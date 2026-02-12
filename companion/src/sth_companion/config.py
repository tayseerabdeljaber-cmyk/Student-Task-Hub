from __future__ import annotations

from dataclasses import dataclass
import os
from pathlib import Path


@dataclass(frozen=True)
class Config:
    port: int
    backend_base_url: str
    brightspace_login_url: str
    data_dir: str
    skill_prompt_path: str


def load_config() -> Config:
    port = int(os.environ.get("STH_COMPANION_PORT", "17325"))
    backend_base_url = os.environ.get("STH_BACKEND_BASE_URL", "http://localhost:5000").rstrip("/")
    brightspace_login_url = os.environ.get(
        "STH_BRIGHTSPACE_LOGIN_URL", "https://purdue.brightspace.com/d2l/login"
    )
    data_dir = os.environ.get(
        "STH_COMPANION_DATA_DIR",
        os.path.join(os.path.expanduser("~"), ".student-task-hub-companion"),
    )
    default_prompt_path = str(
        Path(__file__).resolve().parents[2] / "prompts" / "brightspace_skill.md"
    )
    skill_prompt_path = os.environ.get("STH_AGENT_SKILL_PROMPT_PATH", default_prompt_path)
    return Config(
        port=port,
        backend_base_url=backend_base_url,
        brightspace_login_url=brightspace_login_url,
        data_dir=data_dir,
        skill_prompt_path=skill_prompt_path,
    )
