# Crew Status Command

Use this to get a quick, actionable status snapshot.

```
@Orchestrator Summarize current status and propose one action.

Check:
- docs/vision.md freshness
- docs/Plan.md current checkpoint (from .notes/features/current.json)
- docs/ConnectionGuide.md missing ports/services
- MCP creds (just name missing or set)

Deliver:
1) Status: feature/plan/vision/guide summary
2) Next 3: - <single best action> - <files to open> - <tests to run>
3) Persona: who should act next + why

Guardrails: Plan Mode first; wait for approval before editing; log Current Issues on loops.
```
