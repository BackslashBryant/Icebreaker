# Research: Persona-Based Testing & Polish (Issue #10)

**Research Date**: 2025-01-27  
**Researcher**: Scout 🔎  
**Issue**: #10 - Persona-Based Testing & Polish  
**Status**: Complete

## Research Question

What are best practices for persona-based testing in E2E scenarios, and how should we structure persona journey mapping and test scenarios to ensure comprehensive user experience validation?

## Constraints

- **Stack**: React frontend, Express backend, WebSocket, Playwright E2E tests
- **Scope**: Polish and refinement (no new features)
- **Target**: Real-world user scenario testing using 10 defined personas
- **Existing Infrastructure**: 
  - 10 personas defined in `docs/personas/` (5 core + 5 market research)
  - Playwright E2E tests (8 test files)
  - Each persona has IceBreaker profile configuration (vibe, tags, visibility)
- **Testing Goals**: UX refinements, edge case discovery, user flow optimization

## Sources & Findings

### 1. Persona-Based Testing Methodology

**Source**: Existing persona files (`docs/personas/*.md`) + E2E test patterns (`tests/e2e/`)

**Findings**:
- **Persona Definition**: Each persona includes:
  - Demographics (age, location, pronouns)
  - Social media profiles (contrast with IceBreaker approach)
  - IceBreaker profile configuration (vibe, tags, visibility)
  - Testing scenarios and expected behaviors
  - Use case context (campus, coworking, events, etc.)

- **Current Test Patterns**:
  - Tests use session storage mocking for completed onboarding
  - Tests cover accessibility, keyboard navigation, screen readers
  - Tests verify specific flows (onboarding → radar → chat)
  - No persona-specific test scenarios exist yet

**Gaps Identified**:
- No persona journey mapping documentation
- No persona-specific test scenarios
- No systematic approach to testing each persona's primary use case
- No UX feedback collection mechanism during persona testing

**Recommendation**:
1. **Journey Mapping**: Create `docs/personas/journeys.md` mapping each persona's complete journey:
   - Welcome → Consent → Location → Vibe/Tags → Radar → Chat → Exit
   - Key touchpoints per persona
   - Expected behaviors at each step
   - Edge cases specific to persona type

2. **Test Scenarios**: Create `docs/testing/persona-scenarios.md` with:
   - Primary use case per persona
   - Expected interactions and outcomes
   - Edge cases to test
   - UX friction points to identify

3. **E2E Test Structure**: Create persona-specific test files:
   - `tests/e2e/personas/college-students.spec.ts` (Maya, Ethan, Zoe)
   - `tests/e2e/personas/professionals.spec.ts` (Marcus, Casey)
   - `tests/e2e/personas/market-research.spec.ts` (River, Alex, Jordan, Sam, Morgan)

**Rollback**: Can start with manual persona testing if automated tests prove complex. Document findings in `docs/testing/persona-feedback.md`.

---

### 2. User Journey Mapping Best Practices

**Source**: UX research best practices + existing persona files

**Findings**:
- **Journey Components**:
  - Entry point (Welcome screen)
  - Key decision points (vibe selection, tag selection, visibility toggle)
  - Interaction points (Radar discovery, chat initiation, chat ending)
  - Exit points (panic button, chat end, visibility toggle off)

- **Persona-Specific Considerations**:
  - **Anxious Users** (Maya, Ethan, Zoe): Need clear exit options, low-pressure interactions, visibility control
  - **Professional Users** (Marcus, Casey): Need boundary enforcement, one-chat-at-a-time, professional context
  - **Privacy-Conscious** (Jordan): Need visibility controls, ephemeral guarantees, no history
  - **Event Attendees** (Alex, Sam, Morgan): Need proximity matching, ephemeral chats, event context

**Recommendation**:
- Map complete journeys for all 10 personas
- Identify friction points per persona type
- Document expected behaviors vs. actual behaviors
- Create test scenarios that validate persona-specific needs

**Rollback**: Can start with core personas (Maya, Ethan, Zoe) and expand to others.

---

### 3. E2E Test Structure for Persona Testing

**Source**: Existing E2E tests (`tests/e2e/`) + Playwright best practices

**Findings**:
- **Current Test Patterns**:
  - Tests use `page.addInitScript()` to mock session storage
  - Tests use `page.goto()` for navigation
  - Tests use `expect()` for assertions
  - Tests use `AxeBuilder` for accessibility checks

- **Test Organization**:
  - Tests grouped by feature (`onboarding.spec.ts`, `radar.spec.ts`)
  - Tests include accessibility checks
  - Tests verify keyboard navigation
  - Tests verify screen reader compatibility

**Recommendation**:
- **Persona Test Structure**:
  ```typescript
  test.describe("Persona: Maya Patel", () => {
    test("completes onboarding with anxious user pattern", async ({ page }) => {
      // Test Maya's specific onboarding flow
      // Verify "thinking" vibe selection
      // Verify tag selection (2-3 tags, not too many)
      // Verify visibility toggle behavior
    });
    
    test("appears on Radar with shared tags", async ({ page }) => {
      // Test proximity matching
      // Verify shared tag compatibility (Maya + Zoe share "Overthinking Things")
      // Verify signal score boost
    });
    
    test("ephemeral chat ending reduces anxiety", async ({ page }) => {
      // Test chat ending behavior
      // Verify clean exit
      // Verify no follow-up pressure
    });
  });
  ```

- **Test Data Setup**:
  - Use persona-specific session data
  - Mock proximity scenarios (same coordinates for campus, different for coworking)
  - Mock shared tags for compatibility testing
  - Mock visibility states

**Rollback**: Can use manual testing with documented scenarios if automated tests prove complex.

---

### 4. UX Feedback Collection During Persona Testing

**Source**: UX testing best practices

**Findings**:
- **Feedback Categories**:
  - Friction points (where users struggle)
  - Edge cases (unexpected behaviors)
  - UX improvements (polish opportunities)
  - Brand consistency (does it feel like "terminal meets Game Boy"?)

- **Collection Methods**:
  - Test results documentation
  - UX feedback logs (`docs/testing/persona-feedback.md`)
  - Edge case logs (`docs/testing/edge-cases.md`)
  - Test output analysis

**Recommendation**:
- Create feedback collection templates:
  - `docs/testing/persona-feedback.md` - UX improvements log
  - `docs/testing/edge-cases.md` - Edge case log
  - Test results include persona-specific notes
  - Document friction points per persona type

**Rollback**: Can collect feedback manually during testing if automated collection proves complex.

---

### 5. Edge Case Discovery Through Persona Testing

**Source**: Existing edge cases in codebase + persona use cases

**Findings**:
- **Potential Edge Cases**:
  - Signal scoring with shared tags (Maya + Zoe)
  - Proximity matching across different floors (Marcus + Ethan in coworking)
  - Visibility toggle behavior for anxious users
  - Ephemeral chat ending for overthinkers (Zoe)
  - One-chat-at-a-time enforcement for professionals
  - Panic button accessibility for all personas

- **Edge Case Categories**:
  - Signal engine edge cases (scoring, compatibility)
  - Proximity matching edge cases (different floors, buildings)
  - Chat ephemerality edge cases (clean endings, no history)
  - Visibility toggle edge cases (anxious users, privacy-conscious)
  - Safety feature edge cases (panic button, block/report)

**Recommendation**:
- Systematically test edge cases per persona
- Document edge cases in `docs/testing/edge-cases.md`
- Prioritize edge cases by severity and persona impact
- Fix edge cases before polish phase

**Rollback**: Can document edge cases for future fixes if they're non-critical.

---

### 6. Testing Tools & Infrastructure

**Source**: Existing test infrastructure (`tests/playwright.config.ts`)

**Findings**:
- **Current Setup**:
  - Playwright configured with Chromium, Firefox, Edge
  - Tests run sequentially (`fullyParallel: false`)
  - Web servers auto-start (backend on 8000, frontend on 3000)
  - Accessibility testing with `@axe-core/playwright`

- **Persona Testing Requirements**:
  - Need to simulate multiple personas simultaneously (for Radar matching)
  - Need to mock proximity scenarios (same/different coordinates)
  - Need to mock shared tags for compatibility testing
  - Need to test ephemeral chat behavior

**Recommendation**:
- Use Playwright's `page.context()` for multiple browser contexts (simulate multiple personas)
- Use `page.addInitScript()` for persona-specific session data
- Use `page.route()` to mock WebSocket messages for proximity scenarios
- Use `page.evaluate()` to mock geolocation coordinates per persona

**Rollback**: Can use manual testing with multiple browser windows if automated multi-persona testing proves complex.

---

## Recommendations Summary

### Priority 1: Critical for Persona Testing
1. ✅ **Journey Mapping**: Create `docs/personas/journeys.md` with complete journeys for all 10 personas
2. ✅ **Test Scenarios**: Create `docs/testing/persona-scenarios.md` with persona-specific test cases
3. ✅ **E2E Test Structure**: Create persona-specific test files (`tests/e2e/personas/`)
4. ✅ **UX Feedback Collection**: Create feedback logs (`docs/testing/persona-feedback.md`, `docs/testing/edge-cases.md`)

### Priority 2: Important for Comprehensive Testing
1. ⏸️ **Multi-Persona Simulation**: Test Radar matching with multiple personas simultaneously
2. ⏸️ **Proximity Scenarios**: Mock different proximity scenarios (same building, different floors, etc.)
3. ⏸️ **Edge Case Documentation**: Systematically document edge cases per persona

### Priority 3: Nice to Have
1. ⏸️ **Automated UX Feedback**: Automated collection of friction points (can be manual initially)
2. ⏸️ **Persona Test Reports**: Automated test reports per persona (can be manual initially)

## Rollback Options

1. **If persona journey mapping is complex**: Start with core personas (Maya, Ethan, Zoe) and expand
2. **If multi-persona testing is complex**: Use manual testing with multiple browser windows
3. **If automated edge case discovery is complex**: Document edge cases manually during testing
4. **If UX feedback collection is complex**: Use manual feedback logs during testing

## Next Steps

1. **@Vector 🎯**: Verify plan aligns with research findings
2. **@Vector 🎯 + @Pixel 🖥️**: Create persona journey maps (`docs/personas/journeys.md`)
3. **@Pixel 🖥️**: Create test scenarios (`docs/testing/persona-scenarios.md`)
4. **@Pixel 🖥️**: Implement persona-specific E2E tests (`tests/e2e/personas/`)
5. **@Link 🌐 + @Pixel 🖥️**: Collect UX feedback during testing (`docs/testing/persona-feedback.md`)
6. **@Forge 🔗 + @Link 🌐**: Fix edge cases discovered during testing (`docs/testing/edge-cases.md`)
7. **@Muse 🎨**: Document persona testing results (`docs/testing/persona-results.md`)

## References

- Existing Personas: `docs/personas/` (10 persona files)
- Existing E2E Tests: `tests/e2e/` (8 test files)
- Playwright Config: `tests/playwright.config.ts`
- Vision Document: `docs/vision.md`
- Testing Documentation: `docs/testing/README.md`

---

**Research Status**: ✅ Complete  
**Ready for Planning**: Yes (plan already exists, verify alignment)  
**Confidence Level**: High (personas well-defined, test infrastructure exists, clear methodology)

