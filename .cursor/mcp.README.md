# MCP Servers (Direct Installation)

This workspace uses direct MCP server installations (migrated from Smithery CLI after STDIO support was discontinued in September 2025). Each server is configured in `.cursor/mcp.json` and expects the referenced environment variables to be set before launching Cursor.

| Server | Package | Required Env | Primary Use | Fallback if unavailable |
| --- | --- | --- | --- | --- |
| `desktop-commander` | `@wonderwhy-er/desktop-commander` | `GITHUB_TOKEN` | Local shell/file automation with guardrails | Use local terminal manually; respect `.cursor/tools/policy.md` |
| `playwright-mcp` | `@playwright/mcp` | `GITHUB_TOKEN` | UI tests, axe, Lighthouse, screenshots | Run Playwright locally (`npx playwright test`); attach artifacts manually |
| `ref-tools-mcp` | `ref-tools-mcp` | None | Token-efficient docs search for APIs/libraries/services | Use vendor docs in browser; cite links in `/docs/research.md` |
| `supabase` | Hosted URL | None (OAuth) | DB schema, SQL advisors, policy checks | Use Supabase dashboard or SQL CLI; capture notes in `/docs/research.md` |
| `vercel` | Hosted URL | None (OAuth) | Deployments, project management, environment variables, domains | Use Vercel CLI (`vercel`) or Vercel dashboard |
| `filesystem` | `@modelcontextprotocol/server-filesystem` | None | File operations, reading project structure, code navigation | Manual file operations via terminal or editor |
| `time` | `mcp-server-time` (Python) | None (requires uvx or Python) | Time and date operations, timezone conversions, scheduling | Native JavaScript Date API or date libraries |

**GitHub Operations**: Use GitHub CLI (`gh`) directly - no MCP needed. Run `gh auth login` once, then use `gh` commands for all GitHub operations.

## Removed Servers

- `github` - Removed 2025-11-11. Use GitHub CLI (`gh`) directly instead - simpler and more reliable.
- `toolbox` - Smithery-specific, no direct equivalent (use manual search in Smithery registry)

## Usage Guidance
- Define secrets in your shell/session (or Cursor environment) before launching the IDE.
- For GitHub operations, use GitHub CLI (`gh`) directly - no MCP needed.
- If a server errors, record the outage in the active plan, switch to the documented fallback, and update `/docs/process-improvement.mdc` if it reveals a new workflow gap.
- Run `npm run mcp:suggest` regularly (plan kickoff, dependency upgrades, CI) to sync `.cursor/mcp.json` with evolving stack needs, and append configurations instantly with `npm run mcp:suggest -- --install <id>` when you approve a recommendation.

## Extending
1. Add the new server entry to `.cursor/mcp.json`.
2. Document purpose, env requirements, and fallback here.
3. Update `.cursor/rules/04-integrations.mdc` with mandatory triggers if the new tool is domain-specific.
