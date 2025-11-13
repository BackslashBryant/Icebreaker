# Issue #24 - Fix Critical UX Issues from Persona Testing

**Status**: IN-PROGRESS  
**Branch**: `agent/link/24-fix-critical-ux`  
**GitHub Issue**: #24 (to be created - auth issue)  
**Started**: 2025-01-27

## Research Summary

**Research Date**: 2025-01-27  
**Researcher**: Scout 🔎  
**Status**: Complete

### Research Question

How should we fix the 3 critical UX issues identified in Issue #23 persona testing insights?

### Constraints

- **Stack**: React frontend, Playwright E2E tests
- **Scope**: Fix 3 critical UX issues affecting 67-76 users
- **Current State**: Code review shows fixes were applied in Issue #23, but telemetry still shows issues
- **Goal**: Ensure all 3 issues are fully resolved and verified

### Sources & Findings

1. **Current Implementation**: Panic button on Radar/Profile, visibility toggle on Profile, error banner logic correct
2. **Test Helpers**: Enhanced with 10s timeouts and fallback checks
3. **Telemetry Data**: Shows 76-67 users still affected (82-72% of test runs)
4. **Gap**: Either fixes weren't fully effective, or telemetry was collected before fixes

### Recommendations Summary

1. Verify current fixes and re-run tests
2. Refine test helpers if needed
3. Fix any remaining issues (CSS, rendering, edge cases)

## Goals & Success Metrics

- **Target User**: All users, especially anxious and privacy-conscious personas
- **Problem**: 3 critical UX issues affecting 67-76 users identified in persona testing
- **Desired Outcome**:
  - Panic button visible in 100% of test runs (currently 18%)
  - Visibility toggle detected in 100% of test runs (currently 19%)
  - Error banner count reduced (only real errors shown)
  - All 72 persona tests still passing
- **Success Metrics**:
  - ✅ Panic button visible in 100% of test runs
  - ✅ Visibility toggle detected in 100% of test runs
  - ✅ Error banner frequency < 10% of test runs
  - ✅ All 72 persona tests passing
  - ✅ Telemetry shows 0 missing affordances

## Plan Steps

1. **Step 1**: Verify Current Implementation & Test Helpers
   - **Owner**: @Link 🌐 + @Pixel 🖥️
   - **Status**: ✅ COMPLETE
   - **Acceptance**: Code review complete, test helpers verified
   - **Completed**: 2025-01-27
   - **Details**: Verified panic button on Radar/Profile, visibility toggle on Profile, error banner logic correct. Test helpers already enhanced in Issue #23.

2. **Step 2**: Improve Test Helper Reliability
   - **Owner**: @Link 🌐
   - **Status**: ✅ COMPLETE
   - **Acceptance**: Test helpers have explicit waits, page context checks, improved error detection
   - **Completed**: 2025-01-27
   - **Details**: 
     - Enhanced `checkPanicButtonVisible()`: Added page context check (Radar/Chat/Profile), explicit DOM attachment wait, improved visibility detection with bounding rect check
     - Enhanced `checkVisibilityToggleVisible()`: Added explicit DOM attachment wait, improved visibility detection with bounding rect check
     - Enhanced `countErrorBanners()`: More precise error detection - requires BOTH destructive styling AND error keywords, filters out health status messages

3. **Step 3**: Fix CSS/Rendering Issues (if any)
   - **Owner**: @Link 🌐
   - **Status**: ⏳ PENDING
   - **Acceptance**: Panic button always visible, no CSS hiding issues
   - **Details**: Verify z-index, overflow, positioning don't hide panic button

4. **Step 4**: Re-run Persona Tests & Verify Fixes
   - **Owner**: @Pixel 🖥️
   - **Status**: ⏳ PENDING
   - **Acceptance**: All 72 tests pass, telemetry shows improvements
   - **Details**: Run full persona test suite, collect telemetry, verify all 3 issues resolved

5. **Step 5**: Update Insight Report
   - **Owner**: @Muse 🎨
   - **Status**: ⏳ PENDING
   - **Acceptance**: Insight report updated with fix verification
   - **Details**: Document fixes applied, new telemetry data, verification results

## Current Status

**Overall Status**: IN-PROGRESS

### Step Completion

- ✅ **Step 1**: Verify Current Implementation & Test Helpers - **COMPLETE** (2025-01-27)
- ✅ **Step 2**: Improve Test Helper Reliability - **COMPLETE** (2025-01-27)
- ⏳ **Step 3**: Fix CSS/Rendering Issues (if any) - **PENDING** (may not be needed - verify with tests)
- ⏳ **Step 4**: Re-run Persona Tests & Verify Fixes - **PENDING**
- ⏳ **Step 5**: Update Insight Report - **PENDING**

## Current Issues

_None yet - work just starting_

## Acceptance Tests

- [ ] Panic button visible in 100% of test runs (currently 18%)
- [ ] Visibility toggle detected in 100% of test runs (currently 19%)
- [ ] Error banner frequency < 10% of test runs (currently 72%)
- [ ] All 72 persona tests passing
- [ ] Telemetry shows 0 missing affordances for panic button and visibility toggle

## Team Review

**Review Date**: TBD  
**Status**: ⏳ **PENDING**

### Review Summary

_To be completed after plan is drafted_

### Team Approval

- ⏳ **Scout 🔎**: Research complete
- ⏳ **Vector 🎯**: Plan review pending
- ⏳ **Pixel 🖥️**: Test strategy review pending
- ⏳ **Link 🌐**: Implementation review pending

**Team review pending - plan in draft.**

