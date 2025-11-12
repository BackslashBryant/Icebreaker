# Issue Number Migration Guide

**Date**: 2025-11-11
**Purpose**: Document the mapping between GitHub issue numbers and logical numbering scheme

## Overview

During the project cleanup, we established a logical numbering scheme for internal organization while keeping GitHub issue numbers (which are immutable) as the source of truth for all references.

## Numbering Strategy

### Logical Numbering Categories
1. **MVP Features** (#1-7): Core product features
2. **Testing & QA** (#8-20): Testing, performance, integration
3. **Infrastructure** (#21-22): Deployment, monitoring

### GitHub → Logical Number Mapping

| GitHub # | Logical # | Title | Status |
|----------|-----------|-------|--------|
| 1 | 1 | MVP: Onboarding Flow | CLOSED |
| 2 | 2 | MVP: Radar View | OPEN |
| 4 | 3 | MVP: Chat | CLOSED |
| 5 | 4 | MVP: Panic Button | CLOSED |
| 24 | 5 | MVP: Block/Report | CLOSED |
| 19 | 6 | MVP: Profile/Settings Page | CLOSED |
| 25 | 7 | MVP: Chat Request Cooldowns | CLOSED |
| 6 | 8 | Integration Testing & Launch Preparation | OPEN |
| 20 | 9 | Performance Verification & Benchmarking | OPEN |
| 18 | 10 | Persona-Simulated User Testing | OPEN |
| 11 | 11 | Dual-context flows | OPEN |
| 8 | 12 | PLAYWRIGHT_WS_MOCK transport | OPEN |
| 9 | 13 | Persona presence fixture schema | OPEN |
| 13 | 14 | Data-testid to UI | OPEN |
| 16 | 15 | Keyboard/screen-reader coverage | OPEN |
| 12 | 16 | Look-and-feel validation | OPEN |
| 17 | 17 | Visual snapshots | OPEN |
| 14 | 18 | Persona run telemetry | OPEN |
| 15 | 19 | Split Playwright suites | OPEN |
| 23 | 20 | Run Persona Testing Suite | OPEN |
| 21 | 21 | Production Deployment Infrastructure | OPEN |
| 22 | 22 | Monitoring & Error Tracking | OPEN |

## Usage Guidelines

### For Branches
- **Always use GitHub issue numbers**: `agent/<agent>/<github-issue-number>-<slug>`
- Example: `agent/nexus/21-production-deployment` (GitHub #21)

### For Plan Files
- **Use GitHub issue numbers**: `Docs/plans/Issue-<github-number>.md`
- Example: `Docs/plans/Issue-21.md`

### For References in Code/Docs
- **Use GitHub issue numbers** in commit messages, comments, and documentation
- Example: `feat: Complete Issue #21 - Production Deployment`

### For Internal Organization
- **Logical numbers** can be used for planning and categorization
- See `.notes/audit/new-numbering-scheme.md` for logical grouping

## Special Cases

### Issue #10 (CLOSED)
- GitHub Issue #10: "feat: Implement geolocation helper + proximity boundary tests" (CLOSED)
- Multiple branches incorrectly referenced #10:
  - Performance Verification → Now maps to GitHub #20 (logical #9)
  - Persona Testing → Now maps to GitHub #18 (logical #10)
  - Backend Server Startup → Deleted (work part of #21)

### Missing GitHub Issues Created
- Issue #24: Block/Report (was `feat/6-block-report` branch)
- Issue #25: Chat Request Cooldowns (was `agent/forge/8-chat-request-cooldowns` branch)
- Issue #26: UX Review Fixes (was `agent/link/9-ux-fixes-bootup-messages` branch)
- Issue #27: Profile/Settings (was `agent/link/7-profile-settings` branch)

## Migration Checklist

When referencing issues:
- [ ] Use GitHub issue numbers (not logical numbers)
- [ ] Check GitHub issue exists before creating branch
- [ ] Match branch name to GitHub issue number
- [ ] Update plan files with GitHub issue numbers
- [ ] Reference GitHub issue URLs in documentation

## Related Documents

- `.notes/audit/new-numbering-scheme.md` - Detailed logical numbering scheme
- `.notes/audit/github-issues.md` - Complete GitHub issues inventory
- `.notes/audit/git-branches.md` - Complete branches inventory
- `.notes/audit/cleanup-progress.md` - Cleanup progress tracking
