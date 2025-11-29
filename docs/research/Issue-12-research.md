# Research: Issue #12 - Visual/Accessibility Validation Across Devices & Themes

**Research Date**: 2025-11-29  
**Researcher**: Scout 🔎  
**Status**: Complete

## Research Question

How should we implement comprehensive visual and accessibility validation across multiple viewports (small/medium mobile, tablet, desktop), themes (light/dark), and accessibility settings (prefers-reduced-motion, high-contrast) to ensure consistent look-and-feel and catch CSS regressions?

## Constraints

- **Existing Infrastructure**:
  - Playwright visual regression tests exist (`tests/e2e/visual/`)
  - Viewport utilities exist (`tests/utils/viewports.ts`) with mobile/tablet/desktop configs
  - Browser/viewport matrix projects exist in Playwright config (8 projects: chromium/firefox/webkit/msedge × desktop/mobile)
  - Some accessibility tests exist (WCAG AA checks in persona tests)
  - High-contrast mode exists (`.high-contrast` class, tested in `tests/e2e/profile.spec.ts`)
  - `prefers-reduced-motion` is respected via CSS media queries
  - Dark mode variant defined (`@custom-variant dark`) but not fully implemented
- **Scope**: Add tests for viewport × theme × accessibility setting combinations
- **Acceptance**: CI artifacts include screenshots per combo, tests fail on CSS regressions
- **Related**: Part of Persona Sim Testing Phase 2 backlog

## Sources & Findings

### 1. Playwright Theme/Media Query Testing

**Source**: Playwright documentation, existing codebase patterns

**Findings**:
- Playwright supports emulating CSS media queries via `page.emulateMedia()`:
  - `prefers-color-scheme`: `page.emulateMedia({ colorScheme: 'dark' | 'light' })`
  - `prefers-reduced-motion`: `page.emulateMedia({ reducedMotion: 'reduce' | 'no-preference' })`
- Dark mode can be tested via:
  - CSS media query emulation: `page.emulateMedia({ colorScheme: 'dark' })`
  - Class-based approach: `page.addInitScript(() => document.documentElement.classList.add('dark'))`
- High-contrast mode is user-controlled (checkbox), tested via class toggle: `page.locator('html').classList.add('high-contrast')`

**Example Pattern**:
```typescript
// Emulate dark mode
await page.emulateMedia({ colorScheme: 'dark' });

// Emulate reduced motion
await page.emulateMedia({ reducedMotion: 'reduce' });

// Enable high-contrast (user-controlled)
await page.addInitScript(() => {
  document.documentElement.classList.add('high-contrast');
});
```

### 2. Viewport Matrix

**Source**: `tests/utils/viewports.ts`, `tests/playwright.config.ts`

**Findings**:
- Existing viewports: `mobile` (375×812), `tablet` (768×1024), `desktop` (1440×900)
- Issue #12 requires: small/medium mobile, tablet, desktop
- Current viewports cover this but may need additional small mobile (320px) for edge cases
- Browser matrix already exists: chromium/firefox/webkit/msedge × desktop/mobile

**Recommendation**: Use existing viewport configs, add small mobile (320×568) if needed for comprehensive coverage.

### 3. Visual Regression Testing Patterns

**Source**: `tests/e2e/visual/golden-screens.spec.ts`, `tests/e2e/visual/welcome.spec.ts`

**Findings**:
- Existing pattern: Loop through viewports, capture screenshots with `toHaveScreenshot()`
- Masking: Uses `MASK_SELECTORS` to hide dynamic content (handles, timestamps)
- Screenshot naming: `golden-{screen}-{viewport}.png`
- Full-page screenshots: `fullPage: true` option

**Pattern to Extend**:
```typescript
for (const viewport of VIEWPORTS) {
  for (const theme of ['light', 'dark']) {
    for (const reducedMotion of ['no-preference', 'reduce']) {
      for (const highContrast of [false, true]) {
        // Test combination
      }
    }
  }
}
```

### 4. CSS Theme Implementation

**Source**: `frontend/src/index.css`

**Findings**:
- Dark mode variant defined: `@custom-variant dark (&:is(.dark *))`
- No dark theme CSS variables defined yet (only light theme in `:root`)
- High-contrast mode exists: `.high-contrast` class with enhanced contrast variables
- `prefers-reduced-motion` respected: Animations disabled via `@media (prefers-reduced-motion: reduce)`

**Gap**: Dark mode CSS variables need to be defined before dark mode testing can be meaningful.

### 5. Accessibility Testing Integration

**Source**: `tests/e2e/personas/market-research.spec.ts`, `tests/e2e/profile.spec.ts`

**Findings**:
- Axe accessibility checks exist: `new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()`
- High-contrast contrast ratio tests exist
- Focus order checks exist: `checkFocusOrder(page)`
- Tests run per persona but don't test theme/viewport combinations

**Recommendation**: Add accessibility checks to visual regression tests to ensure WCAG compliance across all combinations.

### 6. CI Artifact Management

**Source**: Playwright config, existing visual tests

**Findings**:
- Screenshots stored in: `artifacts/test-results/`
- Playwright HTML report includes screenshots
- CI workflows publish artifacts
- Screenshot naming convention: `{test-name}-{viewport}.png`

**Recommendation**: Extend naming to include theme/settings: `{test-name}-{viewport}-{theme}-{reducedMotion}-{highContrast}.png`

## Recommendations Summary

### 1. **Implement Dark Mode CSS Variables** (Prerequisite)
- Define dark theme CSS variables in `frontend/src/index.css`
- Use `:root.dark` or `@media (prefers-color-scheme: dark)` selector
- Ensure all components support dark mode

### 2. **Create Theme/Viewport Test Matrix**
- Test combinations:
  - Viewports: mobile (375px), tablet (768px), desktop (1440px) - consider adding small mobile (320px)
  - Themes: light, dark (via `page.emulateMedia({ colorScheme })`)
  - Reduced motion: no-preference, reduce (via `page.emulateMedia({ reducedMotion })`)
  - High contrast: off, on (via class toggle)
- Total combinations: 3 viewports × 2 themes × 2 reduced-motion × 2 high-contrast = 24 combinations per screen
- Focus on key screens: Welcome, Onboarding steps, Radar, Chat, Profile

### 3. **Extend Visual Regression Tests**
- Create new test file: `tests/e2e/visual/theme-matrix.spec.ts`
- Loop through all combinations
- Capture screenshots with descriptive names
- Include accessibility checks (Axe) for each combination
- Fail on CSS regressions (screenshot mismatch)

### 4. **Update Documentation**
- Update `docs/testing/persona-scenarios.md` with matrix expectations
- Document screenshot naming convention
- Add visual regression testing guide

### 5. **CI Integration**
- Ensure CI publishes screenshots for all combinations
- Add visual regression job to CI workflow
- Configure screenshot comparison thresholds (allow minor differences for animations)

## Rollback Options

- **If dark mode implementation is too complex**: Test only light theme + high-contrast + reduced-motion combinations (12 combinations)
- **If test matrix is too slow**: Run full matrix in nightly CI, smoke test subset (mobile + desktop, light theme only) in PR checks
- **If screenshot storage is too large**: Compress screenshots, store only diffs, or use cloud storage

## Next Steps

1. **Prerequisite**: Implement dark mode CSS variables (if not already done)
2. **Create test matrix**: Build `tests/e2e/visual/theme-matrix.spec.ts` with all combinations
3. **Update viewports**: Add small mobile viewport if needed
4. **Documentation**: Update `docs/testing/persona-scenarios.md`
5. **CI**: Ensure artifacts are published correctly

## References

- Playwright `emulateMedia()` API: https://playwright.dev/docs/api/class-page#page-emulate-media
- Existing visual tests: `tests/e2e/visual/`
- Viewport utilities: `tests/utils/viewports.ts`
- High-contrast implementation: `frontend/src/index.css` (lines 210-232)
- Accessibility tests: `tests/e2e/personas/market-research.spec.ts` (WCAG checks)

