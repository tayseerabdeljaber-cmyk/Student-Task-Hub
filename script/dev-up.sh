#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if ! command -v docker >/dev/null 2>&1; then
  echo "docker is required but was not found."
  exit 1
fi

if [[ -f ".env" ]]; then
  set -a
  # shellcheck disable=SC1091
  source ".env"
  set +a
fi

: "${DATABASE_URL:=postgresql://postgres:postgres@localhost:5432/student_task_hub}"
: "${LOCAL_DEV_AUTH_BYPASS:=true}"
: "${PORT:=5000}"
export DATABASE_URL LOCAL_DEV_AUTH_BYPASS PORT

POSTGRES_CONTAINER="student-task-hub-postgres"

if docker ps --format '{{.Names}}' | grep -Fxq "$POSTGRES_CONTAINER"; then
  echo "Postgres container is already running."
elif docker ps -a --format '{{.Names}}' | grep -Fxq "$POSTGRES_CONTAINER"; then
  echo "Starting existing Postgres container..."
  docker start "$POSTGRES_CONTAINER" >/dev/null
else
  echo "Starting Postgres with docker compose..."
  docker compose up -d postgres
fi

echo "Waiting for Postgres readiness..."
for i in $(seq 1 30); do
  if docker exec "$POSTGRES_CONTAINER" pg_isready -U postgres -d student_task_hub >/dev/null 2>&1; then
    break
  fi
  sleep 1
  if [[ "$i" -eq 30 ]]; then
    echo "Postgres did not become ready in time."
    exit 1
  fi
done

echo "Applying schema..."
npm run db:push

echo "Starting app on port ${PORT}..."
npm run dev
