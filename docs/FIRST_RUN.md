# First Run Guide

Welcome! This guide walks you through what happens when you first clone this repository and how to get everything set up.

## What Happens on First Clone

When you clone this repository, you get:

- ✅ **Pre-configured workspace** with Cursor rules, agents, and MCP setup
- ✅ **Automation tools** ready to use (`npm run` commands)
- ✅ **Documentation** for workflows and best practices
- ⚠️ **Setup required** for your environment (tokens, agents, Cursor settings)

## Quick Setup (Recommended)

The fastest way to get started:

```bash
npm install
```

During the first install the postinstall hook will:
- Run the personal bootstrap (`npm run personal:bootstrap`) to cache your GitHub token and preferences
- Launch the full setup wizard in hands-free mode (`npm run setup`)
- Generate the Cursor settings and agent guides

When it finishes you can jump straight into the repo.

## Manual Setup (Alternative)

### Bootstrap your first feature

```bash
npm run feature:new
```

- Fill in `.notes/features/<slug>/spec.md` with the MVP DoD.
- Create a GitHub issue using the **0 - Spec** template.
- Follow `docs/process/MVP_LOOP.md` to move from Spec -> Plan -> Build.

### 1. Check Prerequisites

### 1. Check Prerequisites

```bash
node --version  # Should be 18+
npm --version
git --version
```

**Missing something?**
- Node.js: https://nodejs.org/
- Git: https://git-scm.com/
- Cursor IDE: https://cursor.sh/

### 2. Set Up GitHub Token

Required for GitHub MCP server:

```bash
npm run setup:tokens
```

This wizard will:
- Guide you through creating a GitHub Personal Access Token
- Validate the token format
- Help you save it securely

**Required scopes**: `repo`, `repo:status`, `workflow`, `issues`

### 3. Configure MCP Servers

MCP servers are pre-configured in `.cursor/mcp.json`. To auto-install suggested servers:

```bash
npm run mcp:suggest -- --install all
```

### 4. Run Preflight Checks

Verify workspace scaffolding:

```bash
npm run preflight
```

This checks:
- Plan scaffold exists
- Agent prompts are present
- Issue templates are configured
- MCP config is valid

### 5. Configure Cursor IDE Settings

Generate and follow the settings guide:

```bash
npm run setup:cursor
```

Then open `docs/cursor/SETTINGS_GUIDE.md` and configure:
- Cursor Tab (AI autocomplete)
- Codebase Indexing
- Agent Mode features

### 6. Install Extensions

View extension recommendations:

```bash
npm run setup:extensions
```

Install via Cursor's Extensions panel or Command Palette.

### 7. Create Agents

Generate the agent creation guide:

```bash
npm run setup:agents
```

Then follow `docs/agents/CREATE_AGENTS.md` to create all 11 agents in Cursor IDE.

### 8. Verify Setup

Check everything is ready:

```bash
npm run status
```

This shows:
- ✅ What's configured
- ⚠️ What needs setup
- ❌ What's missing

## Understanding the Structure

```
cursor-template-project/
├── .cursor/              # Cursor workspace configuration
│   ├── config.json       # Rules and plans configuration
│   ├── mcp.json          # MCP server configuration
│   ├── agents-config.json # Agent configuration reference
│   └── rules/            # Development rules
├── docs/                 # Documentation
│   ├── agents/          # Agent prompts and guides
│   ├── cursor/          # Cursor-specific guides
│   └── ...
├── tools/                # Automation scripts
│   ├── setup.mjs        # Main setup wizard
│   ├── health-check.mjs  # Status checker
│   └── ...
└── scripts/              # Verification scripts
```

## Common First-Run Issues

### "Node.js not found"

**Solution**: Install Node.js 18+ from https://nodejs.org/

### "GITHUB_TOKEN not set"

**Solution**: Run `npm run setup:tokens` to create and configure your token

### "MCP servers not configured"

**Solution**: Run `npm run mcp:suggest -- --install all` to auto-configure

### "Preflight checks failed"

**Solution**: Review the preflight output. Most issues are missing files that should be in the template. Try re-cloning if something is missing.

### "Agents not working"

**Solution**:
1. Verify agents are created in Cursor IDE (run `npm run setup:agents` for guide)
2. Check MCP servers are configured (`npm run status`)
3. Ensure environment variables are set

## Next Steps After Setup

1. ✅ **Verify**: Run `npm run status` - should show all green
2. ✅ **Test**: Create a test issue and run the kickoff workflow
3. ✅ **Explore**: Read `docs/agents/KICKOFF.md` for workflow details
4. ✅ **Customize**: Update `.cursor/rules/` to match your team's preferences

## Getting Help

- **Status Check**: `npm run status` shows what's configured
- **Health Dashboard**: `npm run status` provides actionable fixes
- **Documentation**: Check `docs/` directory for guides
- **Quick Reference**: See `QUICKSTART.md` for 3-step setup

## What Gets Configured?

### Automatically Configured

- ✅ Workspace settings (`.vscode/settings.json`)
- ✅ MCP server templates (`.cursor/mcp.json`)
- ✅ Agent prompts (`docs/agents/prompts/`)
- ✅ GitHub templates (`.github/ISSUE_TEMPLATE/`)
- ✅ Rules and workflows (`.cursor/rules/`)

### Needs Your Input

- ⚠️ GitHub token (environment variable)
- ⚠️ Cursor IDE settings (manual configuration)
- ⚠️ Cursor agents (created via UI)
- ⚠️ Extensions (installed via Cursor)

### Optional Configuration

- 💡 Supabase credentials (if using Supabase)
- 💡 Project-specific MCPs (detected via `npm run mcp:suggest`)
- 💡 Custom rules (update `.cursor/rules/`)

---

**Ready?** ? Run `npm install` to begin!



