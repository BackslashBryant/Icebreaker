# Current Issues Command

Append a well-formed Current Issues entry to the active feature log.

```
@Orchestrator Append a Current Issues entry to `.notes/features/<slug>/progress.md`.

Entry template:
## YYYY-MM-DD – <short title>
- Tried: <what we attempted>
- Result: <error/output/behavior>
- Next experiment: <small, reversible test>
- Owner: <persona or human>

Guardrails: Do not retry the same step without a new hypothesis. Ask @Scout when information is unknown.
```
