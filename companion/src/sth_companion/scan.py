from __future__ import annotations

import asyncio
from datetime import datetime, timezone
import json
import os
from typing import Any

from browser_use import Agent, BrowserSession, ChatGoogle, Tools

from .backend import post_import_assignments
from .config import Config
from .state import ScanResult, ScanStatus


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


async def _wait_for_login(session: BrowserSession, timeout_seconds: int = 600) -> bool:
    deadline = _utcnow().timestamp() + timeout_seconds
    while _utcnow().timestamp() < deadline:
        try:
            url = await session.get_current_page_url()
        except Exception:
            url = None
        if url and "purdue.brightspace.com" in url and "/d2l/login" not in url:
            return True
        await asyncio.sleep(2)
    return False


def _export_path(config: Config, scan_id: str) -> str:
    out_dir = os.path.join(config.data_dir, "exports")
    os.makedirs(out_dir, exist_ok=True)
    return os.path.join(out_dir, f"scan_{scan_id}.json")


def _debug_dir(config: Config, scan_id: str) -> str:
    path = os.path.join(config.data_dir, "debug", scan_id)
    os.makedirs(path, exist_ok=True)
    return path


def _write_json(path: str, value: Any) -> None:
    with open(path, "w", encoding="utf-8") as f:
        json.dump(value, f, indent=2, sort_keys=True, default=str)


def _write_text(path: str, value: str) -> None:
    with open(path, "w", encoding="utf-8") as f:
        f.write(value)


def _load_skill_prompt(config: Config) -> str:
    try:
        with open(config.skill_prompt_path, "r", encoding="utf-8") as f:
            return f.read().strip()
    except FileNotFoundError:
        return ""
    except OSError:
        return ""


async def run_scan(
    *,
    config: Config,
    scan_id: str,
    token: str,
    device_id: str,
    status: ScanStatus,
) -> ScanResult:
    status.state = "launching"
    status.message = "Launching browser..."

    tools = Tools(
        exclude_actions=[
            "type",
            "send_keys",
            "upload_file",
        ]
    )

    session = BrowserSession(
        headless=False,
        keep_alive=False,
        # Unrestricted domain access (requested behavior).
    )

    await session.start()
    await tools.navigate(url=config.brightspace_login_url, new_tab=True, browser_session=session)

    status.state = "waiting_for_login"
    status.message = "Complete login + Duo in the opened browser window..."

    logged_in = await _wait_for_login(session, timeout_seconds=15 * 60)
    if not logged_in:
        status.state = "error"
        status.error = "Login not detected (timeout)."
        status.message = "Login not detected (timeout)."
        try:
            await session.kill()
        except Exception:
            pass
        return ScanResult(scan_id=scan_id, payload={"assignments": []})

    status.state = "scanning"
    status.message = "Scanning for assignments..."

    # MVP extraction: let the agent do best-effort extraction and return JSON.
    # This is intentionally conservative on actions (no typing/uploads).
    task = """
You are browsing a student's Brightspace and linked external assignment sites.

Goal: extract every assignment you can find (including external tools reached from Brightspace).

Output JSON ONLY with shape:
{
  "assignments": [
    {
      "source": "brightspace|pearson|webassign|gradescope|vocareum|unknown",
      "platform": "string",
      "type": "string",
      "course": { "code": "string?", "name": "string", "section": "string?" },
      "title": "string",
      "due_at": "ISO8601 string with timezone",
      "points": number?,
      "status": "string?",
      "deep_link_url": "string?"
    }
  ]
}
"""

    llm = ChatGoogle(model="gemini-flash-latest")
    skill_prompt = _load_skill_prompt(config)
    debug_dir = _debug_dir(config, scan_id)
    _write_json(
        os.path.join(debug_dir, "run_meta.json"),
        {
            "scan_id": scan_id,
            "started_at": _utcnow().isoformat(),
            "start_url": config.brightspace_login_url,
            "skill_prompt_path": config.skill_prompt_path,
        },
    )

    agent = Agent(
        task=task,
        llm=llm,
        tools=tools,
        browser_session=session,
        use_vision="auto",
        extend_system_message=skill_prompt or None,
    )

    async def on_step_end(agent_instance: Agent):
        # Step number aligns with recorded history length after each completed step.
        step_no = len(agent_instance.history.history)
        prefix = f"step_{step_no:03d}"

        state_text = await agent_instance.browser_session.get_state_as_text()
        _write_text(os.path.join(debug_dir, f"{prefix}_state.txt"), state_text)

        summary = await agent_instance.browser_session.get_browser_state_summary(include_screenshot=False)
        interactive_elements = []
        for index, element in summary.dom_state.selector_map.items():
            interactive_elements.append(
                {
                    "index": index,
                    "tag": element.tag_name,
                    "text": element.get_all_children_text(max_depth=2)[:200],
                    "placeholder": element.attributes.get("placeholder"),
                    "href": element.attributes.get("href"),
                    "role": element.attributes.get("role"),
                    "type": element.attributes.get("type"),
                }
            )

        latest_history_item = None
        if agent_instance.history.history:
            latest_history_item = agent_instance.history.history[-1].model_dump()

        _write_json(
            os.path.join(debug_dir, f"{prefix}_summary.json"),
            {
                "url": summary.url,
                "title": summary.title,
                "tabs": [tab.model_dump() for tab in summary.tabs],
                "interactive_elements": interactive_elements,
                "history_item": latest_history_item,
            },
        )

    history = await agent.run(max_steps=80, on_step_end=on_step_end)

    # Full trace export for postmortem/debug review.
    history.save_to_file(os.path.join(debug_dir, "history.json"))

    final_text = history.final_result() or "{}"
    try:
        payload: dict[str, Any] = json.loads(final_text)
    except Exception:
        payload = {"assignments": []}

    export_path = _export_path(config, scan_id)
    with open(export_path, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2, sort_keys=True)

    status.state = "posting"
    status.message = "Posting results to backend..."
    assignments = payload.get("assignments") if isinstance(payload, dict) else None
    if not isinstance(assignments, list):
        assignments = []

    try:
        post_import_assignments(config.backend_base_url, token, device_id, assignments)
    except Exception as e:
        status.state = "error"
        status.error = f"Failed to POST results: {e}"
        status.message = "Failed to POST results."
    finally:
        try:
            await session.kill()
        except Exception:
            pass

    if status.state != "error":
        status.state = "done"
        status.message = "Done."
        status.finished_at = _utcnow()

    return ScanResult(scan_id=scan_id, payload=payload)
