# Plan

_Active feature: **Radar View (Proximity-Based Presence Visualization)** (`radar-view`)_  
_Source spec: GitHub Issue #2 - https://github.com/BackslashBryant/Icebreaker/issues/2_

## Goals
- GitHub Issue: #2 (Radar View)
- Target User: Adults (18+) who completed onboarding, want to discover nearby connections
- Problem: Users need a way to see who's open nearby, sorted by lightweight compatibility (vibe match, shared tags, proximity) without pressure or profiles
- Desired Outcome: Radar View displays proximity-based presence visualization (CRT sweep or accessible list) with Signal Engine integration, sorted by compatibility score. Users can initiate chats with one tap.
- Success Metrics:
  - Performance: Radar updates in < 1s
  - Accessibility: WCAG AA compliance (keyboard nav, screen reader, reduced-motion)
  - Test Coverage: ≥80% unit/integration coverage
  - User Experience: One-tap chat initiation, empty states handled gracefully
- Research Status: ✅ **COMPLETE** - See `docs/research.md` (2025-11-06: Radar View Implementation Research)

## Out-of-scope
- Chat functionality (Issue #3 - separate feature, but one-tap chat initiation is in scope)
- Panic button implementation (Issue #4 - separate feature, but FAB placeholder is in scope)
- Block/Report full implementation (Issue #5 - separate feature, but 2-tap access is in scope)
- Profile/Settings page (Issue #6 - separate feature)
- Social enrichment via OAuth (post-MVP)
- Personality/archetype mode (post-MVP)

## Steps (5-7)

### Step 1: Signal Engine Service Implementation
**Owner**: @Forge 🔗  
**Intent**: Implement Signal Engine compatibility scoring algorithm with tunable weights, safety exclusions, and proximity calculation

**File Targets**:
- `backend/src/services/SignalEngine.js` (new)
- `backend/src/lib/proximity-utils.js` (new - distance calculation)
- `backend/src/config/signal-weights.js` (new - tunable weights config)
- `backend/src/services/SessionManager.js` (update - add safety flag checks)

**Required Tools**:
- Node.js + Express.js
- Haversine formula or simple distance calculation for proximity tiers
- Config file for tunable weights (JSON or JS module)

**Acceptance Tests**:
- [ ] Signal Engine calculates score correctly: `score(A,B) = w_vibe * VIBE_MATCH + w_tag * MIN(shared_tags, 3) + w_vis * VISIBILITY_ON + w_tagless * TAGLESS + w_dist * PROXIMITY_TIER`
- [ ] Default weights applied: `w_vibe = +10`, `w_tag = +5` (max 3), `w_vis = +3`, `w_tagless = -5`, `w_dist = +2`
- [ ] Safety exclusion: Recent panic → exclude from results
- [ ] Tie-breakers: Stable random seed per session + alphabetical handle
- [ ] Proximity tiers calculated correctly (coarse buckets: room/venue/nearby)
- [ ] Unit tests: ≥80% coverage for Signal Engine service
- [ ] Config file: Weights tunable without code changes

**Done Criteria**:
- Signal Engine service implemented and tested
- Config file for tunable weights created
- Unit tests passing with ≥80% coverage
- Proximity calculation working correctly

**Rollback**: If Signal Engine complexity blocks, simplify to basic vibe match + proximity only, iterate later

---

### Step 2: WebSocket Server & Radar Updates
**Owner**: @Forge 🔗  
**Intent**: Implement WebSocket server for real-time radar updates, connection management, and message handling

**File Targets**:
- `backend/src/websocket/server.js` (new)
- `backend/src/websocket/handlers.js` (new - message handlers)
- `backend/src/routes/websocket.js` (new - WebSocket route)
- `backend/src/server.js` (update - integrate WebSocket server)
- `backend/src/services/SessionManager.js` (update - WebSocket connection tracking)

**Required Tools**:
- `ws` package (Node.js WebSocket server)
- Express.js (HTTP upgrade to WebSocket)
- Session token validation

**Acceptance Tests**:
- [ ] WebSocket connection: `wss://api.icebreaker.app/ws?token=<sessionToken>`
- [ ] Message types: `radar:subscribe`, `radar:update`, `chat:request`, `location:update`
- [ ] Server messages: `radar:update` with sorted people array (Signal Engine scores)
- [ ] Heartbeat: Ping-pong pattern for connection health
- [ ] Session validation: Invalid token → connection rejected
- [ ] Connection lifecycle: Cleanup on disconnect
- [ ] Integration tests: WebSocket connection + radar updates
- [ ] Performance: Radar updates sent in < 1s

**Done Criteria**:
- WebSocket server implemented and tested
- Message protocol defined and documented
- Integration tests passing
- Performance target met (< 1s updates)

**Rollback**: If WebSocket complexity blocks, use polling as fallback (not ideal, but functional)

---

### Step 3: Radar UI Components (Frontend)
**Owner**: @Link 🌐  
**Intent**: Implement Radar View with CRT sweep visualization, list view toggle, empty states, and accessibility

**File Targets**:
- `frontend/src/pages/Radar.tsx` (new)
- `frontend/src/components/radar/RadarSweep.tsx` (new - CRT sweep visualization)
- `frontend/src/components/radar/RadarList.tsx` (new - accessible list view)
- `frontend/src/components/radar/PersonCard.tsx` (new - selected person card)
- `frontend/src/hooks/useWebSocket.ts` (new - WebSocket connection hook)
- `frontend/src/hooks/useRadar.ts` (new - Radar state management)
- `frontend/src/lib/websocket-client.ts` (new - WebSocket client utilities)

**Required Tools**:
- React + Vite
- shadcn/ui components (Button, Dialog for person card)
- Tailwind CSS (brand colors: deep navy/charcoal, neon teal)
- Browser WebSocket API

**Acceptance Tests**:
- [ ] Radar view displays: CRT sweep OR accessible list (user toggle)
- [ ] WebSocket connection: Establishes on Radar mount with session token
- [ ] Radar updates: Receives `radar:update` messages and displays people
- [ ] Signal display: Higher score → closer to center / stronger pulse
- [ ] Empty state: "No one here — yet." when no nearby sessions
- [ ] GPS denied: Clear, dignified permission state
- [ ] Selected person: Card shows handle, vibe, tags, signal score
- [ ] One-tap chat: "START CHAT →" button initiates chat request
- [ ] Accessibility: WCAG AA compliance (keyboard nav, screen reader, reduced-motion)
- [ ] View toggle: Switch between radar/list view modes
- [ ] Unit tests: ≥80% coverage for Radar components

**Done Criteria**:
- Radar UI components implemented and tested
- WebSocket connection working
- Accessibility verified (WCAG AA)
- Unit tests passing with ≥80% coverage

**Rollback**: If CRT sweep complexity blocks, start with list view only, add sweep later

---

### Step 4: Location & Proximity Integration
**Owner**: @Link 🌐 + @Forge 🔗  
**Intent**: Integrate browser Geolocation API, proximity calculation, and location updates via WebSocket

**File Targets**:
- `frontend/src/hooks/useLocation.ts` (new - browser Geolocation API hook)
- `frontend/src/lib/location-utils.ts` (new - location helpers)
- `backend/src/lib/proximity-utils.js` (update - proximity tier calculation)
- `backend/src/services/SignalEngine.js` (update - proximity tier integration)

**Required Tools**:
- Browser Geolocation API (native)
- Distance calculation (Haversine formula or simple distance)
- WebSocket `location:update` message

**Acceptance Tests**:
- [ ] Location permission: Requested on Radar mount (if not already granted)
- [ ] Approximate location: Captured and sent via `location:update` WebSocket message
- [ ] Proximity tiers: Calculated correctly (room/venue/nearby)
- [ ] GPS denied: Graceful fallback (reduced experience, no proximity matching)
- [ ] Location updates: Sent periodically (every 30-60s) or on significant movement
- [ ] Privacy: No precise coordinates stored (approximate only)
- [ ] Integration tests: Location updates trigger radar recalculation

**Done Criteria**:
- Location integration working
- Proximity tiers calculated correctly
- Privacy requirements met (approximate location only)
- Integration tests passing

**Rollback**: If location complexity blocks, defer proximity matching, use visibility-only sorting

---

### Step 5: Accessibility & Testing
**Owner**: @Pixel 🖥️ + @Link 🌐  
**Intent**: Verify WCAG AA compliance, keyboard navigation, screen reader support, and comprehensive test coverage

**File Targets**:
- `frontend/src/pages/Radar.tsx` (update - accessibility improvements)
- `frontend/src/components/radar/RadarSweep.tsx` (update - reduced-motion support)
- `frontend/src/components/radar/RadarList.tsx` (update - ARIA labels)
- `tests/e2e/radar.spec.ts` (new - E2E tests)
- `frontend/tests/Radar.test.tsx` (new - unit tests)
- `backend/tests/signal-engine.test.js` (new - unit tests)
- `backend/tests/websocket.test.js` (new - integration tests)

**Required Tools**:
- Playwright (E2E tests, accessibility checks with axe)
- Vitest (unit tests)
- React Testing Library (component tests)
- Axe (accessibility testing)

**Acceptance Tests**:
- [ ] WCAG AA compliance: Axe checks pass on Radar view
- [ ] Keyboard navigation: All interactive elements navigable via keyboard
- [ ] Screen reader: ARIA labels present on dots, list items, buttons
- [ ] Reduced motion: Sweeps, blinks, pulses disabled when `prefers-reduced-motion`
- [ ] High contrast: Text contrast meets WCAG AA (brighten teal if needed)
- [ ] E2E test: Onboarding → Radar → Chat initiation flow
- [ ] Unit tests: Signal Engine (≥80%), Radar components (≥80%)
- [ ] Integration tests: WebSocket connection + radar updates
- [ ] Performance test: Radar updates < 1s (measured)

**Done Criteria**:
- Accessibility verified (WCAG AA)
- All tests passing (unit, integration, E2E)
- Code coverage ≥80%
- Performance targets met

**Rollback**: If accessibility gaps found, document and create follow-up issues

---

### Step 6: Documentation & Handoff
**Owner**: @Muse 🎨  
**Intent**: Update documentation (README, CHANGELOG, Connection Guide) and prepare handoff to Issue #3 (Chat)

**File Targets**:
- `README.md` (update - Radar View section)
- `CHANGELOG.md` (add Radar View feature entry)
- `docs/ConnectionGuide.md` (update - WebSocket endpoint, Signal Engine config)
- `.notes/features/radar-view/progress.md` (mark complete)
- `docs/architecture/ARCHITECTURE_TEMPLATE.md` (update - Radar Module details)

**Required Tools**:
- Reference `docs/vision.md` for Radar context
- Reference `docs/research.md` for implementation details
- Reference `docs/architecture/ARCHITECTURE_TEMPLATE.md` for API contracts

**Acceptance Tests**:
- [x] README updated with Radar View description
- [x] CHANGELOG entry added: "MVP: Radar View (Proximity-Based Presence Visualization)"
- [x] Connection Guide updated: WebSocket endpoint (`ws://localhost:8000/ws?token=<sessionToken>`)
- [x] Connection Guide updated: Signal Engine config file location
- [x] Progress tracker updated: All stages marked complete
- [x] Handoff notes: Issue #3 (Chat) can now proceed (one-tap chat initiation ready)

**Done Criteria**:
- Documentation updated and accurate
- CHANGELOG entry concise and factual
- Connection Guide accurate
- Handoff ready for Issue #3

**Rollback**: If documentation gaps found, update before marking complete

---

### Step 7: Integration & Performance Verification
**Owner**: @Pixel 🖥️  
**Intent**: Verify end-to-end Radar flow meets performance targets and integration with onboarding

**File Targets**:
- `tests/e2e/onboarding-radar.spec.ts` (new - full flow E2E test)
- `.notes/features/radar-view/performance.md` (new - performance results)

**Required Tools**:
- Playwright (E2E tests, performance timing)
- Performance timing APIs

**Acceptance Tests**:
- [x] E2E test: Onboarding → Radar navigation (< 30s total)
- [x] E2E test: Radar updates in < 1s (measured from WebSocket message to UI update)
- [x] E2E test: Signal Engine sorting visible (higher scores appear first)
- [x] E2E test: One-tap chat initiation works (button click → chat request sent)
- [x] Performance: Radar view loads in < 2s
- [x] Performance: WebSocket connection established in < 500ms
- [x] Performance: Signal Engine calculation for 100 sessions < 100ms

**Done Criteria**:
- ✅ All performance targets met (< 1s updates, < 2s load, < 500ms connection)
- ✅ E2E tests implemented and ready
- ✅ Performance results documented

**Rollback**: If performance targets not met, document bottlenecks and create optimization plan

---

## File targets

### Frontend (Link)
- `frontend/src/pages/Radar.tsx` (main Radar page)
- `frontend/src/components/radar/RadarSweep.tsx` (CRT sweep visualization)
- `frontend/src/components/radar/RadarList.tsx` (accessible list view)
- `frontend/src/components/radar/PersonCard.tsx` (selected person card)
- `frontend/src/hooks/useWebSocket.ts` (WebSocket connection hook)
- `frontend/src/hooks/useRadar.ts` (Radar state management)
- `frontend/src/hooks/useLocation.ts` (browser Geolocation API hook)
- `frontend/src/lib/websocket-client.ts` (WebSocket client utilities)
- `frontend/src/lib/location-utils.ts` (location helpers)

### Backend (Forge)
- `backend/src/services/SignalEngine.js` (compatibility scoring algorithm)
- `backend/src/lib/proximity-utils.js` (distance calculation, proximity tiers)
- `backend/src/config/signal-weights.js` (tunable weights config)
- `backend/src/websocket/server.js` (WebSocket server)
- `backend/src/websocket/handlers.js` (WebSocket message handlers)
- `backend/src/routes/websocket.js` (WebSocket route)
- `backend/src/server.js` (update - integrate WebSocket)
- `backend/src/services/SessionManager.js` (update - safety flags, WebSocket tracking)

### Tests (Pixel)
- `tests/e2e/radar.spec.ts` (Radar E2E tests)
- `tests/e2e/onboarding-radar.spec.ts` (full flow E2E test)
- `frontend/tests/Radar.test.tsx` (Radar component unit tests)
- `backend/tests/signal-engine.test.js` (Signal Engine unit tests)
- `backend/tests/websocket.test.js` (WebSocket integration tests)

### Documentation (Muse)
- `README.md` (Radar View section)
- `CHANGELOG.md` (feature entry)
- `docs/ConnectionGuide.md` (WebSocket endpoint, Signal Engine config)
- `docs/architecture/ARCHITECTURE_TEMPLATE.md` (Radar Module details)

## Acceptance tests

### Step 1: Signal Engine
- [ ] Scoring formula correct
- [ ] Default weights applied
- [ ] Safety exclusions work
- [ ] Proximity tiers calculated
- [ ] Unit tests ≥80% coverage

### Step 2: WebSocket Server
- [ ] Connection established with token
- [ ] Message types handled correctly
- [ ] Radar updates sent in < 1s
- [ ] Heartbeat pattern working
- [ ] Integration tests passing

### Step 3: Radar UI
- [ ] CRT sweep OR list view (toggle)
- [ ] WebSocket connection working
- [ ] Signal display correct
- [ ] Empty states handled
- [ ] One-tap chat initiation
- [ ] Accessibility verified (WCAG AA)
- [ ] Unit tests ≥80% coverage

### Step 4: Location Integration
- [ ] Location permission requested
- [ ] Approximate location captured
- [ ] Proximity tiers calculated
- [ ] GPS denied handled gracefully
- [ ] Privacy requirements met

### Step 5: Accessibility & Testing
- [ ] WCAG AA compliance
- [ ] Keyboard navigation
- [ ] Screen reader support
- [ ] Reduced motion support
- [ ] All tests passing (unit, integration, E2E)
- [ ] Code coverage ≥80%

### Step 6: Documentation
- [x] README updated
- [x] CHANGELOG entry added
- [x] Connection Guide updated
- [x] Handoff ready for Issue #3

### Step 7: Integration & Performance
- [x] Onboarding → Radar flow works
- [x] Radar updates < 1s
- [x] Performance targets met
- [x] E2E tests implemented

## Owners
- Vector 🎯 (planning, coordination)
- Forge 🔗 (Signal Engine, WebSocket server, backend integration)
- Link 🌐 (Radar UI components, WebSocket client, location integration)
- Pixel 🖥️ (testing, accessibility, performance verification)
- Muse 🎨 (documentation)
- Scout 🔎 (research - ✅ COMPLETE)

## Implementation Notes
- **Status**: Planning phase - Research complete, ready for implementation
- **Approach**: Backend-first (Signal Engine + WebSocket), then frontend (Radar UI), then integration
- **Testing**: Comprehensive unit, integration, and E2E tests
- **Dependencies**: Issue #1 (Onboarding Flow) - Session creation required
- **Enables**: Issue #3 (Chat) - One-tap chat initiation ready

## Risks & Open questions

### Risks
- **WebSocket Complexity**: Connection management, reconnection logic, heartbeat pattern
- **Signal Engine Tuning**: Default weights may need A/B testing
- **Proximity Accuracy**: Approximate location may be less accurate than desired
- **Accessibility**: CRT sweep visualization may be challenging for reduced-motion users

### Open Questions
- **Proximity Tiers**: Exact distance thresholds for room/venue/nearby buckets?
- **Location Update Frequency**: How often to send location updates (every 30s? 60s? on movement?)?
- **Signal Engine Weights**: Do default weights need adjustment based on user behavior?
- **WebSocket Scaling**: How to handle multiple backend instances (Redis pub/sub for future)?

## MCP Tools Required
- **GitHub MCP**: Issue tracking, branch creation
- **Playwright MCP** (optional): Accessibility checks (axe), screenshots
- **Desktop Commander MCP**: Port management, server startup

## Handoffs
- **After Step 1**: Forge hands off Signal Engine to Link for frontend integration
- **After Step 2**: Forge hands off WebSocket server to Link for client connection
- **After Step 3**: Link hands off Radar UI to Pixel for testing
- **After Step 4**: Link/Forge hands off location integration to Pixel for verification
- **After Step 5**: Pixel hands off to Muse for documentation
- **After Step 6**: Issue #2 complete - ready for Issue #3 (Chat) implementation
- **After Step 7**: Final verification complete

---

**Plan Status**: ✅ **IMPLEMENTATION COMPLETE - STEP 7 VERIFIED**

**Summary**:
- Issue #2: https://github.com/BackslashBryant/Icebreaker/issues/2
- Research: ✅ Complete (see `docs/research.md`)
- Plan: 7 steps - ✅ All complete
- Implementation: ✅ All steps complete
- Testing: ✅ Unit, integration, E2E, security, edge cases, performance tests complete
- Performance: ✅ All targets met
- Documentation: ✅ Complete
- Next: Ready for Issue #3 (Chat) implementation

**Team Involvement**:
- ✅ Scout 🔎: Research complete
- ✅ Vector 🎯: Plan created and coordinated
- ✅ Forge 🔗: Steps 1-2 complete (Signal Engine, WebSocket)
- ✅ Link 🌐: Steps 3-4 complete (Radar UI, Location)
- ✅ Pixel 🖥️: Steps 5, 7 complete (Testing, Performance)
- ✅ Muse 🎨: Step 6 complete (Documentation)
