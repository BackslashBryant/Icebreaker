# Cursor Logic vs Application Logic Separation

This document explains the clear separation between Cursor-specific development tooling and actual application code, and how the repository enforces this separation.

## Overview

Cursor-specific files (rules, configs, MCP setup) are meant for template repositories where the development workflow itself is being developed and shared. When you shift from template development to application development, these Cursor files should be blocked from being committed to the repository.

## Repository Modes

### Template Mode (Default)
- **Purpose**: Developing and sharing the Cursor workspace template itself
- **Behavior**: Cursor files (`.cursor/` directory) are tracked and committed
- **Detection**:
  - Explicit `.repo-mode` file containing "template"
  - OR `package.json` name/description contains "template"
  - Default fallback if unable to determine

### App Mode
- **Purpose**: Developing your actual application
- **Behavior**: Cursor files are ignored and blocked from commits
- **Detection**: Explicit `.repo-mode` file containing "app"
- **Exception**: `.cursorignore` is still tracked (app-specific Cursor config)

## Converting to App Mode

When you're ready to start building your application (not the template):

```bash
npm run convert:app
```

This command:
1. Sets `.repo-mode` to "app"
2. Updates `.gitignore` to ignore `.cursor/` (except `.cursorignore`)
3. Configures the pre-commit hook to block `.cursor/` commits

## What Gets Separated

### Cursor Logic (Blocked in App Mode)
These files are part of the development tooling and should not be committed to app repositories:

- **`.cursor/`** - Entire directory containing:
  - `rules/` - Cursor agent rules and workflow definitions
  - `config.json` - Cursor IDE configuration
  - `mcp.json` - MCP server configurations
  - `plans/` - Agent planning templates
  - `commands/` - Cursor command definitions
  - `agents-config.json` - Agent configuration
- **`docs/cursor/`** - Cursor-specific documentation (how to use Cursor with this repo)
- **`tools/cursor-*.mjs`** - Cursor setup and configuration tools

### Application Logic (Always Tracked)
These files are your actual application code and should always be committed:

- **Application source code** - Your actual app files
- **`.cursorignore`** - App-specific Cursor indexing config (should be tracked)
- **`.vscode/settings.json`** - Workspace settings (may be app-specific)
- **Application documentation** - Docs about your app, not Cursor tooling
- **Application tooling** - Build tools, scripts specific to your app

### Template-Specific (Tracked Only in Template Mode)
These files are only relevant when developing the template itself:

- **`.cursor/rules/`** - Workflow rules and agent personas
- **`.cursor/mcp.json`** - MCP server setup for template development
- **`docs/cursor/`** - How to use Cursor with the template

## Enforcement Mechanisms

### 1. Pre-Commit Hook
The pre-commit hook (`scripts/hooks/pre-commit.sample`) automatically blocks commits of `.cursor/` files when in app mode.

**Override**: Set `ALLOW_CURSOR_PUSH=1` environment variable (only for template updates)

```bash
ALLOW_CURSOR_PUSH=1 git commit -m "Update template rules"
```

### 2. Gitignore
When in app mode, `.gitignore` includes:
```
.cursor/*
!.cursorignore
```

### 3. Preflight Validation
Running `npm run preflight` checks:
- Repository mode is correctly set
- Appropriate files are tracked/ignored based on mode
- Warns if mode mismatch detected

## Why This Matters

1. **Clean Separation**: Application repos shouldn't contain template development logic
2. **Team Clarity**: Clear distinction between "how we build" (Cursor tooling) and "what we build" (application)
3. **Repository Hygiene**: Prevents accidental commits of personal/workflow-specific Cursor configs
4. **Template Distribution**: Template repo can track Cursor files for sharing, app repos keep only what's needed

## Common Scenarios

### Scenario 1: Starting App Development from Template
1. Clone template repository
2. Run `npm run convert:app` to switch to app mode
3. Start building your application
4. Cursor files are automatically ignored

### Scenario 2: Updating Template While in App Mode
If you need to update Cursor rules for the template itself:
```bash
ALLOW_CURSOR_PUSH=1 git commit -m "Update template rules"
```

### Scenario 3: Reverting to Template Mode
If you need to switch back:
1. Delete `.repo-mode` file
2. Update `.gitignore` to remove `.cursor/*` entries
3. Or set `.repo-mode` to "template"

## Best Practices

1. **Always run `npm run convert:app`** when shifting from template to app development
2. **Keep `.cursorignore`** - This is app-specific and should be tracked
3. **Don't modify Cursor rules in app repos** - Those belong in the template repo
4. **Run `npm run preflight`** to validate mode consistency
5. **Document app-specific Cursor config** in your app's README if needed

## Troubleshooting

### "Cannot commit Cursor logic files" Error
**Cause**: You're in app mode trying to commit `.cursor/` files
**Solution**:
- If updating template: Use `ALLOW_CURSOR_PUSH=1`
- If developing app: Remove `.cursor/` changes from commit

### Preflight Fails with "Repo mode" Check
**Cause**: Mode mismatch or missing expected files
**Solution**:
- Run `npm run convert:app` if switching to app mode
- Ensure `.cursorignore` exists in app mode
- Verify `.cursor/` exists in template mode

### Cursor Files Still Being Tracked in App Mode
**Cause**: `.gitignore` not updated or `.cursor/` files already tracked
**Solution**:
1. Run `npm run convert:app` to update `.gitignore`
2. Remove tracked files: `git rm -r --cached .cursor/` (except `.cursorignore`)
