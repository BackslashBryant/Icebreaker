# Automation Examples

These scripts illustrate how you can extend the template with custom automation once your project workflow takes shape. They are **not** wired into the template by default so that the workspace remains stack-agnostic.

## What is included?

- `bootstrap-labels.ts` – example script that bootstraps GitHub labels via the API.
- `create-branch.sh`, `create-issue.sh`, `create-pr.sh`, `git-automation.sh`, `Init.ps1` – helper scripts for issue-first git workflows.
- `mcp-monitor.js`, `start-mcp-monitor.bat` – sample monitors for MCP tool health.
- `security-scan` – opinionated security sweep script (`bash`).
- `validate-ticket-headers.js` – example linter for ticket documents.
- `lib/`, `tools/` – supporting snippets for the scripts above.

Feel free to adapt, delete, or move these into your generated project if they are useful. They do not run automatically.