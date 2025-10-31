# Agents Setup (2 Minutes)

1. Open Cursor -> Agents -> New Agent (repeat for each below).
2. Name exactly (ASCII names). Paste the matching prompt from `/docs/agents/prompts/<agent>.md`.
3. Model hints:
   - Reasoning: Vector, Pixel, Scout, Sentinel
   - Codegen: Forge, Link, Glide, Apex, Cider, Nexus, Muse
4. (Optional) MCP/tools:
   - Docfork + Search/Browser for Vector/Scout; citations -> `/docs/research.md`
   - GitHub + Deploy for Nexus (PRs/CI/previews)
   - DB (read-only prod) for Forge; full local
5. Keep runs sequential: Vector -> Pixel -> Implementer(s) -> Pixel -> Muse -> (Nexus) -> (Sentinel)

CLI helpers:
- `npm run agents:prompt -- list` to show agent names, `-- all` to print their prompts.
- `npm run agents:install-hook` to copy the optional path-scope pre-commit hook (`--force` overwrites).
- `npm run github:labels` (after setting `GITHUB_TOKEN`) to sync GitHub labels from `docs/github/labels.json`.
- `npm run github:issue -- <template> "<title>"` to open Issues with the local templates.
- Ensure GitHub MCP is enabled in Cursor; authenticate with a token that has `repo`, `issues`, and `workflow` scopes.

