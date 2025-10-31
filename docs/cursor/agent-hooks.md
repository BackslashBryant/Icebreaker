# Agent Hooks Cookbook

Agent Hooks automate repetitive workflows by running custom Node scripts whenever Cursor agents start or finish tasks.

## Hook locations
- `scripts/hooks/pre-commit.sample` - optional git guard already included; copy to `.git/hooks/pre-commit`.
- Create additional hooks under `scripts/hooks/` using the `cursor-hooks` convention (for example `pre-agent-run.mjs`).

## Wiring a hook
1. Create a Node script exporting an async function.
2. Inside Cursor, open Settings -> Agent -> Hooks.
3. Point the hook to your script path and define when it should run (before/after edits, before verification, etc.).

## Example ideas
- Enforce `npm run preflight` before Forge/Link start heavy edits.
- Auto-open `/docs/Plan.md` in preview when Vector begins planning.
- Trigger `npm run mcp:suggest -- --summary` after dependency updates.

## Guardrails
- Hooks run with your local permissions; keep them idempotent and logged.
- Store reusable hooks in `scripts/hooks/` and document them here or in `.notes/`.
- If a hook misbehaves, disable it from the Agent Hooks panel and track the incident in `/docs/process-improvement.mdc`.

Treat hooks like infrastructure-as-code: small, versioned scripts that make the entire team faster and safer.
