# Kickoff Command (start a feature)

One‑paste kickoff derived from docs/agents/KICKOFF.md.

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
