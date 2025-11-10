# Plan

_Active feature: **UX Review Fixes + Bootup Random Messages** (Issue #9) ✅ **COMPLETE**_  
_Previous feature: **Chat Request Cooldowns** (Issue #8) ✅ **COMPLETE**_

**Git Status**: All feature branches pushed to GitHub:
- ✅ `origin/agent/link/7-profile-settings` (Issue #7)
- ✅ `origin/feat/3-chat` (Issue #3)
- ✅ `origin/feat/5-panic-button` (Issue #5)
- ✅ `origin/feat/6-block-report` (Issue #6)
- ✅ `origin/agent/vector/2-radar-view` (Issue #2)
- ✅ `origin/agent/forge/3-chat` (Issue #2 duplicate)

## Goals
- GitHub Issue: #9 (UX Review Fixes + Bootup Random Messages)
- Target User: All users (onboarding flow improvements)
- Problem: UX review identified critical brand breaks, UX improvements, and polish opportunities. Also need to add random on-brand bootup messages to appeal to target demo.
- Desired Outcome: 
  - Critical brand breaks fixed (HealthStatus removed, page title corrected)
  - UX improvements implemented (consent copy tightened, button radius standardized)
  - Bootup sequence enhanced with random on-brand messages pool
- Success Metrics:
  - Welcome screen: No HealthStatus visible
  - Page title: Shows "IceBreaker" not "Icebreaker Health Check"
  - Consent step: Checkbox label is concise, matches brand voice
  - All buttons: Use `rounded-2xl` consistently (brand guide compliance)
  - Bootup messages: Random selection from on-brand pool, appeals to target demo (18+ adults in shared spaces)
- Research Status: ✅ **COMPLETE** - UX review report: `.notes/ux-review-2025-01-27.md`

## Out-of-scope
- Major UI redesigns (only fixes identified in UX review)
- Additional bootup animations (keep existing animation style)
- Button component refactoring (only radius standardization)

## Steps (5)

### Step 1: Critical Brand Breaks - Remove HealthStatus & Fix Page Title
**Owner**: @Link 🌐  
**Intent**: Remove dev-only HealthStatus component from Welcome screen and fix page title to match brand

**File Targets**:
- `frontend/src/pages/Welcome.tsx` (update - remove HealthStatus import and component, line 74)
- `frontend/index.html` (update - change title from "Icebreaker Health Check" to "IceBreaker")

**Required Tools**:
- React
- HTML

**Acceptance Tests**:
- [ ] HealthStatus component removed from Welcome.tsx (import and usage)
- [ ] Page title shows "IceBreaker" in browser tab
- [ ] Welcome screen renders without HealthStatus component
- [ ] No console errors after removal
- [ ] Unit tests: Welcome page still passes (may need to update mocks)

**Done Criteria**:
- HealthStatus completely removed from Welcome screen
- Page title matches brand ("IceBreaker")
- No visual regressions
- Tests passing

**Rollback**: If removal breaks tests, gate HealthStatus behind `NODE_ENV !== 'production'` instead

---

### Step 2: UX Improvements - Consent Copy & Button Radius Standardization
**Owner**: @Link 🌐 + @Muse 🎨  
**Intent**: Tighten consent checkbox copy (split into checkbox label + separate text) and standardize all button border radius to `rounded-2xl` per brand guide

**File Targets**:
- `frontend/src/components/onboarding/ConsentStep.tsx` (update - split checkbox label, add separate agreement text)
- `frontend/src/components/ui/button.tsx` (update - change default from `rounded-xl` to `rounded-2xl`)
- All components using `rounded-xl` on buttons (grep found 36 instances - update systematically):
  - `frontend/src/pages/Welcome.tsx` (buttons)
  - `frontend/src/pages/Onboarding.tsx` (buttons)
  - `frontend/src/components/onboarding/ConsentStep.tsx` (button)
  - `frontend/src/components/onboarding/LocationStep.tsx` (buttons)
  - `frontend/src/components/onboarding/VibeStep.tsx` (vibe cards - keep rounded-xl for cards, only buttons need rounded-2xl)
  - `frontend/src/components/panic/PanicDialog.tsx` (buttons)
  - Other button instances (verify each is a button, not a card/container)

**Required Tools**:
- React
- Tailwind CSS
- Brand voice guidelines

**Acceptance Tests**:
- [ ] Consent checkbox label: "I am 18 or older" (concise)
- [ ] Consent step shows separate text: "By continuing, you agree to use IceBreaker responsibly." (below checkbox)
- [ ] All primary/secondary buttons use `rounded-2xl` (not `rounded-xl`)
- [ ] Cards/containers can still use `rounded-xl` (only buttons standardized)
- [ ] Button component default is `rounded-2xl`
- [ ] Visual consistency: All buttons match brand guide
- [ ] Keyboard navigation still works
- [ ] Screen reader announces checkbox and agreement text correctly
- [ ] Unit tests: ConsentStep updated, all button tests pass

**Done Criteria**:
- Consent copy tightened and split correctly
- All buttons use `rounded-2xl` consistently
- Brand guide compliance verified
- Accessibility maintained
- Tests passing

**Rollback**: If button radius changes break layout, revert button.tsx default and update components individually

---

### Step 3: Bootup Random Messages Pool - Create Message Pool & Selection Logic
**Owner**: @Muse 🎨 + @Link 🌐  
**Intent**: Create a pool of random on-brand bootup messages that appeal to target demo (18+ adults in shared spaces who value control, subtlety, safety, and a vibe that doesn't try too hard)

**File Targets**:
- `frontend/src/components/custom/BootSequence.tsx` (update - replace static bootMessages array with random selection from message pool)
- `frontend/src/data/bootMessages.ts` (new - message pool with on-brand messages)

**Required Tools**:
- React
- Brand voice guidelines
- Target demo understanding (from vision.md)

**Message Pool Criteria** (from brand voice + target demo):
- Confident, succinct, slightly playful; never clingy or hypey
- Appeals to adults (18+) in shared spaces (campuses, events, coworking, neighborhoods)
- Values: control, subtlety, safety, vibe that doesn't try too hard
- Terminal/retro aesthetic (matches "terminal meets Game Boy")
- Examples of good tone: "Real world. Real time. Real connections.", "No one here — yet.", "Connection lost. Chat deleted."

**Acceptance Tests**:
- [ ] Message pool file created with 10-15 on-brand messages
- [ ] Messages match brand voice (confident, succinct, slightly playful)
- [ ] Messages appeal to target demo (adults in shared spaces)
- [ ] BootSequence randomly selects 4-5 messages from pool (one per stage)
- [ ] Messages rotate on each boot (not same sequence every time)
- [ ] Last message is always "READY" (consistent)
- [ ] Messages maintain terminal aesthetic (UPPERCASE, monospace feel)
- [ ] No messages are hypey, clingy, or off-brand
- [ ] Unit tests: BootSequence random selection works

**Done Criteria**:
- Message pool created with on-brand messages
- Random selection working
- Messages appeal to target demo
- Brand voice maintained
- Tests passing

**Rollback**: If random selection breaks, fall back to static array with original messages

---

### Step 4: Testing & Verification
**Owner**: @Pixel 🖥️  
**Intent**: Comprehensive testing of all UX fixes and bootup messages feature

**File Targets**:
- `frontend/tests/Welcome.test.tsx` (update - remove HealthStatus mocks/assertions)
- `frontend/tests/ConsentStep.test.tsx` (update - test new checkbox label and agreement text)
- `frontend/tests/BootSequence.test.tsx` (update or create - test random message selection)
- `tests/e2e/onboarding.spec.ts` (update - verify UX fixes in E2E flow)
- `tests/e2e/welcome.spec.ts` (new or update - verify Welcome screen fixes)

**Required Tools**:
- Vitest (unit tests)
- Playwright (E2E tests)
- React Testing Library
- Axe (accessibility)

**Acceptance Tests**:
- [ ] Unit tests: Welcome page (no HealthStatus)
- [ ] Unit tests: ConsentStep (new copy structure)
- [ ] Unit tests: BootSequence (random message selection)
- [ ] Unit tests: Button component (rounded-2xl default)
- [ ] E2E test: Welcome screen - No HealthStatus visible
- [ ] E2E test: Page title shows "IceBreaker"
- [ ] E2E test: Consent step - Checkbox label concise, agreement text present
- [ ] E2E test: All buttons use rounded-2xl
- [ ] E2E test: Bootup messages rotate (different messages on refresh)
- [ ] Accessibility: WCAG AA compliance maintained
- [ ] Accessibility: Keyboard navigation works
- [ ] Accessibility: Screen reader announces consent correctly
- [ ] Visual regression: No layout breaks from button radius changes
- [ ] Performance: Bootup sequence still < 3s

**Done Criteria**:
- All tests passing (unit, E2E)
- Code coverage ≥80%
- Accessibility verified (WCAG AA)
- Performance targets met
- Visual consistency verified

**Rollback**: If tests fail, revert changes step by step

---

### Step 5: Documentation & Brand Verification
**Owner**: @Muse 🎨  
**Intent**: Update documentation and verify brand consistency

**File Targets**:
- `README.md` (update - note UX improvements)
- `CHANGELOG.md` (add UX fixes and bootup messages entry)
- `.notes/ux-review-2025-01-27.md` (update - mark issues as resolved)

**Required Tools**:
- Markdown
- Brand guidelines

**Acceptance Tests**:
- [ ] README updated with UX improvements
- [ ] CHANGELOG entry added (UX fixes + bootup messages)
- [ ] UX review report updated with resolution status
- [ ] Brand voice verified: All copy matches brand examples
- [ ] Brand consistency: All buttons match brand guide
- [ ] Bootup messages align with brand voice

**Done Criteria**:
- Documentation complete
- Brand consistency verified
- UX review issues marked resolved

---

## File targets

### Frontend (Link)
- `frontend/src/pages/Welcome.tsx` (remove HealthStatus)
- `frontend/index.html` (fix title)
- `frontend/src/components/onboarding/ConsentStep.tsx` (tighten copy)
- `frontend/src/components/ui/button.tsx` (standardize radius)
- `frontend/src/pages/Welcome.tsx` (button radius)
- `frontend/src/pages/Onboarding.tsx` (button radius)
- `frontend/src/components/onboarding/LocationStep.tsx` (button radius)
- `frontend/src/components/panic/PanicDialog.tsx` (button radius)
- Other button components (systematic update)

### Frontend (Muse + Link)
- `frontend/src/components/custom/BootSequence.tsx` (random messages)
- `frontend/src/data/bootMessages.ts` (message pool)

### Tests (Pixel)
- `frontend/tests/Welcome.test.tsx` (update)
- `frontend/tests/ConsentStep.test.tsx` (update)
- `frontend/tests/BootSequence.test.tsx` (update or create)
- `tests/e2e/onboarding.spec.ts` (update)
- `tests/e2e/welcome.spec.ts` (new or update)

### Documentation (Muse)
- `README.md` (UX improvements)
- `CHANGELOG.md` (UX fixes + bootup messages)
- `.notes/ux-review-2025-01-27.md` (resolution status)

## Acceptance tests

### Step 1: Critical Brand Breaks
- [ ] HealthStatus removed from Welcome screen
- [ ] Page title shows "IceBreaker"
- [ ] No visual regressions
- [ ] Tests passing

### Step 2: UX Improvements
- [ ] Consent copy tightened and split correctly
- [ ] All buttons use `rounded-2xl` consistently
- [ ] Brand guide compliance verified
- [ ] Accessibility maintained
- [ ] Tests passing

### Step 3: Bootup Random Messages
- [ ] Message pool created with on-brand messages
- [ ] Random selection working
- [ ] Messages appeal to target demo
- [ ] Brand voice maintained
- [ ] Tests passing

### Step 4: Testing & Verification
- [ ] All tests passing (unit, E2E)
- [ ] Code coverage ≥80%
- [ ] Accessibility verified (WCAG AA)
- [ ] Performance targets met
- [ ] Visual consistency verified

### Step 5: Documentation & Brand Verification
- [ ] Documentation complete
- [ ] Brand consistency verified
- [ ] UX review issues marked resolved

## Owners
- Vector 🎯 (planning, coordination)
- Link 🌐 (frontend fixes, button radius, bootup integration)
- Muse 🎨 (bootup message pool creation, copy updates, documentation)
- Pixel 🖥️ (testing, accessibility verification, performance)
- Scout 🔎 (research complete - UX review report)

## Implementation Notes
- **Status**: Planning phase - Ready for team review
- **Approach**: Frontend-only fixes (no backend changes)
- **Testing**: Comprehensive unit, integration, and E2E tests
- **Dependencies**: None (standalone UX improvements)
- **Enables**: Better brand consistency, improved UX, enhanced bootup experience

## Risks & Open questions

### Risks
- **Button Radius Changes**: Changing `rounded-xl` to `rounded-2xl` may affect layout in some components (cards vs buttons distinction needed)
- **HealthStatus Removal**: May break existing tests that mock HealthStatus component
- **Random Messages**: Need to ensure messages don't repeat too often or feel stale

### Open Questions
- **Button vs Card Distinction**: Should cards/containers keep `rounded-xl` while only buttons use `rounded-2xl`? (Recommendation: Yes, per brand guide - buttons are `rounded-2xl`, cards can be `rounded-xl`)
- **Message Pool Size**: How many messages should be in the pool? (Recommendation: 10-15 messages, select 4-5 per boot)
- **Message Selection**: Should messages be truly random or weighted to avoid repetition? (Recommendation: Simple random for MVP, can add weighting later if needed)

## MCP Tools Required
- **GitHub MCP**: Issue tracking, branch creation
- **Playwright MCP** (optional): Accessibility checks (axe), screenshots for visual regression

## Handoffs
- **After Step 1**: Link hands off brand fixes to Pixel for testing
- **After Step 2**: Link + Muse hand off UX improvements to Pixel for testing
- **After Step 3**: Muse + Link hand off bootup messages to Pixel for testing
- **After Step 4**: Pixel hands off test results to Muse for documentation
- **After Step 5**: Issue #9 complete - ready for next feature

---

**Plan Status**: ⏳ **AWAITING TEAM REVIEW**

**Summary**:
- Issue #9: UX Review Fixes + Bootup Random Messages
- Plan: 5 steps
- Research: ✅ Complete (UX review report: `.notes/ux-review-2025-01-27.md`)
- **NEXT**: Team review required before implementation begins

**Team Involvement**:
- ✅ Scout 🔎: Research complete (UX review report)
- ✅ Vector 🎯: Plan created
- ⏳ **Team Review**: Required before implementation
- ⏭️ Link 🌐: Steps 1-2 (Frontend fixes, button radius)
- ⏭️ Muse 🎨: Step 2-3 (Copy updates, bootup messages)
- ⏭️ Pixel 🖥️: Step 4 (Testing)
- ⏭️ Muse 🎨: Step 5 (Documentation)
