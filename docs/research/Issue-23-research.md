# Research: Run Persona Testing Suite & Generate Actionable UX Insights (Issue #23)

**Research Date**: 2025-11-11  
**Researcher**: Scout 🔎  
**Issue**: #23 - Run Persona Testing Suite & Generate Actionable UX Insights  
**Status**: Complete

## Research Question

How should we execute the persona testing suite, collect telemetry data, and generate actionable UX insights from test results to inform product improvements?

## Constraints

- **Stack**: React frontend, Express backend, WebSocket, Playwright E2E tests
- **Scope**: Execute existing persona tests, collect telemetry, generate insights (no new infrastructure)
- **Existing Infrastructure**:
  - Persona test suites: `tests/e2e/personas/` (college-students, professionals, market-research, multi-user)
  - Telemetry collection: `tests/utils/telemetry.ts` (TelemetryCollector class)
  - Summarization script: `tools/summarize-persona-runs.mjs` (aggregates telemetry, identifies friction patterns)
  - Feedback template: `docs/testing/persona-feedback.md` (manual feedback collection)
  - CI integration: `.github/workflows/ci.yml` (smoke/full split, telemetry summary generation)
- **Current State**: 
  - `artifacts/persona-runs/` directory exists but empty (no telemetry data yet)
  - Tests exist but telemetry collection not fully integrated into all test runs
  - Summarization script ready but needs telemetry data to process
- **Goal**: Run full suite, collect telemetry, generate actionable insights

## Sources & Findings

### 1. Existing Test Infrastructure

**Source**: `tests/e2e/personas/`, `tests/utils/telemetry.ts`, `tools/summarize-persona-runs.mjs`

**Findings**:

- **Test Suites Available**:
  - `college-students.spec.ts` - Maya, Ethan, Zoe personas (17 tests)
  - `professionals.spec.ts` - Marcus, Casey personas (19 tests)
  - `market-research.spec.ts` - River, Alex, Jordan, Sam, Morgan personas (28 tests)
  - `multi-user.spec.ts` - Multi-persona interaction scenarios
  - Total: ~64+ persona tests across all suites

- **Telemetry Collection**:
  - `TelemetryCollector` class exists in `tests/utils/telemetry.ts`
  - Captures: boot time, onboarding time, step retries, error banners, accessibility violations, visible affordances, errors
  - Writes JSON files to `artifacts/persona-runs/<persona>-<timestamp>.json`
  - Currently used in some tests but not all

- **Summarization Script**:
  - `tools/summarize-persona-runs.mjs` aggregates telemetry data
  - Identifies top 5 friction patterns (slow boot, slow onboarding, step retries, error banners, a11y violations, missing affordances, runtime errors)
  - Generates markdown summary appended to `docs/testing/persona-feedback.md`
  - Requires telemetry files in `artifacts/persona-runs/` to work

**Gaps Identified**:
- Telemetry collection not integrated into all persona tests
- No automated execution workflow for full suite
- No structured insight generation beyond friction patterns
- Manual feedback collection exists but not automated

**Recommendation**:
1. Integrate telemetry collection into all persona test suites
2. Create execution script/workflow for full suite run
3. Enhance summarization script to generate actionable insights (not just friction patterns)
4. Document execution process and insight interpretation

**Rollback**: Can run tests manually and collect telemetry incrementally if automation proves complex.

### 2. Test Execution Patterns

**Source**: `tests/package.json`, `tests/playwright.config.ts`, `.github/workflows/ci.yml`

**Findings**:

- **Test Commands**:
  - `npm test` - Run all tests (list reporter)
  - `npm run test:smoke` - Run smoke tests only (faster subset)
  - `npm run test:ci` - CI mode (with retries, fail-fast)
  - Playwright config auto-starts backend/frontend servers

- **CI Integration**:
  - Smoke tests run on every push/PR (fast feedback)
  - Full suite runs nightly or on-demand (workflow_dispatch)
  - Telemetry summary generated after full suite runs
  - Artifacts published: test reports, screenshots, telemetry files

- **Execution Environment**:
  - Local: 50% CPU cores for workers, parallel execution
  - CI: 2 workers (conservative), retries enabled
  - Servers auto-start via `webServer` config (backend port 8000, frontend port 3000)

**Recommendation**: Use existing test commands, enhance with telemetry collection, create dedicated execution script for full suite runs.

### 3. Insight Generation Best Practices

**Source**: UX research best practices, existing persona feedback template

**Findings**:

- **Insight Types**:
  - Quantitative: Metrics (timings, retries, errors, a11y violations)
  - Qualitative: Friction patterns, user journey pain points, accessibility gaps
  - Actionable: Prioritized recommendations, specific fixes, UX improvements

- **Current Feedback Template** (`docs/testing/persona-feedback.md`):
  - Manual feedback collection (questionnaire-based)
  - Per-persona qualitative feedback
  - Cross-persona patterns
  - Prioritized UX improvements
  - But no automated quantitative insights

- **Gap**: Need automated insight generation from telemetry data (not just friction patterns)

**Recommendation**:
1. Enhance summarization script to generate actionable insights:
   - Identify specific UX improvements (not just friction patterns)
   - Prioritize by impact (affects multiple personas vs persona-specific)
   - Provide concrete recommendations (what to fix, why, how)
   - Cross-reference with manual feedback when available
2. Create insight report format: Executive summary, key findings, prioritized actions, detailed metrics

**Rollback**: Can start with friction patterns only, add insights incrementally.

### 4. Telemetry Integration Requirements

**Source**: `tests/utils/telemetry.ts`, existing test files

**Findings**:

- **TelemetryCollector API**:
  - `new TelemetryCollector(persona, sessionId)` - Initialize collector
  - `recordBootTime(ms)` - Record boot time
  - `recordOnboardingTime(ms)` - Record onboarding completion time
  - `recordStepTime(stepNumber, ms)` - Record individual step timing
  - `incrementRetries()` - Track step retries
  - `incrementBackButtonClicks()` - Track back button usage
  - `incrementErrorBanners()` - Track error encounters
  - `recordA11yViolations(count)` - Record accessibility violations
  - `recordFocusOrder(correct)` - Record focus order correctness
  - `recordVisibleAffordance(name, visible)` - Record affordance visibility
  - `recordError(message)` - Record runtime errors
  - `save()` - Write telemetry file to `artifacts/persona-runs/`

- **Current Usage**:
  - Some tests use telemetry (e.g., `college-students.spec.ts` has example)
  - Not all tests integrated yet
  - Need systematic integration across all persona tests

**Recommendation**:
1. Integrate telemetry collection into all persona test suites
2. Use test helpers (`tests/utils/test-helpers.ts`) to instrument common flows
3. Ensure telemetry files are written even if tests fail (use `finally` blocks)
4. Add telemetry collection to multi-user tests

**Rollback**: Can integrate incrementally, starting with core persona tests.

## Recommendations Summary

**Priority 1**: Execute full suite, integrate telemetry, generate basic insights
- Run full persona test suite locally
- Integrate telemetry collection into all test suites
- Generate telemetry summary using existing script
- Document execution process and results

**Priority 2**: Enhance insight generation, create actionable recommendations
- Enhance summarization script to generate actionable insights
- Create insight report format (executive summary, key findings, prioritized actions)
- Cross-reference quantitative telemetry with qualitative feedback
- Document insight interpretation guidelines

**Priority 3**: Automate execution workflow, CI integration
- Create dedicated execution script for full suite runs
- Enhance CI workflow to generate insights automatically
- Create dashboard/visualization for telemetry trends
- Set up regular execution schedule

## Rollback Options

1. **Manual Execution**: Run tests manually, collect telemetry incrementally
2. **Basic Telemetry**: Start with friction patterns only, add insights later
3. **Incremental Integration**: Integrate telemetry into tests one suite at a time
4. **Manual Insights**: Generate insights manually from telemetry data if automation proves complex

## Next Steps

1. **Scout** → Research complete ✅
2. **Vector** → Create plan with checkpoints for execution, telemetry integration, insight generation
3. **Team Review** → Review plan before implementation
4. **Pixel** → Execute tests, integrate telemetry, generate insights
5. **Muse** → Document execution process and insight interpretation

## References

- **Test Infrastructure**: `tests/e2e/personas/`, `tests/utils/telemetry.ts`
- **Summarization**: `tools/summarize-persona-runs.mjs`
- **Feedback Template**: `docs/testing/persona-feedback.md`
- **CI Integration**: `.github/workflows/ci.yml`
- **Test Config**: `tests/playwright.config.ts`, `tests/package.json`
- **Related Issue**: Issue #18 (Persona-Simulated User Testing infrastructure - COMPLETE)

