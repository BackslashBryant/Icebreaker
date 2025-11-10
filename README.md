# Icebreaker

A proximity-based ephemeral chat application for connecting people nearby. Built with a sequential crew of Cursor agents plus lightweight automation so you always know who is working, what checkpoint they are on, and how to ship safely.

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

## Try It: Onboarding Flow

The MVP Onboarding Flow is complete and ready to run:

1. **Start the backend**:
   ```bash
   cd backend
   npm install
   npm run dev
   ```
   Server runs on `http://localhost:8000`

2. **Start the frontend** (in a new terminal):
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Frontend runs on `http://localhost:3000`

3. **Try the onboarding flow**:
   - Visit `http://localhost:3000/welcome` to see the Welcome screen
   - Click "PRESS START" to begin onboarding
   - Complete the 4 steps: What We Are/Not → 18+ Consent → Location (skip optional) → Vibe & Tags
   - Submit to create a session and navigate to Radar view

4. **Verify**:
   - Test the onboarding API: `curl -X POST http://localhost:8000/api/onboarding -H "Content-Type: application/json" -d '{"vibe":"banter","tags":[],"visibility":true}'`
   - Run unit tests: `cd backend && npm test` and `cd frontend && npm test`
   - Run E2E: `cd tests && npm test`

**Test Results** (Issue #1):
- ✅ Backend: 15/15 unit tests passing
- ✅ Frontend: 35/35 unit tests passing  
- ✅ E2E: 8/8 tests passing (complete flow, accessibility, keyboard nav, error handling)
- ✅ Code coverage: 94.74% average (target: ≥80%)
- ✅ WCAG AA compliance: Verified via Playwright axe checks

See `.notes/features/onboarding-flow/` for detailed test results and verification.

---

## Try It: Radar View (Issue #2)

The Radar View feature is complete and ready to use:

1. **Complete onboarding** (see above) to create a session
2. **Navigate to Radar view** (`/radar`) after onboarding
3. **View nearby people**:
   - **CRT Sweep View**: Retro radar visualization showing people sorted by compatibility score
   - **List View**: Accessible list format with keyboard navigation
   - Toggle between views using the view switcher button
4. **Interact with people**:
   - Click on a person (sweep or list) to view their details
   - Person card shows handle, vibe, tags, signal score, and proximity tier
   - "START CHAT" button initiates chat request (Issue #3)

**Features**:
- Real-time WebSocket connection for radar updates
- Proximity-based sorting (ROOM, VENUE, NEARBY, FAR tiers)
- Compatibility scoring (vibe match, shared tags, visibility, proximity)
- Location updates every 30 seconds (approximate location only)
- WCAG AA compliant (keyboard navigation, screen reader support, reduced motion)
- Safety exclusions (sessions with safety flags excluded from results)

**Test Results** (Issue #2):
- ✅ Backend: 37/37 unit tests passing (Signal Engine, Proximity Utils, SessionManager, WebSocket)
- ✅ Frontend: 31/31 unit tests passing (Radar, RadarList, PersonCard, location-utils)
- ✅ E2E: Test scaffold created (full execution in Step 7)
- ✅ Accessibility: WCAG AA compliance verified (ARIA labels, keyboard nav, reduced motion)

See `docs/Plan.md` for complete implementation details.

---

## Try It: Block/Report (Safety Controls) (Issue #6)

The Block/Report feature provides safety controls for users to block or report others:

1. **From Chat Header**:
   - Click the ⋯ menu button (right side of header)
   - Select "Block" or "Report"
   - Block: Confirmation dialog → ends chat and blocks user
   - Report: Category selection (Harassment, Spam, Impersonation, Other) → submits report

2. **From PersonCard** (Radar view):
   - Long-press (500ms) or right-click on PersonCard dialog
   - Menu appears with "Block" and "Report" options
   - Keyboard alternative: Shift+Enter when PersonCard is focused
   - Same Block/Report dialogs as Chat header

3. **What happens**:
   - **Block**: User added to blocked list, active chat ended (if any), user won't appear in Radar
   - **Report**: Report stored with category, target's report count incremented
   - **Safety Exclusion**: When ≥3 unique users report the same person, they're temporarily hidden from Radar (1 hour default)
   - **Signal Engine Penalty**: Reported users (1-2 unique reports) appear lower in Radar results (negative weight applied)

**Features**:
- Authentication required: All safety endpoints require session token
- Duplicate prevention: Can't block/report yourself, can't duplicate reports
- Privacy-first: No message content stored, only report metadata
- Safety exclusion: Automatic temporary hiding for users with ≥3 unique reports
- Signal Engine integration: Reported users deprioritized in Radar results
- Accessibility: Keyboard navigation, ARIA labels, screen reader support
- WCAG AA compliant: All dialogs and menus accessible

**Test Results** (Issue #6):
- ✅ Backend: 66/66 unit tests passing (safety endpoints, SafetyManager, ReportManager, Signal Engine)
- ✅ Frontend: Tests created (BlockDialog, ReportDialog, useSafety, PersonCard tap-hold)
- ✅ Safety exclusion: Verified (≥3 unique reports triggers exclusion)
- ✅ Signal Engine integration: Verified (report penalty applied correctly)
- ✅ WCAG AA compliance: Verified (ARIA labels, keyboard nav)

See `docs/Plan.md` for complete implementation plan and acceptance criteria.

---

## Try It: Profile/Settings Page (Issue #7)

The Profile/Settings page allows users to manage their visibility, emergency contacts, and accessibility preferences:

1. **Access Profile**:
   - Click the Profile button (User icon) in Radar header or Chat header
   - Navigate to `/profile` route

2. **Manage Visibility**:
   - Toggle "Show me on Radar" checkbox to show/hide yourself from Radar
   - Changes are saved immediately and persisted in session
   - Toast notification confirms update

3. **Set Emergency Contact**:
   - Click "Add" or "Edit" button in Emergency Contact section
   - Enter phone number (E.164 format: +1234567890) or email address
   - Click "Save" to store contact (used for Panic Button notifications)
   - Click "Cancel" to discard changes

4. **Accessibility Settings**:
   - **Reduce Motion**: Toggle to disable animations and transitions
   - **High Contrast**: Toggle to increase color contrast for better visibility
   - Preferences persist in LocalStorage across sessions

**Features**:
- Visibility toggle: Show/hide on Radar (session-scoped)
- Emergency contact: Phone (E.164) or email (RFC 5322) validation
- Accessibility toggles: Reduced-motion and high-contrast modes
- LocalStorage persistence: Accessibility preferences saved locally
- Keyboard navigation: All interactive elements accessible via keyboard
- WCAG AA compliance: ARIA labels, screen reader support, high-contrast mode meets contrast ratios

**Test Results** (Issue #7):
- ✅ Backend: 21/21 unit tests passing (profile endpoints, SessionManager updates)
- ✅ Frontend: Component tests created (VisibilityToggle, EmergencyContactInput, AccessibilityToggles, Profile page)
- ✅ E2E: Profile page tests created (navigation, toggles, validation, accessibility)
- ✅ WCAG AA compliance: Verified (ARIA labels, keyboard nav, high-contrast)

See `docs/Plan.md` for complete implementation plan and acceptance criteria.

---

The Panic Button feature provides an always-accessible emergency exit:

1. **Access from Radar or Chat**:
   - Fixed floating action button (FAB) in bottom-right corner
   - Teal accent color, AlertTriangle icon
   - Always visible and accessible

2. **Trigger panic**:
   - Click the panic button FAB
   - Confirmation dialog appears: "Everything okay?"
   - Click "SEND ALERT & EXIT" or press Enter to confirm
   - Press Escape or "Never mind" to cancel

3. **What happens**:
   - Session ends immediately
   - Active chat terminated (if any)
   - User hidden from Radar for 1 hour (safety exclusion)
   - Success screen: "You're safe. Session ended."
   - Auto-redirects to Welcome screen after 3 seconds

**Features**:
- Always accessible: Fixed FAB on Radar and Chat screens
- Calm confirmation: "Everything okay?" dialog (brand voice)
- Safety exclusion: Temporarily hides user from Radar (1 hour default)
- Session termination: Ends active chat and clears session
- Keyboard accessible: Escape to cancel, Enter to confirm
- WCAG AA compliant: ARIA labels, screen reader support

**Test Results** (Issue #5):
- ✅ Backend: 21/21 PanicManager tests passing
- ✅ Frontend: 27/27 panic tests passing (components + hook)
- ✅ Safety exclusion: Verified in Signal Engine tests
- ✅ WCAG AA compliance: Verified (ARIA labels, keyboard nav)

See `docs/Plan.md` for complete implementation plan and acceptance criteria.

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
npm run dev:guarded        # Start dev server only if canonical port is free
npm run ports:status       # Show listeners on canonical ports
npm run ports:free         # POSIX cleanup of dev servers
npm run ports:free:win     # Windows cleanup of dev servers
npm run mcp:suggest        # Suggest MCP servers based on dependencies
npm run agents:prompt      # Print agent prompts
npm run github:labels      # Sync GitHub labels
npm run github:issue       # Create GitHub issues from templates
npm run github:init        # Seed starter Spec/Plan/Build/Verify issues (optional)
npm run github:pr          # Draft a PR from the current feature (use --push to publish)
```

`npm run github:pr -- --dry-run` previews the payload without pushing or calling GitHub. Add `-- --push` to push the branch automatically.

---

## Chat Commands (in Cursor)

Type `/` in chat to insert these helpers. See `.cursor/commands/README.md` for details.

- `/crew` – Survey context and recommend the next persona (with paste-ready handoff)
- `/resume` – Resume the next checkpoint from the plan
- `/handoff` – Template for a crisp Plan-Mode handoff to any persona
- `/kickoff` – One-paste kickoff block to start a feature
- `/status` – Quick feature status + one recommended action
- `/current-issues` – Append a structured blocker entry to the feature log
- `/finish` – Generate Muse/Nexus wrap-up checklists
- `/vector-plan`, `/pixel-test`, `/scout-research` – Persona-specific helpers
- **Domain Team Commands** – Multi-persona teams for comprehensive reviews:
  - `/team-userexperience` – UI/UX review (Link + Muse)
  - `/team-security` – Security audit (Sentinel + Scout)
  - `/team-testing` – Test infrastructure review (Pixel + Sentinel + Scout)
  - `/team-accessibility` – Accessibility audit (Link + Pixel)
  - `/team-documentation` – Docs alignment (Muse + Link)
  - `/team-architecture` – Tech decisions (Vector + Scout + Sentinel)
  - `/team-release` – Release readiness (Pixel + Sentinel + Muse)
  - `/team-planning` – Test strategy (Vector + Pixel)
  - `/team-research` – Research with domain context (Scout + expert)
- `/self-review` – Architecture/code hygiene self-critique
- `/data-flow` – Explain end-to-end data flow and flag gaps
- `/predict-breakage` – Anticipate production failures with mitigations
- `/draft-architecture` – Fill gaps in docs/architecture/ARCHITECTURE_TEMPLATE.md interactively
- `/append-session-summary` – Auto-append the latest recap to docs/context.md
- `/session-summary` – Produce a paste-ready session recap for `docs/context.md`
- `/as-<persona>` – Force a persona voice when you haven’t opened matching files (e.g., `/as-forge`, `/as-link`)

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
- `AGENTS.md` - Always/Never guardrails for Cursor agents
- `ops/docs/AGENT-RUNBOOK.md` - Step-by-step agent operations

### Guides

- `docs/agents/README.md` - Agent roster and workflow
- `docs/agents/SETUP.md` - Agent setup reference
- `docs/vision.md` - Source of truth for product intent
- `docs/ConnectionGuide.md` - Registry of ports, services, and integrations
- `docs/architecture/ARCHITECTURE_TEMPLATE.md` - Blueprint for stack/modules/data flow
- `docs/context.md` - Running session summaries for fast context reload
- `docs/cursor/SETTINGS_GUIDE.md` - Cursor IDE configuration (generated)
- `docs/cursor/extensions.md` - Extension installation
- `docs/cursor/models.md` - Model selection guide
- `docs/troubleshooting/mcp-setup-guide.md` - MCP server configuration

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

## Auto‑Routing (Default Behavior)

Open matching files and the right teammate joins automatically:

- Vector 🎯 → `docs/Plan.md`, `.notes/features/**`
- Pixel 🖥️ → `tests/**`, `**/__tests__/**`, test configs (Playwright/Jest/Vitest/Cypress)
- Forge 🔗 → `api/**`, `server/**`, `db/**`, `migrations/**`, `services/**`, common monorepo variants under `apps/**` and `packages/**`
- Link 🌐 → `src/**`, `app/**`, `pages/**`, `components/**`, `styles/**`, common monorepo variants under `apps/**` and `packages/**`
- Glide 📳 → `pwa/**`, `public/**`, service workers (`sw.*`, `service-worker.*`), common monorepo variants
- Apex 🤖 → `android/**`
- Cider 🍏 → `ios/**`
- Muse 🎨 → `docs/**`, `README.md`, `CHANGELOG.md` (including monorepos)
- Nexus 🚀 → `.github/**`, `.ci/**`, `Dockerfile*`, `deploy/**`, `env.example`, `docs/github/**`
- Scout 🔎 → `docs/research.md` (and `docs/research/**`)
- Sentinel 🛡️ → `docs/security/**`, `security/**`

Tip: Start with no files open and the orchestrator greets you in Vector’s voice; pick a lane, then open the files to auto‑route to that persona.

---

## Project Hygiene

- Keep modules around 800 lines or fewer; split or version files (e.g. `auth_service_v2.ts`) instead of overwriting.
- Pick one structure per project—either a monorepo or separate front/back specs—and keep the documentation and plans in sync.
- Maintain `docs/architecture/ARCHITECTURE_TEMPLATE.md` as the living blueprint; log each session in `docs/context.md` using `/session-summary`.
- Run `/self-review`, `/data-flow`, and `/predict-breakage` after major changes to catch architectural drift and edge cases.
- Before opening a PR, run `npm run precommit` and share the output.
- Prefer familiar stacks (React, Node, Supabase, etc.) unless you have strong justification—models know them best.
- Test as you go: let Pixel scaffold commands, run them after every checkpoint, and log failures with `/current-issues`.

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
6. ? Enable PR Auto-Labeler workflow (maps paths → `agent:*` labels)
7. ? Run `npm run github:init` to seed starter Spec/Plan/Build/Verify issues (optional)
8. ? Require checks: Template CI + persona auto-routing test + ConnectionGuide doc check

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
