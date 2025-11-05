# MCP Servers (Smithery CLI)

This workspace ships with six Smithery-powered MCP servers. Each one is configured in `.cursor/mcp.json` and expects the referenced environment variables to be set before launching Cursor.

| Server | Command | Required Env | Primary Use | Fallback if unavailable |
| --- | --- | --- | --- | --- |
| `github` | `npx -y @smithery/cli@latest run @smithery-ai/github` | `GITHUB_TOKEN` | Branch/PR ops, repo search, issue sync | Use GitHub web UI or `gh` CLI; log deviation in plan |
| `desktop-commander` | `npx -y @smithery/cli@latest run @wonderwhy-er/desktop-commander` | `GITHUB_TOKEN` | Local shell/file automation with guardrails | Use local terminal manually; respect `.cursor/tools/policy.md` |
| `playwright-mcp` | `npx -y @smithery/cli@latest run @microsoft/playwright-mcp` | `GITHUB_TOKEN` | UI tests, axe, Lighthouse, screenshots | Run Playwright locally (`npx playwright test`); attach artifacts manually |
| `ref-tools-mcp` | `npx -y @smithery/cli@latest run @ref-tools/ref-tools-mcp` | None | Token-efficient docs search for APIs/libraries/services | Use vendor docs in browser; cite links in `/docs/research.md` |
| `supabase-mcp-lite` | `npx -y @smithery/cli@latest run @pinion05/supabase-mcp-lite` | `SUPABASE_URL`, `SUPABASE_ANON_KEY` (optional) | DB schema, SQL advisors, policy checks | Use Supabase dashboard or SQL cli; capture notes in `/docs/research.md` |
| `toolbox` | `npx -y @smithery/cli@latest run @smithery/toolbox` | None | Search for and discover additional MCP servers | Manual search in Smithery registry |

## Usage Guidance
- Define secrets in your shell/session (or Cursor environment) before launching the IDE.
- Mention the tool name in prompts (e.g., "use GitHub MCP to open a PR") so Cursor auto-selects the right server.
- If a server errors, record the outage in the active plan, switch to the documented fallback, and update `/docs/process-improvement.mdc` if it reveals a new workflow gap.
- Run `npm run mcp:suggest` regularly (plan kickoff, dependency upgrades, CI) to sync `.cursor/mcp.json` with evolving stack needs, and append configurations instantly with `npm run mcp:suggest -- --install <id>` when you approve a recommendation.

## Extending
1. Add the new server entry to `.cursor/mcp.json`.
2. Document purpose, env requirements, and fallback here.
3. Update `.cursor/rules/04-integrations.mdc` with mandatory triggers if the new tool is domain-specific.
