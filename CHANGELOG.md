# Changelog

## 2026-02-12

- feat: add companion pairing + token verification backend endpoints
- feat: add companion assignment import endpoint with dedupe strategy
- feat: extend assignment/course schema for companion-imported metadata
- feat: add `/pair` page in web app for device pairing flow
- feat: scaffold local companion service (FastAPI + browser-use scan runner)
- feat: add one-command scan script (`npm run companion:scan`)
- docs: add companion dev/run/debug documentation and architecture docs
- chore: set TypeScript target to ES2020 to fix iterator typecheck issue
- fix: local companion browser session now allows unrestricted domains

