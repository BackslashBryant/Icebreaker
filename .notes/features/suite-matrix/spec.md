# Feature Spec: Split Playwright Suites & Extend Browser Matrix

- Slug: `suite-matrix`
- Issue: #15
- Owner: Vector 🎯
- Created: 2025-11-18T00:00:00.000Z

## Problem Statement
Smoke CI only validates chromium desktop and the nightly suite uses a partial browser mix. We lack WebKit coverage, mobile viewport validation, and disciplined artifact/flake handling, so regressions reach production before we notice.

## Target User
Developers, QA leads, and release managers who rely on the Playwright suites to sign off builds.

## Desired Outcome
- Smoke feedback (<3 minutes) that includes chromium + webkit desktop plus one mobile viewport.
- Full suite hitting all browsers (chromium/firefox/webkit/msedge) × desktop/mobile viewports.
- Guardrails that publish HTML reports reliably and store screenshots/videos only on failure.
- Documented flake policy with retry + quarantine flow recorded in `Docs/testing/FLAKY_TESTS.md`.

## Proposed Approach
1. Expand smoke config to include `chromium-mobile` and `webkit-desktop`, keeping runtime under 3 minutes.
2. Define explicit projects in `tests/playwright.config.ts` for every browser × viewport combination (8 total) and keep legacy names for compatibility.
3. Update CI workflows so smoke installs WebKit, the full suite installs msedge, and health-mvp includes WebKit.
4. Codify artifact retention (7-day smoke, 30-day full) and ensure HTML reports always publish.
5. Stand up flake tracking + retry policy, including quarantine instructions.

## MVP DoD
- [ ] Smoke suite runs chromium-desktop, chromium-mobile, and webkit-desktop in <3 minutes.
- [ ] Full suite runs chromium/firefox/webkit/msedge across desktop + mobile (8 projects total).
- [ ] Health MVP job matrix lists chromium, firefox, webkit, and msedge.
- [ ] `.github/workflows/ci.yml` installs required browsers for each job.
- [ ] HTML reports upload on every run; screenshots/videos collect only on failure.
- [ ] `Docs/testing/FLAKY_TESTS.md` exists with retry/quarantine guidance.

## Success Metrics
- ✅ Smoke runtime < 3 minutes while covering WebKit + mobile.
- ✅ Full suite completes nightly without browser gaps.
- ✅ Artifacts remain under retention targets (smoke 7 days, full 30 days).
- ✅ New flakes tracked with owner + resolution plan.

## Not Now (Out of scope)
- Running the extended matrix on every push (nightly only for full suite).
- Adding Safari Tech Preview or beta channels.
- Rewriting persona specs; only matrix + CI config is in scope.

## Research Needed
- Validate msedge-mobile viewport quirks on Ubuntu (see `ci-monitoring.md`).
- Confirm artifact storage sizing after WebKit adoption.
- Capture telemetry on retry effectiveness before tightening thresholds.

## References
- `docs/plans/Issue-15-plan-status-COMPLETE.md`
- `Docs/plans/Issue-15-plan-status.md`
- `docs/research/Issue-15-research.md`
- `.github/workflows/ci.yml`
- `tests/playwright.config.ts`, `tests/playwright.config.smoke.ts`
