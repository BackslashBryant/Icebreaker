# Issue #17 - Add Playwright Visual Snapshots for Key Screens

**Status**: IN-PROGRESS  
**Branch**: `agent/pixel/17-visual-snapshots`  
**GitHub Issue**: #17  
**Created**: 2025-11-24  
**Last Updated**: 2025-11-24

## Research Summary

**Research Date**: 2025-11-24  
**Researcher**: Scout 🔎  
**Status**: Complete

### Research Question

What visual snapshot infrastructure exists, what's missing, and how should we complete it per Issue #17 requirements?

### Constraints

- **Stack**: Playwright E2E, existing `golden-screens.spec.ts`
- **CI**: `ui-visual-a11y` job exists in `.github/workflows/ci.yml`
- **Issue Scope**: Welcome, Onboarding, Radar (empty/populated), Chat (start/end), Panic, Profile
- **Requirements**: 2% diff threshold, store in snapshots folder, mask dynamic elements

### Sources & Findings

1. **Test Files Exist**: `golden-screens.spec.ts` with 8 screens, `viewports.ts` with 3 viewports
2. **32 Baselines Exist**: Mix of win32/linux platforms, inconsistent coverage
3. **CI Job Exists**: `ui-visual-a11y` job but uses `--update-snapshots` (auto-accepts changes)
4. **Missing**: 2% threshold config, Panic screen, comparison mode in CI

### Recommendations Summary

**Priority 1**: Configure 2% diff threshold in Playwright config  
**Priority 2**: Fix CI workflow (remove --update-snapshots, add comparison mode)  
**Priority 3**: Add Panic dialog screen test  
**Priority 4**: Regenerate baselines on ubuntu CI for consistency  
**Priority 5**: Document baseline process

### Rollback Options

1. If visual tests flaky → increase threshold to 5%
2. If CI baseline generation fails → use local baselines with platform suffix
3. If extended scope complex → defer Radar populated/Chat states to Phase 2

## Goals & Success Criteria

- **Target**: Guard "terminal meets Game Boy" aesthetic during UI changes
- **Problem**: Visual tests exist but CI auto-accepts changes; no diff enforcement
- **Desired Outcome**:
  - Visual tests block merge on unexpected diffs (2% threshold)
  - All 8 golden screens covered with consistent ubuntu baselines
  - Panic dialog added to golden screens
  - Baseline update process documented
- **Success Metrics**:
  - [ ] 2% diff threshold configured
  - [ ] CI compares (not auto-updates) on PRs
  - [ ] Fresh ubuntu baselines committed
  - [ ] Panic dialog test added
  - [ ] Documentation created

## Out-of-scope

- Radar populated state (requires WebSocket mocking)
- Chat lifecycle states (start/active/end)
- Multi-browser visual coverage (webkit, firefox)
- These are deferred to extended scope / Phase 2

## Plan Steps

### Step 1: Configure 2% Diff Threshold
**Owner**: @Pixel 🖥️  
**Status**: ✅ COMPLETE (2025-11-24)

**Intent**: Add `maxDiffPixelRatio: 0.02` to Playwright config

**File Targets**:
- `tests/playwright.config.ts` (update - add expect.toHaveScreenshot config)

**Acceptance**:
- [ ] `maxDiffPixelRatio: 0.02` configured
- [ ] `animations: 'disabled'` to prevent flakes
- [ ] Config verified with local test run

---

### Step 2: Fix CI Workflow - Comparison Mode
**Owner**: @Nexus 🚀  
**Status**: ✅ COMPLETE (2025-11-24)

**Intent**: Remove `--update-snapshots` from CI, add proper comparison mode

**File Targets**:
- `.github/workflows/ci.yml` (update - ui-visual-a11y job)

**Acceptance**:
- [ ] `--update-snapshots` removed from regular CI run
- [ ] Visual tests run in comparison mode (fail on diff)
- [ ] Snapshot diffs uploaded as artifacts on failure

---

### Step 3: Add Panic Dialog Test
**Owner**: @Pixel 🖥️  
**Status**: ✅ COMPLETE (2025-11-24)

**Intent**: Add Panic prompt dialog to golden screens test

**File Targets**:
- `tests/e2e/visual/golden-screens.spec.ts` (update - add Panic dialog test)

**Acceptance**:
- [ ] Panic dialog test added for all 3 viewports
- [ ] Uses `MASK_SELECTORS` for dynamic content
- [ ] Test passes locally

---

### Step 4: Regenerate Ubuntu Baselines
**Owner**: @Pixel 🖥️ + @Nexus 🚀  
**Status**: PENDING

**Intent**: Generate fresh baselines on ubuntu CI for consistency

**File Targets**:
- `tests/e2e/visual/golden-screens.spec.ts-snapshots/` (regenerate all PNGs)

**Approach**:
1. Create temporary CI workflow with `--update-snapshots`
2. Download generated baselines from artifacts
3. Commit baselines to repo
4. Remove `--update-snapshots` from workflow

**Acceptance**:
- [ ] All golden screen baselines are ubuntu-linux
- [ ] No win32 baselines in golden-screens snapshots
- [ ] All 8 screens × 3 viewports = 24 baseline PNGs (plus Panic = 27)
- [ ] Baselines committed to repo

---

### Step 5: Document Baseline Process
**Owner**: @Muse 🎨  
**Status**: ✅ COMPLETE (2025-11-24)

**Intent**: Create documentation for updating visual baselines

**File Targets**:
- `docs/testing/VISUAL-BASELINES.md` (create)

**Content**:
- When to update baselines (intentional UI changes only)
- How to update (CI workflow or local)
- Review process (visual diff approval)
- Troubleshooting flaky tests

**Acceptance**:
- [ ] Documentation created
- [ ] Process clear for future contributors
- [ ] Links added to main testing docs

---

### Step 6: Verification & Cleanup
**Owner**: @Pixel 🖥️  
**Status**: PENDING

**Intent**: Verify everything works end-to-end

**Acceptance**:
- [ ] CI runs visual tests in comparison mode
- [ ] Intentional UI change causes test failure
- [ ] Baseline update process works as documented
- [ ] All acceptance tests pass

---

## Current Status

**Overall Status**: IMPLEMENTATION IN PROGRESS

**Step Completion**:
- ✅ Step 1: Configure 2% Diff Threshold - COMPLETE (2025-11-24)
- ✅ Step 2: Fix CI Workflow - COMPLETE (2025-11-24)
- ✅ Step 3: Add Panic Dialog Test - COMPLETE (2025-11-24)
- ⏸️ Step 4: Regenerate Ubuntu Baselines - PENDING (will generate on CI push)
- ✅ Step 5: Document Baseline Process - COMPLETE (2025-11-24)
- ⏸️ Step 6: Verification & Cleanup - PENDING

## Current Issues

_None yet - plan just created_

## Team Review

**Review Date**: 2025-11-24  
**Status**: ✅ **APPROVED**

### Team Approval

- ✅ **Scout 🔎**: Research complete. Gap analysis accurate.
- ✅ **Vector 🎯**: Plan structure complete. Scope properly bounded.
- ✅ **Pixel 🖥️**: Steps 1, 3, 4, 6 approved.
- ✅ **Nexus 🚀**: Steps 2, 4 approved. CI fix is straightforward.
- ✅ **Muse 🎨**: Step 5 approved. Documentation scope clear.
- ✅ **Link 🌐**: No visual design changes. Snapshots capture existing UI.

**Team review complete - approved for implementation.**

