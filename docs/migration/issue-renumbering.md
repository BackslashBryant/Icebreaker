# Issue Renumbering Migration Summary

**Migration Date**: 2025-11-11  
**Status**: ✅ **COMPLETE**

## Overview

All issues have been renumbered sequentially (1-12) to eliminate gaps and improve organization. The Plan.md structure has been restructured into an index file with individual issue plan files.

## Issue Number Mapping

**Old → New:**
- Issue #2 → Issue #1 (Radar View)
- Issue #3 → Issue #2 (Chat Interface)
- Issue #5 → Issue #3 (Panic Button)
- Issue #6 → Issue #4 (Block/Report Safety Controls)
- Issue #7 → Issue #5 (Profile/Settings)
- Issue #8 → Issue #6 (Chat Request Cooldowns)
- Issue #9 → Issue #7 (UX Review Fixes + Bootup Random Messages)
- Issue #10 → Issue #8 (Persona-Based Testing & Polish)
- Issue #18 → Issue #9 (Persona-Simulated User Testing)
- Issue #20 → Issue #10 (Performance Verification & Benchmarking)
- Issue #21 → Issue #11 (Production Deployment Infrastructure)
- Issue #22 → Issue #12 (Monitoring, Observability & Error Tracking)

## Plan File Consolidation

**Date**: 2025-11-11  
**Status**: ✅ **COMPLETE**

### Overview

All issue-related content has been consolidated into individual plan files (`docs/plans/Issue-<#>.md`). Each plan file is now the single source of truth for all issue-related content.

### Structure

Each plan file (`docs/plans/Issue-<#>.md`) contains:
- **Goals**: Issue goals, problem statement, desired outcome, success metrics
- **Research**: Research question, sources, findings, recommendations, rollback options
- **Steps**: Implementation steps with owners and status
- **Team Review**: Team review notes, approvals, feedback
- **Decisions**: Key decisions made during planning/implementation
- **Progress**: Current status, step completion, current issues
- **Test Results**: Test execution results, pass/fail status
- **Edge Cases**: Edge cases discovered, resolution status

### Files Archived

**Research Files**: Moved to `Docs/research/archive/`
- All `Issue-*-research.md` files archived

**Team Review Files**: Moved to `.notes/features/<slug>/archive/`
- All `team-review*.md` files archived
- All `progress.md` files archived

**Test Result Files**: Moved to `docs/testing/archive/`
- `persona-test-results.md` archived
- `edge-cases.md` archived

### Workflow Rules Updated

All workflow rules updated to reference plan files instead of separate research/progress files:
- `.cursor/rules/00-core.mdc` - Pre-flight checks updated
- `.cursor/rules/01-workflow.mdc` - Research and planning workflow updated
- `.cursor/rules/02-quality.mdc` - Progress references updated
- `.cursor/rules/04-integrations.mdc` - Citation references updated
- `.cursor/rules/06-orchestrator.mdc` - Routing checks updated
- All persona rules updated to reference plan files

### Benefits

1. **Single Source of Truth**: All issue-related content in one place
2. **Better Organization**: Easier to find and maintain issue information
3. **Improved Workflow**: Agents know exactly where to document findings
4. **Reduced Fragmentation**: No more scattered files across multiple directories

---

### Plan Structure
- ✅ `docs/Plan.md` - Restructured as index file
- ✅ `docs/plans/Issue-1.md` through `Issue-12.md` - Individual issue plans created

### Research Files
- ✅ `Docs/research/Issue-4-research.md` (was Issue-6-research.md)
- ✅ `Docs/research/Issue-5-research.md` (was Issue-7-research.md)
- ✅ `Docs/research/Issue-6-research.md` (was Issue-8-research.md)
- ✅ `Docs/research/Issue-8-research.md` (was Issue-10-research.md)
- ✅ `Docs/research/Issue-11-research.md` (was Issue-21-research.md)

### Feature Notes
- ✅ `.notes/features/current.json` - Updated to Issue #10
- ✅ All feature note files updated with new issue numbers

### Documentation
- ✅ `README.md` - All issue references updated
- ✅ `CHANGELOG.md` - All issue references updated
- ✅ `docs/testing/*.md` - Issue references updated
- ✅ `docs/troubleshooting/*.md` - Issue references updated

### Tools
- ✅ `tools/cleanup-branches.mjs` - Issue references updated
- ✅ `tools/create-production-issues.ps1` - Issue references updated

### Workflow Rules
- ✅ `.cursor/rules/07-process-improvement.mdc` - Issue references updated

## Branch Name Mapping

**Old → New:**
- `agent/vector/2-radar-view` → `agent/vector/1-radar-view`
- `feat/3-chat` → `feat/2-chat` or `agent/forge/2-chat`
- `feat/5-panic-button` → `feat/3-panic-button`
- `feat/6-block-report` → `feat/4-block-report`
- `agent/link/7-profile-settings` → `agent/link/5-profile-settings`
- `agent/pixel/20-performance-verification` → `agent/pixel/10-performance-verification`
- `agent/nexus/22-monitoring` → `agent/nexus/12-monitoring`

**Note**: Actual branch renaming on GitHub is optional. References in documentation have been updated to reflect new numbers.

## GitHub Issues

**Status**: ⏸️ **PENDING** - New issues need to be created on GitHub

**Action Required**:
1. Create new GitHub issues #1-12 with correct titles and descriptions
2. Close old issues #2, #3, #5, #6, #7, #8, #9, #10, #18, #20, #21, #22 with migration comments
3. Add migration comments linking old → new issue numbers

## Verification

Run the following to verify all references updated:
```bash
# Check for old issue numbers (should return minimal results)
grep -r "Issue #[0-9]" --exclude-dir=node_modules --exclude-dir=.git | grep -E "(Issue #(2|3|5|6|7|8|9|10|18|20|21|22)[^0-9])"

# Check for new issue numbers (should return many results)
grep -r "Issue #[0-9]" --exclude-dir=node_modules --exclude-dir=.git | grep -E "(Issue #(1|2|3|4|5|6|7|8|9|10|11|12)[^0-9])"
```

## Next Steps

1. ✅ Plan structure created
2. ✅ Research files renamed and updated
3. ✅ Feature notes updated
4. ✅ Code references updated
5. ✅ Branch references updated in docs
6. ⏸️ GitHub issues renumbering (pending)
7. ✅ Workflow rules updated
8. ✅ Verification complete

---

**Migration completed by**: Vector 🎯  
**Date**: 2025-11-11


**Migration Date**: 2025-11-11  
**Status**: ✅ **COMPLETE**

## Overview

All issues have been renumbered sequentially (1-12) to eliminate gaps and improve organization. The Plan.md structure has been restructured into an index file with individual issue plan files.

## Issue Number Mapping

**Old → New:**
- Issue #2 → Issue #1 (Radar View)
- Issue #3 → Issue #2 (Chat Interface)
- Issue #5 → Issue #3 (Panic Button)
- Issue #6 → Issue #4 (Block/Report Safety Controls)
- Issue #7 → Issue #5 (Profile/Settings)
- Issue #8 → Issue #6 (Chat Request Cooldowns)
- Issue #9 → Issue #7 (UX Review Fixes + Bootup Random Messages)
- Issue #10 → Issue #8 (Persona-Based Testing & Polish)
- Issue #18 → Issue #9 (Persona-Simulated User Testing)
- Issue #20 → Issue #10 (Performance Verification & Benchmarking)
- Issue #21 → Issue #11 (Production Deployment Infrastructure)
- Issue #22 → Issue #12 (Monitoring, Observability & Error Tracking)

## Plan File Consolidation

**Date**: 2025-11-11  
**Status**: ✅ **COMPLETE**

### Overview

All issue-related content has been consolidated into individual plan files (`docs/plans/Issue-<#>.md`). Each plan file is now the single source of truth for all issue-related content.

### Structure

Each plan file (`docs/plans/Issue-<#>.md`) contains:
- **Goals**: Issue goals, problem statement, desired outcome, success metrics
- **Research**: Research question, sources, findings, recommendations, rollback options
- **Steps**: Implementation steps with owners and status
- **Team Review**: Team review notes, approvals, feedback
- **Decisions**: Key decisions made during planning/implementation
- **Progress**: Current status, step completion, current issues
- **Test Results**: Test execution results, pass/fail status
- **Edge Cases**: Edge cases discovered, resolution status

### Files Archived

**Research Files**: Moved to `Docs/research/archive/`
- All `Issue-*-research.md` files archived

**Team Review Files**: Moved to `.notes/features/<slug>/archive/`
- All `team-review*.md` files archived
- All `progress.md` files archived

**Test Result Files**: Moved to `docs/testing/archive/`
- `persona-test-results.md` archived
- `edge-cases.md` archived

### Workflow Rules Updated

All workflow rules updated to reference plan files instead of separate research/progress files:
- `.cursor/rules/00-core.mdc` - Pre-flight checks updated
- `.cursor/rules/01-workflow.mdc` - Research and planning workflow updated
- `.cursor/rules/02-quality.mdc` - Progress references updated
- `.cursor/rules/04-integrations.mdc` - Citation references updated
- `.cursor/rules/06-orchestrator.mdc` - Routing checks updated
- All persona rules updated to reference plan files

### Benefits

1. **Single Source of Truth**: All issue-related content in one place
2. **Better Organization**: Easier to find and maintain issue information
3. **Improved Workflow**: Agents know exactly where to document findings
4. **Reduced Fragmentation**: No more scattered files across multiple directories

---

### Plan Structure
- ✅ `docs/Plan.md` - Restructured as index file
- ✅ `docs/plans/Issue-1.md` through `Issue-12.md` - Individual issue plans created

### Research Files
- ✅ `Docs/research/Issue-4-research.md` (was Issue-6-research.md)
- ✅ `Docs/research/Issue-5-research.md` (was Issue-7-research.md)
- ✅ `Docs/research/Issue-6-research.md` (was Issue-8-research.md)
- ✅ `Docs/research/Issue-8-research.md` (was Issue-10-research.md)
- ✅ `Docs/research/Issue-11-research.md` (was Issue-21-research.md)

### Feature Notes
- ✅ `.notes/features/current.json` - Updated to Issue #10
- ✅ All feature note files updated with new issue numbers

### Documentation
- ✅ `README.md` - All issue references updated
- ✅ `CHANGELOG.md` - All issue references updated
- ✅ `docs/testing/*.md` - Issue references updated
- ✅ `docs/troubleshooting/*.md` - Issue references updated

### Tools
- ✅ `tools/cleanup-branches.mjs` - Issue references updated
- ✅ `tools/create-production-issues.ps1` - Issue references updated

### Workflow Rules
- ✅ `.cursor/rules/07-process-improvement.mdc` - Issue references updated

## Branch Name Mapping

**Old → New:**
- `agent/vector/2-radar-view` → `agent/vector/1-radar-view`
- `feat/3-chat` → `feat/2-chat` or `agent/forge/2-chat`
- `feat/5-panic-button` → `feat/3-panic-button`
- `feat/6-block-report` → `feat/4-block-report`
- `agent/link/7-profile-settings` → `agent/link/5-profile-settings`
- `agent/pixel/20-performance-verification` → `agent/pixel/10-performance-verification`
- `agent/nexus/22-monitoring` → `agent/nexus/12-monitoring`

**Note**: Actual branch renaming on GitHub is optional. References in documentation have been updated to reflect new numbers.

## GitHub Issues

**Status**: ⏸️ **PENDING** - New issues need to be created on GitHub

**Action Required**:
1. Create new GitHub issues #1-12 with correct titles and descriptions
2. Close old issues #2, #3, #5, #6, #7, #8, #9, #10, #18, #20, #21, #22 with migration comments
3. Add migration comments linking old → new issue numbers

## Verification

Run the following to verify all references updated:
```bash
# Check for old issue numbers (should return minimal results)
grep -r "Issue #[0-9]" --exclude-dir=node_modules --exclude-dir=.git | grep -E "(Issue #(2|3|5|6|7|8|9|10|18|20|21|22)[^0-9])"

# Check for new issue numbers (should return many results)
grep -r "Issue #[0-9]" --exclude-dir=node_modules --exclude-dir=.git | grep -E "(Issue #(1|2|3|4|5|6|7|8|9|10|11|12)[^0-9])"
```

## Next Steps

1. ✅ Plan structure created
2. ✅ Research files renamed and updated
3. ✅ Feature notes updated
4. ✅ Code references updated
5. ✅ Branch references updated in docs
6. ⏸️ GitHub issues renumbering (pending)
7. ✅ Workflow rules updated
8. ✅ Verification complete

---

**Migration completed by**: Vector 🎯  
**Date**: 2025-11-11

