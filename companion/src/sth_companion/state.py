from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timedelta, timezone
import json
import os
import secrets
from typing import Any


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


@dataclass
class PairingState:
    device_id: str
    pairing_code: str
    expires_at: datetime


@dataclass
class ScanStatus:
    scan_id: str
    state: str
    message: str
    progress: dict[str, int] = field(default_factory=dict)
    started_at: datetime = field(default_factory=_utcnow)
    finished_at: datetime | None = None
    error: str | None = None


@dataclass
class ScanResult:
    scan_id: str
    payload: dict[str, Any]


def ensure_dir(path: str) -> None:
    os.makedirs(path, exist_ok=True)


def load_or_create_device_id(data_dir: str) -> str:
    ensure_dir(data_dir)
    path = os.path.join(data_dir, "device.json")
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)["device_id"]
    device_id = secrets.token_hex(16)
    with open(path, "w", encoding="utf-8") as f:
        json.dump({"device_id": device_id}, f)
    return device_id


def new_pairing_state(device_id: str, ttl_minutes: int = 10) -> PairingState:
    # Human-enterable, but still high entropy for casual guessing.
    code = f"{secrets.token_urlsafe(6)[:4].upper()}-{secrets.token_urlsafe(6)[:4].upper()}"
    return PairingState(device_id=device_id, pairing_code=code, expires_at=_utcnow() + timedelta(minutes=ttl_minutes))

