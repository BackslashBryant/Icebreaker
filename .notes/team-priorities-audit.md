# Team Priorities Audit - Issue Closure & Status Sync

**Date**: 2025-11-20  
**Purpose**: Close finished issues, kick off Issue #2, resolve plan/done mismatches

## Issue Closure Tasks

### Issue #20: Performance Verification & Benchmarking

**Status**: ✅ COMPLETE (plan file: `Docs/plans/Issue-20-plan-status-COMPLETE.md`)
- **Completion Date**: 2025-11-13
- **Branch**: `agent/pixel/20-performance-verification`
- **Summary**: All 4 deliverables complete - chat-start perf test, regression verification, documentation, CI integration

**Action Required**:
1. Post completion comment to GitHub issue #20
2. Update labels: Add `status:done`, remove `status:in-progress` (if present)
3. Close issue (optional - can leave open for tracking)

**Completion Comment Template**:
```markdown
## ✅ Issue #20 Complete

**Status**: All steps completed successfully

**Branch**: `agent/pixel/20-performance-verification`
**Completion Date**: 2025-11-13

**Summary**: All 4 deliverables complete:
1. ✅ Chat-start perf test is live and part of the suite
2. ✅ Performance regression verification passes end-to-end
3. ✅ Results are documented
4. ✅ CI now runs and enforces performance budgets

**Verification**: All tests passing (7 passed, 1 skipped), CI integration complete

See `Docs/plans/Issue-20-plan-status-COMPLETE.md` for full details.
```

**Commands** (after GitHub auth):
```bash
gh issue comment 20 --body "## ✅ Issue #20 Complete\n\n**Status**: All steps completed successfully\n\n**Branch**: \`agent/pixel/20-performance-verification\`\n**Completion Date**: 2025-11-13\n\n**Summary**: All 4 deliverables complete:\n1. ✅ Chat-start perf test is live and part of the suite\n2. ✅ Performance regression verification passes end-to-end\n3. ✅ Results are documented\n4. ✅ CI now runs and enforces performance budgets\n\n**Verification**: All tests passing (7 passed, 1 skipped), CI integration complete\n\nSee \`Docs/plans/Issue-20-plan-status-COMPLETE.md\` for full details."
gh issue edit 20 --add-label "status:done"
gh issue edit 20 --remove-label "status:in-progress"  # if present
```

---

### Issue #6: Integration Testing & Launch Preparation

**Status**: ✅ COMPLETE (plan file: `Docs/plans/Issue-6-plan-status-COMPLETE.md`)
- **Completion Date**: 2025-11-20
- **Branch**: `agent/nexus/6-integration-testing-launch-prep`
- **Commit**: `ee19316`
- **Summary**: All 6 steps complete - cross-browser testing, accessibility audit, security audit, Sentry setup, CI/CD verification, documentation

**Action Required**:
1. Post completion comment to GitHub issue #6
2. Update labels: Add `status:done`, remove `status:in-progress` (if present)
3. Close issue (optional - can leave open for tracking)

**Completion Comment Template**:
```markdown
## ✅ Issue #6 Complete

**Status**: All steps completed successfully

**Branch**: `agent/nexus/6-integration-testing-launch-prep`
**Commit**: `ee19316`
**Completion Date**: 2025-11-20

**Summary**: All 6 steps complete:
1. ✅ Cross-Browser Testing Setup (Chrome, Firefox, Edge)
2. ✅ Accessibility Audit & Fixes (WCAG AA compliance)
3. ✅ Security Audit & Vulnerability Fixes
4. ✅ Error Tracking Setup (Sentry configured)
5. ✅ CI/CD Pipeline Verification
6. ✅ Documentation & Launch Readiness

**Verification**: All acceptance tests passed, all tests passing, cross-browser compatibility verified

See `Docs/plans/Issue-6-plan-status-COMPLETE.md` for full details.
```

**Commands** (after GitHub auth):
```bash
gh issue comment 6 --body "## ✅ Issue #6 Complete\n\n**Status**: All steps completed successfully\n\n**Branch**: \`agent/nexus/6-integration-testing-launch-prep\`\n**Commit**: \`ee19316\`\n**Completion Date**: 2025-11-20\n\n**Summary**: All 6 steps complete:\n1. ✅ Cross-Browser Testing Setup\n2. ✅ Accessibility Audit & Fixes\n3. ✅ Security Audit & Vulnerability Fixes\n4. ✅ Error Tracking Setup (Sentry)\n5. ✅ CI/CD Pipeline Verification\n6. ✅ Documentation & Launch Readiness\n\n**Verification**: All acceptance tests passed\n\nSee \`Docs/plans/Issue-6-plan-status-COMPLETE.md\` for full details."
gh issue edit 6 --add-label "status:done"
gh issue edit 6 --remove-label "status:in-progress"  # if present
```

---

## Issue #2: Radar View - Kick Off

**Current Status**: Implementation appears complete (`.notes/features/radar-view/progress.md` shows "Status: ✅ Complete"), but:
- ❌ No plan-status file exists (`Docs/plans/Issue-2-plan-status-*.md`)
- ❌ No research file exists (`docs/research/Issue-2-research.md`)
- ❌ GitHub issue #2 is OPEN (per migration doc)

**Action Required**:
1. **Research Phase**: Scout needs to research Radar View feature (even though implementation exists, need to document research for completeness)
2. **Plan Phase**: Vector needs to create plan-status file documenting what was implemented
3. **Verification Phase**: Pixel needs to verify implementation matches plan
4. **Documentation Phase**: Muse needs to ensure docs are complete

**Next Steps**:
- Option A: If implementation is truly complete, create retroactive research/plan files and verify
- Option B: If implementation needs work, start fresh research → plan → implement cycle

**Recommendation**: Since implementation exists, create retroactive research/plan files documenting what was built, then verify completeness.

---

## Testing Infrastructure Issues Audit

### Issues with Plan Files Showing COMPLETE

#### Issue #18: Persona-Simulated User Testing
- **Plan File**: `Docs/plans/Issue-18-persona-testing.md` shows ✅ COMPLETE (2025-11-11)
- **Status**: All 7 steps complete, 64 persona tests passing
- **Action**: Check GitHub issue status, close if complete

#### Issue #23: Run Persona Testing Suite
- **Plan File**: `Docs/plans/Issue-23-plan-status-COMPLETE.md` shows ✅ COMPLETE (2025-11-20)
- **Status**: All 6 steps complete, 72 tests passing, telemetry collected
- **Action**: Check GitHub issue status, close if complete

#### Issue #8: PLAYWRIGHT_WS_MOCK Transport
- **Plan File**: `Docs/plans/Issue-8-plan-status-COMPLETE.md` shows ✅ COMPLETE (2025-11-15)
- **Status**: Implemented as part of Issue #18
- **Action**: Check GitHub issue status, close if complete

### Issues #9-17: Need Status Check

**Action Required**: Check GitHub issue status for each:
- Issue #9: Persona presence fixture schema
- Issue #11: Dual-context flows
- Issue #12: Data-testid to UI
- Issue #13: (check if exists)
- Issue #14: Persona run telemetry
- Issue #15: Split Playwright suites
- Issue #16: Keyboard/screen-reader coverage
- Issue #17: Visual snapshots

**Recommendation**: 
1. Check each issue's GitHub status
2. If plan file shows COMPLETE but GitHub shows OPEN → close issue
3. If plan file shows IN-PROGRESS but GitHub shows CLOSED → update plan file
4. If both show different status → investigate and sync

---

## GitHub Authentication Fix

**Current Issue**: GitHub CLI authentication failing (401 Bad credentials)

**Fix Steps**:
1. Run: `gh auth login`
2. Select: GitHub.com
3. Select: HTTPS
4. Authenticate with browser
5. Verify: `gh auth status` should show active account

**Alternative**: Set `GITHUB_TOKEN` environment variable (User-level on Windows)

---

## Priority Order

1. **First**: Fix GitHub authentication
2. **Second**: Close Issue #20 and #6 (completion comments + labels)
3. **Third**: Audit testing infrastructure issues (#18, #23, #8-17)
4. **Fourth**: Kick off Issue #2 (research → plan → verify)

---

## Commands Summary (After Auth Fix)

```bash
# Close Issue #20
gh issue comment 20 --body "..."
gh issue edit 20 --add-label "status:done"

# Close Issue #6
gh issue comment 6 --body "..."
gh issue edit 6 --add-label "status:done"

# Check testing infrastructure issues
gh issue view 18 --json number,title,state,labels
gh issue view 23 --json number,title,state,labels
gh issue view 8 --json number,title,state,labels

# Check Issue #2
gh issue view 2 --json number,title,state,labels
```




