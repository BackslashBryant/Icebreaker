# Cleanup Progress Summary

**Date**: 2025-11-11
**Status**: In Progress

## Completed Steps

### Step 1: Document Current State ✅
- Created audit files in `.notes/audit/`:
  - `github-issues.md` - All GitHub issues inventory
  - `git-branches.md` - All branches inventory
  - `plan-files.md` - Plan files inventory
  - `feature-directories.md` - Feature directories inventory
  - `research-files.md` - Research files inventory
  - `current-state.md` - Overall snapshot

### Step 2: Create New Numbering Scheme ✅
- Created `new-numbering-scheme.md` with:
  - Logical numbering (1-22)
  - Old → New mapping table
  - Category grouping (MVP Features, Testing, Infrastructure)

### Step 3: Sync GitHub Issues ✅
- Added cleanup comments to all issues with logical number mappings
- Fixed status inconsistencies:
  - Closed Issue #4 (Chat - had status:done but was OPEN)
  - Removed status:done from Issues #6, #18
- Created missing issues:
  - Issue #24: Block/Report (logical #5)
  - Issue #25: Chat Request Cooldowns (logical #7)
  - Issue #26: UX Review Fixes (logical #9)
  - Issue #27: Profile/Settings (logical #6)

### Step 4: Sync Git Branches ✅
- Renamed branches to match GitHub issue numbers:
  - `agent/forge/3-chat` → `agent/forge/4-chat` (#4)
  - `feat/5-panic-button` → `agent/forge/5-panic-button` (#5)
  - `agent/forge/8-chat-request-cooldowns` → `agent/forge/25-chat-request-cooldowns` (#25)
  - `agent/link/9-ux-fixes-bootup-messages` → `agent/link/26-ux-fixes-bootup-messages` (#26)
  - `agent/vector/10-persona-testing-polish` → deleted (duplicate)
  - `agent/link/7-profile-settings` → `agent/link/27-profile-settings` (#27)
- Created branches:
  - `agent/forge/24-block-report` (#24)
- Deleted duplicate branches:
  - `feat/3-chat`
  - `feat/6-block-report`
  - `agent/pixel/18-persona-testing`
  - `agent/vector/18-persona-testing-polish`
  - `agent/codex/10-backend-server-startup`

## Remaining Work

### Step 5: Sync Plan Files (In Progress)
- Create individual plan files for active issues
- Update master plan (`Docs/Plan.md`)
- Archive old plan files
- Update plan references

### Step 6: Sync Feature Tracking
- Update `current.json`
- Clean up feature directories
- Update progress files

### Step 7: Sync Research Files
- Rename research files to match GitHub numbers
- Update references
- Archive orphaned research

### Step 8: Update Documentation
- Search and update all references to old issue numbers
- Create migration guide

### Step 9: Verification
- Create verification script
- Run checks
- Fix remaining issues
- Create final cleanup summary

## Current Branch Status

All branches now match GitHub issue numbers:
- `agent/vector/1-onboarding-flow` → #1 ✅
- `agent/vector/2-radar-view` → #2 ✅
- `agent/forge/4-chat` → #4 ✅
- `agent/forge/5-panic-button` → #5 ✅
- `agent/nexus/6-integration-testing-launch-prep` → #6 ✅
- `agent/codex/11-persona-sim-testing-plan` → #11 ✅
- `agent/codex/18-persona-sim-testing` → #18 ✅
- `agent/pixel/20-performance-verification` → #20 ✅ (needs creation from remote)
- `agent/nexus/21-production-deployment` → #21 ✅
- `agent/nexus/22-monitoring` → #22 ✅
- `agent/forge/24-block-report` → #24 ✅
- `agent/forge/25-chat-request-cooldowns` → #25 ✅
- `agent/link/26-ux-fixes-bootup-messages` → #26 ✅
- `agent/link/27-profile-settings` → #27 ✅

## Notes

- GitHub issue numbers are immutable, so branches match GitHub numbers (not logical numbers)
- Logical numbers are used internally in plans/docs for organization
- Mapping table documents GitHub # → Logical # relationships
- Some branches still need to be pushed to remote after renaming
