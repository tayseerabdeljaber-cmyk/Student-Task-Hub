from __future__ import annotations

from dataclasses import dataclass
from typing import Any
import requests


@dataclass(frozen=True)
class VerifiedToken:
    ok: bool
    device_id: str
    user_id: str | None


def verify_pairing_token(backend_base_url: str, token: str) -> VerifiedToken | None:
    url = f"{backend_base_url}/api/companion/token/verify"
    try:
        resp = requests.get(url, headers={"Authorization": f"Bearer {token}"}, timeout=10)
    except requests.RequestException:
        return None
    if resp.status_code != 200:
        return None
    data: dict[str, Any] = resp.json()
    if not data.get("ok"):
        return None
    return VerifiedToken(ok=True, device_id=str(data.get("deviceId", "")), user_id=data.get("userId"))


def post_import_assignments(backend_base_url: str, token: str, device_id: str, assignments: list[dict[str, Any]]) -> dict[str, Any]:
    url = f"{backend_base_url}/api/companion/import/assignments"
    resp = requests.post(
        url,
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
        json={"deviceId": device_id, "assignments": assignments},
        timeout=60,
    )
    resp.raise_for_status()
    return resp.json()

