# Visual Regression Testing & Baselines

## Overview

IceBreaker uses Playwright's visual regression testing to guard the "terminal meets Game Boy" aesthetic. Tests compare screenshots against committed baselines and fail if differences exceed 2%.

## Golden Screens

9 key screens are captured across 3 viewports (mobile, tablet, desktop):

1. **Welcome** - Brand moment with retro logo
2. **Onboarding Step 0** - Consent checkbox
3. **Onboarding Step 1** - Location explainer
4. **Onboarding Step 2** - Vibe selection
5. **Onboarding Step 3** - Tags selection
6. **Radar Empty** - "No one nearby" state
7. **Chat Empty** - No active chat state
8. **Profile** - User settings screen
9. **Panic Dialog** - Emergency exit prompt

## Configuration

```typescript
// tests/playwright.config.ts
expect: {
  toHaveScreenshot: {
    maxDiffPixelRatio: 0.02, // 2% threshold
    animations: 'disabled',
    scale: 'css',
  },
}
```

## Baselines Location

Snapshots are stored in: `tests/e2e/visual/golden-screens.spec.ts-snapshots/`

Format: `golden-<screen>-<viewport>-<browser>-<platform>.png`

## When to Update Baselines

Update baselines ONLY when:
- Intentional UI changes are made
- New screens/viewports are added
- Platform/browser updates affect rendering

**Never** update baselines to "fix" unexpected failures—investigate the root cause first.

## How to Update Baselines

### Option 1: Local Update (for development)

```bash
cd tests
npx playwright test e2e/visual/golden-screens.spec.ts --update-snapshots
```

⚠️ Local baselines may differ from CI (font rendering, OS differences). Prefer CI-generated baselines.

### Option 2: CI-Generated Baselines (recommended)

1. Push changes to branch
2. CI will fail with visual diffs
3. Download `visual-snapshots` artifact from failed job
4. Extract and commit the new baselines
5. Push and verify CI passes

## Reviewing Visual Diffs

When tests fail, check:

1. **Artifacts**: Download `visual-snapshots` from CI
2. **Diff images**: Look for `*-diff.png` files showing changes
3. **Expected vs Actual**: Compare side-by-side

## Masking Dynamic Content

Dynamic elements (handles, timestamps, session IDs) are masked to prevent false failures. See `tests/utils/viewports.ts` for `MASK_SELECTORS`.

## Troubleshooting

### Flaky Tests
- Increase `maxDiffPixelRatio` if minor rendering differences cause failures
- Check for animation timing issues
- Verify `animations: 'disabled'` is working

### Platform Differences
- Baselines should be ubuntu-linux (CI environment)
- Don't commit win32 or darwin baselines for CI tests

### Missing Baselines
- Run with `--update-snapshots` to generate initial baselines
- Ensure test passes locally before committing

