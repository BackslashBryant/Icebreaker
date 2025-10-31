# Agent Tools Guide

Cursor agents can reach beyond the editor: the Tools menu lets you toggle integrations, provide credentials, and grant permissions.

## Opening the panel
- Command Palette -> `Agent: Configure Tools`
- Or click the robot icon in chat -> Tools

## Common tools
- **Desktop Commander** - local filesystem and terminal control (mirrors our MCP policy). Approve only when the command list looks right.
- **Browser/Web** - built-in search when MCP sources are insufficient.
- **GitHub** - branch/PR automation using the token defined in `.cursor/mcp.json`.
- **Playwright**, **Supabase**, etc. - appear once credentials are supplied.

## Workflow expectations
1. Run `npm run preflight` before enabling tools so baseline MCP servers are healthy.
2. When a task needs elevated access, document the exact command or intent in `.notes/` before granting.
3. If you disable a tool for safety, record the reason and next steps in `/docs/process-improvement.mdc`.

## Adding new tools
- Configure MCP servers in `.cursor/mcp.json`, then reopen the Agent tools panel.
- Use `npm run mcp:suggest -- --install <id>` whenever the repo evolves; new tools appear automatically after install.

Treat tool approvals like code review: confirm scope, double-check commands, then approve with confidence.
