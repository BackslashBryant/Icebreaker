# Plan

_Active feature: **Panic Button (Emergency Exit & Safety)** (`panic-button`)_  
_Source spec: GitHub Issue #5 - https://github.com/BackslashBryant/Icebreaker/issues/5_

## Goals
- GitHub Issue: #5 (Panic Button)
- Target User: Adults (18+) using Radar or Chat who need a quick, calm way to exit and alert contacts if they feel unsafe
- Problem: Users need an always-accessible emergency exit button that immediately ends their session, alerts emergency contacts, and temporarily hides them from Radar
- Desired Outcome: Fixed FAB accessible from Radar and Chat screens that ends session, optionally alerts contacts, and triggers safety exclusion
- Success Metrics:
  - Panic accessible in < 1 tap from any screen
  - Session termination in < 500ms
  - Safety exclusion duration: 1 hour (configurable)
  - Emergency contact notification (if configured) within 5 seconds
- Research Status: ✅ **COMPLETE** - See `docs/research.md` (2025-11-10: Panic Button Implementation)

## Out-of-scope
- Full Settings page for emergency contacts (post-MVP - can use session storage for MVP)
- SMS/email notification infrastructure (post-MVP - can use simple webhook/API for MVP)
- Appeals flow (post-MVP)
- Panic analytics/reporting dashboard (post-MVP)

## Steps (5-7)

### Step 1: Backend Panic Handler
**Owner**: @Forge 🔗  
**Intent**: Implement panic handler that sets safety flag, ends active chat, and triggers safety exclusion

**File Targets**:
- `backend/src/services/PanicManager.js` (new)
- `backend/src/websocket/handlers.js` (update - add `panic:trigger` handler)
- `backend/src/services/SessionManager.js` (update - add `panicSession` function)
- `backend/src/services/ChatManager.js` (update - integrate panic termination)

**Required Tools**:
- Node.js + Express.js
- WebSocket server (existing)
- Session management (existing)

**Acceptance Tests**:
- [ ] Panic handler receives `panic:trigger` WebSocket message
- [ ] Sets `safetyFlag = true` on session
- [ ] Ends active chat if in progress (calls `endChat` with reason `panic`)
- [ ] Sets safety exclusion expiration timestamp (default: 1 hour from now)
- [ ] Returns success confirmation to client
- [ ] Unit tests: Panic handler logic (≥80% coverage)

**Done Criteria**:
- Panic handler implemented and tested
- Safety flag set correctly
- Active chat terminated gracefully
- Safety exclusion timestamp stored

**Rollback**: If complexity blocks, simplify to basic safety flag only, add exclusion duration later

---

### Step 2: Safety Exclusion Logic
**Owner**: @Forge 🔗  
**Intent**: Implement safety exclusion expiration and automatic cleanup

**File Targets**:
- `backend/src/services/SessionManager.js` (update - add `panicExclusionExpiresAt` field, expiration check)
- `backend/src/services/SignalEngine.js` (update - check exclusion expiration in addition to safetyFlag)

**Required Tools**:
- Session management (existing)
- Signal Engine (existing)

**Acceptance Tests**:
- [ ] Safety exclusion expires after configured duration (default: 1 hour)
- [ ] Signal Engine excludes sessions with active safety exclusion
- [ ] Expired exclusions automatically clear (safetyFlag reset to false)
- [ ] Unit tests: Exclusion expiration logic (≥80% coverage)

**Done Criteria**:
- Safety exclusion expiration working
- Signal Engine integration complete
- Automatic cleanup implemented

**Rollback**: If expiration complexity blocks, use permanent safety flag until session expires

---

### Step 3: Frontend PanicButton FAB Component
**Owner**: @Link 🌐  
**Intent**: Create fixed floating action button accessible from Radar and Chat screens

**File Targets**:
- `frontend/src/components/panic/PanicButton.tsx` (new - FAB component)
- `frontend/src/pages/Radar.tsx` (update - add PanicButton)
- `frontend/src/pages/Chat.tsx` (update - add PanicButton)

**Required Tools**:
- React + Vite
- shadcn/ui Button component
- lucide-react icons (AlertTriangle)
- Tailwind CSS

**Acceptance Tests**:
- [ ] PanicButton FAB visible on Radar screen (fixed bottom-right)
- [ ] PanicButton FAB visible on Chat screen (fixed bottom-right)
- [ ] FAB styling matches brand (red/destructive, pulsing animation)
- [ ] Keyboard accessible (Enter to trigger, Escape to cancel)
- [ ] Screen reader announces "Emergency panic button"
- [ ] Unit tests: PanicButton component (≥80% coverage)

**Done Criteria**:
- PanicButton FAB component implemented
- Accessible from Radar and Chat
- Accessibility verified (WCAG AA)

**Rollback**: If FAB complexity blocks, use regular button in header/navigation

---

### Step 4: Panic Confirmation Flow
**Owner**: @Link 🌐  
**Intent**: Implement confirmation dialog and success state for panic flow

**File Targets**:
- `frontend/src/components/panic/PanicDialog.tsx` (new - confirmation dialog)
- `frontend/src/components/panic/PanicSuccess.tsx` (new - success state)
- `frontend/src/hooks/usePanic.ts` (new - panic state management)
- `frontend/src/pages/Radar.tsx` (update - integrate panic flow)
- `frontend/src/pages/Chat.tsx` (update - integrate panic flow)

**Required Tools**:
- React + Vite
- shadcn/ui Dialog component
- WebSocket client (existing)

**Acceptance Tests**:
- [ ] User taps Panic → Confirmation dialog appears ("Everything okay?")
- [ ] User confirms → WebSocket sends `panic:trigger` message
- [ ] Success state shows: "You're safe. Session ended." + notification details
- [ ] User redirected to Welcome screen after panic
- [ ] Keyboard navigation works (Enter to confirm, Escape to cancel)
- [ ] Screen reader announces confirmation and success states
- [ ] Unit tests: Panic flow components (≥80% coverage)

**Done Criteria**:
- Panic confirmation flow implemented
- Success state working
- Navigation after panic working
- Accessibility verified

**Rollback**: If dialog complexity blocks, use simple inline confirmation

---

### Step 5: Emergency Contact Storage (MVP)
**Owner**: @Forge 🔗 + @Link 🌐  
**Intent**: Add optional emergency contact storage in session (simple MVP - full Settings page post-MVP)

**File Targets**:
- `backend/src/services/SessionManager.js` (update - add `emergencyContacts` field)
- `frontend/src/components/panic/PanicDialog.tsx` (update - show contact notification status)

**Required Tools**:
- Session management (existing)
- Simple storage (in-memory for MVP)

**Acceptance Tests**:
- [ ] Emergency contacts stored in session (array of { name, phone/email })
- [ ] Panic dialog shows contact notification status
- [ ] Success state shows which contacts were notified
- [ ] MVP: No actual notification sent (just UI indication - post-MVP: SMS/email integration)

**Done Criteria**:
- Emergency contact storage working
- UI shows notification status
- Ready for post-MVP notification integration

**Rollback**: If contact storage blocks, defer entirely to post-MVP

---

### Step 6: Testing & Accessibility
**Owner**: @Pixel 🖥️  
**Intent**: Comprehensive testing and accessibility verification

**File Targets**:
- `backend/tests/panic-manager.test.js` (new - unit tests)
- `frontend/tests/PanicButton.test.tsx` (new - component tests)
- `frontend/tests/PanicDialog.test.tsx` (new - dialog tests)
- `tests/e2e/panic.spec.ts` (new - E2E tests)

**Required Tools**:
- Vitest (unit tests)
- Playwright (E2E tests)
- React Testing Library
- Axe (accessibility)

**Acceptance Tests**:
- [ ] Unit tests: Panic handler (≥80% coverage)
- [ ] Unit tests: Panic components (≥80% coverage)
- [ ] E2E test: Panic flow from Radar screen
- [ ] E2E test: Panic flow from Chat screen
- [ ] E2E test: Safety exclusion hides user from Radar
- [ ] Accessibility: WCAG AA compliance verified
- [ ] Performance: Panic trigger < 500ms

**Done Criteria**:
- All tests passing (unit, E2E)
- Code coverage ≥80%
- Accessibility verified (WCAG AA)
- Performance targets met

**Rollback**: If test gaps found, document and create follow-up issues

---

### Step 7: Documentation & Handoff
**Owner**: @Muse 🎨  
**Intent**: Update documentation and prepare handoff

**File Targets**:
- `README.md` (update - Panic Button section)
- `CHANGELOG.md` (add Panic Button feature entry)
- `docs/ConnectionGuide.md` (update - panic WebSocket message type)
- `.notes/features/panic-button/progress.md` (mark complete)

**Required Tools**:
- Reference `docs/vision.md` for Panic context
- Reference `Docs/Vision/IceBreaker — Safety & Moderation Vision.txt`

**Acceptance Tests**:
- [ ] README updated with Panic Button description
- [ ] CHANGELOG entry added: "MVP: Panic Button (Emergency Exit & Safety)"
- [ ] Connection Guide updated: `panic:trigger` WebSocket message type
- [ ] Progress tracker updated: All stages marked complete

**Done Criteria**:
- Documentation updated and accurate
- CHANGELOG entry concise and factual
- Connection Guide accurate

**Rollback**: If documentation gaps found, update before marking complete

---

## File targets

### Backend (Forge)
- `backend/src/services/PanicManager.js` (panic handler)
- `backend/src/websocket/handlers.js` (panic WebSocket handler)
- `backend/src/services/SessionManager.js` (panic session updates, exclusion expiration)
- `backend/src/services/SignalEngine.js` (safety exclusion check)
- `backend/src/services/ChatManager.js` (panic chat termination)

### Frontend (Link)
- `frontend/src/components/panic/PanicButton.tsx` (FAB component)
- `frontend/src/components/panic/PanicDialog.tsx` (confirmation dialog)
- `frontend/src/components/panic/PanicSuccess.tsx` (success state)
- `frontend/src/hooks/usePanic.ts` (panic state management)
- `frontend/src/pages/Radar.tsx` (integrate PanicButton)
- `frontend/src/pages/Chat.tsx` (integrate PanicButton)

### Tests (Pixel)
- `backend/tests/panic-manager.test.js` (panic handler tests)
- `frontend/tests/PanicButton.test.tsx` (FAB component tests)
- `frontend/tests/PanicDialog.test.tsx` (dialog tests)
- `tests/e2e/panic.spec.ts` (E2E panic flow tests)

### Documentation (Muse)
- `README.md` (Panic Button section)
- `CHANGELOG.md` (feature entry)
- `docs/ConnectionGuide.md` (WebSocket message type)

## Acceptance tests

### Step 1: Backend Panic Handler
- [ ] Panic handler receives WebSocket message
- [ ] Safety flag set correctly
- [ ] Active chat terminated
- [ ] Unit tests ≥80% coverage

### Step 2: Safety Exclusion Logic
- [ ] Exclusion expiration working
- [ ] Signal Engine excludes correctly
- [ ] Automatic cleanup working
- [ ] Unit tests ≥80% coverage

### Step 3: Frontend PanicButton FAB
- [ ] FAB visible on Radar and Chat
- [ ] Styling matches brand
- [ ] Accessibility verified (WCAG AA)
- [ ] Unit tests ≥80% coverage

### Step 4: Panic Confirmation Flow
- [ ] Confirmation dialog working
- [ ] Success state working
- [ ] Navigation after panic working
- [ ] Unit tests ≥80% coverage

### Step 5: Emergency Contact Storage
- [ ] Contact storage working
- [ ] UI shows notification status
- [ ] Ready for post-MVP integration

### Step 6: Testing & Accessibility
- [ ] All tests passing
- [ ] Code coverage ≥80%
- [ ] WCAG AA compliance verified
- [ ] Performance targets met

### Step 7: Documentation
- [ ] README updated
- [ ] CHANGELOG entry added
- [ ] Connection Guide updated

## Owners
- Vector 🎯 (planning, coordination)
- Forge 🔗 (panic handler, safety exclusion, backend integration)
- Link 🌐 (PanicButton FAB, confirmation flow, frontend integration)
- Pixel 🖥️ (testing, accessibility, performance verification)
- Muse 🎨 (documentation)
- Scout 🔎 (research - ✅ COMPLETE)

## Implementation Notes
- **Status**: Planning phase - Research complete, ready for implementation
- **Approach**: Backend-first (panic handler, safety exclusion), then frontend (FAB, confirmation flow)
- **Testing**: Comprehensive unit, integration, and E2E tests
- **Dependencies**: Issue #2 (Radar View), Issue #4 (Chat) - Panic accessible from both screens
- **Enables**: Safety moderation features (safety exclusion, Signal Engine integration)

## Risks & Open questions

### Risks
- **Emergency Contact Notifications**: MVP may need to defer actual SMS/email sending to post-MVP
- **Safety Exclusion Duration**: Default 1 hour may need tuning based on user feedback
- **Panic False Positives**: Need to monitor and adjust confirmation flow if too many accidental triggers

### Open Questions
- **Emergency Contact Storage**: Full Settings page (post-MVP) or simple session storage (MVP)?
- **Notification Infrastructure**: SMS/email service integration (post-MVP) or webhook/API (MVP)?
- **Safety Exclusion Duration**: Is 1 hour appropriate, or should it be configurable per user?

## MCP Tools Required
- **GitHub MCP**: Issue tracking, branch creation
- **Playwright MCP** (optional): Accessibility checks (axe), screenshots

## Handoffs
- **After Step 1**: Forge hands off panic handler to Link for frontend integration
- **After Step 2**: Forge hands off safety exclusion to Pixel for verification
- **After Step 3**: Link hands off PanicButton FAB to Pixel for testing
- **After Step 4**: Link hands off confirmation flow to Pixel for verification
- **After Step 5**: Forge/Link hands off emergency contacts to Pixel for testing
- **After Step 6**: Pixel hands off to Muse for documentation
- **After Step 7**: Issue #5 complete - ready for next feature

---

**Plan Status**: ✅ **PLANNING COMPLETE - READY FOR IMPLEMENTATION**

**Summary**:
- Issue #5: https://github.com/BackslashBryant/Icebreaker/issues/5
- Research: ✅ Complete (see `docs/research.md`)
- Plan: 7 steps - Ready for implementation
- Next: Begin Step 1 (Backend Panic Handler)

**Team Involvement**:
- ✅ Scout 🔎: Research complete
- ✅ Vector 🎯: Plan created
- ⏭️ Forge 🔗: Steps 1-2 (Panic Handler, Safety Exclusion)
- ⏭️ Link 🌐: Steps 3-4 (PanicButton FAB, Confirmation Flow)
- ⏭️ Pixel 🖥️: Step 6 (Testing, Accessibility)
- ⏭️ Muse 🎨: Step 7 (Documentation)
