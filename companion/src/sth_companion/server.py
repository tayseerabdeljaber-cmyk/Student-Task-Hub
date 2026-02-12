from __future__ import annotations

import asyncio
from dataclasses import asdict
from datetime import datetime, timezone
import os
import webbrowser

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from .backend import verify_pairing_token
from .config import Config
from .scan import run_scan
from .state import PairingState, ScanResult, ScanStatus, load_or_create_device_id, new_pairing_state


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class ScanStartBody(BaseModel):
    device_id: str = Field(min_length=1)


class AppState:
    def __init__(self, config: Config):
        self.config = config
        self.device_id = load_or_create_device_id(config.data_dir)
        self.pairing: PairingState = new_pairing_state(self.device_id)
        self.scan_status: dict[str, ScanStatus] = {}
        self.scan_result: dict[str, ScanResult] = {}
        self.scan_tasks: dict[str, asyncio.Task] = {}


def _bearer_token(req: Request) -> str | None:
    header = req.headers.get("authorization") or ""
    if not header.lower().startswith("bearer "):
        return None
    return header.split(" ", 1)[1].strip() or None


def create_app(config: Config) -> FastAPI:
    app = FastAPI(title="Student Task Hub Companion", version="0.1.0")
    st = AppState(config)

    # Dev-friendly CORS. Tighten once we know prod origin(s).
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=False,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.get("/health")
    def health():
        return {"ok": True, "version": "0.1.0"}

    @app.get("/pairing")
    def pairing():
        # Rotate if expired.
        if st.pairing.expires_at <= _utcnow():
            st.pairing = new_pairing_state(st.device_id)
        return {
            "device_id": st.pairing.device_id,
            "pairing_code": st.pairing.pairing_code,
            "expires_at": st.pairing.expires_at.isoformat(),
            "pair_url": f"{config.backend_base_url}/pair?code={st.pairing.pairing_code}&device_id={st.pairing.device_id}",
        }

    @app.post("/pairing/open")
    def pairing_open():
        p = pairing()
        webbrowser.open(p["pair_url"])
        return {"ok": True, "pair_url": p["pair_url"]}

    async def _require_token(req: Request):
        token = _bearer_token(req)
        if not token:
            raise HTTPException(status_code=401, detail="Missing bearer token")
        verified = verify_pairing_token(config.backend_base_url, token)
        if not verified:
            raise HTTPException(status_code=401, detail="Invalid token")
        if verified.device_id and verified.device_id != st.device_id:
            raise HTTPException(status_code=403, detail="Device mismatch")
        return token

    @app.post("/scan/start")
    async def scan_start(req: Request, body: ScanStartBody):
        token = await _require_token(req)
        if body.device_id != st.device_id:
            raise HTTPException(status_code=403, detail="Device mismatch")

        scan_id = os.urandom(8).hex()
        status = ScanStatus(scan_id=scan_id, state="queued", message="Queued")
        st.scan_status[scan_id] = status

        async def _runner():
            try:
                result = await run_scan(
                    config=config,
                    scan_id=scan_id,
                    token=token,
                    device_id=st.device_id,
                    status=status,
                )
                st.scan_result[scan_id] = result
            except Exception as e:
                status.state = "error"
                status.error = str(e)
                status.message = "Scan failed."
                status.finished_at = _utcnow()

        st.scan_tasks[scan_id] = asyncio.create_task(_runner())
        return {"scan_id": scan_id}

    @app.get("/scan/status")
    async def scan_status(req: Request, scan_id: str):
        await _require_token(req)
        status = st.scan_status.get(scan_id)
        if not status:
            raise HTTPException(status_code=404, detail="Unknown scan_id")
        return asdict(status)

    @app.get("/scan/result")
    async def scan_result(req: Request, scan_id: str):
        await _require_token(req)
        result = st.scan_result.get(scan_id)
        if not result:
            raise HTTPException(status_code=404, detail="No result yet")
        return result.payload

    @app.post("/scan/cancel")
    async def scan_cancel(req: Request, scan_id: str):
        await _require_token(req)
        task = st.scan_tasks.get(scan_id)
        if not task:
            raise HTTPException(status_code=404, detail="Unknown scan_id")
        task.cancel()
        st.scan_status[scan_id].state = "error"
        st.scan_status[scan_id].message = "Cancelled."
        st.scan_status[scan_id].finished_at = _utcnow()
        return {"ok": True}

    return app

