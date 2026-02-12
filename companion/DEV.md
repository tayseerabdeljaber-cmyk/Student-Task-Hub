# Companion Dev (Local)

## 1) Backend (Student-Task-Hub)
```bash
cd /media/peter-bui/E/Assistants/Student-Task-Hub
export DATABASE_URL='postgresql://postgres:postgres@localhost:5432/student_task_hub'
export LOCAL_DEV_AUTH_BYPASS=true
export PORT=5000
npm run dev
```

## 2) Companion
Requires Python 3.11+.

```bash
cd /media/peter-bui/E/Assistants/Student-Task-Hub/companion
python3 -m venv .venv
source .venv/bin/activate
pip install -e .
```

Install Chromium for `browser-use`:
```bash
uvx browser-use install
```

Run:
```bash
export GOOGLE_API_KEY=...
export STH_BACKEND_BASE_URL=http://localhost:5000
# optional: override the default Brightspace skill prompt file
# export STH_AGENT_SKILL_PROMPT_PATH=/absolute/path/to/my_skill.md
sth-companion
```

Pair (opens browser):
```bash
curl -sS http://localhost:17325/pairing | cat
curl -sS -X POST http://localhost:17325/pairing/open | cat
```

## One-command scan (recommended)
After backend + companion are already running:

```bash
cd /media/peter-bui/E/Assistants/Student-Task-Hub
npm run companion:scan
```

This script:
- fetches device id from companion
- reuses stored pairing token if valid
- opens pair page only when needed
- starts scan
- polls status until done/error

## Debug artifacts (what the agent sees)
After each scan, companion writes:

- `~/.student-task-hub-companion/debug/<scan_id>/step_XXX_state.txt`
  - the LLM browser-state text representation for that step
- `~/.student-task-hub-companion/debug/<scan_id>/step_XXX_summary.json`
  - url/title/tabs + indexed interactive elements + step history item
- `~/.student-task-hub-companion/debug/<scan_id>/history.json`
  - full browser-use run history
