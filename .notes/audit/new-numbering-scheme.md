# New Clean Numbering Scheme

**Date**: 2025-11-11
**Purpose**: Establish sequential numbering with no duplicates or gaps

## Numbering Strategy

### Categories

1. **MVP Features** (#1-14): Core product features from vision
2. **Testing & QA** (#15-20): Testing, performance, integration
3. **Infrastructure** (#21-22): Deployment, monitoring
4. **Chores & Tech Debt** (#23+): Maintenance, improvements

## New Sequential Numbering

### MVP Features (Core Product)

| New # | Title | Old # | Status | Notes |
|-------|-------|-------|--------|-------|
| 1 | MVP: Onboarding Flow | 1 | CLOSED | Keep as-is |
| 2 | MVP: Radar View | 2 | OPEN | Keep as-is |
| 3 | MVP: Chat (Ephemeral 1:1 Messaging) | 4 | OPEN | Renumber from #4 |
| 4 | MVP: Panic Button | 5 | CLOSED | Keep as-is |
| 5 | MVP: Block/Report | - | NEW | Create from `feat/6-block-report` branch |
| 6 | MVP: Profile/Settings Page | 19 | CLOSED | Renumber from #19 |
| 7 | MVP: Chat Request Cooldowns | 8 | OPEN | Renumber from #8 |

### Testing & QA

| New # | Title | Old # | Status | Notes |
|-------|-------|-------|--------|-------|
| 8 | Integration Testing & Launch Preparation | 6 | OPEN | Renumber from #6 |
| 9 | Performance Verification & Benchmarking | 20 | OPEN | Renumber from #20 (was duplicate of #10) |
| 10 | Persona-Simulated User Testing with Look-and-Feel Validation | 18 | OPEN | Renumber from #18 |
| 11 | Upgrade persona E2E suites to dual-context flows (Phase 2) | 11 | OPEN | Keep as-is |
| 12 | Add PLAYWRIGHT_WS_MOCK transport + frontend shim | 8 | OPEN | Renumber from #8 (duplicate?) |
| 13 | Add persona presence fixture schema + baseline scripts | 9 | OPEN | Renumber from #9 |
| 14 | Add data-testid to critical UI + selector map | 13 | OPEN | Renumber from #13 |
| 15 | Add keyboard-only, screen-reader, and WS failure coverage | 16 | OPEN | Renumber from #16 |
| 16 | Validate look-and-feel across devices, themes, reduced motion | 12 | OPEN | Renumber from #12 |
| 17 | Add Playwright visual snapshots for key screens | 17 | OPEN | Keep as-is |
| 18 | Emit persona run telemetry + summarize results | 14 | OPEN | Renumber from #14 |
| 19 | Split Playwright suites and extend browser matrix | 15 | OPEN | Renumber from #15 |
| 20 | Run Persona Testing Suite & Generate Actionable UX Insights | 23 | OPEN | Renumber from #23 |

### Infrastructure

| New # | Title | Old # | Status | Notes |
|-------|-------|-------|--------|-------|
| 21 | Production Deployment Infrastructure | 21 | OPEN | Keep as-is (launch blocker) |
| 22 | Monitoring, Observability & Error Tracking | 22 | OPEN | Keep as-is (launch blocker) |

## Issues to Close/Merge

### Close These (Duplicates/Resolved)

| Old # | Title | Reason | Merge Into |
|-------|-------|--------|------------|
| 10 | feat: Implement geolocation helper + proximity boundary tests | CLOSED, duplicate references | Close, keep separate |
| 4 | MVP: Chat (Ephemeral 1:1 Messaging) | Has status:done but OPEN | Close if done, or fix status |
| 6 | Integration Testing & Launch Preparation | Has status:done but OPEN | Fix status or close |
| 18 | Persona-Simulated User Testing | Has status:done but OPEN | Fix status or close |

### Create Missing Issues

| New # | Title | Source | Notes |
|-------|-------|--------|-------|
| 5 | MVP: Block/Report | `feat/6-block-report` branch | Create GitHub issue |

## Old → New Number Mapping

| Old # | New # | Title | Action |
|-------|-------|-------|--------|
| 1 | 1 | MVP: Onboarding Flow | Keep |
| 2 | 2 | MVP: Radar View | Keep |
| 3 | - | Chat (no GitHub issue) | Create issue #3 or merge with #4 |
| 4 | 3 | MVP: Chat | Renumber |
| 5 | 4 | MVP: Panic Button | Keep |
| 6 | 8 | Integration Testing & Launch Preparation | Renumber |
| 7 | - | Profile/Settings (no GitHub issue) | Already covered by #19 → #6 |
| 8 | 7 | Chat Request Cooldowns | Renumber (or 12 if duplicate) |
| 9 | 13 | Persona presence fixture schema | Renumber |
| 10 | - | Geolocation helper (CLOSED) | Close, keep separate |
| 10 | 9 | Performance Verification (branch) | Renumber to #9 |
| 10 | 10 | Persona Testing (branch) | Renumber to #10 |
| 10 | - | Backend Server Startup (branch) | Determine if needed |
| 11 | 11 | Dual-context flows | Keep |
| 12 | 16 | Look-and-feel validation | Renumber |
| 13 | 14 | Data-testid to UI | Renumber |
| 14 | 18 | Persona run telemetry | Renumber |
| 15 | 19 | Split Playwright suites | Renumber |
| 16 | 15 | Keyboard/screen-reader coverage | Renumber |
| 17 | 17 | Visual snapshots | Keep |
| 18 | 10 | Persona-Simulated User Testing | Renumber |
| 19 | 6 | Profile/Settings Page | Renumber |
| 20 | 9 | Performance Verification | Renumber |
| 21 | 21 | Production Deployment | Keep |
| 22 | 22 | Monitoring & Error Tracking | Keep |
| 23 | 20 | Run Persona Testing Suite | Renumber |

## Validation

### No Duplicates

- Each new number appears only once
- All active issues have unique numbers

### No Gaps

- Sequential from #1 to #22
- All numbers in sequence are used

### All Active Work Has Number

- All open GitHub issues mapped
- All active branches mapped
- Missing issues created

## Special Cases

### Issue #10 Resolution

Old Issue #10 (CLOSED - geolocation helper) conflicts with branches:

- `agent/pixel/10-performance-verification` → New #9 (Performance Verification)
- `agent/vector/10-persona-testing-polish` → New #10 (Persona Testing)
- `agent/codex/10-backend-server-startup` → Determine if needed (may be part of #21)

### Issue #3 Resolution

Branches exist but no GitHub issue:

- `agent/forge/3-chat` → Merge with Issue #4 (Chat) or create new #3
- Decision: Merge with #4 → New #3 (Chat)

### Issue #7 Resolution

Branch exists but no GitHub issue:

- `agent/link/7-profile-settings` → Already covered by Issue #19 → New #6

### Issue #6 Duplicate Resolution

Two branches for #6:

- `agent/nexus/6-integration-testing-launch-prep` → New #8 (Integration Testing)
- `feat/6-block-report` → New #5 (Block/Report) - create new issue

## Next Steps

1. Renumber GitHub issues using mapping table
2. Rename branches to match new numbers
3. Update plan files with new numbers
4. Update feature directories
5. Update research files
6. Create missing issues (#5 for Block/Report)
