# Rule Updates Needed for Plan File Metadata Consistency

**Date**: 2025-11-26  
**Issue**: #30  
**Status**: Rule updates documented (cannot commit due to app mode)

## Required Rule Updates

Due to app mode restrictions, these rule updates cannot be committed directly. They should be applied when the repo is converted back to template mode or when manually updating the rules.

### 1. Plan File Header Metadata Requirements

**Location**: `.cursor/rules/01-workflow.mdc` Section 1 (Plan creation)

**Add after line 36**:
```
  - **Header Metadata**: The file header MUST be kept accurate at all times:
    - **Status**: Must match filename status (IN-PROGRESS, COMPLETE, etc.)
    - **Branch**: Must be actual branch name (never "TBD" after branch is created)
    - **Labels**: Must reflect current GitHub issue labels
    - **Created/Completed**: Must include accurate dates
```

### 2. Plan File Renaming Requirements

**Location**: `.cursor/rules/01-workflow.mdc` Section 1 (Plan creation)

**Replace line 42**:
```
  - **MANDATORY**: When status changes, use `git mv` to rename the file (e.g., `git mv Issue-10-plan-status-IN-PROGRESS.md Issue-10-plan-status-COMPLETE.md`) - this ensures the old file is deleted and only one file exists
  - **MANDATORY**: When renaming, immediately update header metadata (Status, Branch, Labels, Completion date) to match new status
```

### 3. Plan Checkbox Synchronization

**Location**: `.cursor/rules/01-workflow.mdc` Section 2 (Implementation)

**Add after line 155**:
```
  - **MANDATORY**: When marking checkpoints complete in Status Tracking, also mark the corresponding plan checkboxes (acceptance criteria) as complete - keep Status Tracking and Plan checkboxes synchronized
  - **MANDATORY**: Keep header metadata accurate - update Status, Branch, Labels whenever they change
```

### 4. Completion Checklist Updates

**Location**: `.cursor/rules/01-workflow.mdc` Section 6 (Issue completion)

**Replace lines 221-227**:
```
  1. **MANDATORY**: Update `Docs/plans/Issue-<#>-plan-status-<STATUS>.md`:
     - Mark ALL plan checkboxes (acceptance criteria) as complete `[x]` - not just Status Tracking
     - Mark ALL steps as ✅ COMPLETE with completion date in Status Tracking
     - **Update header metadata**: Change Status to `COMPLETE`, update Branch to actual branch name, update Labels to `status:done`, add Completion date
     - **Rename file**: Use `git mv` to change filename from `Issue-<#>-plan-status-IN-PROGRESS.md` to `Issue-<#>-plan-status-COMPLETE.md` (ensures old file is deleted)
     - Fill in Outcome section with status, completion date, branch, commit hash, verification results
     - Document verification results (all acceptance tests passed)
     - **CRITICAL**: This must be done BEFORE committing completion
     - **VERIFY**: After renaming, confirm only the COMPLETE file exists (no stale IN-PROGRESS file)
```

### 5. Process Improvement Entry

**Location**: `.cursor/rules/07-process-improvement.mdc`

**Add new entry**:
```
## 2025-11-26: Plan File Metadata Consistency & Completion Checklist

**Trigger**: Issue #30 completion revealed inconsistencies: plan file header showed "Status: IN-PROGRESS" and "Branch: TBD" even after completion, plan checkboxes remained unchecked despite Status Tracking showing complete, stale IN-PROGRESS file left after renaming to COMPLETE. **Lesson**: **MANDATORY METADATA CONSISTENCY** - Plan file header metadata (Status, Branch, Labels, dates) must always match actual state. When marking checkpoints complete, update BOTH Status Tracking AND plan checkboxes. When renaming plan file, use `git mv` to ensure old file is deleted. When completing issue, update ALL metadata in header (Status to COMPLETE, Branch to actual name, Labels to status:done, add Completion date). **Rule**: Updated `.cursor/rules/01-workflow.mdc` to require: (1) Header metadata kept accurate at all times (never "TBD" after branch created), (2) Plan checkboxes and Status Tracking kept synchronized, (3) Use `git mv` when renaming plan files, (4) Update all header metadata when completing issue, (5) Verify only one plan file exists after renaming. Added to completion checklist: update header metadata, mark all checkboxes, verify no stale files.
```

## Summary

These rule updates ensure:
1. Plan file headers always reflect accurate state
2. Plan checkboxes and Status Tracking stay synchronized
3. File renaming uses `git mv` to prevent stale files
4. Completion checklist includes all metadata updates
5. Verification step confirms only one plan file exists

These changes prevent the inconsistencies encountered in Issue #30.

