# Crew Command (context → next persona)

Use this to quickly route the next step. Paste in any chat.

```
@Orchestrator Survey context and propose the next persona.

Context hints:
- Vision: docs/vision.md (rev [DATE])
- Plan: docs/Plan.md (active feature from .notes/features/current.json)
- Connection guide: docs/ConnectionGuide.md

Deliver:
1) Status (what’s active + current checkpoint)
2) Next 3 (explicit actions)
3) Persona recommendation (one) with a one‑line why
4) Exact handoff message I can paste (prefixed with the persona name + emoji)

Guardrails:
- Plan Mode first (ask for approval). Do not proceed until I say “Proceed”.
- If context is stale or missing, say unknown and list the minimal fixes.
```
