# Cursor IDE Settings Guide

This guide provides step-by-step instructions for configuring Cursor IDE to work optimally with this workspace template.

## Quick Start

1. Open Cursor Settings: `Ctrl+Shift+J` (Windows/Linux) or `Cmd+Shift+J` (macOS)
2. Navigate through the settings sections below
3. Enable/configure each setting as described
4. Restart Cursor if prompted

---

## Essential Settings

### 1. Enable Cursor Tab (AI Autocomplete)

**What it does**: Provides multi-line code suggestions based on context.

**How to enable**:
1. Settings → Features → **Cursor Tab**
2. Toggle **"Enable Cursor Tab"** ON
3. Optional: Adjust suggestion acceptance (Tab for full, Ctrl+→ for word-by-word)

**Why**: Dramatically speeds up coding with intelligent autocomplete.

---

### 2. Configure Codebase Indexing

**What it does**: Indexes your codebase for better AI understanding and context.

**How to enable**:
1. Settings → **Indexing**
2. Enable **"Index New Files by Default"** ✓
3. Enable **"Git Graph Relationships"** ✓ (indexes git history for better context)

**Why**: Improves AI's understanding of your codebase structure and relationships.

---

### 3. Enable Agent Mode Features

**What it does**: Configures how Cursor Agents interact with your workspace.

**How to enable**:
1. Settings → **Chat** → **Agent Mode**
2. Enable **"Agent Stickiness"** ✓ (maintains mode selection across conversations)
3. Enable **"Auto-Scroll to Bottom"** ✓ (auto-scrolls to latest messages)
4. Enable **"Auto-Apply to Files Outside Context"** ✓ (allows agents to edit files beyond current context)

**Why**: Makes agent workflow smoother and more autonomous.

---

### 4. Workspace Settings (Auto-Applied)

The following settings are automatically applied via `.vscode/settings.json`:

### Editor Formatting
- **Format on Save**: `true`
- **Code Actions on Save**: Auto-fix linting issues
- **Tab Size**: `2` spaces
- **Insert Spaces**: `true`

### File Handling
- **Trim Trailing Whitespace**: Enabled
- **Insert Final Newline**: Enabled
- **Trim Final Newlines**: Enabled

### File Associations
- `*.mdc` → `markdown`

### File Exclusions
`.vscode/settings.json` excludes `11` patterns from file explorer:
- Build outputs (`dist/`, `build/`, `.next/`, etc.)
- Dependencies (`node_modules/`)
- Cache directories
- Test results

See `.cursorignore` for AI indexing exclusions.

### Search Exclusions
Search excludes the same patterns as file exclusions for better performance.

---

## Keyboard Shortcuts Reference

Essential shortcuts for efficient Cursor usage:

### Navigation & Modes
- `Ctrl+I` / `Cmd+I` - Toggle Sidepanel (Agent Mode)
- `Ctrl+L` / `Cmd+L` - Open Ask Mode
- `Ctrl+.` / `Cmd+.` - Toggle Chat Modes (Agent/Ask/Custom)
- `Ctrl+/` / `Cmd+/` - Loop between AI models
- `Ctrl+K` / `Cmd+K` - Inline Edit / Prompt Bar
- `Ctrl+Shift+P` / `Cmd+Shift+P` - Command Palette

### Chat & Editing
- `Enter` - Submit message
- `Ctrl+Backspace` / `Cmd+Backspace` - Cancel generation
- `Ctrl+Enter` / `Cmd+Enter` - Queue messages (send multiple)

### Autocomplete
- `Tab` - Accept suggestion
- `Ctrl+→` / `Cmd+→` - Accept word-by-word
- `Esc` - Reject suggestion

---

## Advanced Settings

### Plan Mode (Shift+Tab)

**What it does**: Draft multi-step plans before implementation.

**How to use**:
1. Press `Shift+Tab` to enter Plan Mode
2. Describe what you want to build
3. Agent drafts a plan, you review/tweak, then build
4. Plans saved to `.cursor/plans/`

**Why**: Better structure for complex features requiring multiple steps.

---

### Privacy Mode (Optional)

**What it does**: Ensures code is never stored remotely without consent.

**How to enable**:
1. Settings → **Privacy**
2. Enable **"Privacy Mode"** ✓

**When to use**: If working with sensitive code or compliance requirements.

---

### Model Selection

**How to switch models**:
- Use `Ctrl+/` / `Cmd+/` to loop between models
- Or specify in chat: "Use Gemini 2.5 Pro for this task"

**Model recommendations** (see `docs/cursor/models.md`):
- **Claude 3.7 Sonnet** - Default, balanced reasoning (200k context)
- **Gemini 2.5 Pro** - Fast iteration, large context (2M context)
- **OpenAI o4-mini** - Quick TDD loops, small context

---

## Context References (@symbols)

Use these in chat to provide context:

- `@filename` - Include specific file
- `@symbol` - Reference code symbol
- `@LibraryName` - Access library documentation
- `@Docs → Add new doc` - Add custom documentation
- `@Web` - Retrieve web information
- `@file-tree` - Include file tree structure
- `@Cursor Rules` - Reference specific rules

See `docs/cursor/symbols.md` for complete reference.

---

## Verification

After configuring settings:

1. Run `npm run status` to check setup status
2. Verify Cursor Tab is working (type code, see suggestions)
3. Test Agent Mode: `Ctrl+I` → type a request → agent should respond
4. Verify indexing: Check Settings → Indexing status

---

## Troubleshooting

### Settings Not Applying

- **Solution**: Restart Cursor IDE
- **Check**: Settings are workspace-specific (not global) - verify `.vscode/settings.json` exists

### Cursor Tab Not Showing Suggestions

- **Check**: Settings → Features → Cursor Tab is enabled
- **Check**: You have an active subscription/API access
- **Try**: Restart Cursor IDE

### Agent Mode Not Working

- **Check**: Settings → Chat → Agent Mode features are enabled
- **Check**: MCP servers are configured in `.cursor/mcp.json`
- **Check**: Environment variables are set (run `npm run status`)

### Indexing Slow

- **Check**: Settings → Indexing → exclude large directories in `.cursorignore`
- **Check**: File exclusions in `.vscode/settings.json` are working

---

## Next Steps

1. ✅ Configure all settings above
2. ✅ Install recommended extensions: `npm run setup:extensions`
3. ✅ Set up MCP servers: `npm run setup`
4. ✅ Create agents: `npm run setup:agents`
5. ✅ Verify setup: `npm run status`

---

## Related Documentation

- `docs/cursor/extensions.md` - Install workspace extensions
- `docs/cursor/symbols.md` - @symbol reference
- `docs/cursor/models.md` - Model selection guide
- `docs/cursor/agent-tools.md` - Agent tools configuration
- `docs/guides/setup/mcp-setup.md` - MCP server setup

---

_This guide was generated from `.vscode/settings.json`. Run `npm run setup:cursor` to regenerate._
