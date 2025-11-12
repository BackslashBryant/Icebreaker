# Plan Files Inventory

**Date**: 2025-11-11

## Master Plan File

- **Location**: `Docs/Plan.md`
- **Status**: Contains multiple issues mixed together
- **Active Feature**: Persona-Based Testing & Polish (Issue #10)
- **Previous Features**: Integration Testing & Launch Preparation (Issue #6), UX Review Fixes (Issue #9)

### Issues Referenced in Master Plan

1. **Issue #6**: Integration Testing & Launch Preparation - Marked as COMPLETE but GitHub issue is OPEN
2. **Issue #9**: UX Review Fixes + Bootup Random Messages - Marked as COMPLETE
3. **Issue #10**: Persona-Based Testing & Polish - Marked as PLANNING but GitHub issue is CLOSED
4. **Issue #2**: Radar View - Listed as complete
5. **Issue #3**: Chat - Listed as complete
6. **Issue #5**: Panic Button - Listed as complete
7. **Issue #6**: Block/Report - Listed as complete (different from Integration Testing?)
8. **Issue #7**: Profile/Settings - Listed as complete
9. **Issue #8**: Chat Request Cooldowns - Listed as complete

## Individual Plan Files

### Existing Plan Files

- **Location**: `Docs/plans/Issue-10.md`
- **Status**: Exists but references Issue #10 which is CLOSED
- **Content**: Contains plan for Performance Verification & Benchmarking

### Missing Plan Files

No individual plan files found for:
- Issue #1 (Onboarding - CLOSED)
- Issue #2 (Radar View - OPEN)
- Issue #3 (Chat - no GitHub issue)
- Issue #4 (Chat - OPEN)
- Issue #5 (Panic Button - CLOSED)
- Issue #6 (Integration Testing - OPEN)
- Issue #7 (Profile/Settings - no GitHub issue)
- Issue #8 (WS Mock - OPEN)
- Issue #9 (Persona Fixtures - OPEN)
- Issue #11 (Dual-context flows - OPEN)
- Issue #12-23 (All OPEN issues)

## Inconsistencies

1. **Master Plan Confusion**: `Docs/Plan.md` mixes multiple issues and their statuses
2. **Issue #10 Conflict**: Plan file exists but GitHub issue is CLOSED
3. **Missing Plans**: Most issues don't have individual plan files
4. **Status Mismatch**: Plan says Issue #6 is COMPLETE but GitHub says OPEN
5. **Duplicate Issue #6**: Plan references both "Integration Testing" and "Block/Report" as Issue #6

## Plan File Structure

Current structure:
- `Docs/Plan.md` - Master plan (single file with multiple issues)
- `Docs/plans/Issue-10.md` - Individual plan (only one exists)

Desired structure (per plan):
- `Docs/Plan.md` - Master plan (overview, active feature, references to individual plans)
- `docs/plans/Issue-*.md` - Individual plan files (one per active issue)
