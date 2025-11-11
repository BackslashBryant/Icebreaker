# Research: Persona-Simulated User Testing with Look-and-Feel Validation (Issue #18)

**Research Date**: 2025-11-11  
**Researcher**: Scout 🔎  
**Issue**: #18 - Persona-Simulated User Testing (GitHub Issue #18, research file kept as Issue-11-research.md for consistency)  
**Status**: Complete

## Research Question

How can we transform existing E2E persona tests into realistic, simulated multi-user testing that validates look-and-feel, captures UX telemetry, and enables deterministic testing without a live user base?

## Constraints

- **Stack**: React frontend, Express backend, WebSocket, Playwright E2E tests
- **Existing Infrastructure**: 
  - 64 persona tests passing (Issue #10 complete)
  - Real backend/frontend servers required for tests
  - WebSocket connections to backend for Radar/Chat
  - No WebSocket mocking currently
  - No visual regression testing
  - No data-testid attributes in UI
  - No telemetry capture
- **Scope**: Transform tests to be deterministic, multi-user capable, and visual-regression aware
- **Target**: Realistic persona simulation with look-and-feel validation

## Sources & Findings

### 1. WebSocket Mocking for Multi-User Simulation

**Source**: Playwright documentation, existing WebSocket implementation (`frontend/src/lib/websocket-client.ts`, `frontend/src/hooks/useWebSocket.ts`)

**Findings**:
- **Current Implementation**: 
  - WebSocket connects to real backend at `ws://localhost:8000/ws?token=<token>`
  - `useWebSocket` hook manages connection lifecycle
  - `useRadar`, `useChat`, `usePanic` hooks depend on WebSocket messages
  - Messages: `radar:update`, `chat:request`, `chat:accepted`, `chat:message`, `chat:end`, `panic:triggered`

- **Mocking Strategy**:
  - Playwright `page.route()` can intercept WebSocket connections
  - Alternative: Create mock WebSocket class that implements same interface
  - Environment variable toggle: `PLAYWRIGHT_WS_MOCK=1`
  - Inject mock via `page.addInitScript()` before app loads
  - Mock must handle: presence updates, chat requests, location updates, visibility toggles

- **Multi-User Simulation**:
  - Use multiple browser contexts (`browser.newContext()`) for each persona
  - Each context has its own session, geolocation, permissions
  - Mock WebSocket must coordinate between contexts (shared presence state)
  - Playwright fixtures can manage multi-context setup

**Recommendation**:
1. Create `tests/mocks/websocket-mock.ts` with `WsMock` class
2. Add runtime shim in `frontend/src/lib/websocket-client.ts` to use mock when `PLAYWRIGHT_WS_MOCK=1`
3. Create Playwright fixture `tests/e2e/fixtures/ws-mock.setup.ts` for multi-context setup
4. Store presence scripts in `tests/fixtures/persona-presence/*.json`

**Rollback**: Can fall back to real backend if mocking proves complex. Tests will be slower but still functional.

---

### 2. Geolocation Realism & Proximity Testing

**Source**: Playwright geolocation API, existing persona scenarios (`docs/testing/persona-scenarios.md`)

**Findings**:
- **Playwright Capabilities**:
  - `context.grantPermissions(['geolocation'])` - grant permission
  - `context.setGeolocation({ latitude, longitude })` - set coordinates
  - `context.clearPermissions()` - revoke permission
  - Can simulate permission denial, revocation flows

- **Proximity Scenarios Needed**:
  - Same building, different floors (Marcus + Ethan coworking)
  - Same event/venue (Casey + Alex gallery/conference)
  - Same campus (Maya + Zoe + Ethan)
  - Boundary testing: just inside/outside radius
  - Floor changes during test
  - Venue exit/entry

- **Location Data Structure**:
  - Personas have venue context (campus-library, coworking-downtown, gallery-opening)
  - Need coordinates per persona per scenario
  - Floor numbers for multi-floor buildings

**Recommendation**:
1. Create `tests/fixtures/locations.json` with venue coordinates
2. Create `tests/utils/geolocation.ts` helper: `setPersonaGeo(context, geo)`
3. Add boundary test helpers: `setProximityBoundary(context, center, radius)`
4. Test permission flows: first-seen vs. previously-denied

**Rollback**: Can use fixed coordinates per test if location fixtures prove complex.

---

### 3. Visual Regression Testing

**Source**: Playwright screenshot API, existing plan (`docs/testing/persona-sim-testing-plan.md`)

**Findings**:
- **Playwright Screenshot API**:
  - `expect(page).toHaveScreenshot('name.png')` - visual regression
  - `maxDiffPixelRatio: 0.02` - tolerance for minor differences
  - Screenshots stored in `test-results/` by default
  - Can capture full page or element-specific

- **Screens to Capture**:
  - Welcome screen (boot sequence complete)
  - Each onboarding step (What We Are, Age Verification, Location, Vibe, Tags)
  - Radar empty state
  - Radar with users (multiple personas visible)
  - Chat active state
  - Chat ending state
  - Panic prompt
  - Profile settings

- **Viewports Needed**:
  - Mobile: 375x812 (iPhone X), 414x896 (iPhone 11 Pro Max)
  - Tablet: 768x1024 (iPad)
  - Desktop: 1440x900 (common desktop)

- **Theme Coverage**:
  - Light mode (default)
  - Dark mode (if implemented)
  - High contrast (if implemented)
  - Reduced motion (if implemented)

**Recommendation**:
1. Add visual snapshot tests to existing persona test files
2. Create viewport matrix helper: `testViewports.forEach(viewport => ...)`
3. Store screenshots in `artifacts/visual/<persona>/<screen>-<viewport>.png`
4. Add CI step to compare screenshots and fail on regressions

**Rollback**: Can skip visual regression initially, focus on functional tests first.

---

### 4. UX Telemetry Capture

**Source**: Existing test helpers (`tests/utils/test-helpers.ts`), Playwright performance API

**Findings**:
- **Metrics to Capture**:
  - Time-to-boot (Welcome screen load)
  - Time-to-complete-onboarding (all steps)
  - Steps retried (back button usage)
  - Error banners encountered
  - UI focus order correctness (accessibility)
  - Visible affordances (panic button, visibility toggle)
  - Network request timing
  - WebSocket connection timing

- **Playwright Capabilities**:
  - `page.metrics()` - performance metrics
  - `page.timing` - navigation timing
  - `page.evaluate()` - custom metrics
  - Network request interception for timing

- **Storage Format**:
  - Per-run JSON: `artifacts/persona-runs/<persona>-<timestamp>.json`
  - Aggregation script: `tools/summarize-persona-runs.mjs`
  - Auto-append to `docs/testing/persona-feedback.md`

**Recommendation**:
1. Create `tests/utils/telemetry.ts` with `writePersonaRun(run)` function
2. Instrument test helpers to capture timings
3. Create aggregation script for trend analysis
4. Add CI step to generate feedback summary

**Rollback**: Can skip telemetry initially, add incrementally.

---

### 5. Selector Stability with data-testid

**Source**: Existing tests (`tests/e2e/personas/*.spec.ts`), Playwright best practices

**Findings**:
- **Current Selectors**:
  - Text-based: `page.getByText("PRESS START")`
  - Role-based: `page.getByRole("link", { name: /PRESS START/i })`
  - No `data-testid` attributes in UI currently
  - Selectors break when copy changes

- **Critical Elements Needing data-testid**:
  - Welcome CTA: `data-testid="cta-press-start"`
  - Onboarding steps: `data-testid="onboarding-step-{n}"`
  - Vibe options: `data-testid="vibe-{name}"`
  - Tag chips: `data-testid="tag-{name}"`
  - Panic button: `data-testid="panic-fab"`
  - Visibility toggle: `data-testid="visibility-toggle"`
  - Chat controls: `data-testid="chat-{action}"`

- **Centralization Strategy**:
  - Create `tests/utils/selectors.ts` with selector map
  - Export `SEL` object with all selectors
  - Update tests to use centralized selectors
  - Update UI components to add `data-testid` attributes

**Recommendation**:
1. Add `data-testid` to critical UI components (frontend)
2. Create `tests/utils/selectors.ts` with centralized selector map
3. Update existing tests to use centralized selectors
4. Document selector naming convention

**Rollback**: Can keep text-based selectors if adding data-testid proves disruptive.

---

### 6. Multi-User Test Scenarios

**Source**: Existing persona scenarios (`docs/testing/persona-scenarios.md`), WebSocket message types

**Findings**:
- **Scenarios Needing Multi-User Simulation**:
  - Maya + Zoe: Shared tag compatibility (both have "Overthinking Things")
  - Ethan + Marcus: Shared tag + different floors (coworking)
  - Casey + Alex: Event proximity matching
  - Visibility toggle: One persona hides, other sees disappearance
  - One-chat-at-a-time: Second chat request blocked
  - Reconnect/disconnect: Transient WS drop and recovery

- **Test Structure**:
  - Use `test('Maya sees Zoe', async ({ browser }) => { ... })`
  - Create two contexts: `const maya = await browser.newContext()`
  - Set different geolocations per context
  - Assert mutual appearance on Radar
  - Assert signal score boost for shared tags

**Recommendation**:
1. Create multi-user test helpers: `createMultiPersonaContext(browser, personas)`
2. Add presence script fixtures for common scenarios
3. Test mutual visibility, signal scoring, chat blocking

**Rollback**: Can test personas individually if multi-user setup proves complex.

---

### 7. Visual Regression Best Practices

**Source**: Playwright documentation, visual testing best practices

**Findings**:
- **Screenshot Stability**:
  - Use `maxDiffPixelRatio: 0.02` for minor differences (fonts, rendering)
  - Use `maxDiffPixels: 100` for absolute pixel tolerance
  - Disable animations: `page.emulateMedia({ reducedMotion: 'reduce' })`
  - Wait for stable state before screenshot

- **Common Issues**:
  - Font rendering differences across OS
  - Animation timing differences
  - Dynamic content (timestamps, random handles)
  - Flaky selectors causing different content

- **Mitigation Strategies**:
  - Mask dynamic content: `mask: [page.locator('.timestamp')]`
  - Wait for animations: `await page.waitForLoadState('networkidle')`
  - Use consistent fonts: Ensure system fonts or web fonts loaded

**Recommendation**:
1. Add visual tests incrementally (start with Welcome, Radar)
2. Mask dynamic content (handles, timestamps)
3. Wait for stable state before screenshots
4. Store baseline screenshots in git (first run)

**Rollback**: Can skip visual regression if it proves flaky, focus on functional tests.

---

### 8. CI Integration & Test Splitting

**Source**: Existing Playwright config (`tests/playwright.config.ts`), CI best practices

**Findings**:
- **Current Setup**:
  - Single test suite runs sequentially (`fullyParallel: false`)
  - All tests run on every push
  - No smoke vs. full split
  - No visual regression in CI

- **Test Splitting Strategy**:
  - Smoke suite: 1 test per persona group, visual on Welcome + Radar
  - Full suite: All personas, WS-mock, visual matrix, a11y
  - Smoke runs on every push (fast feedback)
  - Full runs nightly or on demand

- **CI Reporting**:
  - HTML report: `artifacts/playwright-report/`
  - Screenshots: `artifacts/test-results/`
  - Videos: `artifacts/test-results/` (on failure)
  - Telemetry summary: `artifacts/persona-runs/summary.json`

**Recommendation**:
1. Create `tests/playwright.config.smoke.ts` for smoke tests
2. Update CI workflow to run smoke on push, full on schedule
3. Publish HTML report + telemetry summary
4. Quarantine flaky tests with `test.describe.skip()` or `test.skip()`

**Rollback**: Can run all tests together if splitting proves complex.

---

## Recommendations Summary

### Priority 1: Critical for Multi-User Simulation
1. ✅ **WebSocket Mock**: Create `tests/mocks/websocket-mock.ts` and runtime shim
2. ✅ **Presence Scripts**: Create `tests/fixtures/persona-presence/*.json` with persona presence data
3. ✅ **Multi-Context Helpers**: Create helpers for multi-persona test setup
4. ✅ **Geolocation Helpers**: Create `tests/utils/geolocation.ts` for persona coordinates

### Priority 2: Important for Look-and-Feel Validation
1. ⏸️ **Visual Regression**: Add Playwright screenshot tests for key screens
2. ⏸️ **data-testid Attributes**: Add to critical UI elements, centralize selectors
3. ⏸️ **Viewport Matrix**: Test across mobile/tablet/desktop viewports

### Priority 3: Nice-to-Have for UX Insights
1. ⏸️ **Telemetry Capture**: Instrument tests to capture UX metrics
2. ⏸️ **Telemetry Aggregation**: Create script to summarize trends
3. ⏸️ **CI Test Splitting**: Split smoke vs. full suites

## Rollback Options

- **WebSocket Mocking**: Fall back to real backend (slower but functional)
- **Visual Regression**: Skip if flaky, focus on functional tests
- **Telemetry**: Add incrementally, not blocking
- **Multi-User**: Test personas individually if multi-context setup proves complex

## Next Steps

1. **Research Complete** ✅ - Proceed to planning phase
2. **Vector to Create Plan**: Reference this research in `docs/Plan.md`
3. **Team Review**: All agents review plan before implementation
4. **Implementation**: Start with Priority 1 (WebSocket mock + multi-user), then Priority 2 (visual regression)

---

**Last Updated**: 2025-11-11  
**Status**: ✅ Research Complete - Ready for Planning Phase

