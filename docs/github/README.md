# GitHub Workflow Quickstart

1. Set environment variables:
   ```bash
   export GITHUB_TOKEN=<personal access token with repo, workflow scopes>
   export GITHUB_REPO=BackslashBryant/<your-repo>
   ```
2. Run the label sync:
   ```bash
   npm run github:labels
   ```
3. Update `.github/CODEOWNERS`, `.github/ISSUE_TEMPLATE/config.yml`, and each template with the actual BackslashBryant teams or usernames you want reviewing changes.
4. Enable GitHub MCP in Cursor and authenticate with the same token so agents can create branches, issues, and pull requests.
5. Use the Issue templates in `.github/ISSUE_TEMPLATE/` (Kickoff, Bug, Research, Security, Maintenance) when starting work, then reference the issue number inside `/docs/Plan.md`, commits, and PR descriptions.
6. Use `npm run github:issue -- <template> "<title>"` to open issues from the CLI when you want to stay inside Cursor.
7. Require the `Template CI` workflow (preflight + verify-all) as a status check on the `main` branch, extend it with stack-specific jobs, and follow `docs/github/BRANCH_PROTECTION.md` for final protections.
