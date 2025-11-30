# Visual Regression Testing Guide

## Overview

Visual regression tests capture screenshots across all theme/viewport/accessibility combinations to detect CSS and UI regressions. The test matrix ensures consistent look-and-feel across devices, themes, and accessibility settings.

## Test Matrix

### Screens Tested

The visual regression suite tests 8 key screens:
- **Welcome** - Landing page
- **Onboarding Step 0** - What We Are/Not
- **Onboarding Step 1** - 18+ Consent
- **Onboarding Step 2** - Location Access
- **Onboarding Step 3** - Vibe & Tags
- **Radar** - Main discovery interface
- **Chat** - Messaging interface
- **Profile** - User settings

### Combinations

Each screen is tested across **24 combinations**:
- **3 viewports**: mobile (375×812), tablet (768×1024), desktop (1440×900)
- **2 themes**: light, dark
- **2 reduced motion**: reduce, no-preference
- **2 high contrast**: on, off

**Total**: 8 screens × 24 combinations = **192 tests**

### Runtime Expectations

- **Full matrix**: ~30-60 minutes (depends on CI resources)
- **PR subset** (mobile+desktop, light theme): ~15-20 minutes (128 tests)
- **Minimal subset** (mobile, light, normal): ~5-10 minutes (64 tests)

## Screenshot Naming Convention

Screenshots follow this naming pattern:

```
{screen}-{viewport}-{theme}-{motion}-{contrast}.png
```

### Examples

- `welcome-mobile-light-normal-motion-normal-contrast.png`
- `onboarding-step-0-tablet-dark-reduced-motion-high-contrast.png`
- `radar-desktop-light-normal-motion-normal-contrast.png`

### Naming Components

- **screen**: Screen identifier (e.g., `welcome`, `onboarding-step-0`, `radar`, `chat`, `profile`)
- **viewport**: `mobile`, `tablet`, `desktop`
- **theme**: `light`, `dark`
- **motion**: `normal-motion`, `reduced-motion`
- **contrast**: `normal-contrast`, `high-contrast`

## Running Tests

### Full Matrix (All Combinations)

```bash
cd tests
npm test -- tests/e2e/visual/theme-matrix.spec.ts
```

### Subset Selection

Use environment variables to filter combinations:

```bash
# PR subset: mobile + desktop, light theme only (128 tests)
THEME_MATRIX_VIEWPORT=mobile,desktop THEME_MATRIX_THEME=light npm test -- tests/e2e/visual/theme-matrix.spec.ts

# Minimal subset: mobile, light, normal motion, normal contrast (64 tests)
THEME_MATRIX_VIEWPORT=mobile \
THEME_MATRIX_THEME=light \
THEME_MATRIX_MOTION=no-preference \
THEME_MATRIX_CONTRAST=off \
npm test -- tests/e2e/visual/theme-matrix.spec.ts
```

### Environment Variables

- `THEME_MATRIX_VIEWPORT`: Comma-separated viewport names (e.g., `mobile,desktop`)
- `THEME_MATRIX_THEME`: Comma-separated themes (e.g., `light` or `light,dark`)
- `THEME_MATRIX_MOTION`: Comma-separated motion settings (e.g., `no-preference` or `reduce,no-preference`)
- `THEME_MATRIX_CONTRAST`: Comma-separated contrast settings (e.g., `off` or `on,off`)

**Note**: Invalid values are skipped with a warning. Use exact tokens: `mobile`, `tablet`, `desktop`, `light`, `dark`, `reduce`, `no-preference`, `on`, `off`.

## Updating Baselines

When UI changes are intentional, update screenshot baselines:

### 1. Run Tests to Generate New Screenshots

```bash
cd tests
npm test -- tests/e2e/visual/theme-matrix.spec.ts --update-snapshots
```

This generates new screenshots in `tests/e2e/visual/theme-matrix.spec.ts-snapshots/`.

### 2. Review Generated Screenshots

Check the generated screenshots to ensure they match the intended changes:
- Screenshots are organized by screen name
- Each combination has a unique screenshot
- Verify all affected combinations are updated

### 3. Commit Updated Screenshots

```bash
git add tests/e2e/visual/theme-matrix.spec.ts-snapshots/
git commit -m "chore: Update visual regression baselines for [description]"
```

### 4. Verify CI Passes

After pushing, verify CI passes with the new baselines. If tests fail, review the diff to ensure changes are intentional.

## CI Integration

### Nightly Runs

Full matrix runs in nightly CI (no environment variables):
- All 192 tests
- ~30-60 minutes runtime
- Screenshots uploaded as artifacts

### PR Checks

Subset runs in PR CI (with environment variables):
- Example: `THEME_MATRIX_VIEWPORT=mobile,desktop THEME_MATRIX_THEME=light`
- 128 tests (~15-20 minutes)
- Screenshots uploaded as artifacts for review

### Artifact Access

Screenshots are available in CI artifacts:
- Download and review screenshot diffs
- Compare before/after for visual changes
- Verify accessibility compliance

## Accessibility Checks

Each combination includes an Axe accessibility check:
- **WCAG 2.1 AA** compliance
- Tests fail if violations are detected
- Violations are reported in test output

## Troubleshooting

### Tests Fail on Screenshot Mismatch

1. **Review the diff**: Check the screenshot diff to see what changed
2. **Verify intent**: Confirm changes are intentional
3. **Update baseline**: Run with `--update-snapshots` if changes are correct
4. **Investigate**: If changes are unexpected, investigate CSS/component changes

### Tests Fail on Accessibility Violations

1. **Check violations**: Review Axe violation details in test output
2. **Fix issues**: Address accessibility violations in code
3. **Re-run tests**: Verify fixes resolve violations

### Slow Test Execution

1. **Use subsets**: Run with environment variables to reduce test count
2. **Parallel execution**: Tests run in parallel by default (adjust with `PLAYWRIGHT_WORKERS`)
3. **CI optimization**: Use appropriate subsets for PR vs nightly runs

## Related Documentation

- [Persona Scenarios](./persona-scenarios.md) - Persona-based testing
- [Testing README](./README.md) - General testing guide
- [Playwright Config](../../tests/playwright.config.ts) - Test configuration

