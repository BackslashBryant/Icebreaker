# Bugfix Plan (Vector → Pixel)

## Context
- Issue: <!-- link -->
- Reported by / repro source: …
- Severity / impact: …

## Current Behavior
- Observed: …
- Expected: …
- Repro steps: …

## Steps
1. Confirm repro with failing test or log capture (Pixel).
2. Inspect scope with GitHub MCP search / blame.
3. Run `npm run mcp:suggest` if new tooling surfaced during investigation; log the output and add required servers with `npm run mcp:suggest -- --install <id>`.
4. Implement minimal fix (Forge/Link/Glide/Backend persona).
5. Add regression test + `npm run verify`.
6. Document root cause + follow-up in `/docs/process-improvement.mdc` if systemic.

## Acceptance Tests
- [ ] Automated test fails before fix, passes after.
- [ ] Regression scenario covered in docs or release notes.
- [ ] No new lint/type failures.
- [ ] MCP suggestions reviewed/applied (`--install`) or tracked.

## MCP Hooks
- GitHub MCP for code search/blame.
- DocFork MCP if external API semantics are unclear.
- Desktop Commander for local commands when automation is safe.

## Rollback Plan
- `git revert <commit>` or feature flag toggle.
- Note fallback in `.notes/` if a staged rollout is required.
