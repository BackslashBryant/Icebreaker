## Why
Unlock deterministic multi-user runs without relying on live backend sockets.

## Scope
- Implement `tests/mocks/websocket-mock.ts` mirroring `createWebSocketConnection` behavior (`radar:subscribe`, `location:update`, chat lifecycle, panic).
- Add a runtime switch in `frontend/src/lib/websocket-client.ts` to use the mock when `PLAYWRIGHT_WS_MOCK=1`.
- Provide sample script + test proving two mock personas appear on Radar concurrently.

## Acceptance
- Playwright smoke run passes entirely with `PLAYWRIGHT_WS_MOCK=1`
- Docs updated in `docs/testing/persona-sim-testing-plan.md`

## Related
Part of Persona Sim Testing Phase 2 backlog.

