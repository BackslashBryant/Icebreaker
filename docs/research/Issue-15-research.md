# Research: Split Playwright Suites and Extend Browser Matrix (Issue #15)

**Research Date**: 2025-11-25  
**Researcher**: Scout 🔎  
**Issue**: #15 - Split Playwright suites and extend browser matrix  
**Status**: Complete

## Research Question

How should we split Playwright test suites (smoke vs. full) and extend the browser matrix to include WebKit, mobile/desktop viewports, artifact publishing, flake policies, and tag strategies for optimal CI performance and coverage?

## Constraints

- **Current Setup**:
  - Smoke suite: Chromium only, ~2-3 min, runs on push/PR
  - Full suite: Chromium/Firefox/MS Edge nightly, runs on schedule
  - Health MVP: Matrix with chromium/firefox/msedge (desktop only)
  - Visual/A11y: Chromium only (desktop)
  - Performance: Chromium only (desktop)
- **Stack**: Playwright, GitHub Actions CI, React frontend, Express backend
- **Scope**: Improve CI performance, extend browser coverage, add mobile viewports, improve artifact management
- **Target**: Fast smoke feedback on push/PR, comprehensive full suite nightly

## Sources & Findings

### 1. Current Test Suite Split

**Source**: `.github/workflows/ci.yml`, `tests/playwright.config.ts`, `tests/playwright.config.smoke.ts`

**Findings**:
- **Smoke Suite** (`persona-smoke` job):
  - Runs on: push, pull_request, workflow_dispatch (when `run_full_suite=false`)
  - Browser: Chromium only (desktop)
  - Config: `tests/playwright.config.smoke.ts`
  - Tag filter: `@smoke` (grep pattern)
  - Duration: ~2-3 minutes
  - Artifacts: 7-day retention (smoke-test-report, telemetry-summary)
  - Retries: 1 in CI, 0 locally

- **Full Suite** (`persona-full` job):
  - Runs on: schedule (nightly 2 AM UTC), workflow_dispatch (when `run_full_suite=true`)
  - Browsers: Chromium, Firefox, WebKit (installed but not matrixed)
  - Config: `tests/playwright.config.ts`
  - Duration: 10+ minutes
  - Artifacts: 30-day retention (full-test-report, telemetry-summary-full)
  - Retries: 2 in CI, 0 locally

- **Health MVP** (`health-mvp` job):
  - Runs on: push, pull_request, workflow_dispatch
  - Browser matrix: chromium, firefox, msedge (desktop only)
  - Tests: `e2e/health.spec.ts` only
  - Project selection: `--project=${{ matrix.browser }}`

- **Visual/A11y** (`ui-visual-a11y` job):
  - Runs on: push, pull_request, workflow_dispatch
  - Browser: Chromium only (desktop)
  - Tests: Visual snapshots, accessibility checks
  - Project: `stateless`

- **Performance** (`performance-budgets` job):
  - Runs on: push, pull_request, workflow_dispatch
  - Browser: Chromium only (desktop)
  - Tests: `e2e/performance.spec.ts`
  - Project: `stateful`

**Gaps Identified**:
1. **WebKit missing from smoke**: Smoke only uses Chromium
2. **No mobile viewports**: All tests run desktop-only
3. **Inconsistent browser matrix**: Full suite installs WebKit but doesn't matrix it
4. **Health MVP missing WebKit**: Only chromium/firefox/msedge
5. **No viewport matrix**: Desktop-only across all jobs
6. **Artifact publishing**: Smoke artifacts exist but could be improved
7. **Flake policy**: Retry counts exist but no quarantine mechanism
8. **Tag strategy**: Smoke uses `@smoke` tag, but no explicit `@full` tag

### 2. Playwright Browser Matrix Best Practices

**Source**: Playwright documentation, CI best practices

**Findings**:
- **Browser Projects**: Define explicit projects for each browser/device combination
- **Matrix Strategy**: Use GitHub Actions matrix to parallelize browser runs
- **Viewport Coverage**: Test mobile (375x667), tablet (768x1024), desktop (1280x720, 1920x1080)
- **Device Emulation**: Use Playwright `devices` presets (`Mobile Chrome`, `Desktop Chrome`, etc.)
- **Project Naming**: Clear names like `chromium-desktop`, `chromium-mobile`, `firefox-desktop`, `webkit-mobile`

**Recommendation**:
- Create explicit projects in config: `chromium-desktop`, `chromium-mobile`, `firefox-desktop`, `firefox-mobile`, `webkit-desktop`, `webkit-mobile`, `msedge-desktop`, `msedge-mobile`
- Use GitHub Actions matrix: `browser: [chromium, firefox, webkit, msedge]`, `viewport: [desktop, mobile]`
- Match project names to matrix values for `--project=${{ matrix.browser }}-${{ matrix.viewport }}`

### 3. Smoke vs. Full Suite Strategy

**Source**: Playwright best practices, CI performance optimization

**Findings**:
- **Smoke Suite Goals**:
  - Fast feedback (< 3 minutes)
  - Critical path coverage (happy paths only)
  - Run on every push/PR
  - Should catch breaking changes quickly
  
- **Full Suite Goals**:
  - Comprehensive coverage (all tests, edge cases)
  - Cross-browser validation
  - Mobile + desktop viewports
  - Run nightly or on-demand
  - Catch browser-specific issues

**Recommendation**:
- **Smoke Projects**: `chromium-desktop`, `chromium-mobile`, `webkit-desktop` (3 projects, ~2-3 min total)
- **Full Projects**: All browser/viewport combinations (8 projects: chromium/firefox/webkit/msedge × desktop/mobile)
- **Tag Strategy**: 
  - `@smoke`: Fast subset (1 test per persona group, critical flows)
  - `@full`: All tests (or no tag = full suite)
  - Explicit tags in test files: `test('@smoke critical flow', ...)`

### 4. Artifact Publishing & Retention

**Source**: GitHub Actions documentation, current CI config

**Findings**:
- **Current Artifacts**:
  - Smoke: `smoke-test-report` (7 days), `telemetry-summary` (30 days)
  - Full: `full-test-report` (30 days), `telemetry-summary-full` (30 days)
  - Visual: `visual-snapshots` (30 days)
  - Performance: `performance-test-report` (7 days)

- **Artifact Contents**:
  - HTML reports: `artifacts/playwright-report-smoke/`, `artifacts/playwright-report/`
  - Test results: `artifacts/test-results-smoke/`, `artifacts/test-results/`
  - Telemetry: `docs/testing/persona-feedback.md`, `artifacts/persona-runs/`

**Recommendation**:
- **Smoke Artifacts**: Keep 7-day retention (fast feedback, less historical value)
- **Full Artifacts**: Keep 30-day retention (comprehensive, valuable for debugging)
- **Publish HTML reports**: Always publish for easy review
- **Publish screenshots/videos**: On failure only (reduce artifact size)
- **Telemetry**: Always publish (30-day retention for trend analysis)

### 5. Flake Policy & Retry Strategy

**Source**: Playwright retry documentation, CI reliability best practices

**Findings**:
- **Current Retry Policy**:
  - Smoke: 1 retry in CI, 0 locally
  - Full: 2 retries in CI, 0 locally
  - Health MVP: Inherits from config (2 retries in CI)

- **Flake Handling**:
  - No quarantine mechanism (tests that consistently fail are still run)
  - No flake tracking (can't identify patterns)
  - Retries help but don't prevent flaky tests from slowing CI

**Recommendation**:
- **Retry Strategy**:
  - Smoke: 1 retry (fast feedback, don't retry too much)
  - Full: 2 retries (comprehensive, can afford more retries)
  - Health MVP: 1 retry (critical path, but fast)
  
- **Quarantine Mechanism**:
  - Use `test.describe.skip()` or `test.skip()` for known flaky tests
  - Track flaky tests in `Docs/testing/FLAKY_TESTS.md`
  - Auto-quarantine after 3 consecutive failures (future enhancement)
  
- **Flake Tracking**:
  - Log flaky test patterns in telemetry
  - Review flaky tests weekly
  - Fix or quarantine within 1 week

### 6. Workflow Wiring (Push/PR vs. Nightly)

**Source**: Current `.github/workflows/ci.yml`

**Findings**:
- **Push/PR Triggers**:
  - Smoke suite runs automatically
  - Health MVP runs automatically
  - Visual/A11y runs automatically
  - Performance runs automatically
  
- **Nightly Schedule**:
  - Full suite runs at 2 AM UTC
  - Can be triggered manually via `workflow_dispatch` with `run_full_suite=true`

- **Workflow Dispatch**:
  - Can trigger smoke (`run_full_suite=false`) or full (`run_full_suite=true`)
  - Useful for debugging or pre-release validation

**Recommendation**:
- **Keep Current Triggers**: Push/PR → smoke, nightly → full
- **Add Manual Triggers**: Workflow dispatch for both smoke and full
- **Matrix Strategy**: Use GitHub Actions matrix for browser/viewport combinations
- **Parallel Execution**: Run browser/viewport combinations in parallel (faster feedback)

### 7. Mobile Viewport Testing

**Source**: Playwright devices documentation, responsive design best practices

**Findings**:
- **Current State**: All tests run desktop-only (`Desktop Chrome`, `Desktop Firefox`)
- **Mobile Devices Available**: `Mobile Chrome`, `Mobile Safari`, `iPhone 13`, `Pixel 5`, etc.
- **Viewport Sizes**: 
  - Mobile: 375x667 (iPhone SE), 390x844 (iPhone 12), 412x915 (Pixel 5)
  - Tablet: 768x1024 (iPad)
  - Desktop: 1280x720, 1920x1080

**Recommendation**:
- **Start with Mobile Chrome**: Most common mobile browser
- **Add Mobile Viewports**: Create `chromium-mobile`, `firefox-mobile`, `webkit-mobile`, `msedge-mobile` projects
- **Use Playwright Devices**: `devices['Mobile Chrome']`, `devices['Mobile Safari']`
- **Test Critical Flows**: Smoke suite should include mobile viewport for critical paths
- **Full Suite**: Test all viewports for comprehensive coverage

## Recommendations Summary

### Priority 1: Extend Browser Matrix

1. **Add WebKit to Smoke Suite**:
   - Create `webkit-desktop` project in smoke config
   - Add WebKit to smoke job browser installation
   - Update smoke matrix: `chromium-desktop`, `chromium-mobile`, `webkit-desktop` (3 projects)

2. **Extend Full Suite Matrix**:
   - Create explicit projects: `chromium-desktop`, `chromium-mobile`, `firefox-desktop`, `firefox-mobile`, `webkit-desktop`, `webkit-mobile`, `msedge-desktop`, `msedge-mobile`
   - Use GitHub Actions matrix: `browser: [chromium, firefox, webkit, msedge]`, `viewport: [desktop, mobile]`
   - Match project names: `--project=${{ matrix.browser }}-${{ matrix.viewport }}`

3. **Update Health MVP**:
   - Add WebKit to matrix: `browser: [chromium, firefox, webkit, msedge]`
   - Add mobile viewport: `viewport: [desktop, mobile]` (optional, start with desktop)

### Priority 2: Add Mobile Viewports

1. **Create Mobile Projects**:
   - Add `chromium-mobile`, `firefox-mobile`, `webkit-mobile`, `msedge-mobile` to configs
   - Use `devices['Mobile Chrome']`, `devices['Mobile Safari']` for viewport emulation
   - Test critical flows on mobile (smoke suite)

2. **Update CI Matrix**:
   - Add `viewport` dimension to matrix jobs
   - Run desktop and mobile in parallel for faster feedback

### Priority 3: Improve Artifact Publishing

1. **Smoke Artifacts**:
   - Keep 7-day retention (fast feedback)
   - Always publish HTML report
   - Publish screenshots/videos on failure only

2. **Full Artifacts**:
   - Keep 30-day retention (comprehensive)
   - Always publish HTML report
   - Publish screenshots/videos on failure only
   - Group by browser/viewport for easier review

### Priority 4: Flake Policy & Retry Rules

1. **Retry Strategy**:
   - Smoke: 1 retry (fast feedback)
   - Full: 2 retries (comprehensive)
   - Health MVP: 1 retry (critical path)

2. **Quarantine Mechanism**:
   - Track flaky tests in `Docs/testing/FLAKY_TESTS.md`
   - Use `test.describe.skip()` for known flaky tests
   - Review and fix within 1 week

### Priority 5: Tag Strategy

1. **Explicit Tags**:
   - `@smoke`: Fast subset (1 test per persona group, critical flows)
   - `@full`: All tests (or no tag = full suite)
   - Tag tests explicitly: `test('@smoke critical flow', ...)`

2. **Tag Usage**:
   - Smoke config: `grep: /@smoke/`
   - Full config: No grep filter (runs all tests)
   - Health MVP: No tags (runs specific test file)

## Rollback Options

- **If WebKit causes issues**: Remove WebKit from smoke, keep in full suite only
- **If mobile viewports slow CI**: Start with desktop-only, add mobile incrementally
- **If matrix complexity causes problems**: Fall back to sequential browser runs
- **If artifact size becomes issue**: Reduce retention periods or compress artifacts
- **If flake policy too strict**: Relax retry counts or quarantine rules

## Next Steps

1. **Research Complete** ✅ - Proceed to planning phase
2. **Vector to Create Plan**: Reference this research in `Docs/plans/Issue-15-plan-status-IN-PROGRESS.md`
3. **Implementation Order**:
   - Step 1: Add WebKit to smoke suite (chromium + webkit desktop)
   - Step 2: Add mobile viewports (chromium mobile)
   - Step 3: Extend full suite matrix (all browsers × desktop/mobile)
   - Step 4: Update artifact publishing
   - Step 5: Implement flake policy
   - Step 6: Update tag strategy

