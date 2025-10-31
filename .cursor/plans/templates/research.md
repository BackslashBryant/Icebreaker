# Research Plan (Vector ↔ Scout)

## Problem Statement
- Question / decision to inform: …
- Timebox: …
- Stakeholders: …

## Approach
1. Inventory existing knowledge (`/docs/research.md`, recent issues).
2. Scout uses DocFork + web search for up-to-date sources.
3. Run `npm run mcp:suggest` when research identifies new tooling so recommendations include MCP coverage; apply needed servers with `npm run mcp:suggest -- --install <id>`.
4. Summarize findings with trade-offs and version notes.
5. Recommend next actions (prototype, spike, defer).
6. Capture decisions in `/docs/Plan.md` and `.notes/`.

## Deliverables
- Citations recorded in `/docs/research.md`.
- Summary + recommendation block for issue comment or PR.
- Risks/open questions list for hand-off.

## MCP Hooks
- DocFork MCP – official docs.
- GitHub MCP – reference implementations.
- Desktop Commander – optional scripts to benchmark or scaffold examples.

## Exit Criteria
- [ ] At least 2 high-signal sources cited.
- [ ] Recommendation aligned with constraints (perf, security, timeline).
- [ ] Follow-up tasks or tickets identified (if any).
- [ ] MCP suggestions (if any) documented alongside recommendations (and installed when needed).
