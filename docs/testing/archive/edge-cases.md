# Edge Cases Discovered - Issue #8

**Discovery Date**: 2025-01-27  
**Source**: Persona E2E Test Execution  
**Status**: ⚠️ Needs Resolution

## Edge Cases by Category

### Server & Infrastructure

#### Edge Case 1: Backend Server Dependency ✅ FIXED
**Description**: E2E tests fail if backend server (port 8000) is not running
**Impact**: All tests that require API calls fail
**Severity**: HIGH → **RESOLVED**
**Affected Personas**: All (Maya, Ethan, Zoe, Marcus, Casey, River, Alex, Jordan, Sam, Morgan)

**Resolution**: 
- ✅ Playwright config now automatically starts backend server before tests
- ✅ Backend server starts first, then frontend (frontend proxies to backend)
- ✅ Servers automatically stop after tests complete
- ✅ Set `SKIP_WEB_SERVER=1` to use manually started servers if needed

**Status**: ✅ **RESOLVED** - Tests now handle server setup automatically

---

#### Edge Case 2: WebSocket Dependency
**Description**: Radar tests require WebSocket connection to backend
**Impact**: Radar discovery tests fail if WebSocket unavailable
**Severity**: HIGH
**Affected Personas**: All (Radar discovery is core feature)

**Steps to Reproduce**:
1. Start backend server without WebSocket support
2. Run Radar discovery tests
3. Tests fail

**Expected Behavior**: Tests should either:
- Mock WebSocket for unit tests
- Provide clear error message if WebSocket unavailable
- Skip WebSocket-dependent tests with clear message

**Actual Behavior**: Tests fail without clear error message

**Recommendation**:
- Add WebSocket health check
- Mock WebSocket for unit tests
- Document WebSocket requirements

---

### UI Element Selectors

#### Edge Case 3: Checkbox Label Mismatch
**Description**: Consent checkbox not found by accessibility selector
**Impact**: Onboarding flow tests fail
**Severity**: MEDIUM
**Affected Personas**: All (onboarding is required for all)

**Steps to Reproduce**:
1. Run persona onboarding tests
2. Test looks for checkbox: `getByRole('checkbox', { name: /I confirm I am 18 or older/i })`
3. Checkbox not found

**Expected Behavior**: Checkbox should be found by accessibility selector

**Actual Behavior**: Checkbox not found, test fails

**Recommendation**:
- Verify checkbox label text matches test expectation
- Add proper ARIA label if needed
- Add fallback selector (data-testid)

---

#### Edge Case 4: Radar Heading Selector
**Description**: Radar heading not found by accessibility selector
**Impact**: All Radar view tests fail
**Severity**: HIGH
**Affected Personas**: All (Radar is core feature)

**Steps to Reproduce**:
1. Navigate to Radar page
2. Test looks for heading: `getByRole('heading', { name: /RADAR/i })`
3. Heading not found

**Expected Behavior**: Radar heading should be found by accessibility selector

**Actual Behavior**: Heading not found, test fails

**Recommendation**:
- Verify heading text matches test expectation
- Add proper heading role
- Add fallback selector (text content, aria-label)

---

#### Edge Case 5: Panic Button Selector
**Description**: Panic button not found by accessibility selector
**Impact**: Panic button accessibility tests fail
**Severity**: MEDIUM
**Affected Personas**: All (panic button is safety feature)

**Steps to Reproduce**:
1. Navigate to Radar page
2. Test looks for button: `getByRole('button', { name: /panic|emergency|help/i })`
3. Button not found

**Expected Behavior**: Panic button should be found by accessibility selector

**Actual Behavior**: Button not found, test fails

**Recommendation**:
- Verify panic button label/aria-label matches test expectation
- Add proper ARIA label if needed
- Add fallback selector (data-testid, class name)

---

#### Edge Case 6: Visibility Toggle Selector
**Description**: Visibility toggle not found by accessibility selector
**Impact**: Visibility toggle tests fail
**Severity**: MEDIUM
**Affected Personas**: Maya, Jordan (anxious/privacy-focused users)

**Steps to Reproduce**:
1. Navigate to Radar page
2. Test looks for button: `getByRole('button', { name: /visibility|toggle/i })`
3. Button not found

**Expected Behavior**: Visibility toggle should be found by accessibility selector

**Actual Behavior**: Button not found, test fails

**Recommendation**:
- Verify visibility toggle label/aria-label matches test expectation
- Add proper ARIA label if needed
- Add fallback selector (data-testid, class name)

---

### Test Isolation

#### Edge Case 7: Session Cleanup
**Description**: Tests may interfere with each other if sessions aren't cleared
**Impact**: Test flakiness, false positives/negatives
**Severity**: MEDIUM
**Affected Personas**: All (cross-persona tests)

**Steps to Reproduce**:
1. Run multiple persona tests in sequence
2. Sessions may persist between tests
3. Tests may see unexpected data

**Expected Behavior**: Each test should start with clean session state

**Actual Behavior**: Sessions may persist, causing test interference

**Recommendation**:
- Ensure session cleanup between tests
- Use unique session IDs per test
- Add test isolation verification

---

### Performance & Timeouts

#### Edge Case 8: Page Load Timeout
**Description**: Page navigation times out after 30 seconds
**Impact**: Tests fail before completing
**Severity**: MEDIUM
**Affected Personas**: All (onboarding flow)

**Steps to Reproduce**:
1. Run persona onboarding tests
2. Navigate to welcome page
3. Page load times out after 30 seconds

**Expected Behavior**: Page should load within timeout period

**Actual Behavior**: Page load times out

**Recommendation**:
- Optimize page load performance
- Add loading indicators
- Reduce API dependencies
- Increase timeout if needed

---

## Edge Cases by Persona

### Anxious Users (Maya, Ethan, Zoe)
- **Visibility Toggle**: Not found by accessibility selector
- **Panic Button**: Not found by accessibility selector
- **Onboarding Flow**: Checkbox not found, page load timeout

### Professional Users (Marcus, Casey)
- **Radar Discovery**: Heading not found, WebSocket dependency
- **Proximity Matching**: Requires backend server
- **One-Chat Enforcement**: Requires backend server

### Privacy-Conscious Users (Jordan)
- **Visibility Toggle**: Not found by accessibility selector
- **Privacy Features**: Requires backend server for verification

### Event Attendees (Alex, Sam, Morgan)
- **Event Proximity**: Requires backend server
- **Tag Compatibility**: Requires WebSocket connection

---

## Prioritization

### High Priority (Blocks Testing)
1. Backend Server Dependency
2. WebSocket Dependency
3. Radar Heading Selector

### Medium Priority (Affects Specific Tests)
4. Checkbox Label Mismatch
5. Panic Button Selector
6. Visibility Toggle Selector
7. Session Cleanup
8. Page Load Timeout

---

## Resolution Plan

### Step 6: Edge Case Resolution
1. **Fix Backend Server Dependency**
   - Add backend server health check
   - Auto-start backend server if not running
   - Improve error messages

2. **Fix Element Selectors**
   - Verify and fix checkbox label
   - Verify and fix Radar heading
   - Verify and fix panic button label
   - Verify and fix visibility toggle label

3. **Fix Test Isolation**
   - Ensure session cleanup
   - Use unique session IDs
   - Add isolation verification

4. **Fix Performance Issues**
   - Optimize page load
   - Add loading indicators
   - Reduce API dependencies

---

**Last Updated**: 2025-01-27  
**Status**: ⚠️ Edge cases documented, ready for resolution

