# Plan

_Active feature: **Bootstrap Web Health MVP** (`bootstrap-web-health-mvp`)_
_Source spec: `.notes/features/bootstrap-web-health-mvp/spec.md`_

## Goals
- GitHub Issue: #TBD
- Target User: Solo dev verifying Cursor workspace
- Problem: No starter UI/API exists to validate the agent workflow quickly.
- Desired Outcome: Deliver a simple health endpoint and UI status tile to prove the agents can ship end-to-end.
- Success Metrics:
  - All automated checks (npm run verify) GREEN
  - Preview URL or local server manually confirmed once
- MVP Guardrail: Ship only the checklist in `MVP DoD` and defer everything else.

## Out-of-scope
- Additional dashboards or metrics
- User authentication or persistence

## Steps (3-7)
1. ✅ Vector - Finalize plan & cite research for the DoD.
2. ✅ Pixel - Scaffold tests for each MVP DoD item.
3. ✅ Implementers - Deliver the smallest slice to satisfy the DoD.
4. ✅ Pixel - Verify tests / report GREEN.
5. ✅ Muse - Update docs & release notes for the shipped MVP.
6. ✅ Nexus - Ensure CI/preview or release automation is GREEN.

## File targets
### Planning & Spec
- `.notes/features/bootstrap-web-health-mvp/spec.md` (source spec)
- `.notes/features/bootstrap-web-health-mvp/progress.md` (progress tracker)
- `docs/Plan.md` (this file)
- `docs/research.md` (research citations)

### Implementation (to be created)
- `backend/src/routes/health.ts` or `backend/src/routes/health.js` (health endpoint)
- `backend/src/index.ts` or `backend/src/index.js` (server entry point - if not exists)
- `frontend/src/components/HealthStatus.tsx` or equivalent (health status UI component)
- `frontend/src/pages/Home.tsx` or `frontend/src/App.tsx` (page that renders health status)
- `shared/src/types/health.ts` or equivalent (shared health response type - optional)

### Tests (to be created)
- `backend/tests/health.test.ts` or `backend/tests/health.test.js` (API unit test)
- `frontend/tests/HealthStatus.test.tsx` or equivalent (component unit test)
- `tests/e2e/health.spec.ts` or `tests/e2e/health.spec.js` (Playwright smoke test)

### Documentation (to be updated)
- `README.md` (add health endpoint docs)
- `docs/ConnectionGuide.md` (add backend port/endpoint)
- `CHANGELOG.md` (release notes - if exists)

## Acceptance tests
- [x] Health API returns JSON { status: "ok" } ✅ Verified
- [x] Front-end renders the health status with passing tests ✅ Verified
- [x] Playwright smoke test covers API + UI ✅ Verified

## Owners
- Vector (planning, research citations)
- Pixel (tests & verification)
- Implementers (Forge/Link/Glide/Apex/Cider) as assigned
- Muse (docs)
- Nexus (CI/preview)
- Sentinel (only if plan calls for security review)

## Implementation Notes
- **Tech Stack**: Framework-agnostic approach. Implementers choose minimal viable stack (Express/Fastify/Node.js for backend, React/Vue/Vanilla for frontend).
- **Health Endpoint**: GET `/api/health` or `/health` returns `{ "status": "ok" }` with 200 status.
- **Frontend Component**: Simple status tile/indicator showing health API response. No styling required for MVP (default browser styles acceptable).
- **Test Strategy**: Unit tests for API and component, Playwright E2E covering API fetch + UI render.
- **Port Assignment**: Backend on `8000` (or `3001`), frontend on `3000` (or `5173`). Update `docs/ConnectionGuide.md` when ports are chosen.

## Risks & Open questions
- **Tech Stack Decision**: No framework chosen yet. Implementers should pick minimal viable stack (see research citations below).
- **Port Conflicts**: Verify ports are free before starting servers. Use `npm run ports:status`.
- **Stack Compatibility**: Ensure chosen frontend can fetch from backend (CORS configured if needed).
- Record research links in `docs/research.md`.
