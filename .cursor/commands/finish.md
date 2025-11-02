# Finish Command (wrap-up checklist)

Generate wrap-up items for Muse and Nexus from the last completed checkpoint.

```
@Orchestrator Produce wrap-up checklists for @Muse and @Nexus.

Context:
- Last completed checkpoint: <n>: <title>
- Tests: <names/commands that passed>
- Any env/CI changes: <summarize or "none">

Deliver:
1) Muse: CHANGELOG bullets (≤8 lines) + README snippets (Prereqs/Setup/Try it/Troubleshoot ≤6 lines each)
2) Nexus: env.example updates, CI notes, rollback steps (if any)
3) Handoffs: paste-ready notes to @Muse and @Nexus

Guardrails: No hype words; cite test names; list secret names only (no values).
```
