# Kickoff Template and Sanity Test

## Prerequisites

Before starting your first feature, ensure setup is complete:

1. [OK] **Setup Complete**: Run `npm run status` - all checks should pass
2. [OK] **Agents Created**: All 11 agents should exist in Cursor IDE (see `docs/agents/CREATE_AGENTS.md`)
3. [OK] **MCP Servers Configured**: GitHub MCP should be working (check with `npm run status`)
4. [OK] **Environment Variables**: `GITHUB_TOKEN` should be set

**First time?** Run `npm install` (auto-setup) or `npm run setup` to complete initial setup.

## Kickoff Flow

1. Generate/confirm feature scaffold:
   ```bash
   npm run feature:new
   ```
2. Open the generated spec at `.notes/features/<slug>/spec.md` and fill any TODOs.
3. Create a GitHub issue using the **0 - Spec** template and paste the spec content.
4. Ask @Vector to update `docs/Plan.md` (use **1 - Plan** issue template).
5. Move to **2 - Build** once Pixel has tests scaffolded.

## Kickoff Message (for Cursor chat)

Paste the following once the spec and plan are ready:

```
Goal: <copy Goals from docs/Plan.md>
Targets: <backend / web / mobile web / Android / iOS>
DoD:
- <copy MVP DoD checklist from spec>

@Vector Finalise docs/Plan.md (reference spec slug, confirm MVP scope). Record citations in /docs/research.md.
@Pixel Scaffold tests for every DoD item. Block build until GREEN scaffolding.
@Forge/@Link/@Glide/@Apex/@Cider Implement only assigned plan steps (respect path scopes).
@Pixel Re-run tests, report GREEN/RED with repro.
@Muse Update docs/release notes referencing the shipped MVP.
@Nexus Ensure CI/preview is configured (only if plan requires it).
@Sentinel Join if security/privacy risks are in scope.
@Scout Research only when someone says `unknown` or requests sources.
```

## Sanity Test

Prompt: Build a `/health` JSON endpoint and a tiny UI that renders its status.

Expected sequence:
- Vector -> refreshes Plan.md + checklist from spec
- Pixel -> tests scaffold (1 happy + 1 edge)
- Forge -> `/health` API (e.g., `{ "status": "ok", "time": "<iso>" }`)
- Link -> minimal UI fetches `/health` and renders status; include a11y checklist
- Pixel -> GREEN/RED with repro steps
- Muse -> README updates (Prereqs/Setup/Try it/Troubleshoot) citing test names
- Nexus (optional) -> CI runs tests on push/PR and posts preview/artifact URL

Definition of Done:
- Tests GREEN
- Docs updated
- (Optional) Preview works
- `npm run preflight` passes locally
