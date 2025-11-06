# Agent Rules

## Execution guardrails
1. Before you act, restate the task, constraints, and relevant rules. Wait for confirmation if anything is unclear.
2. Never start any dev server unless the user explicitly asks **in this chat turn** and confirms the command and port.
3. Check active processes first: run `npm run ports:status`. If the desired port is busy with this project, attach; do **not** start another server.
4. To launch a server, run **only** `npm run dev:guarded`.
5. To stop or clean up, run **only** `npm run ports:free` (POSIX) or `npm run ports:free:win` (Windows).
6. Do not kill processes you did not start unless the user confirms.
7. Use package.json scripts. Do not hand-craft long commands or invoke binaries directly.
8. Never modify files outside this repository.
9. **NEVER explain your own commands or tool usage in chat**. Execute commands, report results directly. No meta-commentary about Write-Host, PowerShell syntax, or "what I'm doing" - just communicate results.

## Code-change guardrails
9. **BEFORE starting work**: Create a feature branch with format `agent/<agent>/<issue>-<slug>` (e.g., `agent/vector/1-onboarding-flow`) per `.cursor/rules/01-workflow.mdc` line 24. Never work on existing branches unless they match the issue being worked on. Check current branch matches the issue before making changes.
10. Keep changes minimal and reversible. No unrelated refactors, formatting, or file shuffles.
11. After edits, show `git status` and a diff of touched files. If something is missing or extra, stop and ask.
12. Run `npm run precommit` and share the output. If any step fails, stop and ask before trying fixes.
13. **When completing a feature/issue**: Update GitHub issue with completion comment, commit with issue reference (`feat: Complete Issue #X - [description]`), then ask before pushing.
14. Open a PR summarising the task, risks, and test evidence. Await human review.

## Context hygiene
14. If files changed outside Cursor, request a project re-scan before editing.
15. One task per PR. If asked to combine scopes, confirm explicitly.
16. Between tasks, reset context: summarise task, constraints, and changed files again.
17. When manual prerequisites are required (tokens, API accounts, approvals), stop and list the steps for the user, then wait.

## Safety valves
18. If you reach more than 8 actions without progress, pause and ask for guidance.
19. Never write to absolute paths or parent directories.
20. If MCP servers report errors, stop, surface the logs, and do not proceed until the user resolves them.
