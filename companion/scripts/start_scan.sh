#!/usr/bin/env bash
set -euo pipefail

COMPANION_URL="${COMPANION_URL:-http://127.0.0.1:17325}"
BACKEND_URL="${STH_BACKEND_BASE_URL:-http://localhost:5000}"
DATA_DIR="${STH_COMPANION_DATA_DIR:-$HOME/.student-task-hub-companion}"
TOKEN_FILE="${DATA_DIR}/pairing_token.txt"

mkdir -p "$DATA_DIR"

echo "[1/4] Fetching pairing metadata from companion..."
PAIR_JSON="$(curl -fsS "$COMPANION_URL/pairing")"
DEVICE_ID="$(echo "$PAIR_JSON" | python3 -c 'import sys,json; print(json.load(sys.stdin)["device_id"])')"

TOKEN=""
if [[ -f "$TOKEN_FILE" ]]; then
  TOKEN="$(cat "$TOKEN_FILE" || true)"
fi

verify_token() {
  local token="$1"
  if [[ -z "$token" ]]; then
    return 1
  fi
  curl -fsS "$BACKEND_URL/api/companion/token/verify" \
    -H "Authorization: Bearer $token" >/dev/null 2>&1
}

if ! verify_token "$TOKEN"; then
  echo "[2/4] No valid token. Opening pair page..."
  curl -fsS -X POST "$COMPANION_URL/pairing/open" >/dev/null
  echo "Complete pairing in browser, then press Enter to continue."
  read -r

  # Dev-friendly token mint (works with LOCAL_DEV_AUTH_BYPASS=true).
  # In production, this endpoint should be called via authenticated web flow.
  TOKEN="$(
    curl -fsS -X POST "$BACKEND_URL/api/companion/pair" \
      -H 'Content-Type: application/json' \
      -d "{\"deviceId\":\"$DEVICE_ID\"}" \
    | python3 -c 'import sys,json; print(json.load(sys.stdin)["token"])'
  )"
  printf '%s' "$TOKEN" > "$TOKEN_FILE"
fi

echo "[3/4] Starting scan..."
SCAN_ID="$(
  curl -fsS -X POST "$COMPANION_URL/scan/start" \
    -H "Authorization: Bearer $TOKEN" \
    -H 'Content-Type: application/json' \
    -d "{\"device_id\":\"$DEVICE_ID\"}" \
  | python3 -c 'import sys,json; print(json.load(sys.stdin)["scan_id"])'
)"
echo "SCAN_ID=$SCAN_ID"

echo "[4/4] Polling status..."
while true; do
  STATUS_JSON="$(curl -fsS "$COMPANION_URL/scan/status?scan_id=$SCAN_ID" -H "Authorization: Bearer $TOKEN")"
  STATE="$(echo "$STATUS_JSON" | python3 -c 'import sys,json; print(json.load(sys.stdin)["state"])')"
  MESSAGE="$(echo "$STATUS_JSON" | python3 -c 'import sys,json; print(json.load(sys.stdin).get("message",""))')"
  echo "state=$STATE message=$MESSAGE"
  if [[ "$STATE" == "done" ]]; then
    echo "Scan complete."
    break
  fi
  if [[ "$STATE" == "error" ]]; then
    echo "Scan failed."
    echo "$STATUS_JSON"
    exit 1
  fi
  sleep 4
done

echo "Fetch result:"
echo "curl -sS \"$COMPANION_URL/scan/result?scan_id=$SCAN_ID\" -H \"Authorization: Bearer $TOKEN\""

