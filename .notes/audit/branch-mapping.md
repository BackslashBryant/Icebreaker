# GitHub Issue → Branch Mapping

**Date**: 2025-11-11
**Strategy**: Branches match GitHub issue numbers (GitHub numbers are immutable)

## Current Branch Status

| GitHub # | Title | Current Branch | Should Be | Action |
|----------|-------|----------------|-----------|--------|
| 1 | Onboarding (CLOSED) | `agent/vector/1-onboarding-flow` | ✓ Correct | Keep |
| 2 | Radar View (OPEN) | `agent/vector/2-radar-view` | ✓ Correct | Keep |
| 3 | - (no issue) | `agent/forge/3-chat` | - | Create issue #3 or delete branch |
| 4 | Chat (CLOSED) | `agent/forge/3-chat` | `agent/forge/4-chat` | Rename |
| 5 | Panic Button (CLOSED) | `feat/5-panic-button` | `agent/*/5-panic-button` | Rename to agent branch |
| 6 | Integration Testing (OPEN) | `agent/nexus/6-integration-testing-launch-prep` | ✓ Correct | Keep |
| 7 | - (no issue) | `agent/link/7-profile-settings` | - | Create issue #7 or delete |
| 8 | WS Mock (OPEN) | `agent/forge/8-chat-request-cooldowns` | `agent/forge/8-ws-mock` | Rename (conflict) |
| 9 | Persona Fixtures (OPEN) | `agent/link/9-ux-fixes-bootup-messages` | `agent/link/9-persona-fixtures` | Rename (conflict) |
| 10 | Geolocation (CLOSED) | Multiple branches | - | Resolve conflicts |
| 11 | Dual-context flows (OPEN) | `agent/codex/11-persona-sim-testing-plan` | ✓ Correct | Keep |
| 18 | Persona Testing (OPEN) | `agent/codex/18-persona-sim-testing` | ✓ Correct | Keep |
| 20 | Performance (OPEN) | `agent/pixel/20-performance-verification` | ✓ Correct | Keep |
| 21 | Production Deployment (OPEN) | `agent/nexus/21-production-deployment` | ✓ Correct | Keep |
| 22 | Monitoring (OPEN) | `agent/nexus/22-monitoring` | ✓ Correct | Keep |
| 24 | Block/Report (OPEN) | - | `agent/forge/24-block-report` | Create |

## Branch Conflicts to Resolve

### Issue #10 Conflicts
- `agent/pixel/10-performance-verification` → Should map to GitHub #20 (Performance)
- `agent/vector/10-persona-testing-polish` → Should map to GitHub #18 (Persona Testing)
- `agent/codex/10-backend-server-startup` → Determine if needed (may be part of #21)

### Issue #8 Conflict
- Branch: `agent/forge/8-chat-request-cooldowns` (Chat Request Cooldowns)
- GitHub #8: "WS Mock transport"
- **Decision Needed**: Are these the same feature or different?

### Issue #9 Conflict
- Branch: `agent/link/9-ux-fixes-bootup-messages` (UX Fixes)
- GitHub #9: "Persona presence fixture schema"
- **Decision Needed**: Are these the same feature or different?

## Rename Plan

1. `agent/forge/3-chat` → `agent/forge/4-chat` (Chat - GitHub #4)
2. `feat/5-panic-button` → `agent/forge/5-panic-button` (Panic Button - GitHub #5)
3. `agent/pixel/10-performance-verification` → `agent/pixel/20-performance-verification` (Performance - GitHub #20, already exists!)
4. `agent/vector/10-persona-testing-polish` → `agent/vector/18-persona-testing-polish` (Persona Testing - GitHub #18)
5. `agent/codex/10-backend-server-startup` → Determine destination
6. `agent/forge/8-chat-request-cooldowns` → Resolve conflict with GitHub #8
7. `agent/link/9-ux-fixes-bootup-messages` → Resolve conflict with GitHub #9
8. Create `agent/forge/24-block-report` for GitHub #24

## Duplicate Branches to Delete

- `feat/3-chat` (duplicate of `agent/forge/3-chat`)
- `feat/6-block-report` (work moved to GitHub #24)
- `agent/pixel/20-performance-verification` (if keeping `agent/pixel/10-performance-verification`)
