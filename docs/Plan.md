# Plan

_Active feature: **Onboarding Flow (Welcome → 18+ Consent → Location → Vibe & Tags)** (`onboarding-flow`)_
_Source spec: GitHub Issue #1 - https://github.com/BackslashBryant/Icebreaker/issues/1_

## Goals
- GitHub Issue: #1 (reopening for implementation verification and completion)
- Target User: Adults (18+) in shared spaces who want lightweight, authentic contact without committing to an identity performance
- Problem: Users need a clear, quick entry point to IceBreaker that establishes privacy expectations, safety boundaries, and enables proximity-based matching
- Desired Outcome: User completes onboarding in under 30 seconds (decisive user) and reaches Radar view with session established, ready for proximity-based connections
- Success Metrics:
  - Onboarding Time: User reaches Radar in under 30 seconds (decisive user)
  - Understanding: New user understands premise within 10 seconds on Welcome screen
  - Accessibility: WCAG AA compliance verified (Playwright axe checks)
  - Test Coverage: ≥80% unit/integration coverage for onboarding module
- Implementation Status: **Code exists but needs verification and completion** - Frontend and backend components are implemented, but DoD checklist items need verification

## Out-of-scope
- OAuth integration for social enrichment (post-MVP)
- Personality/archetype mode (post-MVP)
- Email/phone verification (post-MVP)
- Profile customization beyond vibe/tags (post-MVP)
- Multiple onboarding flows (single flow only)
- Radar View (Issue #2 - separate feature)
- Chat functionality (Issue #3 - separate feature)

## Steps (4-5)

### Step 1: Verify Existing Implementation
**Owner**: @Pixel 🖥️
**Intent**: Audit existing onboarding code, run tests, identify gaps against Issue #1 DoD checklist

**File Targets**:
- `frontend/src/pages/Welcome.tsx` (verify)
- `frontend/src/pages/Onboarding.tsx` (verify)
- `frontend/src/components/onboarding/*.tsx` (verify all 4 components)
- `backend/src/routes/onboarding.js` (verify)
- `backend/src/services/SessionManager.js` (verify)
- `tests/e2e/onboarding.spec.ts` (run and verify)
- `frontend/tests/Welcome.test.tsx` (run and verify)
- `backend/tests/onboarding.test.js` (run and verify)

**Required Tools**:
- Vitest (unit tests)
- Playwright (E2E tests)
- Axe (accessibility checks)

**Acceptance Tests**:
- [ ] All unit tests pass (`npm test` in frontend and backend)
- [ ] E2E test passes: Complete onboarding flow (Welcome → Consent → Location → Vibe & Tags → API → Radar)
- [ ] Accessibility test passes: WCAG AA compliance check (axe)
- [ ] Keyboard navigation test passes: Tab through all steps
- [ ] Screen reader test passes: ARIA labels present
- [ ] API error handling test passes: Graceful error display
- [ ] Code coverage report: ≥80% for onboarding components
- [ ] Gap analysis: Document any missing DoD items

**Done Criteria**:
- All tests pass (unit + E2E)
- Accessibility verified (WCAG AA)
- Code coverage ≥80%
- Gap analysis document created listing any missing DoD items

**Rollback**: If critical gaps found, document in `.notes/features/onboarding-flow/progress.md` and proceed to Step 2

---

### Step 2: Complete Missing DoD Items
**Owner**: @Link 🌐 + @Forge 🔗 (as needed)
**Intent**: Implement any missing features identified in Step 1 gap analysis

**File Targets**:
- TBD based on Step 1 gap analysis
- Likely candidates:
  - Welcome screen enhancements (if needed)
  - Onboarding step accessibility improvements (if needed)
  - Error handling improvements (if needed)
  - Session storage TTL cleanup verification (if needed)

**Required Tools**:
- React + shadcn/ui (frontend)
- Express.js (backend)
- SessionManager (backend)

**Acceptance Tests**:
- [ ] All gaps from Step 1 addressed
- [ ] Missing DoD items implemented
- [ ] Tests updated to cover new functionality
- [ ] Accessibility maintained (WCAG AA)

**Done Criteria**:
- All DoD checklist items from Issue #1 complete
- Tests pass with new functionality
- No accessibility regressions

**Rollback**: If implementation is complex, break into smaller steps and tag @Vector for plan update

---

### Step 3: Integration Testing & Performance Verification
**Owner**: @Pixel 🖥️
**Intent**: Verify end-to-end onboarding flow meets performance targets and accessibility requirements

**File Targets**:
- `tests/e2e/onboarding.spec.ts` (update if needed)
- `.notes/features/onboarding-flow/progress.md` (update with test results)

**Required Tools**:
- Playwright (E2E tests, performance timing)
- Axe (accessibility checks)
- Performance timing APIs

**Acceptance Tests**:
- [ ] E2E test: Onboarding completes in < 30 seconds (timed from Welcome to Radar navigation)
- [ ] E2E test: Welcome screen understanding test (user can read tagline in < 10 seconds)
- [ ] Accessibility: WCAG AA compliance verified on all onboarding steps (Welcome, Consent, Location, Vibe & Tags)
- [ ] Keyboard navigation: All steps navigable via keyboard only
- [ ] Screen reader: All steps have proper ARIA labels
- [ ] Performance: API call (`POST /api/onboarding`) completes in < 500ms (measured)
- [ ] Error handling: API errors display gracefully with clear messages
- [ ] Location handling: GPS denied/off state handled gracefully

**Done Criteria**:
- All performance targets met (< 30s onboarding, < 10s understanding, < 500ms API)
- All accessibility targets met (WCAG AA, keyboard nav, screen reader)
- All error states handled gracefully
- Test results documented

**Rollback**: If performance targets not met, document bottlenecks and tag @Vector for optimization plan

---

### Step 4: Documentation & Handoff
**Owner**: @Muse 🎨
**Intent**: Update documentation (README, CHANGELOG, Connection Guide) and prepare handoff to Issue #2 (Radar View)

**File Targets**:
- `README.md` (update onboarding section)
- `CHANGELOG.md` (add onboarding feature entry)
- `docs/ConnectionGuide.md` (verify onboarding endpoint documented)
- `.notes/features/onboarding-flow/progress.md` (mark complete)

**Required Tools**:
- Reference `docs/vision.md` for onboarding flow context
- Reference `docs/architecture/ARCHITECTURE_TEMPLATE.md` for API contracts

**Acceptance Tests**:
- [ ] README updated with onboarding flow description
- [ ] CHANGELOG entry added: "MVP: Onboarding Flow (Welcome → 18+ Consent → Location → Vibe & Tags)"
- [ ] Connection Guide verified: `POST /api/onboarding` endpoint documented
- [ ] Progress tracker updated: All stages marked complete
- [ ] Handoff notes: Issue #2 (Radar View) can now proceed (session creation dependency met)

**Done Criteria**:
- Documentation updated and accurate
- CHANGELOG entry concise and factual
- Connection Guide accurate
- Handoff ready for Issue #2

**Rollback**: If documentation gaps found, update before marking complete

---

## File targets

### Frontend (verify/enhance)
- `frontend/src/pages/Welcome.tsx` (Welcome screen)
- `frontend/src/pages/Onboarding.tsx` (Main onboarding flow)
- `frontend/src/components/onboarding/ConsentStep.tsx` (18+ Consent step)
- `frontend/src/components/onboarding/LocationStep.tsx` (Location Explainer step)
- `frontend/src/components/onboarding/VibeStep.tsx` (Vibe selection step)
- `frontend/src/components/onboarding/TagsStep.tsx` (Tags & Visibility step)
- `frontend/src/lib/api-client.js` (API client)
- `frontend/src/lib/username-generator.ts` (Handle generation)
- `frontend/src/hooks/useSession.ts` (Session management hook)

### Backend (verify/enhance)
- `backend/src/routes/onboarding.js` (Onboarding API endpoint)
- `backend/src/services/SessionManager.js` (Session creation service)
- `backend/src/lib/crypto-utils.js` (Session ID/token generation)
- `backend/src/lib/username-generator.js` (Handle generation)

### Tests
- `tests/e2e/onboarding.spec.ts` (E2E tests)
- `frontend/tests/Welcome.test.tsx` (Welcome unit tests)
- `backend/tests/onboarding.test.js` (Backend API tests)

### Documentation
- `README.md` (onboarding section)
- `CHANGELOG.md` (feature entry)
- `docs/ConnectionGuide.md` (API endpoint docs)

## Acceptance tests

### Step 1: Verification
- [ ] All unit tests pass
- [ ] E2E test passes
- [ ] Accessibility verified (WCAG AA)
- [ ] Code coverage ≥80%
- [ ] Gap analysis complete

### Step 2: Completion
- [ ] Missing DoD items implemented
- [ ] Tests updated
- [ ] No regressions

### Step 3: Integration & Performance
- [ ] Onboarding time < 30s
- [ ] Welcome understanding < 10s
- [ ] API latency < 500ms
- [ ] Accessibility maintained
- [ ] Error states handled

### Step 4: Documentation
- [ ] README updated
- [ ] CHANGELOG entry added
- [ ] Connection Guide verified
- [ ] Handoff ready

## Owners
- Vector 🎯 (planning, coordination)
- Pixel 🖥️ (verification, testing, gap analysis)
- Link 🌐 (frontend completion/enhancements)
- Forge 🔗 (backend completion/enhancements)
- Muse 🎨 (documentation)

## Implementation Notes
- **Status**: Code exists but needs verification - Frontend and backend components are implemented
- **Approach**: Start with verification (Step 1) to identify gaps, then complete missing items (Step 2)
- **Testing**: Focus on E2E flow, accessibility (WCAG AA), and performance targets
- **Dependencies**: No blocking dependencies - this is the entry point
- **Enables**: Issue #2 (Radar View) requires session creation from onboarding

## Risks & Open questions

### Risks
- **Code Quality**: Existing code may have gaps or bugs - Step 1 verification will surface issues
- **Performance**: Onboarding time target (< 30s) may be tight - need to measure and optimize
- **Accessibility**: May need enhancements to meet WCAG AA - gap analysis will identify needs

### Open Questions
- **Test Coverage**: Current unit test coverage unknown - Step 1 will measure
- **Performance Baseline**: No baseline measurements yet - Step 3 will establish
- **Missing Features**: Unknown what DoD items are missing - Step 1 gap analysis will reveal

## MCP Tools Required
- **GitHub MCP**: Issue tracking, branch/PR creation
- **Playwright MCP** (optional): Accessibility checks (axe), screenshots
- **Desktop Commander MCP**: Not required (file operations only)

## Handoffs
- **After Step 1**: Pixel hands off gap analysis to Link/Forge for completion
- **After Step 2**: Link/Forge hands off to Pixel for integration testing
- **After Step 3**: Pixel hands off to Muse for documentation
- **After Step 4**: Issue #1 complete - ready for Issue #2 (Radar View) implementation

---

**Plan Status**: ✅ **COMPLETE**

**Summary**:
- Issue #1: https://github.com/BackslashBryant/Icebreaker/issues/1
- ✅ All 4 steps completed: Verify → Complete → Test → Document
- ✅ All DoD items verified and complete
- ✅ Test results: Backend (15/15), Frontend (35/35), E2E (8/8)
- ✅ Code coverage: 94.74% average (target: ≥80%)
- ✅ WCAG AA compliance verified
- ✅ Documentation updated (README, CHANGELOG, Connection Guide)

**Handoff**: ✅ Ready for Issue #2 (Radar View) - Session creation dependency met

**Artifacts**:
- `.notes/features/onboarding-flow/gap-analysis.md` - Complete DoD verification
- `.notes/features/onboarding-flow/step1-summary.md` - Verification results
- `.notes/features/onboarding-flow/final-summary.md` - Final summary
