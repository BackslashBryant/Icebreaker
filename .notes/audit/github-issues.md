# GitHub Issues Inventory

**Date**: 2025-11-11
**Total Issues**: 20

## Open Issues (17)

| # | Title | State | Labels | Notes |
|---|-------|-------|--------|-------|
| 23 | Run Persona Testing Suite & Generate Actionable UX Insights | OPEN | status:plan, feature:testing, agent:pixel | |
| 22 | Monitoring, Observability & Error Tracking | OPEN | status:plan, agent:pixel, agent:nexus, infrastructure, monitoring | Launch blocker |
| 21 | Production Deployment Infrastructure | OPEN | status:plan, agent:nexus, infrastructure, agent:muse, launch-blocker | Launch blocker |
| 20 | Performance Verification & Benchmarking | OPEN | status:plan, feature:testing, agent:pixel, agent:nexus, performance | |
| 18 | Persona-Simulated User Testing with Look-and-Feel Validation | OPEN | agent:vector, status:plan, status:done, feature:testing, agent:pixel | Has status:done but OPEN |
| 17 | feat: Add Playwright visual snapshots for key screens | OPEN | status:plan, feature:testing, agent:pixel | |
| 16 | feat: Add keyboard-only, screen-reader, and WS failure coverage | OPEN | status:plan, feature:testing, agent:pixel, accessibility | |
| 15 | chore: Split Playwright suites and extend browser matrix | OPEN | status:plan, agent:pixel, chore, agent:nexus | |
| 14 | feat: Emit persona run telemetry + summarize results | OPEN | status:plan, feature:testing, agent:pixel, agent:nexus | |
| 13 | chore: Add data-testid to critical UI + selector map | OPEN | status:plan, agent:pixel, chore, agent:link | |
| 12 | feat: Validate look-and-feel across devices, themes, reduced motion | OPEN | status:plan, feature:testing, agent:pixel, accessibility | |
| 11 | feat: Upgrade persona E2E suites to dual-context flows (Phase 2) | OPEN | status:plan, feature:testing, agent:pixel | |
| 9 | chore: Add persona presence fixture schema + baseline scripts | OPEN | status:plan, agent:pixel, chore | |
| 8 | feat: Add PLAYWRIGHT_WS_MOCK transport + frontend shim | OPEN | status:plan, feature:testing, agent:pixel | |
| 6 | Integration Testing & Launch Preparation | OPEN | agent:vector, status:plan, status:done | Has status:done but OPEN |
| 4 | MVP: Chat (Ephemeral 1:1 Messaging) | OPEN | status:done | Has status:done but OPEN |
| 2 | MVP: Radar View (Proximity-Based Presence Visualization) | OPEN | agent:vector, status:plan, feature:radar | |

## Closed Issues (3)

| # | Title | State | Labels | Notes |
|---|-------|-------|--------|-------|
| 19 | Profile/Settings Page | CLOSED | status:done, feature:profile | |
| 10 | feat: Implement geolocation helper + proximity boundary tests | CLOSED | status:plan, status:done, feature:testing, agent:pixel | |
| 5 | MVP: Panic Button (Emergency Exit & Safety) | CLOSED | status:plan | |
| 1 | MVP: Onboarding Flow (Welcome → 18+ Consent → Location → Vibe & Tags) | CLOSED | stage:spec, agent:vector, feature:onboarding, status:done | |

## Missing Issue Numbers

- Issue #3: Referenced in branches but no GitHub issue found
- Issue #7: Referenced in branches but no GitHub issue found
- Issue #24+: Not present (gaps in numbering)

## Inconsistencies

1. **Issue #10**: CLOSED but has multiple branches referencing it:
   - `agent/pixel/10-performance-verification`
   - `agent/pixel/20-performance-verification` (duplicate?)
   - `agent/vector/10-persona-testing-polish`
   - `agent/codex/10-backend-server-startup`
   - Multiple research files: `Issue-10-research.md`, `Issue-10-backend-server-startup.md`

2. **Issue #6**: OPEN but has `status:done` label - inconsistent state

3. **Issue #4**: OPEN but has `status:done` label - inconsistent state

4. **Issue #18**: OPEN but has `status:done` label - inconsistent state

5. **Missing Issues**: Branches reference issues #3, #7 that don't exist in GitHub

6. **Duplicate References**: Issue #10 appears to be used for multiple different features
