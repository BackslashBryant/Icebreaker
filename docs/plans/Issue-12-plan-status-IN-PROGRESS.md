# Issue #12: Validate Look-and-Feel Across Devices, Themes, Reduced Motion

**Status**: IN-PROGRESS
**Branch**: `agent/pixel/12-visual-accessibility-validation`
**Labels**: `status:plan`, `agent:pixel`, `feature:testing`, `accessibility`
**Created**: 2025-11-29
**Issue**: #12
**Issue URL**: https://github.com/BackslashBryant/Icebreaker/issues/12

## Goals & Success Metrics

- **Goal**: Automate visual and accessibility validation for our core flows across all supported viewports, themes, and accessibility preferences so regressions are caught before release.
- **Success Metrics**:
  - Screenshot artifacts generated for every viewport × theme × accessibility combination on each CI run.
  - Tests fail automatically when CSS/UX regressions are detected (visual diff or Axe violation).
  - Documentation clearly lists the matrix expectations so QA and agents can reproduce results locally.

## Plan Steps

1. Implement dark mode CSS variables so visual tests have parity across themes.
2. Build reusable helpers that apply theme/viewport/reduced-motion/high-contrast combinations.
3. Author a Playwright matrix spec that captures screenshots + Axe checks for key flows.
4. Update docs with the matrix expectations, screenshot naming, and review process.
5. Ensure CI publishes screenshot artifacts and enforces the visual regression suite.

## Current Status

- Research (`docs/research/Issue-12-research.md`) completed with actionable findings.
- Plan drafted and awaiting team review; no checkpoints started yet.
- Dark mode prerequisite (Checkpoint 1) is still outstanding and blocks automated testing work.

## Acceptance Tests

- Playwright matrix spec runs cleanly across all combinations with screenshots stored using the documented naming convention.
- Axe accessibility checks pass for every combination.
- Documentation updates merged (`docs/testing/*`) describing the workflow.
- CI job uploads screenshot artifacts and fails when diffs exceed thresholds.

## Research Summary

**Research Question**: How should we implement comprehensive visual and accessibility validation across multiple viewports (small/medium mobile, tablet, desktop), themes (light/dark), and accessibility settings (prefers-reduced-motion, high-contrast) to ensure consistent look-and-feel and catch CSS regressions?

**Constraints**:
- Playwright visual regression tests exist (`tests/e2e/visual/`)
- Viewport utilities exist (`tests/utils/viewports.ts`) with mobile/tablet/desktop configs
- Browser/viewport matrix projects exist in Playwright config (8 projects)
- High-contrast mode exists (`.high-contrast` class, tested)
- `prefers-reduced-motion` is respected via CSS media queries
- Dark mode variant defined (`@custom-variant dark`) but not fully implemented (no CSS variables)

**Sources & Findings**:
- **Playwright Theme Testing**: `page.emulateMedia({ colorScheme: 'dark' | 'light' })` for themes, `page.emulateMedia({ reducedMotion: 'reduce' | 'no-preference' })` for reduced motion
- **High-Contrast**: User-controlled via class toggle (`page.locator('html').classList.add('high-contrast')`)
- **Viewport Matrix**: Existing viewports cover mobile/tablet/desktop, may need small mobile (320px) for edge cases
- **Visual Regression Pattern**: Existing tests loop through viewports, capture screenshots with `toHaveScreenshot()`
- **Dark Mode Gap**: CSS variables not defined - need to implement dark theme before testing

**Recommendations Summary**:
1. **Prerequisite**: Implement dark mode CSS variables (if not already done)
2. Create theme/viewport test matrix (24 combinations per screen: 3 viewports × 2 themes × 2 reduced-motion × 2 high-contrast)
3. Extend visual regression tests with new `theme-matrix.spec.ts`
4. Update documentation with matrix expectations
5. Ensure CI publishes screenshots for all combinations

**Rollback Options**:
- If dark mode too complex: Test only light theme + high-contrast + reduced-motion (12 combinations)
- If matrix too slow: Full matrix in nightly CI, smoke subset in PR checks
- If storage too large: Compress screenshots or store only diffs

## Plan

### Checkpoint 1: Implement Dark Mode CSS Variables (Prerequisite)
**Owner**: @Link 🌐
**Acceptance Criteria**:
- [x] Dark theme CSS variables defined in `frontend/src/index.css`
- [x] Dark mode activated via `:root.dark` or `@media (prefers-color-scheme: dark)`
- [x] All components render correctly in dark mode
- [x] Visual verification: Manual check of key screens in dark mode

**Files to Modify**:
- `frontend/src/index.css` - Add dark theme CSS variables

**Approach**:
- Define dark theme variables using `:root.dark` selector (matches Tailwind `@custom-variant dark`)
- Use darker backgrounds, lighter text, maintain brand colors (teal accent)
- Ensure contrast ratios meet WCAG AA standards
- Test manually before proceeding to automated tests

**Tests to Run**:
- Manual visual check: Navigate to Welcome, Onboarding, Radar, Chat, Profile in dark mode
- Verify all text is readable, buttons are visible, brand colors maintained

### Checkpoint 2: Create Theme/Viewport Test Matrix Infrastructure
**Owner**: @Pixel 🖥️
**Acceptance Criteria**:
- [ ] Test helper function to apply theme/viewport/accessibility combinations
- [ ] Viewport configs include small mobile (320×568) if needed
- [ ] Helper generates descriptive screenshot names with all parameters
- [ ] Helper supports: viewport, colorScheme, reducedMotion, highContrast

**Files to Create/Modify**:
- `tests/utils/theme-matrix.ts` - New helper for theme/viewport combinations
- `tests/utils/viewports.ts` - Add small mobile viewport if needed

**Approach**:
- Create `applyThemeSettings(page, { colorScheme, reducedMotion, highContrast })` helper
- Create `getThemeMatrix()` function that returns all combinations
- Extend viewport configs if small mobile needed
- Screenshot naming: `{screen}-{viewport}-{theme}-{motion}-{contrast}.png`

**Tests to Run**:
- Unit test helper functions
- Verify screenshot names are generated correctly

### Checkpoint 3: Create Visual Regression Test Matrix
**Owner**: @Pixel 🖥️
**Acceptance Criteria**:
- [ ] New test file `tests/e2e/visual/theme-matrix.spec.ts` created
- [ ] Tests cover key screens: Welcome, Onboarding steps (0-3), Radar, Chat, Profile
- [ ] All 24 combinations tested per screen (3 viewports × 2 themes × 2 reduced-motion × 2 high-contrast)
- [ ] Screenshots captured with descriptive names
- [ ] Accessibility checks (Axe) run for each combination
- [ ] Tests fail on CSS regressions (screenshot mismatch)

**Files to Create/Modify**:
- `tests/e2e/visual/theme-matrix.spec.ts` - New test file
- `tests/utils/theme-matrix.ts` - Helper functions (from Checkpoint 2)

**Approach**:
- Loop through all combinations using helper from Checkpoint 2
- For each screen:
  - Navigate to screen
  - Apply theme/viewport/accessibility settings
  - Wait for page to stabilize
  - Capture screenshot
  - Run Axe accessibility check
  - Verify no violations
- Use existing `MASK_SELECTORS` for dynamic content
- Full-page screenshots: `fullPage: true`

**Tests to Run**:
- `npm test -- tests/e2e/visual/theme-matrix.spec.ts`
- Verify all combinations generate screenshots
- Verify accessibility checks pass

### Checkpoint 4: Update Documentation
**Owner**: @Muse 🎨
**Acceptance Criteria**:
- [ ] `docs/testing/persona-scenarios.md` updated with matrix expectations
- [ ] Screenshot naming convention documented
- [ ] Visual regression testing guide created or updated
- [ ] Matrix combinations documented (24 per screen)

**Files to Modify**:
- `docs/testing/persona-scenarios.md` - Add matrix expectations section
- `docs/testing/README.md` or new file - Visual regression testing guide

**Approach**:
- Document which screens are tested
- Document all combinations (viewport × theme × reduced-motion × high-contrast)
- Explain screenshot naming convention
- Document how to update baselines when intentional changes made

**Verification**:
- Documentation is clear and complete
- Screenshot naming examples provided

### Checkpoint 5: CI Integration & Artifact Publishing
**Owner**: @Nexus 🚀
**Acceptance Criteria**:
- [ ] CI workflow publishes screenshots for all combinations
- [ ] Visual regression job added to CI (if not already exists)
- [ ] Screenshot comparison thresholds configured (allow minor differences for animations)
- [ ] Artifacts accessible in CI runs

**Files to Modify**:
- `.github/workflows/` - CI workflow files
- `tests/playwright.config.ts` - Screenshot threshold configuration

**Approach**:
- Verify existing CI publishes artifacts
- Add visual regression job if needed
- Configure `expect().toHaveScreenshot({ threshold: 0.2 })` for minor animation differences
- Ensure artifacts are uploaded and accessible

**Tests to Run**:
- Push to branch, verify CI runs visual regression tests
- Verify artifacts are published and downloadable

## Status Tracking

### Checkpoint 1: Implement Dark Mode CSS Variables
- [x] Status: COMPLETE
- [x] Owner: @Link 🌐
- [x] Started: 2025-11-29
- [x] Completed: 2025-11-29

### Checkpoint 2: Create Theme/Viewport Test Matrix Infrastructure
- [ ] Status: PENDING
- [ ] Owner: @Pixel 🖥️
- [ ] Started: _(not started)_
- [ ] Completed: _(not started)_

### Checkpoint 3: Create Visual Regression Test Matrix
- [ ] Status: PENDING
- [ ] Owner: @Pixel 🖥️
- [ ] Started: _(not started)_
- [ ] Completed: _(not started)_

### Checkpoint 4: Update Documentation
- [ ] Status: PENDING
- [ ] Owner: @Muse 🎨
- [ ] Started: _(not started)_
- [ ] Completed: _(not started)_

### Checkpoint 5: CI Integration & Artifact Publishing
- [ ] Status: PENDING
- [ ] Owner: @Nexus 🚀
- [ ] Started: _(not started)_
- [ ] Completed: _(not started)_

## Current Issues

_None yet - work just starting_

## Team Review

**Status**: IN PROGRESS

**Reviewers**:
- [x] @Vector 🎯 - Plan structure and checkpoints ✅ APPROVED
- [x] @Link 🌐 - Checkpoint 1 (Dark mode CSS variables) ✅ APPROVED - Ready to implement
- [x] @Pixel 🖥️ - Checkpoints 2-3 (Test matrix infrastructure and visual regression) ✅ APPROVED - Waiting on Checkpoint 1
- [x] @Muse 🎨 - Checkpoint 4 (Documentation) ✅ APPROVED
- [x] @Nexus 🚀 - Checkpoint 5 (CI integration) ✅ APPROVED

**Review Notes**:
- Research complete: Playwright theme/media query patterns documented
- Prerequisite identified: Dark mode CSS variables must be implemented before automated testing
- Plan structure validated: All required sections present (Goals, Plan Steps, Current Status, Acceptance Tests)
- Guardrails green: Status check 17/17 passing, preflight passing
- Current state: `frontend/src/index.css` has `@custom-variant dark` defined but no `:root.dark` selector with dark theme variables. Current theme is dark (deep navy), so we need to either make current theme the `.dark` variant and add light default, or keep current as default and add `.dark` variant.

**Approval**: ✅ APPROVED

_Team review complete - approved for implementation. @Link can proceed with Checkpoint 1._

## Outcome

_To be filled upon completion_

