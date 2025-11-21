# Plan-Status Migration Guide

**Date**: 2025-11-20  
**Purpose**: Guide for migrating existing issues to the new single plan-status file structure

## Overview

We've consolidated issue documentation from multiple files to a single living document per issue: `Docs/plans/Issue-<#>-plan-status.md`

## Migration Steps

### For Existing Issues

1. **Identify Issue Files**:
   - Check `.notes/features/<slug>/` for step files (step1-*.md, step2-*.md, etc.)
   - Check for `progress.md` file
   - Check for plan file in `Docs/plans/`

2. **Create Plan-Status File**:
   - Create `Docs/plans/Issue-<#>-plan-status.md` using the template below
   - Extract research summary from plan file or create `docs/research/Issue-<#>-research.md`
   - Consolidate all step details into the plan-status file
   - Include current status from progress.md

3. **Archive Old Files**:
   - Move all step files to `.notes/features/<slug>/archive/`
   - Remove `progress.md` (content consolidated into plan-status)
   - Keep `team-review-approved.md` (approval record)

4. **Update References**:
   - Update `.notes/features/current.json` if needed
   - Update any scripts or tools that reference old file locations

## Plan-Status File Template

```markdown
# Issue #<NUMBER> - <FEATURE NAME>

**Status**: draft | approved | in-progress | complete  
**Branch**: `agent/<agent>/<issue>-<slug>`  
**GitHub Issue**: https://github.com/BackslashBryant/Icebreaker/issues/<NUMBER>

## Research Summary

_Research file: `docs/research/Issue-<#>-research.md`_

_Research summary will be added here after Scout completes research._

## Goals & Success Metrics

- **Target User**: <target user>
- **Problem**: <problem statement>
- **Desired Outcome**: <desired outcome>
- **Success Metrics**:
  - <metric 1>
  - <metric 2>

## Plan Steps

1. **Step 1**: <Description> - **Status**: pending | in-progress | complete
2. **Step 2**: <Description> - **Status**: pending | in-progress | complete
...

## Current Status

**Overall Status**: draft | approved | in-progress | complete

### Step Completion

- [ ] Step 1: <Description>
- [ ] Step 2: <Description>
...

## Current Issues

_No blockers at this time._

_Or document blockers/loops here._

## Acceptance Tests

- [ ] <Test 1>
- [ ] <Test 2>
...

## Owners

- Vector (planning, research citations)
- Pixel (tests & verification)
- Implementers (Forge/Link/Glide/Apex/Cider) as assigned
- Muse (docs)
- Nexus (CI/preview)
- Sentinel (only if plan calls for security review)

## Risks & Open Questions

- <Risk or question 1>
- <Risk or question 2>
...

## Completion Summary

_Will be filled in when issue is complete._

_Include: Completion date, final status, summary, production URLs (if applicable), files created/modified, next steps_
```

## Status Values

- **draft**: Plan is being created, not yet reviewed
- **approved**: Plan reviewed and approved by team, ready for implementation
- **in-progress**: Implementation in progress
- **complete**: Issue completed

## GitHub Integration

The plan-status file header includes:
- GitHub issue URL
- Branch name
- Status (synced with GitHub labels)

When updating status:
- Update plan-status file status field
- Update GitHub issue labels: `status:draft`, `status:approved`, `status:in-progress`, `status:done`
- Update `.notes/features/current.json` status field

## Examples

See `Docs/plans/Issue-21-plan-status.md` for a complete example of a consolidated plan-status file.

## Benefits

- **Single Source of Truth**: One file per issue, easier to find and maintain
- **Better Organization**: All information in one place (research, plan, status, issues)
- **Reduced File Sprawl**: No more step1-*.md, step2-*.md proliferation
- **GitHub Sync**: Status synced with GitHub issues and labels
- **Easier Navigation**: Clear structure with consistent sections

## Rollback

If issues arise:
- Archived files remain in `.notes/features/<slug>/archive/`
- Old plan files can be restored from git history
- Plan-status files can coexist with old structure during transition

