# Feature Directories Inventory

**Date**: 2025-11-11
**Base Directory**: `.notes/features/`

## Active Feature Directories

| Directory | Issue # | Status | Files |
|-----------|---------|--------|-------|
| `block-report` | 6? | Active | progress.md, github-comment.md, team-review-approved.md |
| `bootstrap-web-health-mvp` | - | Template | progress.md, spec.md |
| `chat` | 3? | Archived | archive/, completion-status.md, github-comment.md |
| `chat-request-cooldowns` | 8? | Active | team-review-approved.md |
| `icebreaker-mvp-planning` | - | Planning | progress.md, spec.md |
| `integration-testing-launch-prep` | 6 | Active | progress.md, security-audit.md, team-review-approved.md, team-testing-review.md, test-fixes-summary.md |
| `onboarding-flow` | 1 | Complete | progress.md, final-summary.md, gap-analysis.md, step1-summary.md |
| `panic-button` | 5 | Archived | archive/, completion-status.md |
| `persona-testing-polish` | 10 | Active | team-review-approved.md, team-review.md |
| `profile-settings` | 7? | Complete | completion-summary.md, github-comment.md, team-review-approved.md |
| `radar-view` | 2 | Active | progress.md, performance.md |
| `ux-fixes-bootup-messages` | 9 | Complete | completion-summary.md, team-review-approved.md |

## Current Feature Tracking

- **File**: `.notes/features/current.json`
- **Current Feature**: Persona-Based Testing & Polish (Issue #10)
- **Branch**: `agent/vector/10-persona-testing-polish`
- **Status**: in-progress
- **Note**: References Issue #10 which is CLOSED on GitHub

## Inconsistencies

1. **Issue #10 Mismatch**: `current.json` references Issue #10 but it's CLOSED on GitHub
2. **Missing Directories**: No directories for many open issues (#11-23)
3. **Unclear Mapping**: Some directories don't clearly map to GitHub issue numbers
4. **Archive Status**: Some completed features have `archive/` subdirectories, others don't
5. **Template Directory**: `bootstrap-web-health-mvp` appears to be a template, not a real feature

## Directory Structure Patterns

1. **Active Features**: Have `progress.md`, `team-review-approved.md`
2. **Completed Features**: Have `completion-summary.md`, may have `archive/` subdirectory
3. **Archived Features**: Have `archive/` subdirectory with old files
