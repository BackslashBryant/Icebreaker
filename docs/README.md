# Documentation Index

**Purpose**: Single source of truth for all project documentation. This index maps folder ownership, audience boundaries, and entry points.

## Quick Entry Points

- **[Vision](vision.md)** - Product vision, user journey, success criteria
- **[Connection Guide](ConnectionGuide.md)** - Ports, endpoints, services, integrations
- **[QUICKSTART.md](../QUICKSTART.md)** - Quick setup guide (root level)
- **[README.md](../README.md)** - Project overview (root level)

## Folder Ownership Map

### Product & UX
- **`Vision/`** - Product vision documents, brand assets, design mocks
- **`personas/`** - User personas with social profiles and IceBreaker configurations
- **`PRD.md`** - Product Requirements Document

### Architecture & Technical
- **`architecture/`** - Technical overviews, service maps, ADRs, data flows
- **`ConnectionGuide.md`** - Ports, endpoints, services, integrations (single file)

### Development Workflow
- **`development/`** - Local setup, workflows, git hooks, guardrails
- **`github/`** - Branch protection, CI behavior, release process, labels
- **`cursor/`** - Cursor IDE extensions, symbols, agent tooling, settings
- **`agents/`** - Agent playbooks, prompts, setup guides

### Testing & Quality
- **`testing/`** - Test strategy, visual baselines, flake log, runbooks, backlog
  - **`FLAKY_TESTS.md`** - Known flaky tests and resolution status
  - **`VISUAL-BASELINES.md`** - Visual regression baseline process
  - **`TESTING-BACKLOG.md`** - Remaining testing infrastructure issues

### Operations & Production
- **`monitoring/`** - Dashboards, alert definitions, API keys, health checks, runbooks
  - **`RUNBOOK.md`** - Incident response procedures
  - **`DASHBOARDS.md`** - Monitoring dashboard links
  - **`ALERTS.md`** - Alert definitions and thresholds
- **`verification/`** - Deployment/rollback checklists, health validation procedures
- **`troubleshooting/`** - Incident runbooks, known issues, past incident reports

### Issue-Specific Documentation
- **`plans/`** - Per-issue plan-status files (`Issue-<id>-plan-status-<STATE>.md`)
- **`research/`** - Per-issue research files (`Issue-<id>-research.md`)

### Process & Analysis
- **`process/`** - Process documentation, MVP loop, improvements
- **`analysis/`** - Analysis reports, readiness reviews
- **`migration/`** - Migration guides and procedures

### Security
- **`security/`** - Security documentation, notes, compliance
- **`security.md`** - Security overview (single file)

### Guides & References
- **`guides/`** - Setup guides, field testing, troubleshooting guides

## Audience Boundaries

### Dev-Facing (How to change/build/test the app)
- `development/` - Local setup, workflows, git hooks
- `testing/` - How to run tests, smoke vs full, visual baseline process
- `architecture/` - Diagrams, service maps, data flows, ADRs
- `github/` - Branch protection, CI behavior, release process
- `cursor/` - IDE extensions, symbols, agent tooling
- `agents/` - Agent playbooks, prompts, setup

### Ops-Facing (How to run/monitor/repair the app in production)
- `monitoring/` - Dashboards, alert definitions, API keys, health checks
- `verification/` - Deployment/rollback checklists, health validation
- `troubleshooting/` - Incident runbooks, known issues, past incidents

**Rule of thumb**: If it's about changing/building/testing → dev docs. If it's about running/monitoring/repairing → ops docs.

## Documentation Standards

### Per-Issue Documentation
- **Plans**: `plans/Issue-<id>-plan-status-<STATE>.md` where STATE is `IN-PROGRESS`, `COMPLETE`, `SUPERSEDED`, or `BLOCKED`
- **Research**: `research/Issue-<id>-research.md`
- See [`plans/README.md`](plans/README.md) for lifecycle rules

### No Top-Level Sprawl
- **No new top-level doc directories** - everything goes under `Docs/`
- New categories go as subfolders of closest existing area
- One-off notes go in `research/` or `troubleshooting/` with clear names

### Completion Requirements
- No issue is `status:done` unless matching `plan-status-COMPLETE.md` exists
- Testing docs must be updated when suites/matrix/snapshots change
- Monitoring/runbooks must be updated when CI/health checks change

## Maintenance

- **Nexus** keeps monitoring/verification docs current
- **Muse** maintains README/CHANGELOG/guides
- **Vector** ensures plan-status files follow naming conventions
- **All agents** update relevant docs when making changes

For questions or updates to this index, contact @Muse 🎨 or @Vector 🎯

