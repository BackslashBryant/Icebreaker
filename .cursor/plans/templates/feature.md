# Feature Plan (Vector → Delivery)

## Context
- Issue: <!-- link -->
- Personas involved: Vector → Forge/Link/Glide → Pixel → Muse/Nexus
- Reference docs: `/docs/Plan.md`, `/docs/cursor/models.md`

## Steps (3-7)
1. Clarify acceptance tests with stakeholder + Pixel.
2. Run `npm run mcp:suggest` and log recommendations in `.notes/` or the plan; if a server is needed, execute `npm run mcp:suggest -- --install <id>` to append it.
3. Spike implementation approach (Forge/Link) using MCP research (`@DocFork`, `@GitHub`).
4. Implement scoped changes inside agreed paths.
5. Run `npm run verify` (Pixel) and capture artifacts.
6. Update docs/PR checklist (Muse/Nexus).

## File Targets
- `src/...` or `app/...` as applicable – implementation
- `tests/...` – coverage additions
- `docs/...` – user/developer notes

## Acceptance Tests
- [ ] Feature flag or entry point documented
- [ ] Tests cover happy & edge path
- [ ] `npm run verify` passes locally and in CI
- [ ] MCP suggestions reviewed/applied (via `--install`) or documented as follow-up

## MCP Hooks
- GitHub MCP for branch + PR
- DocFork MCP for API/library confirmation
- Desktop Commander for scripted verification (if allowed)

## Risks / Mitigation
- Risk: scope creep → freeze requirements in `/docs/Plan.md`.
- Risk: missing artifacts → attach outputs under `artifacts/<issue>/`.
