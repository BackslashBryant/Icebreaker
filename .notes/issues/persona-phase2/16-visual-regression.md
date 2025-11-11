## Why
Guard "terminal meets Game Boy" aesthetic during UI changes.

## Scope
- Capture screenshots for Welcome, Onboarding steps, Radar (empty/populated), Chat start/end, Panic prompt, Profile.
- Store in `artifacts/visual/<screen>/<viewport>.png`; mask dynamic elements (handles, timestamps).
- Set ≤2% diff threshold and document baselines.

## Acceptance
- Visual tests run on CI smoke/full suites
- Diffs surface layout regressions

## Related
Part of Persona Sim Testing Phase 2 backlog.

