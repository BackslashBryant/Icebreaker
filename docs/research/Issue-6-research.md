# Research: Integration Testing & Launch Preparation (Issue #6)

**Research Date**: 2025-11-10  
**Researcher**: Scout 🔎  
**Issue**: #6 - Integration Testing & Launch Preparation  
**Status**: Complete

## Research Question

What are best practices for comprehensive integration testing of a real-time proximity-based chat app (WebSocket, geolocation, ephemeral sessions), and what is required for production launch preparation?

## Constraints

- **Stack**: React frontend, Express backend, WebSocket, in-memory sessions
- **MVP Scope**: No new features, verification only
- **Target**: Production readiness
- **Performance Targets**: Chat start < 500ms, Radar updates < 1s
- **Accessibility**: WCAG AA compliance required
- **Existing Infrastructure**: Playwright E2E tests (8 test files), axe-core accessibility testing

## Sources & Findings

### 1. E2E Testing Strategies for WebSocket + Geolocation

**Source**: Existing test suite analysis (`tests/e2e/`)

**Findings**:
- Current tests cover: onboarding → radar flow, performance metrics, accessibility
- WebSocket testing uses custom events (`radar-update`) for simulation
- Performance tests measure: Radar load < 2s, WebSocket connection < 500ms, Radar updates < 1s
- Tests use mock session storage to simulate completed onboarding
- Playwright config runs sequentially (`fullyParallel: false`) to avoid port conflicts

**Gaps Identified**:
- No true WebSocket message interception (using custom events instead)
- Missing cross-browser test coverage (only Chromium configured)
- No mobile/PWA-specific tests
- Geolocation permission testing is basic (only denial case)

**Recommendation**: 
- Use Playwright's `page.route()` to intercept WebSocket connections
- Add Firefox, Safari, Edge projects to `playwright.config.ts`
- Create mobile viewport tests (iPhone, Android)
- Expand geolocation testing (grant/deny/skip scenarios)

**Rollback**: Current test approach works but is limited. Can continue with custom events if WebSocket interception proves complex.

---

### 2. Cross-Browser Testing Tools & Approaches

**Source**: Web search + Playwright documentation

**Findings**:
- Playwright supports Chrome, Firefox, Safari, Edge via `devices` API
- Cross-browser testing requires separate projects in `playwright.config.ts`
- Safari requires macOS (can't test on Windows)
- Edge uses Chromium engine (similar to Chrome but worth testing)

**Current State**:
- Only Chromium configured in `playwright.config.ts` (line 28-31)
- No Firefox, Safari, or Edge projects

**Recommendation**:
- Add Firefox project: `{ name: 'firefox', use: { ...devices['Desktop Firefox'] } }`
- Add Edge project: `{ name: 'msedge', use: { ...devices['Desktop Edge'] } }`
- Note Safari limitation: Requires macOS CI runner or manual testing
- Use GitHub Actions matrix strategy for cross-browser CI

**Rollback**: Focus on Chromium + Firefox initially (covers 90%+ of users). Safari can be manual testing or deferred.

---

### 3. Performance Testing for Real-Time Features

**Source**: Existing `tests/e2e/performance.spec.ts` + Web Vitals documentation

**Findings**:
- Current performance tests measure:
  - Radar view load < 2s ✅
  - WebSocket connection < 500ms ✅
  - Radar updates < 1s ✅
  - Signal Engine calculation < 100ms ✅
- Tests use `Date.now()` for timing (accurate but not Web Vitals aligned)
- No Core Web Vitals measurement (LCP, INP, CLS)

**Recommendation**:
- Add Lighthouse CI for Core Web Vitals (LCP, INP, CLS)
- Use Playwright's `page.metrics()` for runtime performance
- Measure chat start latency end-to-end (button click → chat ready)
- Add network throttling tests (3G, 4G) for mobile scenarios

**Rollback**: Current performance tests are sufficient for MVP. Lighthouse CI can be added post-launch.

---

### 4. Accessibility Testing Automation (WCAG AA)

**Source**: Existing `tests/e2e/radar.spec.ts` + axe-core documentation

**Findings**:
- Current tests use `@axe-core/playwright` with WCAG 2A/2AA/21AA tags ✅
- Tests cover: keyboard navigation, screen reader announcements, reduced motion
- Accessibility violations are checked but not comprehensive across all pages

**Recommendation**:
- Add accessibility tests to all E2E test files (not just radar)
- Use Playwright MCP for automated accessibility audits (if available)
- Test with actual screen readers (NVDA, VoiceOver) in manual QA
- Verify color contrast ratios meet WCAG AA (4.5:1 for normal text)

**Rollback**: Current axe-core tests are good baseline. Manual screen reader testing can supplement.

---

### 5. Mobile/PWA Testing Approaches

**Source**: Playwright mobile device emulation + PWA best practices

**Findings**:
- Playwright supports mobile device emulation via `devices['iPhone 13']`, `devices['Pixel 5']`
- PWA testing requires: service worker registration, offline mode, installability
- Geolocation behaves differently on mobile (more accurate, battery impact)

**Recommendation**:
- Add mobile projects to Playwright config:
  - `{ name: 'iPhone', use: { ...devices['iPhone 13'] } }`
  - `{ name: 'Android', use: { ...devices['Pixel 5'] } }`
- Test PWA installability (manifest.json, service worker)
- Test offline mode (service worker caching)
- Test touch interactions (tap, swipe, pinch)

**Rollback**: Desktop-first approach is acceptable for MVP. Mobile can be manual testing initially.

---

### 6. Production Launch Checklist Items

**Source**: Web search + DevOps best practices

**Findings**:

**Monitoring/Logging**:
- Need: Application performance monitoring (APM), error tracking, uptime monitoring
- Tools: Sentry (errors), Datadog/New Relic (APM), UptimeRobot (uptime)
- Log aggregation: Winston/Pino for structured logging

**Error Tracking**:
- Need: Real-time error alerts, error grouping, stack traces
- Tools: Sentry (recommended), Rollbar, Bugsnag
- Integration: Frontend error boundary + backend error middleware

**Security Audit**:
- Need: Dependency vulnerability scan, OWASP Top 10 check, secrets audit
- Tools: `npm audit`, Snyk, OWASP ZAP
- Checklist: No secrets in code, HTTPS enforced, CORS configured, rate limiting active

**CI/CD Pipeline Verification**:
- Current: GitHub Actions workflow exists (`.github/workflows/ci.yml`)
- Need: Verify all checks pass, deployment automation, rollback procedure
- Environment variables: Production secrets configured, not in code

**Documentation**:
- Need: Deployment guide, rollback procedure, monitoring runbook
- Current: `docs/ConnectionGuide.md` exists but needs production updates

**Recommendation**:
1. **Monitoring**: Set up Sentry (free tier) for error tracking
2. **Logging**: Use Winston with JSON format, send to console/log file initially
3. **Security**: Run `npm audit`, fix high/critical vulnerabilities
4. **CI/CD**: Verify GitHub Actions passes, add deployment workflow
5. **Documentation**: Update `docs/ConnectionGuide.md` with production endpoints

**Rollback**: MVP can launch with basic console logging. Monitoring can be added post-launch.

---

## Recommendations Summary

### Priority 1: Critical for Launch
1. ✅ **Cross-browser testing**: Add Firefox + Edge to Playwright config
2. ✅ **Accessibility audit**: Run axe-core on all pages, fix violations
3. ✅ **Security audit**: Run `npm audit`, fix vulnerabilities
4. ✅ **Error tracking**: Set up Sentry (free tier)
5. ✅ **CI/CD verification**: Ensure GitHub Actions passes all checks

### Priority 2: Important but Can Defer
1. ⏸️ **Mobile/PWA testing**: Add mobile device emulation (can be manual initially)
2. ⏸️ **Lighthouse CI**: Add Core Web Vitals measurement (post-launch)
3. ⏸️ **True WebSocket interception**: Improve WebSocket testing (current approach works)

### Priority 3: Nice to Have
1. ⏸️ **Load testing**: Stress test with multiple concurrent users
2. ⏸️ **Performance profiling**: Deep dive into bottlenecks
3. ⏸️ **Safari testing**: Requires macOS CI runner or manual testing

## Rollback Options

1. **If cross-browser testing blocks**: Focus on Chromium + Firefox (covers 90%+ users)
2. **If WebSocket testing fails**: Continue with custom events (current approach)
3. **If monitoring setup delays**: Launch with console logging, add monitoring post-launch
4. **If mobile testing complex**: Desktop-first launch, mobile manual QA

## Next Steps

1. **@Vector 🎯**: Create plan with checkpoints based on Priority 1 items
2. **@Pixel 🖥️**: Implement cross-browser tests (Firefox, Edge)
3. **@Pixel 🖥️**: Run accessibility audit on all pages, fix violations
4. **@Nexus 🚀**: Set up Sentry error tracking
5. **@Nexus 🚀**: Run security audit (`npm audit`), fix vulnerabilities
6. **@Nexus 🚀**: Verify CI/CD pipeline, add deployment workflow
7. **@Muse 🎨**: Update documentation with production details

## References

- Playwright Cross-Browser Testing: https://playwright.dev/docs/browsers
- axe-core Playwright: https://github.com/dequelabs/axe-core-npm/tree/develop/packages/playwright
- Sentry Error Tracking: https://sentry.io/
- OWASP Top 10: https://owasp.org/www-project-top-ten/
- Existing E2E Tests: `tests/e2e/` (8 test files)
- Playwright Config: `tests/playwright.config.ts`
- Connection Guide: `docs/ConnectionGuide.md`

---

**Research Status**: ✅ Complete  
**Ready for Planning**: Yes  
**Confidence Level**: High (existing tests provide good foundation, gaps are clear)
