# Kickoff Template and Sanity Test

## Prerequisites

Before starting your first feature, confirm:

1. [OK] `npm run status` passes (setup and MCP servers healthy)
2. [OK] All 11 agents exist in Cursor (see `docs/agents/CREATE_AGENTS.md`)
3. [OK] `GITHUB_TOKEN` (and any optional MCP credentials) are set
4. [OK] `docs/vision.md` reflects the current user journey and goals
5. [OK] `docs/ConnectionGuide.md` lists any existing ports/endpoints

**First time?** Run `npm install` (auto-setup) or `npm run setup` to complete initial onboarding.

## Kickoff Flow

1. Generate/confirm the feature scaffold:
   ```bash
   npm run feature:new
   ```
2. Fill in `.notes/features/<slug>/spec.md` and refresh `docs/vision.md`.
3. Create a GitHub issue using the **0 - Spec** template; link the spec + vision.
4. Open `docs/Plan.md` (auto-activates Vector 🎯) and/or run `/vector-plan` to update it with numbered checkpoints. Tell Vector: “Do not proceed past step 1 until I approve.”
5. Share the plan, vision, and Connection Guide in chat. Once satisfied, move the issue to **1 - Plan**.
6. Promote to **2 - Build** only after Pixel scaffolds tests for every acceptance criterion and reports command outputs.

## Kickoff Message (paste into Cursor chat)

```
Goal: <copy Goals from docs/Plan.md>
Vision: See docs/vision.md (rev <date>)
Connection Guide: Updated ports/services in docs/ConnectionGuide.md
Targets: <backend / web / mobile web / Android / iOS>
DoD:
- <copy MVP DoD checklist from spec>

@Vector Plan Mode only: confirm checkpoints and acceptance tests. Do not continue past Step 1 without approval. Log citations in /docs/research.md.
@Pixel Scaffold tests for each DoD item. Share exact commands + expect GREEN before implementation begins.
@Forge/@Link/@Glide/@Apex/@Cider Implement Step 1 only when approved. Be stupidly specific, run targeted tests after every change, and update ConnectionGuide.md if ports/services shift.
@Pixel Re-run tests per checkpoint and report GREEN/RED with repro instructions.
@Muse Update README/CHANGELOG/docs referencing the tests and Connection Guide entries.
@Nexus Ensure CI/env changes are reflected in docs/ConnectionGuide.md. Ask before committing or pushing.
@Sentinel Join if security/privacy risks are in scope.
@Scout Research only when someone says `unknown` or requests sources.
```

## Sanity Test

Prompt: Build a `/health` JSON endpoint and a tiny UI that renders its status.

Expected sequence:
1. Vector refreshes `docs/Plan.md`, numbering checkpoints and mapping them to the DoD.
2. Pixel scaffolds one happy + one edge test per acceptance test; posts commands.
3. Forge implements the `/health` API (e.g., `{ "status": "ok", "time": "<iso>" }`), runs targeted tests, and updates Connection Guide if a new port is used.
4. Link creates the UI, shares accessibility checklist results, and runs frontend/unit tests.
5. Pixel reruns the full test command set and reports GREEN/RED with repro steps.
6. Muse updates README (Prereqs/Setup/Try it/Troubleshoot) referencing the new tests and Connection Guide.
7. Nexus (optional) runs CI/preview and records any pipeline/env changes.

Definition of Done:
- All targeted tests GREEN with commands recorded
- `docs/vision.md` and `docs/ConnectionGuide.md` updated
- README/CHANGELOG entries shipped by Muse
- `npm run preflight` passes locally (or documented if blocked)
