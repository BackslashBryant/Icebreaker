# MCP Servers (Smithery CLI)

This workspace ships with five Smithery-powered MCP servers. Each one is configured in `.cursor/mcp.json` and expects the referenced environment variables to be set before launching Cursor.

| Server | Command | Required Env | Primary Use | Fallback if unavailable |
| --- | --- | --- | --- | --- |
| `github` | `npx -y @smithery/cli@latest run github` | `GITHUB_TOKEN` | Branch/PR ops, repo search, issue sync | Use GitHub web UI or `gh` CLI; log deviation in plan |
| `supabase` | `npx -y @smithery/cli@latest run supabase` | `SUPABASE_URL`, `SUPABASE_ANON_KEY` | DB schema, SQL advisors, Edge Functions | Use Supabase dashboard or SQL cli; capture notes in `/docs/research.md` |
| `playwright` | `npx -y @smithery/cli@latest run playwright` | `GITHUB_TOKEN` | UI tests, axe, Lighthouse, screenshots | Run Playwright locally (`npx playwright test`); attach artifacts manually |
| `desktop-commander` | `npx -y @smithery/cli@latest run desktop-commander` | `GITHUB_TOKEN` | Local shell/file automation with guardrails | Use local terminal manually; respect `.cursor/tools/policy.md` |
| `docfork` | `npx -y @smithery/cli@latest run docfork` | `GITHUB_TOKEN` | Official docs lookup + code samples | Use vendor docs in browser; cite links in `/docs/research.md` |

## Usage Guidance
- Define secrets in your shell/session (or Cursor environment) before launching the IDE.
- Mention the tool name in prompts (e.g., "use GitHub MCP to open a PR") so Cursor auto-selects the right server.
- If a server errors, record the outage in the active plan, switch to the documented fallback, and update `/docs/process-improvement.mdc` if it reveals a new workflow gap.
- Run `npm run mcp:suggest` regularly (plan kickoff, dependency upgrades, CI) to sync `.cursor/mcp.json` with evolving stack needs, and append configurations instantly with `npm run mcp:suggest -- --install <id>` when you approve a recommendation.

## Extending
1. Add the new server entry to `.cursor/mcp.json`.
2. Document purpose, env requirements, and fallback here.
3. Update `.cursor/rules/04-integrations.mdc` with mandatory triggers if the new tool is domain-specific.
