# Cursor Custom Commands

Custom commands are reusable prompts that you can invoke in Cursor chat using the `/` prefix. They help streamline common workflows and maintain consistency across your team.

## How to Use

1. Type `/` in Cursor's chat interface
2. Select or type the command name (e.g., `/vector-plan`)
3. The command template will be inserted into your chat
4. Fill in any placeholders or customize as needed

## Available Commands

### Workflow Commands
- `/crew` - Survey context and recommend the next persona with a paste-ready handoff
- `/resume` - Identify the next checkpoint and owner, producing a ready-to-paste handoff
- `/handoff` - Template to hand off a specific checkpoint to a specific persona
- `/kickoff` - One-paste kickoff block for starting a feature (mirrors docs/agents/KICKOFF.md)
- `/status` - Quick status snapshot and recommended next action
- `/whats-next` - Comprehensive project status check (vision, plans, git, issues) with immediate next action
- `/current-issues` - Append a structured blocker entry to the active feature log
- `/finish` - Generate Muse/Nexus wrap-up checklists

### Persona-Specific Commands
- `/vector-plan` - Generate or update the numbered plan
- `/pixel-test` - Scaffold test cases for acceptance criteria
- `/scout-research` - Research a topic with citations
- `/as-<persona>` - Force a persona voice when you haven't opened matching files (e.g., `/as-forge`, `/as-link`)

### Domain Team Commands (Multi-Persona)
- `/team-userexperience` - Link + Muse: UI/UX review, copy, brand consistency
- `/team-security` - Sentinel + Scout: Security audit and vulnerability research
- `/team-testing` - Pixel + Sentinel + Scout: Test infrastructure, coverage, tooling
- `/team-accessibility` - Link + Pixel: WCAG compliance, keyboard navigation, screen readers
- `/team-documentation` - Muse + Link: Docs alignment with implementation
- `/team-architecture` - Vector + Scout + Sentinel: Tech decisions with security implications
- `/team-release` - Pixel + Sentinel + Muse: Release readiness check
- `/team-planning` - Vector + Pixel: Test strategy and acceptance criteria alignment
- `/team-research` - Scout + [domain expert]: Research with domain context

### Review & Analysis Commands
- `/self-review` - Architecture/code hygiene self-critique
- `/data-flow` - Explain end-to-end data flow and flag gaps
- `/predict-breakage` - Anticipate production failures with mitigations
- `/draft-architecture` - Fill gaps in docs/architecture/ARCHITECTURE_TEMPLATE.md interactively

### Documentation Commands
- `/append-session-summary` - Auto-append the latest recap to docs/context.md
- `/session-summary` - Produce a paste-ready session recap for `docs/context.md`

## Creating Your Own Commands

1. Create a new `.md` file in `.cursor/commands/`
2. Write your command template as a prompt that can be reused
3. Use placeholders like `[TOPIC]` or `[ISSUE_NUMBER]` for customization
4. Follow the existing command patterns for consistency

## Command Best Practices

- Keep commands focused on a single workflow
- Use clear, descriptive names
- Include examples in the command template
- Reference agent personas and path scopes when relevant
- Document dependencies (MCP tools, environment variables, etc.)
