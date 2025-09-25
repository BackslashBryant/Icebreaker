# MCP Tool Safety Policy (Repo-Scoped)

- All MCP runs must be proposed first with the exact command; wait for approval.
- Prohibited: git push (unless ticket explicitly says), rm -rf, SSH, registry edits, package manager installs without ticket.
- If a command could be destructive or permanent, ASK first with options.

# Allowlist (desktop-commander)
- npm run dev
- npm run lint
- npm run build
- npm test
- node --version
- npm --version
- git status
- git diff
- git add -A
- git commit -m "<TICKET-ID>: <message>"

