# Team Testing Review - Test Infrastructure Assessment

**Date**: 2025-11-20  
**Issue**: #6 (Integration Testing & Launch Preparation)  
**Reviewers**: @Pixel 🖥️ + @Sentinel 🛡️ + @Scout 🔎

---

## Pixel Findings: Test Coverage & Infrastructure

### Critical Issues

1. **Boot Sequence Not Handled** ⚠️ **CRITICAL**
   - **Problem**: Welcome page shows `BootSequence` component first, tests check for "ICEBREAKER" immediately
   - **Impact**: Tests fail with "element(s) not found" errors
   - **Location**: `tests/e2e/onboarding-radar.spec.ts:231`, `tests/e2e/onboarding.spec.ts:12`
   - **Fix**: Wait for boot sequence to complete OR skip boot sequence in test mode

2. **Hardcoded URLs** ⚠️ **HIGH**
   - **Problem**: 25 instances of `http://localhost:3000` and `http://localhost:8000` instead of using `baseURL` from config
   - **Impact**: Tests break if ports change, not configurable for CI/staging
   - **Location**: `onboarding.spec.ts`, `profile.spec.ts`, `cooldown.spec.ts`, `block-report.spec.ts`
   - **Fix**: Use relative URLs or `process.env.FRONTEND_URL` / `process.env.BACKEND_URL`

3. **Anti-Pattern: waitForTimeout** ⚠️ **MEDIUM**
   - **Problem**: 11 instances of `waitForTimeout()` scattered across tests
   - **Impact**: Flaky tests, unpredictable timing, slows test execution
   - **Location**: `onboarding.spec.ts:89,130`, `block-report.spec.ts:129,180,333`, `cooldown.spec.ts:38,125,199,237`, `profile.spec.ts:228`, `performance.spec.ts:211`
   - **Fix**: Replace with proper waits (`waitForLoadState`, `waitForSelector`, `expect().toBeVisible()`)

4. **Missing Dependency** ⚠️ **HIGH**
   - **Problem**: `@axe-core/playwright` used but not in `tests/package.json`
   - **Impact**: Tests may fail if dependency not installed globally
   - **Fix**: Add to `devDependencies`

5. **Inconsistent Session Setup** ⚠️ **MEDIUM**
   - **Problem**: Some tests use `addInitScript` for session storage, others complete full onboarding
   - **Impact**: Inconsistent test behavior, slower tests
   - **Fix**: Create shared test utilities for session setup

6. **Test.skip() Usage** ⚠️ **MEDIUM**
   - **Problem**: Tests skip when they should handle gracefully or fail properly
   - **Location**: `performance.spec.ts:68`, `block-report.spec.ts:165,215`
   - **Fix**: Use conditional logic or proper test setup instead of skipping

### Test Coverage Gaps

- **No test utilities**: Repeated onboarding helper code across 3+ files
- **No shared fixtures**: Session setup duplicated
- **No error handling**: Tests don't handle server startup failures gracefully
- **No retry logic**: Network flakiness causes failures

### Test Infrastructure Health

- ✅ Playwright config properly structured
- ✅ Cross-browser projects configured (chromium, firefox, msedge)
- ✅ Reporter configuration appropriate
- ⚠️ Missing test utilities/shared helpers
- ⚠️ No test data fixtures
- ⚠️ No CI-specific test configuration

### Test Commands

```bash
# Run all accessibility tests
npm test -- --grep "accessibility.*WCAG AA" --project=chromium

# Run with servers (requires dev servers running)
SKIP_WEB_SERVER=1 npm test

# Run specific test file
npm test -- tests/e2e/onboarding-radar.spec.ts
```

---

## Sentinel Findings: Security Testing

### Security Concerns

1. **Test Tokens in Logs** ⚠️ **MEDIUM**
   - **Problem**: Test tokens (`test-token`, `test-session-id`) may appear in test output/logs
   - **Impact**: If logs are exposed, tokens could be misused (low risk for test tokens)
   - **Location**: All test files using session mocks
   - **Fix**: Use environment variables for test tokens, mask in logs

2. **Hardcoded API Endpoints** ⚠️ **LOW**
   - **Problem**: API endpoints hardcoded in tests (`/api/safety/report`, `/api/chat/decline`)
   - **Impact**: Tests break if API routes change
   - **Fix**: Use constants or config for API endpoints

3. **No Security Test Coverage** ⚠️ **HIGH**
   - **Problem**: No tests for:
     - Authentication/authorization failures
     - Rate limiting enforcement
     - Input validation (XSS, injection)
     - CORS headers
     - Security headers (CSP, HSTS)
   - **Fix**: Add security test suite

4. **Test Data Security** ✅ **GOOD**
   - Test data is properly mocked (no real PII)
   - No secrets in test files
   - Session tokens are test-only

### Security Testing Gaps

- **Authentication**: No tests for invalid tokens, expired sessions
- **Authorization**: No tests for unauthorized access attempts
- **Input Validation**: No tests for XSS, SQL injection, path traversal
- **Rate Limiting**: No tests for cooldown enforcement, rate limit triggers
- **CORS**: No tests for cross-origin request handling

---

## Scout Research: Testing Best Practices & Tooling

### Research Sources

1. **Playwright Best Practices** (Official Docs)
   - URL: https://playwright.dev/docs/best-practices
   - Key Takeaway: Avoid `waitForTimeout`, use proper waits; use `baseURL` instead of hardcoded URLs

2. **Axe-Core Playwright Integration** (Deque Labs)
   - URL: https://github.com/dequelabs/axe-core-npm/tree/develop/packages/playwright
   - Key Takeaway: `@axe-core/playwright` must be in `devDependencies` for CI

3. **Test Utilities Pattern** (Testing Library)
   - URL: https://testing-library.com/docs/react-testing-library/setup
   - Key Takeaway: Shared test utilities reduce duplication and improve maintainability

### Tooling Recommendations

1. **Test Utilities** ✅ **RECOMMENDED**
   - Create `tests/utils/` directory for shared helpers
   - `completeOnboarding()` helper (already exists but duplicated)
   - `setupSession()` helper for session storage
   - `waitForBootSequence()` helper for Welcome page

2. **Test Fixtures** ✅ **RECOMMENDED**
   - Create `tests/fixtures/` for test data
   - Mock session data
   - Mock API responses

3. **Environment Configuration** ✅ **RECOMMENDED**
   - Use `.env.test` for test-specific config
   - `FRONTEND_URL`, `BACKEND_URL` from env
   - Test token generation

### Best Practices Citations

- **Avoid waitForTimeout**: Playwright docs recommend using `waitForLoadState`, `waitForSelector`, or `expect().toBeVisible()` instead
- **Use baseURL**: Playwright config `baseURL` should be used instead of hardcoded URLs
- **Test Isolation**: Each test should be independent; use `beforeEach` for setup, not shared state

---

## Combined Recommendations

### Priority 1: Critical Fixes (Must Fix Before Launch)

1. ✅ **Fix Boot Sequence Handling**
   - Wait for boot sequence OR skip in test mode
   - Update all Welcome page tests

2. ✅ **Replace Hardcoded URLs**
   - Use `baseURL` from config or environment variables
   - Update all 25 instances

3. ✅ **Add Missing Dependency**
   - Add `@axe-core/playwright` to `tests/package.json`

4. ✅ **Create Test Utilities**
   - Extract onboarding helper to shared utility
   - Create session setup helper
   - Create boot sequence wait helper

### Priority 2: Important Improvements (Fix Soon)

5. ✅ **Remove waitForTimeout Anti-Patterns**
   - Replace all 11 instances with proper waits
   - Use `waitForLoadState`, `waitForSelector`, `expect().toBeVisible()`

6. ✅ **Add Security Test Suite**
   - Authentication/authorization tests
   - Input validation tests
   - Rate limiting tests

7. ✅ **Improve Test Error Handling**
   - Handle server startup failures gracefully
   - Add retry logic for flaky network operations

### Priority 3: Nice to Have (Post-Launch)

8. ⏸️ **Test Fixtures**
   - Create test data fixtures
   - Mock API responses

9. ⏸️ **CI-Specific Configuration**
   - Separate CI test config
   - Parallel test execution optimization

---

## Next Steps

### @Pixel Implementation Tasks

1. Create `tests/utils/test-helpers.ts` with:
   - `completeOnboarding(page, options)` - unified onboarding helper
   - `setupSession(page, sessionData)` - session storage setup
   - `waitForBootSequence(page)` - boot sequence wait helper

2. Fix boot sequence handling in all Welcome page tests

3. Replace all hardcoded URLs with `baseURL` or env vars

4. Remove all `waitForTimeout` calls, replace with proper waits

5. Add `@axe-core/playwright` to `tests/package.json`

### @Sentinel Implementation Tasks

1. Add security test suite (`tests/e2e/security.spec.ts`):
   - Authentication failure tests
   - Authorization tests
   - Input validation tests (XSS, injection)
   - Rate limiting tests

2. Mask test tokens in logs (use env vars)

### @Scout Documentation Tasks

1. Document test utilities in `tests/README.md`
2. Update test best practices in `.cursor/rules/08-testing.mdc`

---

## Verification Commands

```bash
# Verify all fixes
npm test -- --grep "accessibility.*WCAG AA" --project=chromium

# Verify no hardcoded URLs
grep -r "http://localhost" tests/e2e/

# Verify no waitForTimeout
grep -r "waitForTimeout" tests/e2e/

# Verify dependencies
cd tests && npm list @axe-core/playwright
```

---

**Status**: Review complete. Critical fixes identified. Implementation pending.

