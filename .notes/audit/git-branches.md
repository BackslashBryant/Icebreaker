# Git Branches Inventory

**Date**: 2025-11-11
**Current Branch**: `agent/codex/11-persona-sim-testing-plan`

## Local Branches (20)

### Agent Branches by Issue Number

| Branch | Issue # | Agent | Status |
|--------|---------|-------|--------|
| `agent/vector/1-onboarding-flow` | 1 | vector | CLOSED issue |
| `agent/vector/2-radar-view` | 2 | vector | OPEN issue |
| `agent/forge/3-chat` | 3 | forge | No GitHub issue |
| `feat/3-chat` | 3 | - | Duplicate of above |
| `feat/5-panic-button` | 5 | - | CLOSED issue |
| `agent/nexus/6-integration-testing-launch-prep` | 6 | nexus | OPEN issue |
| `feat/6-block-report` | 6 | - | Duplicate of above? |
| `agent/link/7-profile-settings` | 7 | link | No GitHub issue |
| `agent/forge/8-chat-request-cooldowns` | 8 | forge | OPEN issue |
| `agent/link/9-ux-fixes-bootup-messages` | 9 | link | OPEN issue |
| `agent/pixel/10-performance-verification` | 10 | pixel | CLOSED issue |
| `agent/pixel/20-performance-verification` | 20 | pixel | OPEN issue (duplicate #10?) |
| `agent/vector/10-persona-testing-polish` | 10 | vector | CLOSED issue (duplicate) |
| `agent/codex/10-backend-server-startup` | 10 | codex | CLOSED issue (duplicate) |
| `agent/codex/11-persona-sim-testing-plan` | 11 | codex | OPEN issue |
| `agent/codex/18-persona-sim-testing` | 18 | codex | OPEN issue |
| `agent/nexus/21-production-deployment` | 21 | nexus | OPEN issue |
| `agent/nexus/22-monitoring` | 22 | nexus | OPEN issue |

### Chore Branches

| Branch | Purpose | Status |
|--------|---------|--------|
| `chore/cleanup-old-files` | Cleanup work | Completed |
| `chore/update-current-feature` | Feature tracking update | Completed |

## Remote Branches (13)

All remote branches match local branches (no additional remotes).

## Branch Naming Patterns

1. **Standard Pattern**: `agent/<agent>/<issue>-<slug>`
   - Examples: `agent/pixel/10-performance-verification`, `agent/nexus/21-production-deployment`

2. **Legacy Pattern**: `feat/<issue>-<slug>`
   - Examples: `feat/3-chat`, `feat/5-panic-button`, `feat/6-block-report`

3. **Chore Pattern**: `chore/<purpose>`
   - Examples: `chore/cleanup-old-files`, `chore/update-current-feature`

## Inconsistencies

1. **Issue #10 Duplicates**: Multiple branches reference issue #10:
   - `agent/pixel/10-performance-verification` (Performance Verification)
   - `agent/pixel/20-performance-verification` (Performance Verification - different number?)
   - `agent/vector/10-persona-testing-polish` (Persona Testing)
   - `agent/codex/10-backend-server-startup` (Backend Server Startup)

2. **Issue #3 Duplicates**: Two branches for issue #3:
   - `agent/forge/3-chat`
   - `feat/3-chat`

3. **Issue #6 Duplicates**: Two branches for issue #6:
   - `agent/nexus/6-integration-testing-launch-prep`
   - `feat/6-block-report` (different feature?)

4. **Missing Issues**: Branches reference issues without GitHub issues:
   - Issue #3: Has branches but no GitHub issue
   - Issue #7: Has branch but no GitHub issue

5. **Inconsistent Naming**: Mix of `agent/` and `feat/` prefixes

6. **Issue #20 vs #10**: `agent/pixel/20-performance-verification` may be duplicate of `agent/pixel/10-performance-verification`

## Merged Branches

None found merged to main (all branches appear active or unmerged).
