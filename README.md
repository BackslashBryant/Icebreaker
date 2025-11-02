# Cursor Workspace Template

A stack-agnostic starting point for Cursor projects. It focuses on a visible, sequential crew of Cursor agents plus lightweight automation so you always know who is working, what checkpoint they are on, and how to ship safely.

**Foundational habits baked into the repo:**
- 📄 **Document the vision first** – `docs/vision.md` anchors every chat and plan.
- ✅ **Numbered checkpoints** – Vector’s plan and every handoff obey “Do not continue until approved.”
- 🎯 **Be stupidly specific** – prompts, rules, and playbooks demand exact selectors, values, and file targets.
- 🧪 **Test after every change** – Pixel enforces per-change verification; failures go to **Current Issues**.
- 🔁 **Reset on loops** – escalation protocol captures loops in `.notes/features/<slug>/progress.md`.
- 🔌 **ConnectionGuide** – `docs/ConnectionGuide.md` prevents port/API collisions.
- 🛑 **Global guardrails** – agents ask before committing, avoid mock data, and confirm tool choices.
- 🧠 **Plan Mode → Act Mode** – every agent describes the approach, waits for “Proceed,” then executes.

## Quick Start

**Get started in 3 steps:**

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd cursor-template-project
   ```

2. **Install dependencies (auto-setup)**
   ```bash
   npm install
   ```
   Postinstall runs your personal bootstrap (one-time token cache), refreshes detection/state when dependencies change, installs the template pre-commit guard, and then `npm run setup` for you.

3. **Start coding**
   - Configure Cursor IDE: `npm run setup:cursor`
   - Install extensions: `npm run setup:extensions`
   - (Optional) Create saved agents: `npm run setup:agents`
   - Track agent setup: rerun `npm run setup:agents -- --sync-state` and mark created agents in `.cursor/agents-state.json` to keep `npm run status` accurate
   - Verify: `npm run status`

**See QUICKSTART.md for the complete quick start guide.**

A default "Bootstrap Web Health MVP" feature is generated on first install. Run `npm run feature:new` to replace it with your own spec.

---

## What You Get

- **Automated Setup**: One-command setup wizard (`npm run setup`)
- **Health Dashboard**: Comprehensive status checker (`npm run status`)
- **MCP Scaffolding**: Pre-configured GitHub, Supabase, Playwright, DocFork, and Desktop Commander servers
- **Agent Workflow**: 11 specialized agents with sequential workflow (auto-routed, command-based, or saved)
- **Preflight Guards**: Automated checks before work starts
- **GitHub Integration**: Issue templates, PR templates, label sync, and workflow automation
- **Verification Helpers**: Stack-agnostic verification scripts
- **Documentation**: Comprehensive guides for setup, agents, and workflows

---

## Setup Commands

### One-Command Setup (Recommended)

```bash
npm run setup
```

Interactive wizard that handles:
- Prerequisites checking
- Token setup
- MCP configuration
- Preflight validation
- Guide generation

### Individual Setup Steps

```bash
npm run status             # Check setup status
npm run setup:tokens       # GitHub token wizard
npm run setup:agents       # Generate agent creation guide
npm run setup:extensions   # View extension installation guide
npm run setup:cursor       # Generate Cursor settings guide
npm run detect            # Detect project type and suggest MCPs/agents
npm run brains:refresh    # Re-run detection, agent sync, settings guide
npm run personal:bootstrap # Store GitHub token + preferences locally
npm run feature:new        # Bootstrap a new MVP spec/plan
npm run preset:webapp      # Re-seed the default health-check MVP
```

`npm run personal:bootstrap` safely stores your GitHub token and preferences in `~/.cursor-personal/config.json`, letting postinstall automate everything.

`npm run feature:new` creates `.notes/features/<slug>/spec.md`, rewrites `docs/Plan.md`, and resets progress for the next feature.

Set `CURSOR_AUTO_SETUP=false npm run setup` if you prefer to walk through the wizard manually.
---

## Workflow Commands

```bash
npm run preflight          # Validate workspace scaffolding
npm run verify             # Run verification suite (lint/test/build)
npm run test:personas      # Smoke-test persona auto-routing globs
npm run mcp:suggest        # Suggest MCP servers based on dependencies
npm run agents:prompt      # Print agent prompts
npm run github:labels      # Sync GitHub labels
npm run github:issue       # Create GitHub issues from templates
npm run github:pr          # Draft a PR from the current feature (use --push to publish)
```

`npm run github:pr -- --dry-run` previews the payload without pushing or calling GitHub. Add `-- --push` to push the branch automatically.

---

## Advanced Configuration

### Manual Cursor IDE Setup

If you prefer manual configuration, see `docs/cursor/SETTINGS_GUIDE.md` (generated via `npm run setup:cursor`):

1. **Enable Cursor Tab**: Settings ? Features ? Enable "Cursor Tab"
2. **Configure Indexing**: Settings ? Indexing ? Enable "Index New Files by Default" and "Git Graph Relationships"
3. **Enable Agent Mode**: Settings ? Chat ? Enable Agent Mode features
4. **Set Up MCP Servers**: Configure `.cursor/mcp.json` with your tokens

### Manual Agent Creation

See `docs/agents/CREATE_AGENTS.md` (generated via `npm run setup:agents`) for step-by-step instructions.

### Manual Extension Installation

See `docs/cursor/extensions.md` or run `npm run setup:extensions`.

---

## Solo MVP Loop

- Read `docs/process/MVP_LOOP.md` for the full solo workflow.
- Use the GitHub issue templates in `.github/ISSUE_TEMPLATE` (**0 - Spec**, **1 - Plan**, **2 - Build**).
- Active feature state lives in `.notes/features/current.json` and the spec/plan inside `.notes/features/<slug>/`.
- `npm run feature:new` archives the previous feature, scaffolds a new spec + progress log, and rewrites `docs/Plan.md`.
- Agents stop once the MVP DoD checklist in the spec is GREEN; log stretch work as a new spec.

## Documentation

### Getting Started

- `QUICKSTART.md` - 3-step quick start guide
- `docs/FIRST_RUN.md` - Detailed first-time setup walkthrough
- `docs/agents/PLAYBOOK.md` - Roster playbook and chat handoff cheat sheet
- `docs/agents/KICKOFF.md` - How to start your first feature

### Guides

- `docs/agents/README.md` - Agent roster and workflow
- `docs/agents/SETUP.md` - Agent setup reference
- `docs/vision.md` - Source of truth for product intent
- `docs/ConnectionGuide.md` - Registry of ports, services, and integrations
- `docs/cursor/SETTINGS_GUIDE.md` - Cursor IDE configuration (generated)
- `docs/cursor/extensions.md` - Extension installation
- `docs/cursor/models.md` - Model selection guide
- `docs/MCP_SETUP_GUIDE.md` - MCP server configuration

### Workflow

- `docs/agents/KICKOFF.md` - Starting a new feature
- `docs/github/README.md` - GitHub workflow checklist
- `docs/github/BRANCH_PROTECTION.md` - Branch protection setup

---

## Typical Workflow

1. **Setup** (one-time)
   ```bash
   npm install            # Auto-runs bootstrap + setup
   npm run setup:agents   # (Optional) Create persistent agents in Cursor IDE
   npm run status         # Verify everything is ready
   ```

2. **Stage 0 - Spec**
   - Run `npm run feature:new` (or keep the seeded MVP).
   - Fill in `.notes/features/<slug>/spec.md` and create a **0 - Spec** issue.
   - Capture MVP DoD and success metrics; postpone extras to "Not Now".

3. **Stage 1 - Plan**
   - Ask @Vector to update `docs/Plan.md` (use **1 - Plan** issue).
   - Keep steps to 3-5 and map every DoD checkbox to a specific step.
   - Let @Pixel sign off once scaffolding tests are outlined.

4. **Stage 2 - Build & Verify**
   - Work issue moves to **2 - Build**.
   - Agents execute: Pixel -> Implementers -> Pixel -> Muse -> Nexus (Sentinel if required).
   - Update `.notes/features/<slug>/progress.md` as stages complete.
   - Ship once the spec's MVP DoD is GREEN and `npm run verify` passes.

5. **Ship**
   - Archive the feature automatically on the next `npm run feature:new`.
   - Log follow-up ideas in `.notes/ideas.md` or a new **0 - Spec** issue.
   - Keep the repo clean by running `npm run preflight` before closing the loop.
---

## Agent Modes

- **Auto-routing (default)** – The rule files under `.cursor/rules/persona-*.mdc` activate the right persona as soon as you open the matching files (e.g., `/docs/Plan.md` → Vector 🎯, `/tests/**` → Pixel 🖥️). No manual agent creation required.
- **On-demand commands** – Use `/vector-plan`, `/pixel-test`, `/scout-research`, etc., to inject a persona prompt into any chat when you need them outside their file scope.
- **Saved agents (advanced)** – If you prefer persistent agents in Cursor’s sidebar, run `npm run setup:agents` and paste the prompts from `docs/agents/CREATE_AGENTS.md`. The automatic rules still work alongside them.
- The orchestrator rule (`.cursor/rules/06-orchestrator.mdc`) keeps the relay clean when multiple personas are in play or when no files are attached.

---

## Customization

- **Documentation**: Everything under `docs/` is a template--replace or delete once you create project-specific content
- **Automation**: Copy useful scripts from `examples/automation/` into your project
- **Rules**: Update `.cursor/rules/*.mdc` to reflect your team's conventions
- **CI**: Expand `.github/workflows/ci.yml` with stack-specific jobs

---

## GitHub Integration Checklist

1. ? Configure `GITHUB_TOKEN` (repo + workflow scopes): `npm run setup:tokens`
2. ? Sync labels: `npm run github:labels`
3. ? Update `.github/CODEOWNERS` and issue templates with your team info
4. ? Enable GitHub MCP in Cursor IDE
5. ? Set up branch protections (see `docs/github/BRANCH_PROTECTION.md`)

---

## Troubleshooting

**Setup issues?**
- Run `npm run status` to see what's missing
- Check `docs/FIRST_RUN.md` for detailed walkthrough
- Verify prerequisites: Node.js 18+, npm, Git, Cursor IDE

**Agent issues?**
- Verify agents are created: Check Cursor IDE Agents panel
- Check MCP servers: `npm run status`
- Review `docs/agents/CREATE_AGENTS.md`

**MCP issues?**
- Verify environment variables: `npm run status`
- Check `.cursor/mcp.json` syntax
- Run `npm run mcp:suggest` for suggestions

---

## Next Steps

- Complete setup: `npm run setup`
- Verify: `npm run status`
- Start coding: See `docs/agents/KICKOFF.md`

**Happy building!**
