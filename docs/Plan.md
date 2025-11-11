# Plan

_Active feature: **Persona-Based Testing & Polish** (Issue #10) 📋 **PLANNING**  
_Previous feature: **Integration Testing & Launch Preparation** (Issue #6) ✅ **COMPLETE**  
_Previous feature: **UX Review Fixes + Bootup Random Messages** (Issue #9) ✅ **COMPLETE**_

**Git Status**: All feature branches pushed to GitHub:
- ✅ `origin/agent/link/7-profile-settings` (Issue #19 - Profile/Settings, retroactively created)
- ✅ `origin/feat/3-chat` (Issue #3)
- ✅ `origin/feat/5-panic-button` (Issue #5)
- ✅ `origin/feat/6-block-report` (Issue #6)
- ✅ `origin/agent/vector/2-radar-view` (Issue #2)
- ✅ `origin/agent/forge/3-chat` (Issue #2 duplicate)

## Goals
- GitHub Issue: #6 (Integration Testing & Launch Preparation)
- Target: Production readiness for MVP launch
- Problem: MVP features complete but need comprehensive integration testing, cross-browser verification, security audit, error tracking, and CI/CD verification before launch.
- Desired Outcome: 
  - Cross-browser compatibility verified (Chrome, Firefox, Edge)
  - Accessibility compliance verified (WCAG AA)
  - Security vulnerabilities fixed
  - Error tracking operational (Sentry)
  - CI/CD pipeline verified and deployment-ready
- Success Metrics:
  - E2E tests pass on Chrome, Firefox, Edge
  - All pages pass axe-core accessibility audit (WCAG AA)
  - `npm audit` shows no high/critical vulnerabilities
  - Sentry error tracking configured and tested
  - GitHub Actions CI passes all checks
  - Deployment workflow ready
- Research Status: ✅ **COMPLETE** - Research file: `docs/research/Issue-6-research.md`

## Out-of-scope
- Mobile/PWA testing (deferred to manual QA for MVP)
- Lighthouse CI (can be added post-launch)
- Load/stress testing (deferred to post-launch)
- Safari testing (requires macOS CI runner, deferred)

## Steps (6)

### Step 1: Cross-Browser Testing Setup
**Owner**: @Pixel 🖥️  
**Intent**: Add Firefox and Edge browser projects to Playwright config for cross-browser E2E testing

**File Targets**:
- `tests/playwright.config.ts` (update - add Firefox and Edge projects)
- `.github/workflows/ci.yml` (update - add cross-browser matrix strategy)

**Required Tools**:
- Playwright
- GitHub Actions

**Acceptance Tests**:
- [ ] Firefox project added to `playwright.config.ts`
- [ ] Edge project added to `playwright.config.ts`
- [ ] E2E tests run successfully on Chromium (existing)
- [ ] E2E tests run successfully on Firefox
- [ ] E2E tests run successfully on Edge
- [ ] GitHub Actions CI runs tests on all browsers
- [ ] No test failures specific to Firefox/Edge (browser compatibility verified)

**Done Criteria**:
- Cross-browser testing configured (Chrome, Firefox, Edge)
- All E2E tests pass on all browsers
- CI runs cross-browser tests automatically

**Rollback**: If Firefox/Edge tests fail due to browser-specific issues, focus on Chromium + Firefox initially (covers 90%+ users)

---

### Step 2: Accessibility Audit & Fixes
**Owner**: @Pixel 🖥️  
**Intent**: Run comprehensive accessibility audit on all pages using axe-core, fix WCAG AA violations

**File Targets**:
- `tests/e2e/welcome.spec.ts` (update or create - add accessibility test)
- `tests/e2e/onboarding.spec.ts` (update - add accessibility test)
- `tests/e2e/radar.spec.ts` (update - verify accessibility test exists)
- `tests/e2e/block-report.spec.ts` (update - add accessibility test)
- `tests/e2e/profile.spec.ts` (update - add accessibility test)
- `tests/e2e/cooldown.spec.ts` (update - add accessibility test)
- Frontend components (fix violations found)

**Required Tools**:
- `@axe-core/playwright`
- Playwright
- React Testing Library

**Acceptance Tests**:
- [ ] Accessibility test added to all E2E test files
- [ ] Welcome page passes axe-core audit (WCAG AA)
- [ ] Onboarding flow passes axe-core audit (WCAG AA)
- [ ] Radar page passes axe-core audit (WCAG AA)
- [ ] All other pages pass axe-core audit (WCAG AA)
- [ ] Color contrast ratios meet WCAG AA (4.5:1 for normal text)
- [ ] Keyboard navigation works on all pages
- [ ] Screen reader labels present and correct
- [ ] No accessibility violations in test output

**Done Criteria**:
- All pages pass axe-core accessibility audit (WCAG AA)
- Zero accessibility violations
- Keyboard navigation verified
- Screen reader compatibility verified

**Rollback**: If violations are too complex to fix, document them and prioritize critical ones (keyboard nav, screen reader)

---

### Step 3: Security Audit & Vulnerability Fixes
**Owner**: @Nexus 🚀  
**Intent**: Run `npm audit` on frontend and backend, fix high/critical vulnerabilities, verify security best practices

**File Targets**:
- `frontend/package.json` (update dependencies if needed)
- `backend/package.json` (update dependencies if needed)
- `package.json` (root - update dependencies if needed)
- `.env.example` (verify no secrets)
- Code review for security issues (secrets, CORS, rate limiting)

**Required Tools**:
- `npm audit`
- Security best practices checklist

**Acceptance Tests**:
- [ ] `npm audit` run on root, frontend, backend
- [ ] No high/critical vulnerabilities (moderate/low acceptable)
- [ ] Dependencies updated if vulnerabilities found
- [ ] No secrets in code (verify `.env` not committed)
- [ ] CORS configured correctly (verify `docs/ConnectionGuide.md`)
- [ ] Rate limiting active (verify backend rate limiter)
- [ ] HTTPS enforced in production config
- [ ] Security audit report documented

**Done Criteria**:
- Zero high/critical vulnerabilities
- Security best practices verified
- Dependencies updated if needed
- Security audit documented

**Rollback**: If dependency updates break functionality, document risk and defer non-critical updates

---

### Step 4: Error Tracking Setup (Sentry)
**Owner**: @Nexus 🚀  
**Intent**: Set up Sentry error tracking for frontend and backend, configure error boundaries and middleware

**File Targets**:
- `frontend/src/lib/sentry.ts` (new - Sentry initialization)
- `frontend/src/components/ErrorBoundary.tsx` (new or update - integrate Sentry)
- `backend/src/middleware/error-handler.js` (update - add Sentry integration)
- `.env.example` (add `SENTRY_DSN` variables)
- `docs/ConnectionGuide.md` (update - document Sentry setup)

**Required Tools**:
- Sentry (free tier)
- `@sentry/react` (frontend)
- `@sentry/node` (backend)

**Acceptance Tests**:
- [ ] Sentry account created (free tier)
- [ ] Frontend Sentry DSN configured
- [ ] Backend Sentry DSN configured
- [ ] Error boundary catches React errors
- [ ] Backend error middleware sends errors to Sentry
- [ ] Test error triggers Sentry notification (verify in Sentry dashboard)
- [ ] Error tracking tested (intentional error, verify in Sentry)
- [ ] Environment variables documented in `.env.example`
- [ ] Connection Guide updated with Sentry details

**Done Criteria**:
- Sentry configured for frontend and backend
- Error tracking operational
- Test errors appear in Sentry dashboard
- Documentation updated

**Rollback**: If Sentry setup delays launch, use console logging initially, add Sentry post-launch

---

### Step 5: CI/CD Pipeline Verification & Deployment Workflow
**Owner**: @Nexus 🚀  
**Intent**: Verify GitHub Actions CI passes all checks, add deployment workflow, document rollback procedure

**File Targets**:
- `.github/workflows/ci.yml` (verify - ensure all checks pass)
- `.github/workflows/deploy.yml` (new - deployment workflow)
- `docs/deployment.md` (new - deployment guide and rollback procedure)
- `docs/ConnectionGuide.md` (update - production endpoints)

**Required Tools**:
- GitHub Actions
- Deployment platform (TBD - Vercel, Netlify, Railway, etc.)

**Acceptance Tests**:
- [ ] GitHub Actions CI runs successfully
- [ ] All CI checks pass (lint, typecheck, tests)
- [ ] Cross-browser tests run in CI
- [ ] Deployment workflow created (or documented manual process)
- [ ] Production environment variables configured
- [ ] Rollback procedure documented
- [ ] Deployment guide created
- [ ] Connection Guide updated with production endpoints

**Done Criteria**:
- CI pipeline verified and passing
- Deployment workflow ready (or manual process documented)
- Rollback procedure documented
- Production configuration documented

**Rollback**: If deployment automation is complex, document manual deployment process for MVP launch

---

### Step 6: Documentation & Launch Readiness
**Owner**: @Muse 🎨  
**Intent**: Update documentation with integration testing results, launch checklist, production details

**File Targets**:
- `README.md` (update - testing, deployment, monitoring sections)
- `CHANGELOG.md` (add integration testing and launch prep entry)
- `docs/deployment.md` (update - finalize deployment guide)
- `docs/ConnectionGuide.md` (verify - production endpoints documented)
- `.notes/launch-checklist.md` (new - launch readiness checklist)

**Required Tools**:
- Markdown
- Documentation best practices

**Acceptance Tests**:
- [ ] README updated with testing approach, deployment steps, monitoring info
- [ ] CHANGELOG entry added (integration testing + launch prep)
- [ ] Deployment guide complete and accurate
- [ ] Connection Guide has production endpoints
- [ ] Launch checklist created and verified
- [ ] All documentation reviewed for accuracy

**Done Criteria**:
- Documentation complete and accurate
- Launch checklist verified
- Production details documented
- Ready for launch

---

## File targets

### Testing (Pixel)
- `tests/playwright.config.ts` (cross-browser projects)
- `.github/workflows/ci.yml` (cross-browser matrix)
- `tests/e2e/welcome.spec.ts` (accessibility test)
- `tests/e2e/onboarding.spec.ts` (accessibility test)
- `tests/e2e/radar.spec.ts` (accessibility test)
- `tests/e2e/block-report.spec.ts` (accessibility test)
- `tests/e2e/profile.spec.ts` (accessibility test)
- `tests/e2e/cooldown.spec.ts` (accessibility test)
- Frontend components (accessibility fixes)

### Security & DevOps (Nexus)
- `frontend/package.json` (dependency updates)
- `backend/package.json` (dependency updates)
- `package.json` (root dependency updates)
- `.env.example` (Sentry variables)
- `frontend/src/lib/sentry.ts` (new - Sentry init)
- `frontend/src/components/ErrorBoundary.tsx` (Sentry integration)
- `backend/src/middleware/error-handler.js` (Sentry integration)
- `.github/workflows/deploy.yml` (new - deployment workflow)
- `docs/deployment.md` (new - deployment guide)

### Documentation (Muse)
- `README.md` (testing, deployment, monitoring)
- `CHANGELOG.md` (integration testing entry)
- `docs/deployment.md` (deployment guide)
- `docs/ConnectionGuide.md` (production endpoints, Sentry)
- `.notes/launch-checklist.md` (new - launch checklist)

## Acceptance tests

### Step 1: Cross-Browser Testing
- [ ] Firefox and Edge projects added to Playwright config
- [ ] E2E tests pass on Chrome, Firefox, Edge
- [ ] CI runs cross-browser tests automatically

### Step 2: Accessibility Audit
- [ ] All pages pass axe-core audit (WCAG AA)
- [ ] Zero accessibility violations
- [ ] Keyboard navigation verified
- [ ] Screen reader compatibility verified

### Step 3: Security Audit
- [ ] Zero high/critical vulnerabilities
- [ ] Security best practices verified
- [ ] Dependencies updated if needed

### Step 4: Error Tracking
- [ ] Sentry configured for frontend and backend
- [ ] Error tracking operational
- [ ] Test errors appear in Sentry dashboard

### Step 5: CI/CD Verification
- [ ] CI pipeline verified and passing
- [ ] Deployment workflow ready (or documented)
- [ ] Rollback procedure documented

### Step 6: Documentation
- [ ] Documentation complete and accurate
- [ ] Launch checklist verified
- [ ] Ready for launch

## Owners
- Vector 🎯 (planning, coordination)
- Pixel 🖥️ (cross-browser testing, accessibility audit)
- Nexus 🚀 (security audit, error tracking, CI/CD, deployment)
- Muse 🎨 (documentation, launch checklist)
- Scout 🔎 (research complete - `docs/research/Issue-6-research.md`)

## Implementation Notes
- **Status**: Planning phase - Ready for team review
- **Approach**: Verification and preparation (no new features)
- **Testing**: Cross-browser E2E, accessibility audit, security audit
- **Dependencies**: Sentry (free tier), Playwright browsers
- **Enables**: Production launch readiness, cross-browser compatibility, error tracking

## Risks & Open questions

### Risks
- **Cross-Browser Compatibility**: Firefox/Edge may have browser-specific issues requiring fixes
- **Security Vulnerabilities**: Dependency updates may break functionality
- **Sentry Setup**: May require manual account creation and configuration
- **Deployment Platform**: Need to choose deployment platform (Vercel, Netlify, Railway, etc.)

### Open Questions
- **Deployment Platform**: Which platform for production? (Recommendation: Choose based on cost, ease of setup, Node.js support)
- **Sentry Account**: Who creates Sentry account? (Recommendation: Nexus creates, shares DSN)
- **Mobile Testing**: Defer to manual QA or add automated tests? (Recommendation: Manual QA for MVP, automated post-launch)

## MCP Tools Required
- **GitHub MCP**: Issue tracking, branch creation, CI verification
- **Playwright MCP** (optional): Accessibility checks, screenshots

## Handoffs
- **After Step 1**: Pixel hands off cross-browser setup to Pixel for Step 2 (accessibility)
- **After Step 2**: Pixel hands off accessibility results to Nexus for Step 3 (security)
- **After Step 3**: Nexus hands off security audit to Nexus for Step 4 (error tracking)
- **After Step 4**: Nexus hands off error tracking to Nexus for Step 5 (CI/CD)
- **After Step 5**: Nexus hands off CI/CD to Muse for Step 6 (documentation)
- **After Step 6**: Issue #6 complete - ready for launch

---

**Plan Status**: ✅ **APPROVED** - Team review complete, ready for implementation

**Summary**:
- Issue #6: Integration Testing & Launch Preparation
- Plan: 6 steps
- Research: ✅ Complete (`docs/research/Issue-6-research.md`)
- Team Review: ✅ Approved (`.notes/features/integration-testing-launch-prep/team-review-approved.md`)
- Implementation: Ready to begin Step 1

**Team Involvement**:
- ✅ Scout 🔎: Research complete
- ✅ Vector 🎯: Plan created
- ✅ **Team Review**: ✅ Approved
- ⏸️ Pixel 🖥️: Steps 1-2 (cross-browser, accessibility) - Ready to begin
- ⏸️ Nexus 🚀: Steps 3-5 (security, error tracking, CI/CD)
- ⏸️ Muse 🎨: Step 6 (documentation)

---

## Next Logical Steps (Post-MVP)

**MVP Status**: ✅ **ALL 14 FEATURES COMPLETE** (per `.notes/mvp-feature-inventory-review.md`)

### Priority 1: Integration Testing & Verification
**Owner**: @Pixel 🖥️ + @Nexus 🚀  
**Intent**: Verify end-to-end flows, cross-browser compatibility, and performance targets

**Scope**:
- End-to-end flow testing (onboarding → Radar → Chat → Panic)
- Cross-browser testing (Chrome, Firefox, Safari, Edge)
- Mobile/PWA testing
- Performance verification (< 500ms chat start, < 1s Radar updates)
- Accessibility audit (WCAG AA compliance)

**Acceptance Tests**:
- [ ] E2E tests cover critical user flows
- [ ] Performance targets met (chat start < 500ms, Radar < 1s)
- [ ] WCAG AA compliance verified
- [ ] Cross-browser compatibility confirmed
- [ ] Mobile/PWA functionality verified

**Files/Artifacts**:
- `tests/e2e/` - E2E test suite
- Performance test results
- Accessibility audit report
- Cross-browser test results

---

### Priority 2: Launch Preparation
**Owner**: @Nexus 🚀 + @Muse 🎨  
**Intent**: Prepare for production deployment

**Scope**:
- Production environment setup
- CI/CD pipeline verification
- Monitoring/logging setup
- Error tracking setup
- Documentation finalization
- Security audit

**Acceptance Tests**:
- [ ] Production environment configured
- [ ] CI/CD pipeline verified
- [ ] Monitoring/logging operational
- [ ] Error tracking configured
- [ ] Documentation complete
- [ ] Security audit passed

**Files/Artifacts**:
- Production deployment configs
- CI/CD workflow files
- Monitoring setup docs
- Security audit report
- Deployment guide

---

### Priority 3: Post-MVP Features (Future)
**Owner**: TBD  
**Intent**: Plan future enhancements based on user feedback

**Scope** (from vision.md):
- OAuth integrations (Spotify/Reddit/X)
- Personality/archetype mode
- Appeals flow
- Optional verification
- Client-side encryption
- Silent queue

**Status**: ⏸️ **DEFERRED** - Awaiting user feedback and prioritization

---

## Issue #10: Persona-Based Testing & Polish

**Status**: ✅ **COMPLETE** - All tests passing, UX improvements implemented, documentation complete  
**Test Results**: See `docs/testing/persona-test-results.md`  
**Edge Cases**: See `docs/testing/edge-cases.md`  
**UX Review**: See `docs/testing/ux-review-issue-10.md`  
**Summary**: See `docs/testing/persona-testing-summary.md`  
**Research Status**: ✅ **COMPLETE** - Research file: `docs/research/Issue-10-research.md`  
**Team Review**: ✅ **APPROVED** - Approval file: `.notes/features/persona-testing-polish/team-review-approved.md`

### Test Execution Status

- ✅ **Step 1**: Persona Journey Maps - COMPLETE
- ✅ **Step 2**: Persona Test Scenarios - COMPLETE  
- ✅ **Step 3**: Persona Questionnaire - COMPLETE
- ✅ **Step 4**: Test Execution - COMPLETE (64/64 tests passing)
- ✅ **Step 5**: UX Refinement & Polish - COMPLETE
- ✅ **Step 6**: Edge Case Resolution - COMPLETE
- ✅ **Step 7**: Documentation & Summary - COMPLETE

### Test Results Summary

- **Total Tests**: 64 persona tests (Chromium)
- **Passing**: 64 ✅
- **Failing**: 0 ❌
- **Duration**: ~3-4 minutes
- **Issues Resolved**: 6 major issues fixed (server startup, session storage, selectors, navigation, timeouts, accessibility)
- **UX Improvements**: 5 accessibility enhancements, 4 copy refinements, keyboard navigation improved
- **Edge Cases**: All 8 edge cases resolved

### Goals
- **GitHub Issue**: #10 (to be created)
- **Target**: Comprehensive persona-based testing and app polish using 10 user personas
- **Problem**: MVP features are complete but need real-world user scenario testing and refinement based on actual user personas to ensure the app meets target demo needs.
- **Desired Outcome**: 
  - All 10 personas tested through complete user journeys
  - UX refinements identified and prioritized
  - Edge cases discovered and fixed
  - User flow optimizations implemented
  - App polished to match persona expectations
- **Success Metrics**:
  - All 10 personas complete onboarding flow successfully
  - Each persona's primary use case tested and verified
  - UX improvements documented and prioritized
  - Edge cases identified and resolved
  - User flow friction points eliminated
- **Personas Reference**: `docs/personas/` (10 personas: 5 core test + 5 market research)

### Out-of-scope
- New feature development (focus on polish and refinement)
- Performance optimization (separate issue)
- Security audit (covered in Issue #6)
- Cross-browser testing (covered in Issue #6)

### Steps (7)

#### Step 1: Persona Journey Mapping
**Owner**: @Vector 🎯 + @Pixel 🖥️  
**Intent**: Map complete user journeys for each persona, identifying key touchpoints and expected behaviors

**File Targets**:
- `docs/personas/journeys.md` (create - persona journey maps)
- `docs/testing/persona-scenarios.md` (create - test scenarios per persona)

**Required Tools**:
- Persona files (`docs/personas/*.md`)
- Vision document (`docs/vision.md`)

**Acceptance Tests**:
- [x] Journey map created for all 10 personas
- [x] Each journey includes: onboarding → vibe/tags selection → radar discovery → chat interaction → exit
- [x] Key touchpoints identified for each persona
- [x] Expected behaviors documented per persona
- [x] Test scenarios created for each persona's primary use case

**Done Criteria**:
- Complete journey maps for all personas
- Test scenarios documented
- Expected behaviors defined

**Rollback**: N/A (documentation only)

---

#### Step 2: Core Persona Testing (College Students)
**Owner**: @Pixel 🖥️  
**Intent**: Test app with core college student personas (Maya, Ethan, Zoe) to verify anxious student use cases

**File Targets**:
- `tests/e2e/personas/college-students.spec.ts` (create - persona-based E2E tests)
- Test results documentation

**Required Tools**:
- Playwright
- Persona profiles (`docs/personas/maya-patel.md`, `ethan-chen.md`, `zoe-kim.md`)

**Acceptance Tests**:
- [x] Maya Patel (19, anxious first-year) completes onboarding with "thinking" vibe + tags
- [x] Ethan Chen (20, socially anxious) completes onboarding with "intros" vibe + tech tags
- [x] Zoe Kim (21, overthinker) completes onboarding with "surprise" vibe + overthinking tags
- [x] All three appear on each other's Radar (proximity matching)
- [x] Shared tags boost signal scores (Maya + Zoe share "Overthinking Things")
- [x] Visibility toggling works as expected for anxious users
- [x] Ephemeral chat endings feel clean and reduce anxiety
- [x] Panic button accessible and functional for all personas

**Done Criteria**:
- All core student personas tested successfully
- Edge cases documented
- UX friction points identified

**Rollback**: Document issues and create follow-up tasks

---

#### Step 3: Professional Persona Testing (Remote Workers & Creatives)
**Owner**: @Pixel 🖥️  
**Intent**: Test app with professional personas (Marcus, Casey) to verify coworking/event use cases

**File Targets**:
- `tests/e2e/personas/professionals.spec.ts` (create - professional persona tests)
- Test results documentation

**Required Tools**:
- Playwright
- Persona profiles (`docs/personas/marcus-thompson.md`, `casey-rivera.md`)

**Acceptance Tests**:
- [x] Marcus Thompson (29, remote worker) completes onboarding with "intros" vibe + builder tags
- [x] Casey Rivera (34, creative) completes onboarding with "banter" vibe + creative tags
- [x] Both appear on Radar in coworking/event scenarios
- [x] One-chat-at-a-time enforcement works (professional boundaries)
- [x] Proximity matching works for different floors/buildings
- [x] Signal scoring prioritizes shared tags ("Tech curious" for Marcus + Ethan)
- [x] Ephemeral chats feel appropriate for professional contexts

**Done Criteria**:
- Professional personas tested successfully
- Professional use cases verified
- Boundary enforcement confirmed

**Rollback**: Document issues and create follow-up tasks

---

#### Step 4: Market Research Persona Testing (Diverse Use Cases)
**Owner**: @Pixel 🖥️  
**Intent**: Test app with market research personas (River, Alex, Jordan, Sam, Morgan) to verify diverse use cases

**File Targets**:
- `tests/e2e/personas/market-research.spec.ts` (create - market research persona tests)
- Test results documentation

**Required Tools**:
- Playwright
- Persona profiles (`docs/personas/river-martinez.md`, `alex-kim.md`, `jordan-park.md`, `sam-taylor.md`, `morgan-davis.md`)

**Acceptance Tests**:
- [x] River Martinez (26, urban resident) tests neighborhood proximity matching
- [x] Alex Kim (27, tech conference) tests event/conference networking
- [x] Jordan Park (38, privacy-focused) tests privacy features and visibility toggling
- [x] Sam Taylor (24, outgoing introvert) tests event socializing without drain
- [x] Morgan Davis (28, grad student) tests academic conference connections
- [x] Each persona's unique use case verified
- [x] Edge cases discovered and documented

**Done Criteria**:
- All market research personas tested
- Diverse use cases verified
- Edge cases documented

**Rollback**: Document issues and create follow-up tasks

---

#### Step 5: UX Refinement & Polish
**Owner**: @Link 🌐 + @Pixel 🖥️  
**Intent**: Implement UX improvements identified during persona testing

**File Targets**:
- Frontend components (refine based on testing feedback)
- `docs/testing/persona-feedback.md` (create - UX improvements log)

**Required Tools**:
- Test results from Steps 2-4
- Vision document for brand alignment

**Acceptance Tests**:
- [x] UX friction points from persona testing addressed
- [x] Onboarding flow optimized for anxious users
- [x] Radar discovery refined for different use cases
- [x] Chat interface polished for ephemeral feel
- [x] Visibility controls refined for privacy-conscious users
- [x] Brand vibe maintained throughout ("terminal meets Game Boy")
- [x] Accessibility preserved (WCAG AA)

**Done Criteria**:
- [x] UX improvements implemented
- [x] Persona feedback addressed
- [x] Brand consistency maintained

**Status**: ✅ **COMPLETE**

---

#### Step 6: Edge Case Resolution
**Owner**: @Forge 🔗 + @Link 🌐  
**Intent**: Fix edge cases and bugs discovered during persona testing

**File Targets**:
- Backend handlers (fix edge cases)
- Frontend components (fix UI edge cases)
- `docs/testing/edge-cases.md` (create - edge case log)

**Required Tools**:
- Test results from Steps 2-4
- Backend/frontend codebases

**Acceptance Tests**:
- [x] Edge cases from persona testing fixed
- [x] Signal scoring edge cases resolved
- [x] Proximity matching edge cases fixed
- [x] Chat ephemerality edge cases resolved
- [x] Visibility toggle edge cases fixed
- [x] All persona test scenarios pass

**Done Criteria**:
- [x] Edge cases resolved
- [x] All persona tests passing
- [x] Bug fixes verified

**Status**: ✅ **COMPLETE**

---

#### Step 7: Persona Testing Documentation & Summary
**Owner**: @Muse 🎨  
**Intent**: Document persona testing results, insights, and recommendations

**File Targets**:
- `docs/testing/persona-results.md` (create - comprehensive test results)
- `docs/personas/insights.md` (create - persona insights and recommendations)
- Update `docs/testing/README.md` with persona testing section

**Required Tools**:
- Test results from Steps 2-4
- UX feedback from Step 5
- Edge case logs from Step 6

**Acceptance Tests**:
- [x] Persona testing results documented
- [x] UX insights summarized
- [x] Edge cases catalogued
- [x] Recommendations for future improvements
- [x] Testing documentation updated

**Done Criteria**:
- [x] Complete documentation of persona testing
- [x] Insights and recommendations captured
- [x] Future improvements identified

**Status**: ✅ **COMPLETE**

---

## Issue #18: Persona-Simulated User Testing with Look-and-Feel Validation

**Status**: 📋 **PLANNING** - Awaiting team review  
**Research Status**: ✅ **COMPLETE** - Research file: `docs/research/Issue-11-research.md`  
**Team Review**: ✅ **APPROVED** - Approval file: `.notes/features/persona-sim-testing/team-review-approved.md`

**Team review complete - approved for implementation.**

### Goals
- **GitHub Issue**: #18
- **Target**: Transform existing E2E persona tests into realistic, simulated multi-user testing with look-and-feel validation
- **Problem**: Current tests require real backend, can't simulate multi-user scenarios, lack visual regression, and don't capture UX telemetry
- **Desired Outcome**: 
  - Deterministic multi-user simulation without live backend
  - Visual regression testing for key screens across viewports
  - UX telemetry capture and automatic feedback summaries
  - Stable selectors via data-testid to reduce flakiness
  - Geolocation realism per persona and scenario
- **Success Metrics**:
  - WebSocket mock enables multi-user tests without backend
  - Visual snapshots captured for all key screens (Welcome, Onboarding, Radar, Chat, Panic)
  - Telemetry captured per persona run and aggregated
  - All critical UI elements have data-testid attributes
  - Multi-user scenarios test mutual visibility, signal scoring, chat blocking
  - Tests run faster and more reliably

### Out-of-scope
- Real backend integration (mocked for deterministic testing)
- Mobile device testing (emulation only)
- Performance profiling (basic telemetry only)
- Cross-browser visual regression (Chromium first, expand later)

### Steps (7)

#### Step 1: WebSocket Mock Infrastructure
**Owner**: @Forge 🔗 + @Pixel 🖥️  
**Intent**: Create WebSocket mock and runtime shim to enable multi-user simulation without real backend

**File Targets**:
- `tests/mocks/websocket-mock.ts` (create - WebSocket mock class)
- `frontend/src/lib/websocket-client.ts` (update - add mock shim)
- `tests/e2e/fixtures/ws-mock.setup.ts` (create - Playwright fixture)
- `tests/fixtures/persona-presence/campus-library.json` (create - example presence script)
- `tests/fixtures/persona-presence/schema.d.ts` (create - TypeScript types)

**Required Tools**:
- Playwright
- TypeScript
- Existing WebSocket message types

**Acceptance Tests**:
- [ ] `WsMock` class implements WebSocket-like interface
- [ ] Mock handles `connect`, `disconnect`, `setVisibility`, `updateGeo` methods
- [ ] Mock broadcasts presence updates to all connected sessions
- [ ] Runtime shim checks `PLAYWRIGHT_WS_MOCK=1` environment variable
- [ ] When mock enabled, app uses mock instead of real WebSocket
- [ ] Presence script JSON validates against schema
- [ ] Playwright fixture injects mock before app loads

**Done Criteria**:
- WebSocket mock class created and tested
- Runtime shim integrated into frontend
- Playwright fixture sets up mock correctly
- At least one presence script created (campus-library scenario)
- Mock can simulate multiple personas simultaneously

**Rollback**: Remove shim code, fall back to real backend (tests will be slower but functional)

---

#### Step 2: Geolocation Helpers & Location Fixtures
**Owner**: @Pixel 🖥️  
**Intent**: Create geolocation helpers and location fixtures for realistic proximity testing

**File Targets**:
- `tests/utils/geolocation.ts` (create - geolocation helper functions)
- `tests/fixtures/locations.json` (create - venue coordinates)
- `tests/e2e/personas/college-students.spec.ts` (update - use geolocation helpers)

**Required Tools**:
- Playwright geolocation API
- Existing persona scenarios

**Acceptance Tests**:
- [ ] `setPersonaGeo(context, geo)` helper grants permission and sets coordinates
- [ ] `locations.json` contains coordinates for all venues (campus-library, coworking-downtown, gallery-opening)
- [ ] Helper supports floor numbers for multi-floor buildings
- [ ] Permission denial flow tested
- [ ] Boundary testing helpers work (just inside/outside radius)

**Done Criteria**:
- Geolocation helper functions created
- Location fixtures include all persona venues
- At least one persona test uses geolocation helpers
- Permission flows tested

**Rollback**: Use fixed coordinates per test if fixtures prove complex

---

#### Step 3: Multi-User Test Scenarios
**Owner**: @Pixel 🖥️  
**Intent**: Create multi-user test scenarios that validate mutual visibility, signal scoring, and chat blocking

**File Targets**:
- `tests/utils/multi-persona.ts` (create - multi-user test helpers)
- `tests/e2e/personas/multi-user.spec.ts` (create - multi-user scenarios)
- `tests/fixtures/persona-presence/coworking-downtown.json` (create - Marcus + Ethan scenario)
- `tests/fixtures/persona-presence/gallery-opening.json` (create - Casey + Alex scenario)

**Required Tools**:
- WebSocket mock (Step 1)
- Geolocation helpers (Step 2)
- Playwright multi-context API

**Acceptance Tests**:
- [ ] Maya + Zoe appear on each other's Radar (shared tag compatibility)
- [ ] Shared tags boost signal scores (Maya + Zoe both have "Overthinking Things")
- [ ] Visibility toggle hides one persona from the other in real time
- [ ] One-chat-at-a-time enforcement blocks second chat start
- [ ] Reconnect/disconnect scenarios work (transient WS drop and recovery)
- [ ] Stale presence cleanup works correctly

**Done Criteria**:
- Multi-user test helpers created
- At least 3 multi-user scenarios tested (Maya+Zoe, Ethan+Marcus, Casey+Alex)
- Mutual visibility verified
- Signal scoring verified
- Chat blocking verified

**Rollback**: Test personas individually if multi-user setup proves complex

---

#### Step 4: data-testid Attributes & Selector Centralization
**Owner**: @Link 🌐 + @Pixel 🖥️  
**Intent**: Add data-testid attributes to critical UI elements and centralize selectors

**File Targets**:
- `frontend/src/pages/Welcome.tsx` (update - add data-testid)
- `frontend/src/pages/Onboarding.tsx` (update - add data-testid)
- `frontend/src/pages/Radar.tsx` (update - add data-testid)
- `frontend/src/pages/Chat.tsx` (update - add data-testid)
- `frontend/src/components/PanicButton.tsx` (update - add data-testid)
- `tests/utils/selectors.ts` (create - centralized selector map)
- `tests/e2e/personas/college-students.spec.ts` (update - use centralized selectors)

**Required Tools**:
- React components
- Playwright selectors

**Acceptance Tests**:
- [ ] Welcome CTA has `data-testid="cta-press-start"`
- [ ] All onboarding steps have `data-testid="onboarding-step-{n}"`
- [ ] All vibe options have `data-testid="vibe-{name}"`
- [ ] All tag chips have `data-testid="tag-{name}"`
- [ ] Panic button has `data-testid="panic-fab"`
- [ ] Visibility toggle has `data-testid="visibility-toggle"`
- [ ] Chat controls have `data-testid="chat-{action}"`
- [ ] Centralized selector map exports `SEL` object
- [ ] At least one test file uses centralized selectors

**Done Criteria**:
- All critical UI elements have data-testid attributes
- Centralized selector map created
- At least one test file updated to use centralized selectors
- Selector naming convention documented

**Rollback**: Keep text-based selectors if adding data-testid proves disruptive

---

#### Step 5: Visual Regression Testing
**Owner**: @Pixel 🖥️  
**Intent**: Add Playwright screenshot tests for key screens across viewports

**File Targets**:
- `tests/e2e/visual/welcome.spec.ts` (create - Welcome screen visual tests)
- `tests/e2e/visual/onboarding.spec.ts` (create - Onboarding steps visual tests)
- `tests/e2e/visual/radar.spec.ts` (create - Radar visual tests)
- `tests/e2e/visual/chat.spec.ts` (create - Chat visual tests)
- `tests/utils/viewports.ts` (create - viewport matrix helper)

**Required Tools**:
- Playwright screenshot API
- Existing persona test setup

**Acceptance Tests**:
- [ ] Welcome screen captured for mobile (375x812), tablet (768x1024), desktop (1440x900)
- [ ] Each onboarding step captured across viewports
- [ ] Radar empty state captured
- [ ] Radar with users captured (multiple personas visible)
- [ ] Chat active state captured
- [ ] Chat ending state captured
- [ ] Panic prompt captured
- [ ] Screenshots stored in `artifacts/visual/<persona>/<screen>-<viewport>.png`
- [ ] Dynamic content masked (handles, timestamps)

**Done Criteria**:
- Visual tests created for Welcome, Onboarding, Radar, Chat, Panic
- Viewport matrix helper created
- Screenshots captured for all key screens
- Dynamic content masked appropriately
- Baseline screenshots stored

**Rollback**: Skip visual regression if flaky, focus on functional tests

---

#### Step 6: UX Telemetry Capture & Aggregation
**Owner**: @Pixel 🖥️  
**Intent**: Instrument tests to capture UX metrics and create aggregation script

**File Targets**:
- `tests/utils/telemetry.ts` (create - telemetry capture functions)
- `tests/utils/test-helpers.ts` (update - instrument with telemetry)
- `tools/summarize-persona-runs.mjs` (create - aggregation script)
- `docs/testing/persona-feedback.md` (create - auto-generated feedback)

**Required Tools**:
- Playwright performance API
- Node.js file system APIs

**Acceptance Tests**:
- [ ] Time-to-boot captured (Welcome screen load)
- [ ] Time-to-complete-onboarding captured (all steps)
- [ ] Steps retried captured (back button usage)
- [ ] Error banners encountered captured
- [ ] UI focus order correctness captured
- [ ] Visible affordances captured (panic button, visibility toggle)
- [ ] Per-run JSON written to `artifacts/persona-runs/<persona>-<timestamp>.json`
- [ ] Aggregation script summarizes trends
- [ ] Top 5 friction patterns identified

**Done Criteria**:
- Telemetry capture functions created
- Test helpers instrumented with telemetry
- Aggregation script created
- At least one persona run captures telemetry
- Feedback summary generated

**Rollback**: Skip telemetry initially, add incrementally

---

#### Step 7: CI Integration & Test Splitting
**Owner**: @Nexus 🚀 + @Pixel 🖥️  
**Intent**: Split smoke vs. full test suites and integrate into CI

**File Targets**:
- `tests/playwright.config.smoke.ts` (create - smoke test config)
- `.github/workflows/ci.yml` (update - add smoke/full split)
- `tests/e2e/personas/college-students.spec.ts` (update - tag smoke tests)

**Required Tools**:
- Playwright config
- GitHub Actions

**Acceptance Tests**:
- [ ] Smoke suite runs 1 test per persona group
- [ ] Smoke suite includes visual tests for Welcome + Radar
- [ ] Full suite runs all personas + WS-mock + visual matrix + a11y
- [ ] Smoke runs on every push (fast feedback)
- [ ] Full runs nightly or on demand
- [ ] HTML report published
- [ ] Screenshots/videos published
- [ ] Telemetry summary published

**Done Criteria**:
- Smoke test config created
- CI workflow updated with smoke/full split
- Smoke tests tagged appropriately
- Reports published correctly

**Rollback**: Run all tests together if splitting proves complex

---

### Team Review Required

**CRITICAL CHECKPOINT**: This plan must be reviewed by all agents before implementation begins.

**Review Checklist**:
- [ ] @Forge 🔗: Review WebSocket mock approach and runtime shim
- [ ] @Link 🌐: Review data-testid placement and selector strategy
- [ ] @Pixel 🖥️: Review test structure and visual regression approach
- [ ] @Nexus 🚀: Review CI integration and test splitting
- [ ] @Scout 🔎: Verify research findings align with plan
- [ ] @Vector 🎯: Confirm plan completeness and checkpoint structure

**After Team Review**:
- Create `.notes/features/persona-sim-testing/team-review-approved.md`
- Update `docs/Plan.md` to include "Team review complete - approved for implementation"
- Proceed to implementation phase

**Do not continue past Step 1 without team review approval.**

**✅ Team review complete - approved for implementation. Proceed to Step 1.**

---

## Issue #20: Performance Verification & Benchmarking

**Status**: ✅ **APPROVED** - Team review complete, ready for implementation  
**Research Status**: ✅ **COMPLETE** - Research file: `docs/research/Issue-20-research.md`  
**Team Review**: ✅ **APPROVED** - Approval file: `.notes/features/performance-verification/team-review-approved.md`

**Team review complete - approved for implementation.**

### Goals
- **GitHub Issue**: #20
- **Target**: Comprehensive performance verification and benchmarking for production readiness
- **Problem**: Chat start performance (< 500ms) is not tested. Existing Radar performance tests exist but need regression verification. Performance targets from vision.md must be verified before launch.
- **Desired Outcome**: 
  - Chat start latency < 500ms verified (button click → chat active)
  - All existing performance targets re-verified (regression check)
  - Performance results documented and compared to vision.md targets
  - Performance budget enforced in CI (optional)
- **Success Metrics**:
  - Chat start performance test passes (< 500ms)
  - Radar performance tests still pass (regression check)
  - WebSocket connection tests still pass (regression check)
  - Performance results documented
  - CI fails if performance targets not met (optional)
- **Research Status**: ✅ **COMPLETE** - Research file: `docs/research/Issue-20-research.md`

### Out-of-scope
- Performance optimization (verification only, optimization is separate work)
- Network throttling comprehensive tests (deferred to post-MVP)
- Mobile device performance testing (deferred to manual QA for MVP)
- Core Web Vitals measurement (LCP, INP, CLS) - not needed for chat latency
- Load/stress testing (deferred to post-launch)

### Steps (4)

#### Step 1: Chat Start Performance Test Implementation
**Owner**: @Pixel 🖥️  
**Intent**: Create chat start performance test measuring button click → chat active state (< 500ms)

**File Targets**:
- `tests/e2e/performance.spec.ts` (update - add chat start performance test)
- `tests/fixtures/persona-presence/chat-performance.json` (create - 2-persona presence script for chat testing)

**Required Tools**:
- Playwright
- WebSocket mock infrastructure (`tests/mocks/websocket-mock.ts`)
- Multi-persona test helpers (`tests/utils/multi-persona.ts`)

**Acceptance Tests**:
- [ ] Chat start performance test added to `performance.spec.ts`
- [ ] Test uses WebSocket mock with 2 personas (requester + accepter)
- [ ] Test measures: Button click → `chatState === "active"` visible in UI
- [ ] Test asserts: Total latency < 500ms
- [ ] Test uses existing performance test pattern (`Date.now()` timing)
- [ ] Test passes consistently (no flakiness)
- [ ] Presence script created for chat performance testing (2 personas)

**Done Criteria**:
- Chat start performance test implemented and passing
- Test measures end-to-end latency accurately
- Test uses WebSocket mock for deterministic results
- Performance target (< 500ms) verified

**Rollback**: If WebSocket mock doesn't support chat flow accurately, use real backend with controlled test data. If test proves flaky, document manual performance testing approach.

---

#### Step 2: Performance Regression Verification
**Owner**: @Pixel 🖥️  
**Intent**: Re-run existing performance tests to verify no regressions, document results

**File Targets**:
- `tests/e2e/performance.spec.ts` (verify - all existing tests still pass)
- `.notes/features/performance-verification/performance.md` (create - performance results documentation)

**Required Tools**:
- Playwright
- Existing performance test suite

**Acceptance Tests**:
- [ ] Radar view load test still passes (< 2s)
- [ ] WebSocket connection test still passes (< 500ms)
- [ ] Radar updates test still passes (< 1s)
- [ ] Signal Engine calculation test still passes (< 100ms for 100 sessions)
- [ ] All performance tests run successfully
- [ ] Performance results documented in `.notes/features/performance-verification/performance.md`
- [ ] Results compared to vision.md targets

**Done Criteria**:
- All existing performance tests pass (no regressions)
- Performance results documented
- Results match or exceed vision.md targets

**Rollback**: If performance regressions found, document bottlenecks and create follow-up optimization tasks. Do not block launch for minor regressions (< 10% degradation).

---

#### Step 3: Performance Documentation & Summary
**Owner**: @Muse 🎨  
**Intent**: Document performance verification results, create performance summary, update CHANGELOG

**File Targets**:
- `.notes/features/performance-verification/performance.md` (update - finalize documentation)
- `CHANGELOG.md` (update - add performance verification entry)
- `docs/vision.md` (verify - performance targets still accurate)

**Required Tools**:
- Markdown
- Performance test results from Steps 1-2

**Acceptance Tests**:
- [ ] Performance results documented with all metrics
- [ ] Results compared to vision.md targets (pass/fail status)
- [ ] Performance summary created (all targets met/not met)
- [ ] CHANGELOG entry added (performance verification)
- [ ] Vision document verified (targets still accurate)
- [ ] Documentation clear and actionable

**Done Criteria**:
- Performance documentation complete
- CHANGELOG updated
- Vision document verified
- Performance summary available for launch readiness

**Rollback**: N/A (documentation only)

---

#### Step 4: CI Performance Budget Integration (Optional)
**Owner**: @Nexus 🚀  
**Intent**: Add performance budget checks to CI pipeline (fail if targets not met)

**File Targets**:
- `.github/workflows/ci.yml` (update - add performance budget check)
- `tests/e2e/performance.spec.ts` (verify - tests suitable for CI)

**Required Tools**:
- GitHub Actions
- Playwright CI configuration

**Acceptance Tests**:
- [ ] Performance tests run in CI
- [ ] CI fails if performance targets not met
- [ ] Performance test results visible in CI output
- [ ] CI performance checks don't slow down pipeline significantly
- [ ] Performance budget documented in CI workflow

**Done Criteria**:
- Performance budget enforced in CI
- CI fails appropriately if targets not met
- Performance results visible in CI

**Rollback**: Skip CI integration for MVP if it proves complex. Manual performance verification is acceptable for launch. Add CI integration post-launch.

---

### File targets

### Testing (Pixel)
- `tests/e2e/performance.spec.ts` (chat start performance test)
- `tests/fixtures/persona-presence/chat-performance.json` (2-persona presence script)
- `.notes/features/performance-verification/performance.md` (performance results)

### Documentation (Muse)
- `.notes/features/performance-verification/performance.md` (performance documentation)
- `CHANGELOG.md` (performance verification entry)
- `docs/vision.md` (verify performance targets)

### CI/DevOps (Nexus - Optional)
- `.github/workflows/ci.yml` (performance budget check)

### Acceptance tests

### Step 1: Chat Start Performance Test
- [ ] Chat start performance test implemented
- [ ] Test measures button click → chat active (< 500ms)
- [ ] Test uses WebSocket mock with 2 personas
- [ ] Test passes consistently

### Step 2: Performance Regression Verification
- [ ] All existing performance tests pass
- [ ] Performance results documented
- [ ] Results match vision.md targets

### Step 3: Performance Documentation
- [ ] Performance results documented
- [ ] CHANGELOG updated
- [ ] Vision document verified

### Step 4: CI Performance Budget (Optional)
- [ ] Performance budget enforced in CI
- [ ] CI fails if targets not met

### Owners
- Vector 🎯 (planning, coordination)
- Pixel 🖥️ (chat start performance test, regression verification)
- Muse 🎨 (performance documentation)
- Nexus 🚀 (CI integration - optional)
- Scout 🔎 (research complete - `docs/research/Issue-20-research.md`)

### Implementation Notes
- **Status**: ✅ **APPROVED** - Team review complete, ready for implementation
- **Approach**: Performance verification only (no optimization)
- **Testing**: Chat start latency, Radar regression check
- **Dependencies**: WebSocket mock infrastructure, multi-persona test helpers
- **Enables**: Production launch readiness, performance confidence

### Risks & Open questions

### Risks
- **WebSocket Mock Accuracy**: Mock may not accurately simulate real backend chat flow
- **Test Flakiness**: Performance tests may be flaky due to timing variability
- **Performance Regressions**: Existing performance may have degraded since last verification

### Open Questions
- **CI Integration**: Should performance budget be enforced in CI for MVP? (Recommendation: Optional for MVP, add post-launch)
- **Network Throttling**: Should we test chat start on throttled networks? (Recommendation: Skip for MVP, add post-launch)

## Team Review Required

**CRITICAL CHECKPOINT**: This plan must be reviewed by all agents before implementation begins.

**Review Checklist**:
- [ ] @Pixel 🖥️: Review chat start performance test approach and measurement points
- [ ] @Forge 🔗: Review WebSocket mock usage for chat performance testing
- [ ] @Nexus 🚀: Review CI integration approach (optional step)
- [ ] @Muse 🎨: Review documentation requirements
- [ ] @Scout 🔎: Verify research findings align with plan
- [ ] @Vector 🎯: Confirm plan completeness and checkpoint structure

**After Team Review**:
- ✅ Create `.notes/features/performance-verification/team-review-approved.md`
- ✅ Update `docs/Plan.md` to include "Team review complete - approved for implementation"
- ✅ Proceed to implementation phase

**✅ Team review complete - approved for implementation. Proceed to Step 1.**

---

**Status**: ✅ **APPROVED** - Team review complete, ready for implementation  
**Research Status**: ✅ **COMPLETE** - Research file: `docs/research/Issue-21-research.md`  
**Team Review**: ✅ **APPROVED** - Approval file: `.notes/features/production-deployment-infrastructure/team-review-approved.md`

**Team review complete - approved for implementation.**

### Goals
- **GitHub Issue**: #21
- **Target**: Production-ready deployment infrastructure for MVP launch
- **Problem**: No production environment, deployment workflow, or rollback plan exists. Cannot launch MVP without production infrastructure.
- **Desired Outcome**: 
  - Production environment ready and accessible
  - Deployment workflow tested (deploy, verify, rollback)
  - Rollback plan documented and tested
  - SSL/domain configured
  - Environment variables secured
  - Deployment runbook complete
  - Team can deploy with confidence
- **Success Metrics**:
  - Successful production deployment
  - Rollback tested and working
  - Production environment stable
  - Deployment time < 5 minutes
  - Zero-downtime deployments (if possible)
- **Research Status**: ✅ **COMPLETE** - Research file: `docs/research/Issue-21-research.md`

### Out-of-scope
- Multi-region deployment (post-MVP)
- Blue-green deployments (post-MVP)
- Auto-scaling configuration (post-MVP)
- Custom domains (can be added post-MVP, platform domains sufficient for launch)
- GitHub Actions deployment workflow (platform-native auto-deploy for MVP, can enhance later)

### Steps (7)

#### Step 1: Platform Account Setup & GitHub Connection
**Owner**: @Nexus 🚀  
**Intent**: Create Vercel and Railway accounts, connect GitHub repositories, verify access

**File Targets**:
- Platform dashboards (Vercel, Railway)
- GitHub repository settings

**Required Tools**:
- Vercel account (free tier)
- Railway account (free tier)
- GitHub repository access

**Acceptance Tests**:
- [ ] Vercel account created and verified
- [ ] Railway account created and verified
- [ ] GitHub repository connected to Vercel
- [ ] GitHub repository connected to Railway
- [ ] Vercel can access repository
- [ ] Railway can access repository
- [ ] Platform dashboards accessible

**Done Criteria**:
- Both platforms connected to GitHub repository
- Accounts verified and accessible
- Ready for environment variable configuration

**Rollback**: If platform connection fails, use manual deployment via CLI as fallback

---

#### Step 2: Environment Variables Configuration
**Owner**: @Nexus 🚀  
**Intent**: Configure all required environment variables in Vercel and Railway dashboards

**File Targets**:
- Vercel dashboard → Project Settings → Environment Variables
- Railway dashboard → Service → Variables
- `env.example` (verify all variables documented)

**Required Tools**:
- Platform dashboards
- Sentry DSNs (if available)
- Production API URLs (TBD after backend deployment)

**Acceptance Tests**:
- [ ] Frontend env vars configured in Vercel:
  - [ ] `VITE_API_URL` (set after backend deployment)
  - [ ] `VITE_SENTRY_DSN` (if available)
  - [ ] `VITE_SENTRY_ENABLE_DEV=false`
  - [ ] `VITE_APP_VERSION=0.1.0`
- [ ] Backend env vars configured in Railway:
  - [ ] `NODE_ENV=production`
  - [ ] `PORT=8000` (or Railway-assigned port)
  - [ ] `SENTRY_DSN` (if available)
  - [ ] `SENTRY_ENABLE_DEV=false`
  - [ ] `APP_VERSION=0.1.0`
  - [ ] `CORS_ORIGIN` (set after frontend deployment)
- [ ] `env.example` updated with all production variables
- [ ] All variables encrypted/secured in platform dashboards

**Done Criteria**:
- All required environment variables configured
- Variables documented in `env.example`
- Ready for deployment

**Rollback**: Remove incorrect variables, reconfigure correctly

---

#### Step 3: Backend Deployment (Railway)
**Owner**: @Nexus 🚀  
**Intent**: Deploy backend to Railway, verify WebSocket support, test health endpoints

**File Targets**:
- Railway dashboard → Service configuration
- `backend/package.json` (verify start script)
- `backend/src/index.js` (verify health endpoint)

**Required Tools**:
- Railway dashboard
- Backend codebase
- Health check endpoint (`/api/health`)

**Acceptance Tests**:
- [ ] Railway service created with root directory `backend`
- [ ] Start command set to `npm start`
- [ ] Backend deploys successfully
- [ ] Health endpoint accessible: `https://<railway-url>/api/health`
- [ ] Health endpoint returns `{ status: "ok" }`
- [ ] WebSocket endpoint accessible: `wss://<railway-url>/ws`
- [ ] WebSocket connection successful (test with token)
- [ ] Logs visible in Railway dashboard
- [ ] Railway URL documented (for frontend `VITE_API_URL`)

**Done Criteria**:
- Backend deployed and accessible
- Health endpoint working
- WebSocket connection successful
- Backend URL available for frontend configuration

**Rollback**: Use Railway dashboard → Deployments → Redeploy previous commit

---

#### Step 4: Frontend Deployment (Vercel)
**Owner**: @Nexus 🚀  
**Intent**: Deploy frontend to Vercel, configure API URL, verify production build

**File Targets**:
- Vercel dashboard → Project configuration
- `frontend/package.json` (verify build script)
- `frontend/vite.config.js` (verify build config)

**Required Tools**:
- Vercel dashboard
- Frontend codebase
- Backend URL (from Step 3)

**Acceptance Tests**:
- [ ] Vercel project created and connected to GitHub repo
- [ ] Root directory set to `frontend` (or build command configured)
- [ ] Build command: `npm run build` (auto-detected by Vercel)
- [ ] Output directory: `dist` (auto-detected by Vercel)
- [ ] `VITE_API_URL` set to Railway backend URL
- [ ] Frontend deploys successfully
- [ ] Frontend accessible: `https://<vercel-url>`
- [ ] Frontend loads without errors
- [ ] Vercel URL documented (for backend `CORS_ORIGIN`)

**Done Criteria**:
- Frontend deployed and accessible
- API URL configured correctly
- Frontend loads successfully
- Frontend URL available for backend CORS configuration

**Rollback**: Use Vercel dashboard → Deployments → Promote previous deployment

---

#### Step 5: Deployment Verification & Testing
**Owner**: @Pixel 🖥️ + @Nexus 🚀  
**Intent**: Verify end-to-end deployment, test critical flows, verify HTTPS/SSL

**File Targets**:
- `scripts/verify-deployment.mjs` (create - deployment verification script)
- Production URLs (Vercel frontend, Railway backend)

**Required Tools**:
- Production deployments
- Playwright (for E2E testing)
- curl or HTTP client (for health checks)

**Acceptance Tests**:
- [ ] Health check script created (`scripts/verify-deployment.mjs`)
- [ ] Backend health endpoint: `GET /api/health` returns `{ status: "ok" }`
- [ ] WebSocket connection: `wss://<backend-url>/ws` connects successfully
- [ ] Frontend loads: `https://<frontend-url>` loads without errors
- [ ] HTTPS enforced: All requests use HTTPS (no mixed content)
- [ ] CORS configured: Frontend can connect to backend
- [ ] Onboarding flow: Complete onboarding → Radar view loads
- [ ] Sentry errors: Errors appear in Sentry dashboard (if configured)
- [ ] Cross-browser test: Chrome, Firefox, Edge (basic smoke test)
- [ ] Performance: Frontend load time < 2s, backend health < 500ms

**Done Criteria**:
- All verification checks pass
- Critical flows working in production
- HTTPS/SSL verified
- Ready for rollback testing

**Rollback**: If verification fails, use Step 6 rollback procedures

---

#### Step 6: Rollback Procedure Testing
**Owner**: @Nexus 🚀  
**Intent**: Test rollback procedures (quick rollback and emergency rollback) to ensure team can recover from deployment issues

**File Targets**:
- Platform dashboards (Vercel, Railway)
- `docs/deployment/RUNBOOK.md` (create - rollback procedures)

**Required Tools**:
- Platform dashboards
- Git (for emergency rollback)
- Production deployments

**Acceptance Tests**:
- [ ] Quick rollback tested (Vercel):
  - [ ] Deploy new version
  - [ ] Rollback to previous deployment via dashboard
  - [ ] Verify previous version is live
  - [ ] Rollback time < 2 minutes
- [ ] Quick rollback tested (Railway):
  - [ ] Deploy new version
  - [ ] Rollback to previous deployment via dashboard
  - [ ] Verify previous version is live
  - [ ] Rollback time < 2 minutes
- [ ] Emergency rollback tested (Git revert):
  - [ ] Make test commit
  - [ ] Deploy to production
  - [ ] Revert commit: `git revert <commit-hash>`
  - [ ] Push to main: `git push origin main`
  - [ ] Verify reverted version deploys
  - [ ] Total rollback time < 5 minutes
- [ ] Rollback procedures documented in `docs/deployment/RUNBOOK.md`

**Done Criteria**:
- Quick rollback tested and working (< 2 minutes)
- Emergency rollback tested and working (< 5 minutes)
- Rollback procedures documented
- Team confident in rollback process

**Rollback**: N/A (testing rollback procedures)

---

#### Step 7: Deployment Runbook Documentation
**Owner**: @Muse 🎨 + @Nexus 🚀  
**Intent**: Create comprehensive deployment runbook with step-by-step procedures, troubleshooting, and best practices

**File Targets**:
- `docs/deployment/RUNBOOK.md` (create - comprehensive deployment guide)
- `docs/deployment.md` (update - add production deployment section)
- `docs/ConnectionGuide.md` (update - add production endpoints)
- `README.md` (update - add deployment section)

**Required Tools**:
- Markdown
- Production deployment experience (from Steps 1-6)

**Acceptance Tests**:
- [ ] `docs/deployment/RUNBOOK.md` created with:
  - [ ] Initial deployment steps
  - [ ] Continuous deployment process
  - [ ] Rollback procedures (quick + emergency)
  - [ ] Troubleshooting guide
  - [ ] Environment variable reference
  - [ ] Platform-specific notes (Vercel, Railway)
- [ ] `docs/deployment.md` updated with production deployment section
- [ ] `docs/ConnectionGuide.md` updated with:
  - [ ] Production frontend URL
  - [ ] Production backend URL
  - [ ] Production WebSocket URL
  - [ ] Production environment variables
- [ ] `README.md` updated with deployment section
- [ ] All documentation reviewed for accuracy

**Done Criteria**:
- Deployment runbook complete and accurate
- All documentation updated
- Team can deploy independently using runbook
- Production endpoints documented

**Rollback**: Update documentation if procedures change

---

### File Targets

### Platform Setup (Nexus)
- Vercel dashboard (account, project, GitHub connection)
- Railway dashboard (account, service, GitHub connection)
- Platform environment variables (Vercel, Railway)

### Deployment (Nexus)
- Railway service configuration (root directory, start command)
- Vercel project configuration (root directory, build settings)
- Production deployments (backend, frontend)

### Verification (Pixel + Nexus)
- `scripts/verify-deployment.mjs` (new - deployment verification script)
- Production URLs (health checks, WebSocket, frontend)

### Documentation (Muse + Nexus)
- `docs/deployment/RUNBOOK.md` (new - comprehensive deployment guide)
- `docs/deployment.md` (update - production deployment section)
- `docs/ConnectionGuide.md` (update - production endpoints)
- `README.md` (update - deployment section)
- `env.example` (update - production variables)

### Acceptance Tests

### Step 1: Platform Setup
- [ ] Vercel and Railway accounts created
- [ ] GitHub repositories connected
- [ ] Platform dashboards accessible

### Step 2: Environment Variables
- [ ] All frontend variables configured in Vercel
- [ ] All backend variables configured in Railway
- [ ] Variables documented in `env.example`

### Step 3: Backend Deployment
- [ ] Backend deployed to Railway
- [ ] Health endpoint accessible
- [ ] WebSocket connection successful
- [ ] Backend URL documented

### Step 4: Frontend Deployment
- [ ] Frontend deployed to Vercel
- [ ] API URL configured correctly
- [ ] Frontend loads successfully
- [ ] Frontend URL documented

### Step 5: Deployment Verification
- [ ] All verification checks pass
- [ ] Critical flows working in production
- [ ] HTTPS/SSL verified

### Step 6: Rollback Testing
- [ ] Quick rollback tested (< 2 minutes)
- [ ] Emergency rollback tested (< 5 minutes)
- [ ] Rollback procedures documented

### Step 7: Documentation
- [ ] Deployment runbook complete
- [ ] All documentation updated
- [ ] Production endpoints documented

### Owners
- Vector 🎯 (planning, coordination)
- Nexus 🚀 (platform setup, deployment, rollback testing)
- Pixel 🖥️ (deployment verification, testing)
- Muse 🎨 (documentation, runbook)
- Scout 🔎 (research complete - `docs/research/Issue-21-research.md`)

### Implementation Notes
- **Status**: Planning phase - Ready for team review
- **Approach**: Platform-native auto-deploy (simplest for MVP)
- **Platforms**: Vercel (frontend), Railway (backend)
- **Deployment**: Automatic on push to `main` branch
- **Rollback**: Dashboard rollback + git revert
- **Enables**: Production launch readiness, zero-downtime deployments

### Risks & Open Questions

### Risks
- **Platform Limits**: Railway free tier ($5 credit) may be insufficient for production traffic
- **WebSocket Stability**: Need to verify WebSocket connections remain stable on Railway
- **Environment Variables**: Sensitive variables must be secured in platform dashboards
- **Deployment Failures**: Need tested rollback procedures before production launch
- **CORS Configuration**: Frontend and backend URLs must be configured correctly

### Open Questions
- **Sentry DSNs**: Are Sentry accounts created? (If not, can deploy without Sentry initially)
- **Custom Domains**: Use platform domains for MVP or configure custom domains? (Recommendation: Platform domains for MVP)
- **Monitoring**: Basic monitoring via platform dashboards sufficient? (Recommendation: Yes for MVP, enhance with Issue #22)

### MCP Tools Required
- **GitHub MCP**: Issue tracking, branch creation (if needed)
- **Desktop Commander MCP**: Local script execution (verify-deployment.mjs)

### Handoffs
- **After Step 1**: Nexus hands off platform setup to Nexus for Step 2 (environment variables)
- **After Step 2**: Nexus hands off env vars to Nexus for Step 3 (backend deployment)
- **After Step 3**: Nexus hands off backend URL to Nexus for Step 4 (frontend deployment)
- **After Step 4**: Nexus hands off deployments to Pixel for Step 5 (verification)
- **After Step 5**: Pixel hands off verification to Nexus for Step 6 (rollback testing)
- **After Step 6**: Nexus hands off rollback testing to Muse for Step 7 (documentation)
- **After Step 7**: Issue #21 complete - production deployment ready

---

**Plan Status**: ✅ **APPROVED** - Team review complete, ready for implementation

**Summary**:
- Issue #21: Production Deployment Infrastructure
- Plan: 7 steps
- Research: ✅ Complete (`docs/research/Issue-21-research.md`)
- Team Review: ✅ Approved (`.notes/features/production-deployment-infrastructure/team-review-approved.md`)
- Implementation: Ready to begin Step 1

**Team Involvement**:
- ✅ Scout 🔎: Research complete
- ✅ Vector 🎯: Plan created
- ✅ **Team Review**: ✅ Approved
- ⏸️ Nexus 🚀: Steps 1-4, 6 (platform setup, deployment, rollback) - Ready to begin
- ⏸️ Pixel 🖥️: Step 5 (verification)
- ⏸️ Muse 🎨: Step 7 (documentation)

**✅ Team review complete - approved for implementation. Proceed to Step 1.**

---

## Issue #22: Monitoring, Observability & Error Tracking

**Status**: ✅ **APPROVED** - Team review complete, ready for implementation  
**Research Status**: ✅ **COMPLETE** - Research file: `docs/research/Issue-22-research.md`  
**Team Review**: ✅ **APPROVED** - Approval file: `.notes/features/monitoring-observability-error-tracking/team-review-approved.md`

**Team review complete - approved for implementation.**

### Goals
- **GitHub Issue**: #22
- **Target**: Complete monitoring, observability, and error tracking setup for production readiness
- **Problem**: Sentry partially implemented but setup unclear. No performance monitoring verification, uptime monitoring, alerting rules, dashboards, or runbooks configured.
- **Desired Outcome**: 
  - Sentry error tracking operational (frontend + backend)
  - Performance monitoring verified and enhanced (WebSocket, Signal Engine spans)
  - Uptime monitoring active (UptimeRobot free tier)
  - Alerting rules configured (error rate, performance degradation)
  - Monitoring dashboards accessible and documented
  - Monitoring runbook created for incident response
- **Success Metrics**:
  - Sentry captures errors from frontend and backend
  - Performance metrics visible in Sentry dashboard
  - Uptime monitoring alerts on downtime
  - Alert response time < 5 minutes
  - Zero false-positive alerts
  - Team can respond to incidents using runbook
- **Research Status**: ✅ **COMPLETE** - Research file: `docs/research/Issue-22-research.md`

### Out-of-scope
- Prometheus + Grafana setup (post-MVP enhancement)
- Advanced business metrics (chat starts, radar updates) - basic metrics only
- Slack/PagerDuty alerting (email alerts only for MVP)
- Custom Grafana dashboards (use Sentry dashboards)
- Load/stress testing monitoring (deferred to post-launch)

### Steps (6)

#### Step 1: Complete Sentry Setup & Verification
**Owner**: @Nexus 🚀 + @Forge 🔗  
**Intent**: Install missing Sentry package, create Sentry project, configure DSNs, and verify error capture

**File Targets**:
- `backend/package.json` (update - add `@sentry/node` dependency)
- `.env.example` (verify - Sentry DSN variables documented)
- `backend/src/middleware/error-handler.js` (verify - Sentry initialization correct)
- `frontend/src/lib/sentry.ts` (verify - Sentry initialization correct)
- `docs/ConnectionGuide.md` (update - document Sentry dashboard access)

**Required Tools**:
- Sentry account (free tier)
- npm (package installation)
- Environment variable configuration

**Acceptance Tests**:
- [ ] `@sentry/node` installed in backend (`npm install @sentry/node`)
- [ ] Sentry project created (free tier) for frontend
- [ ] Sentry project created (free tier) for backend
- [ ] Frontend DSN configured in `.env` (`VITE_SENTRY_DSN`)
- [ ] Backend DSN configured in `.env` (`SENTRY_DSN`)
- [ ] Intentional error test: Frontend error appears in Sentry dashboard
- [ ] Intentional error test: Backend error appears in Sentry dashboard
- [ ] Sentry dashboard access documented in `docs/ConnectionGuide.md`
- [ ] Error capture verified (test errors visible in Sentry)

**Done Criteria**:
- Sentry packages installed (frontend + backend)
- Sentry projects created and DSNs configured
- Error capture verified (test errors appear in Sentry)
- Dashboard access documented

**Rollback**: If Sentry setup fails, fall back to console logging + structured logs. Can add Sentry post-launch.

---

#### Step 2: WebSocket Error Tracking & Performance Spans
**Owner**: @Forge 🔗  
**Intent**: Add Sentry error tracking to WebSocket error handler and create performance spans for WebSocket operations

**File Targets**:
- `backend/src/websocket/server.js` (update - add Sentry error tracking)
- `backend/src/websocket/handlers.js` (update - add Sentry spans for message handling)
- `backend/src/services/SignalEngine.js` (update - add Sentry spans for calculations)

**Required Tools**:
- Sentry SDK (`@sentry/node`)
- WebSocket server code

**Acceptance Tests**:
- [ ] WebSocket errors captured in Sentry (`ws.on("error")` handler)
- [ ] Custom tags added: `sessionId`, `connectionCount`
- [ ] Performance span created for WebSocket message handling
- [ ] Performance span created for Signal Engine calculations
- [ ] WebSocket error test: Error appears in Sentry with correct tags
- [ ] Performance spans visible in Sentry Performance dashboard

**Done Criteria**:
- WebSocket errors tracked in Sentry
- Performance spans created for WebSocket and Signal Engine operations
- Custom tags added for context
- Performance data visible in Sentry dashboard

**Rollback**: If Sentry integration proves complex, start with basic error logging. Add spans incrementally.

---

#### Step 3: Enhanced Health Endpoint & Uptime Monitoring
**Owner**: @Forge 🔗 + @Nexus 🚀  
**Intent**: Enhance health endpoint to check WebSocket status, add readiness endpoint, and set up UptimeRobot monitoring

**File Targets**:
- `backend/src/routes/health.js` (update - enhance health endpoint)
- `backend/src/websocket/server.js` (update - expose WebSocket status)
- `.env.example` (verify - no new variables needed)
- `docs/ConnectionGuide.md` (update - document health endpoints)

**Required Tools**:
- UptimeRobot account (free tier)
- Express route handlers

**Acceptance Tests**:
- [ ] Health endpoint returns: `{ status: "ok", websocket: "connected", sessions: <count> }`
- [ ] Health endpoint checks WebSocket server status (`wss.clients.size`)
- [ ] Readiness endpoint created: `GET /api/health/ready`
- [ ] Readiness endpoint returns: `{ status: "ready", websocket: "connected" }`
- [ ] UptimeRobot account created (free tier)
- [ ] UptimeRobot monitor configured: `GET /api/health` (5-minute intervals)
- [ ] UptimeRobot alert configured: 3+ consecutive failures = downtime alert
- [ ] Health endpoints documented in `docs/ConnectionGuide.md`
- [ ] UptimeRobot status page URL documented

**Done Criteria**:
- Health endpoint enhanced with WebSocket status
- Readiness endpoint created for deployment checks
- UptimeRobot monitoring active (health checks every 5 minutes)
- Uptime alerts configured (3+ consecutive failures)
- Documentation updated

**Rollback**: If UptimeRobot fails, use GitHub Actions scheduled workflow to ping health endpoint. Manual monitoring as last resort.

---

#### Step 4: Alerting Rules Configuration
**Owner**: @Nexus 🚀  
**Intent**: Configure alerting rules in Sentry and UptimeRobot for error rate, performance degradation, and uptime

**File Targets**:
- Sentry dashboard (configure alert rules)
- UptimeRobot dashboard (configure alert settings)
- `docs/monitoring/ALERTS.md` (create - alert rules documentation)

**Required Tools**:
- Sentry dashboard access
- UptimeRobot dashboard access

**Acceptance Tests**:
- [ ] Sentry alert rule: Error rate > 10 errors/minute (critical)
- [ ] Sentry alert rule: Error rate > 5 errors/minute (warning)
- [ ] Sentry alert rule: Performance degradation P95 > 1s (warning)
- [ ] Sentry alert rule: Performance degradation P95 > 2s (critical)
- [ ] Sentry alert rule: New error type detected (alert on new issues)
- [ ] UptimeRobot alert: Health check fails 3+ times consecutively (downtime)
- [ ] UptimeRobot alert: Response time > 1s (performance alert)
- [ ] Alert channels configured: Email (default)
- [ ] Alert rules documented in `docs/monitoring/ALERTS.md`
- [ ] Test alert sent (verify email delivery)

**Done Criteria**:
- Sentry alert rules configured (error rate, performance degradation)
- UptimeRobot alerts configured (downtime, performance)
- Email alerts working (test alert received)
- Alert rules documented

**Rollback**: If alerting fails, fall back to email-only. Manual dashboard checks as interim solution.

---

#### Step 5: Performance Monitoring Verification & Dashboard Setup
**Owner**: @Nexus 🚀 + @Pixel 🖥️  
**Intent**: Verify Sentry Performance Monitoring is working, create performance dashboard, and document access

**File Targets**:
- Sentry dashboard (create performance dashboard)
- `docs/ConnectionGuide.md` (update - document Sentry Performance dashboard)
- `docs/monitoring/DASHBOARDS.md` (create - dashboard access guide)

**Required Tools**:
- Sentry dashboard access
- Performance test suite (existing)

**Acceptance Tests**:
- [ ] Sentry Performance Monitoring verified (traces visible in dashboard)
- [ ] Performance dashboard created in Sentry (latency, throughput)
- [ ] WebSocket performance spans visible in dashboard
- [ ] Signal Engine performance spans visible in dashboard
- [ ] P50, P95, P99 latencies tracked for critical paths
- [ ] Performance dashboard access documented
- [ ] UptimeRobot status page URL documented
- [ ] Dashboard access guide created (`docs/monitoring/DASHBOARDS.md`)

**Done Criteria**:
- Sentry Performance Monitoring verified and working
- Performance dashboard created and accessible
- Dashboard access documented
- Team can access monitoring dashboards

**Rollback**: If dashboards unavailable, use Sentry Issues page + manual log analysis. Add Grafana post-MVP if needed.

---

#### Step 6: Monitoring Runbook Creation
**Owner**: @Muse 🎨 + @Nexus 🚀  
**Intent**: Create comprehensive monitoring runbook for incident response

**File Targets**:
- `docs/monitoring/RUNBOOK.md` (create - incident response runbook)
- `docs/ConnectionGuide.md` (verify - monitoring details complete)

**Required Tools**:
- Documentation best practices
- Incident response procedures

**Acceptance Tests**:
- [ ] Runbook created: `docs/monitoring/RUNBOOK.md`
- [ ] Error investigation procedure documented:
  - Access Sentry dashboard
  - Check error grouping and trends
  - Review stack traces and context
  - Check related performance metrics
- [ ] Performance degradation procedure documented:
  - Check Sentry Performance dashboard
  - Identify slow endpoints/operations
  - Check WebSocket connection metrics
  - Review recent deployments
- [ ] Service downtime procedure documented:
  - Check UptimeRobot status
  - Verify health endpoint (`/api/health`)
  - Check server logs
  - Verify WebSocket server status
  - Check deployment status
- [ ] WebSocket connection issues procedure documented:
  - Check WebSocket server logs
  - Verify connection count (`wss.clients.size`)
  - Check for connection errors in Sentry
  - Verify session store health
- [ ] Incident response process documented (Detect → Acknowledge → Investigate → Resolve → Document)
- [ ] Connection Guide updated with all monitoring details

**Done Criteria**:
- Monitoring runbook complete with all procedures
- Incident response process documented
- Team can follow runbook to respond to incidents
- Documentation complete and accurate

**Rollback**: If runbooks prove insufficient, document common issues in GitHub issues. Build runbook incrementally based on real incidents.

---

### File Targets

### Sentry Setup (Nexus + Forge)
- `backend/package.json` (add `@sentry/node`)
- `backend/src/middleware/error-handler.js` (verify Sentry init)
- `frontend/src/lib/sentry.ts` (verify Sentry init)
- `.env.example` (verify Sentry variables)

### WebSocket Monitoring (Forge)
- `backend/src/websocket/server.js` (add Sentry error tracking)
- `backend/src/websocket/handlers.js` (add performance spans)
- `backend/src/services/SignalEngine.js` (add performance spans)

### Health & Uptime (Forge + Nexus)
- `backend/src/routes/health.js` (enhance health endpoint)
- `backend/src/websocket/server.js` (expose WebSocket status)
- UptimeRobot dashboard (configure monitoring)

### Alerting (Nexus)
- Sentry dashboard (configure alert rules)
- UptimeRobot dashboard (configure alerts)
- `docs/monitoring/ALERTS.md` (document alert rules)

### Dashboards (Nexus + Pixel)
- Sentry dashboard (create performance dashboard)
- `docs/monitoring/DASHBOARDS.md` (dashboard access guide)

### Documentation (Muse + Nexus)
- `docs/monitoring/RUNBOOK.md` (incident response runbook)
- `docs/ConnectionGuide.md` (monitoring details)
- `docs/monitoring/ALERTS.md` (alert rules)

## Acceptance Tests

### Step 1: Sentry Setup
- [ ] `@sentry/node` installed in backend
- [ ] Sentry projects created (frontend + backend)
- [ ] DSNs configured in environment variables
- [ ] Error capture verified (test errors appear in Sentry)
- [ ] Dashboard access documented

### Step 2: WebSocket Monitoring
- [ ] WebSocket errors tracked in Sentry
- [ ] Performance spans created for WebSocket operations
- [ ] Performance spans created for Signal Engine calculations
- [ ] Custom tags added for context

### Step 3: Health & Uptime
- [ ] Health endpoint enhanced (WebSocket status check)
- [ ] Readiness endpoint created
- [ ] UptimeRobot monitoring active
- [ ] Uptime alerts configured

### Step 4: Alerting
- [ ] Sentry alert rules configured (error rate, performance)
- [ ] UptimeRobot alerts configured (downtime, performance)
- [ ] Email alerts working
- [ ] Alert rules documented

### Step 5: Dashboards
- [ ] Sentry Performance Monitoring verified
- [ ] Performance dashboard created
- [ ] Dashboard access documented
- [ ] Team can access dashboards

### Step 6: Runbook
- [ ] Monitoring runbook created
- [ ] Incident response procedures documented
- [ ] Team can follow runbook
- [ ] Documentation complete

## Owners
- Vector 🎯 (planning, coordination)
- Nexus 🚀 (Sentry setup, UptimeRobot, alerting, dashboards)
- Forge 🔗 (WebSocket monitoring, health endpoint, performance spans)
- Pixel 🖥️ (performance verification)
- Muse 🎨 (runbook, documentation)
- Scout 🔎 (research complete - `docs/research/Issue-22-research.md`)

## Implementation Notes
- **Status**: Planning phase - Ready for team review
- **Approach**: Complete existing Sentry setup, add monitoring infrastructure
- **Dependencies**: Sentry account (free tier), UptimeRobot account (free tier)
- **Enables**: Production monitoring, error tracking, incident response

## Risks & Open Questions

### Risks
- **Sentry Setup**: May require manual account creation and DSN configuration
- **UptimeRobot**: Free tier limitations (50 monitors, 5-minute intervals)
- **Alert Fatigue**: Too many alerts may cause team to ignore them
- **Performance Impact**: Sentry spans may add overhead (mitigated by sampling rates)

### Open Questions
- **Sentry Account**: Who creates Sentry account? (Recommendation: Nexus creates, shares DSNs)
- **UptimeRobot Account**: Who creates UptimeRobot account? (Recommendation: Nexus creates, shares access)
- **Alert Channels**: Email only or add Slack? (Recommendation: Email for MVP, Slack post-launch)
- **Performance Sampling**: Current 10% sample rate sufficient? (Recommendation: Start with 10%, adjust based on volume)

## MCP Tools Required
- **GitHub MCP**: Issue tracking, branch creation
- **Ref Tools MCP** (optional): Sentry documentation search

## Handoffs
- **After Step 1**: Nexus hands off Sentry setup to Forge for Step 2 (WebSocket monitoring)
- **After Step 2**: Forge hands off WebSocket monitoring to Forge + Nexus for Step 3 (health endpoint)
- **After Step 3**: Forge + Nexus hand off health monitoring to Nexus for Step 4 (alerting)
- **After Step 4**: Nexus hands off alerting to Nexus + Pixel for Step 5 (dashboards)
- **After Step 5**: Nexus + Pixel hand off dashboards to Muse + Nexus for Step 6 (runbook)
- **After Step 6**: Issue #22 complete - monitoring operational

---

**Plan Status**: ✅ **APPROVED** - Team review complete, ready for implementation

**Summary**:
- Issue #22: Monitoring, Observability & Error Tracking
- Plan: 6 steps
- Research: ✅ Complete (`docs/research/Issue-22-research.md`)
- Team Review: ✅ Approved (`.notes/features/monitoring-observability-error-tracking/team-review-approved.md`)
- Implementation: Ready to begin Step 1

**Team Involvement**:
- ✅ Scout 🔎: Research complete
- ✅ Vector 🎯: Plan created
- ✅ **Team Review**: ✅ Approved
- ⏸️ Nexus 🚀: Steps 1, 3, 4, 5 (Sentry, UptimeRobot, alerting, dashboards) - Ready to begin
- ⏸️ Forge 🔗: Steps 1, 2, 3 (Sentry setup, WebSocket monitoring, health endpoint)
- ⏸️ Pixel 🖥️: Step 5 (performance verification)
- ⏸️ Muse 🎨: Step 6 (runbook, documentation)

**✅ Team review complete - approved for implementation. Proceed to Step 1.**

---

## Current Status Summary

**Completed Issues**:
- ✅ Issue #2: Radar View
- ✅ Issue #3: Chat Interface
- ✅ Issue #5: Panic Button
- ✅ Issue #6: Integration Testing & Launch Preparation
- ✅ Issue #9: UX Review Fixes + Bootup Random Messages

**Note**: Issue #7 was completed but created retroactively as Issue #19. Current active issues are listed below.

**Planning**:
- 📋 Issue #18: Persona-Simulated User Testing with Look-and-Feel Validation (Main planning issue - see steps above)
- 📋 Issue #21: Production Deployment Infrastructure (Launch blocker - see plan above)

**Production Readiness (Critical for Launch)**:
- 📋 Issue #20: Performance Verification & Benchmarking (Vision requirement: < 500ms chat, < 1s radar)
- 📋 Issue #22: Monitoring, Observability & Error Tracking (Operational requirement)

**Persona Sim Testing Phase 2 Backlog** (Issues #8-#10, #11-#17):
- 📋 Issue #8: Feature-Flagged WebSocket Mock & Shim
- 📋 Issue #9: Persona Presence Fixture Library  
- 📋 Issue #10: Geolocation & Permission Helpers
- 📋 Issue #11: Multi-Context Persona Specs (Phase 2)
- 📋 Issue #12: Device & Theme Matrix Coverage
- 📋 Issue #13: Stable Selector Map via `data-testid`
- 📋 Issue #14: Persona Telemetry Writer & Aggregator
- 📋 Issue #15: CI Smoke vs Full Split + Multi-Browser Matrix
- 📋 Issue #16: Accessibility & Failure-State Hardening
- 📋 Issue #17: Visual Regression Baselines

See `.notes/features/persona-sim-testing/next-issues.md` for detailed scope and acceptance criteria.

**Test Coverage**:
- ✅ Frontend: 172/172 tests passing
- ⚠️ Backend: Status needs verification
- ⚠️ E2E: Needs comprehensive coverage

**Next Actions**:
1. Verify backend test coverage
2. Create integration testing plan
3. Begin performance verification
4. Prepare launch checklist
