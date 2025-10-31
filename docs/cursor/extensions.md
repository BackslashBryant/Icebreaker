# Cursor Extensions Playbook

Cursor ships with VS Code compatibility, so you can sync the same extensions you rely on elsewhere. This guide keeps the repo opinionated but flexible.

## Recommended set
- GitLens (`eamodio.gitlens`) - commit authorship, blame, and PR insights inline.
- Thunder Client (`rangav.vscode-thunder-client`) - quick REST/GraphQL smoke tests during implementation.
- Prettier (`esbenp.prettier-vscode`) - formatting safety net when agents scaffold new files.
- Code Spell Checker (`streetsidesoftware.code-spell-checker`) - light proofreading for docs, PRs, and prompts.
- EditorConfig (`EditorConfig.EditorConfig`) - keeps editor behavior aligned with `.editorconfig`.

These are pre-listed in `.vscode/extensions.json`, so Cursor (and VS Code) will prompt you to install them. Run `npm run cursor:extensions` any time to print this list with quick-install reminders.

## Install or refresh
1. Open the Command Palette in Cursor (`Ctrl/Cmd + Shift + P`).
2. Run `Extensions: Show Recommended Extensions`.
3. Install all workspace recommendations.
4. Restart Cursor to ensure activation (most extensions hot-load but formatting providers may require a reload).

## Fast re-install
- Open the Extensions panel (`Ctrl/Cmd + Shift + X`) and use the More Actions menu to choose "Install Workspace Recommended Extensions".
- Migrating from VS Code? Run `Cursor Settings -> Import from VS Code` and the same extensions are pulled in.

## Keeping things tidy
- Disable or uninstall extensions you do not need via the Extensions panel. Cursor will remember the workspace choice.
- If you add more team-standard extensions, update `.vscode/extensions.json` and leave a short note in `.notes/` for the next session.
