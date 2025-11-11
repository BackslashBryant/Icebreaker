# Persona Sim Testing – Next Issues Backlog

These are proposed as separate GitHub issues following Issue #18 (main planning issue). Each includes rationale, scope, and acceptance criteria so they can be filed independently.

**Note**: Main planning issue is Issue #18 (Persona-Simulated User Testing with Look-and-Feel Validation). Issues #8-#17 are Phase 2 implementation backlog items.

---

## 1. Feature-Flagged WebSocket Mock & Shim
- **Title**: `feat: Add PLAYWRIGHT_WS_MOCK transport + frontend shim`
- **Why**: Unlock deterministic multi-user runs without relying on live backend sockets.
- **Scope**:
  - Implement `tests/mocks/websocket-mock.ts` mirroring `createWebSocketConnection` behavior (`radar:subscribe`, `location:update`, chat lifecycle, panic).
  - Add a runtime switch in `frontend/src/lib/websocket-client.ts` to use the mock when `PLAYWRIGHT_WS_MOCK=1`.
  - Provide sample script + test proving two mock personas appear on Radar concurrently.
- **Acceptance**: Playwright smoke run passes entirely with `PLAYWRIGHT_WS_MOCK=1`; docs updated in `docs/testing/persona-sim-testing-plan.md`.

## 2. Persona Presence Fixture Library
- **Title**: `chore: Add persona presence fixture schema + baseline scripts`
- **Why**: Keep persona/tag/geo data consistent across suites.
- **Scope**:
  - Create `tests/fixtures/persona-presence/schema.d.ts` and reusable JSON fixtures (campus, coworking, event).
  - Loader helper exposes fixture data to tests and WS mock.
  - Document fixture usage in testing plan.
- **Acceptance**: Persona specs import fixtures; running tests references shared personas instead of inline definitions.

## 3. Geolocation & Permission Helpers
- **Title**: `feat: Implement geolocation helper + proximity boundary tests`
- **Why**: Simulate venue realism and verify proximity scoring.
- **Scope**:
  - Add `tests/utils/geolocation.ts` granting geolocation permission and setting coordinates/floor metadata.
  - Define canonical locations in `tests/fixtures/locations.json`.
  - Add tests covering just-inside/outside range and floor offsets.
- **Acceptance**: Persona tests call helper; assertions confirm Radar reacts correctly to geo changes.

## 4. Multi-Context Persona Specs
- **Title**: `feat: Upgrade persona E2E suites to dual-context flows`
- **Why**: Validate real interaction dynamics (visibility, compatibility, single chat rule).
- **Scope**:
  - For each persona group, add at least one test spawning two contexts (e.g., Maya+Zoe, Marcus+Ethan).
  - Assert mutual visibility, signal score deltas, visibility toggle behavior, and chat gating.
  - Leverage WS mock + fixtures for deterministic results.
- **Acceptance**: Tests fail if personas don’t see each other or chat rules misbehave.

## 5. Visual Regression Baselines
- **Title**: `feat: Add Playwright visual snapshots for key screens`
- **Why**: Guard “terminal meets Game Boy” aesthetic during UI changes.
- **Scope**:
  - Capture screenshots for Welcome, Onboarding steps, Radar (empty/populated), Chat start/end, Panic prompt, Profile.
  - Store in `artifacts/visual/<screen>/<viewport>.png`; mask dynamic elements (handles, timestamps).
  - Set ≤2% diff threshold and document baselines.
- **Acceptance**: Visual tests run on CI smoke/full suites; diffs surface layout regressions.

## 6. Device & Theme Matrix Coverage
- **Title**: `feat: Validate look-and-feel across devices, themes, reduced motion`
- **Why**: Ensure experience holds for accessibility settings and breakpoints.
- **Scope**:
  - Add tests for small/medium mobile, tablet, desktop viewports.
  - Run combos for light/dark themes, prefers-reduced-motion, high-contrast.
  - Update `docs/testing/persona-scenarios.md` with matrix expectations.
- **Acceptance**: CI artifacts include screenshots per combo; tests fail if CSS regressions occur.

## 7. Stable Selector Map via `data-testid`
- **Title**: `chore: Add data-testid to critical UI + selector map`
- **Why**: Reduce flake from copy and accessibility tweaks.
- **Scope**:
  - Add `data-testid` attributes to onboarding CTAs, vibe/tag chips, panic FAB, visibility toggle, chat controls, nav buttons.
  - Create `tests/utils/selectors.ts` exporting canonical selectors.
  - Refactor persona specs to use selector map; keep ARIA expectations for a11y tests.
- **Acceptance**: All persona specs import selector map; Axe scans confirm no accessibility regression.

## 8. Persona Telemetry Writer & Aggregator
- **Title**: `feat: Emit persona run telemetry + summarize results`
- **Why**: Produce quantitative feedback (timings, errors) per run.
- **Scope**:
  - Implement `tests/utils/telemetry.ts` to record per-persona metrics and write JSON under `artifacts/persona-runs/`.
  - Add `tools/summarize-persona-runs.mjs` to aggregate counts/top issues (tolerates empty dirs).
  - Append summarized insights to `docs/testing/persona-feedback.md` after CI runs.
- **Acceptance**: Telemetry files uploaded as CI artifacts; summary appears in logs/docs.

## 9. CI Smoke vs Full Split + Multi-Browser Matrix
- **Title**: `chore: Split Playwright suites and extend browser matrix`
- **Why**: Keep fast feedback while ensuring rich nightly coverage.
- **Scope**:
  - Define smoke (Chromium mobile+desktop, subset tests) vs full (Chromium/WebKit/Firefox + visual + a11y) projects in Playwright config.
  - Update GitHub Actions workflows to run smoke on push/PR and full nightly.
  - Publish artifacts (screenshots, videos, telemetry) and implement flake quarantine/retry policy.
- **Acceptance**: CI shows separate jobs with expected runtimes; documentation describes strategy.

## 10. Accessibility & Failure-State Hardening
- **Title**: `feat: Add keyboard-only, screen-reader, and WS failure coverage`
- **Why**: Ensure safety UX under stress conditions.
- **Scope**:
  - Add keyboard-only journeys for onboarding, Radar navigation, panic usage.
  - Assert SR labels/states for visibility toggle, panic, chat status via Playwright’s accessibility tree.
  - Simulate WS disconnect/failure and onboarding API 4xx/5xx with user-friendly recovery UI.
  - Update edge-case docs with new findings.
- **Acceptance**: Tests cover each scenario and fail if accessibility or failure UX regresses.

---

**Owner Suggestion**: Track these in a “Persona Sim Testing Phase 2” milestone to coordinate delivery order (foundation → visuals → robustness).
