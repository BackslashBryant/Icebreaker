# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

#### MVP: Panic Button (Emergency Exit & Safety) (Issue #5)
- Fixed floating action button (FAB): Always accessible from Radar and Chat screens
- Panic confirmation flow: "Everything okay?" dialog with calm, reassuring copy
- Safety exclusion: Temporarily hides user from Radar for 1 hour (configurable)
- Session termination: Immediately ends active chat and clears session
- Success state: "You're safe. Session ended." with notification details
- Keyboard navigation: Escape to cancel, Enter to confirm
- WCAG AA compliance: ARIA labels, screen reader support, keyboard navigation
- Unit tests: PanicManager (21/21), Panic components (18/18), usePanic hook (9/9)

**Technical Details**:
- Backend: PanicManager service, WebSocket panic handler, safety exclusion logic
- Frontend: PanicButton FAB, PanicDialog, PanicSuccess components, `usePanic` hook
- WebSocket protocol: `panic:trigger` (client → server), `panic:triggered` (server → client)
- Safety exclusion: Sets `safetyFlag` and `panicExclusionExpiresAt` on session
- Exclusion duration: Default 1 hour (configurable in `backend/src/services/PanicManager.js`)
- Signal Engine integration: Excludes sessions with active panic exclusion from Radar results
- Auto-cleanup: Safety flag cleared when exclusion expires

**Verified**:
- ✅ Panic button accessible from Radar and Chat screens
- ✅ Confirmation dialog shows "Everything okay?" (brand copy)
- ✅ Session termination ends active chat immediately
- ✅ Safety exclusion hides user from Radar for configured duration
- ✅ Success state displays notification details
- ✅ Keyboard navigation (Escape/Enter) works correctly
- ✅ All unit tests passing: Backend (21/21), Frontend (27/27)
- ✅ WCAG AA compliance verified (ARIA labels, keyboard nav)

See `docs/Plan.md` for complete implementation plan and acceptance criteria.

#### MVP: Chat (Ephemeral 1:1 Messaging) (Issue #3)
- Terminal-style chat interface: black background, teal monospace text, `[HH:MM]` timestamps
- Ephemeral messaging: no storage, no history, messages relayed via WebSocket only
- Chat request flow: one-tap initiation from Radar, accept/decline handling
- Real-time message relay via WebSocket (`chat:message` message type)
- Rate limiting: max 10 messages/minute per chat (configurable in `backend/src/lib/rate-limiter.js`)
- Proximity monitoring: automatic chat termination when distance >100m
- Proximity warning: shows "Signal weak — chat may end." when distance >80m
- One-chat-at-a-time enforcement: both sessions must have `activeChatPartnerId === null`
- Chat termination: user-initiated (`chat:end`) or proximity-based (`proximity_lost`)
- ASCII dividers between message bursts (>5 minute gap)
- Keyboard navigation: Enter to send, Escape to end chat
- WCAG AA compliance: ARIA labels, screen reader support, keyboard navigation
- Unit tests: ChatManager (21/21), RateLimiter (7/7), Chat components (14/14)

**Technical Details**:
- Backend: ChatManager service, RateLimiter utility, WebSocket chat handlers
- Frontend: Chat page (`/chat`), ChatMessage, ChatInput, ChatHeader components, `useChat` hook
- WebSocket protocol: `chat:request`, `chat:accept`, `chat:decline`, `chat:message`, `chat:end`, `chat:accepted`, `chat:declined`, `chat:request:ack`
- Chat state management: `activeChatPartnerId` in SessionManager
- Proximity thresholds: Warning at 80m, termination at 100m (configurable)
- Rate limit: 10 messages/minute per chat (1-minute sliding window)

**Verified**:
- ✅ Chat request validates target session and enforces one-chat-at-a-time
- ✅ Accept/decline flow updates both sessions correctly
- ✅ Message relay works with rate limiting
- ✅ Proximity monitoring terminates chats when distance >100m
- ✅ Terminal-style UI matches brand aesthetic
- ✅ Keyboard navigation and screen reader support working
- ✅ All unit tests passing: Backend (117/117), Frontend (14/14 Chat tests)
- ✅ WCAG AA compliance verified

See `docs/Plan.md` for complete implementation plan and acceptance criteria.

#### MVP: Radar View (Proximity-Based Presence Visualization) (Issue #2)
- CRT-style radar sweep visualization with retro aesthetic
- Accessible list view for keyboard navigation and screen readers
- Real-time WebSocket connection for radar updates (`ws://localhost:8000/ws?token=<sessionToken>`)
- Signal Engine service for compatibility scoring (vibe match, shared tags, visibility, proximity)
- Proximity calculation using Haversine formula (ROOM, VENUE, NEARBY, FAR tiers)
- Location integration with browser Geolocation API (approximate location, 30s updates)
- Person card component showing handle, vibe, tags, signal score, and proximity
- View toggle between sweep and list modes
- Safety exclusions (sessions with safety flags excluded from radar results)
- WCAG AA compliance: ARIA labels, keyboard navigation, reduced motion support, screen reader announcements
- Unit tests: Signal Engine (13/13), Proximity Utils (11/11), WebSocket (10/10), Radar components (31/31)
- E2E test scaffold with accessibility checks (Playwright + Axe)

**Technical Details**:
- Backend: WebSocket server on `/ws` endpoint, Signal Engine service, proximity utilities
- Frontend: `useRadar` hook, `useWebSocket` hook, `useLocation` hook, Radar components
- WebSocket protocol: `radar:subscribe`, `location:update`, `chat:request`, `radar:update`, `connected`, `error`
- Signal weights: Configurable in `backend/src/config/signal-weights.js`
- Proximity thresholds: ROOM (10m), VENUE (100m), NEARBY (1000m), FAR (>1000m)
- Location privacy: Approximate coordinates only (3 decimal places ≈ 100m precision)

**Verified**:
- ✅ Radar view displays people sorted by compatibility score
- ✅ CRT sweep visualization renders correctly with reduced motion support
- ✅ List view is keyboard navigable and screen reader friendly
- ✅ WebSocket connection establishes and maintains heartbeat
- ✅ Location updates trigger radar recalculation
- ✅ Person card displays correct information
- ✅ Safety flags exclude sessions from results
- ✅ All unit tests passing: Backend (37/37), Frontend (31/31)
- ✅ WCAG AA compliance verified (ARIA labels, keyboard nav, reduced motion)

See `docs/Plan.md` for complete implementation plan and acceptance criteria.

#### MVP Onboarding Flow (Issue #1)
- Welcome screen with retro logo, brand moment ("Real world. Real time. Real connections."), and CTAs
- 4-step onboarding flow: What We Are/Not → 18+ Consent → Location Explainer → Vibe & Tags
- Backend onboarding API endpoint (`POST /api/onboarding`) with session management
- In-memory session storage with TTL (1 hour default)
- Anonymous handle generation from vibe + tags (e.g., "ChillWit42")
- React Router setup with routes: `/welcome`, `/onboarding`, `/radar`
- shadcn/ui components (Button, Checkbox) with Icebreaker brand styling
- Tailwind CSS with Icebreaker brand colors (deep navy, neon teal)
- Unit tests for onboarding components (≥80% coverage target)
- E2E test for complete onboarding flow with accessibility checks

### Technical Details
- Frontend: React + Vite + React Router + shadcn/ui (Radix UI)
- Backend: Express.js with session management (in-memory Map with TTL cleanup)
- Session tokens: Signed tokens (MVP), JWT for production
- Location: Browser Geolocation API (approximate only, skip option available)
- Accessibility: WCAG AA compliance via Radix UI primitives
- Testing: Vitest for unit tests, Playwright for E2E tests

### Verified
- ✅ Welcome screen displays brand moment and CTAs
- ✅ All 4 onboarding steps render and function correctly
- ✅ Form validation prevents submission without required fields
- ✅ Keyboard navigation works throughout (WCAG AA)
- ✅ Screen reader support (ARIA labels)
- ✅ Geolocation API integration works (with skip option)
- ✅ Handle generation from vibe + tags
- ✅ API integration: Success navigates to Radar, errors displayed
- ✅ `POST /api/onboarding` accepts valid request and returns session
- ✅ Session storage works (in-memory Map with TTL)
- ✅ TTL cleanup removes expired sessions
- ✅ Error handling: 400 for invalid data, 500 for server errors
- ✅ All tests passing: Backend (15/15), Frontend (35/35), E2E (8/8)
- ✅ Code coverage: 94.74% average for onboarding components (target: ≥80%)
- ✅ WCAG AA compliance: Verified via Playwright axe checks

### Test Results
- **Backend unit tests**: 15/15 passing (health, SessionManager, onboarding API)
- **Frontend unit tests**: 35/35 passing (Welcome, Onboarding, all step components)
- **E2E tests**: 8/8 passing (complete flow, accessibility, keyboard nav, error handling)
- **Code coverage**: Onboarding components average 94.74% (above 80% target)
- **Accessibility**: WCAG AA compliance verified (axe checks pass)

See `.notes/features/onboarding-flow/gap-analysis.md` for complete DoD verification.

## [0.1.0] - 2025-01-27

### Added

#### Bootstrap Web Health MVP
- Backend health endpoint (`GET /api/health`) returning `{ status: "ok" }`
- Frontend health status component displaying API response
- Test suite: 7 tests (2 backend unit, 2 frontend unit, 3 E2E)
- Express.js backend on port 8000 with CORS enabled
- React + Vite frontend on port 3000 with API proxy
- Vitest configuration for unit tests
- Playwright configuration for E2E tests

### Technical Details
- Backend: Express.js server with health route
- Frontend: React component with fetch API integration
- Testing: Vitest for unit tests, Playwright for E2E
- Ports: Backend 8000, Frontend 3000 (documented in `docs/ConnectionGuide.md`)

### Verified
- ✅ Health API returns JSON `{ status: "ok" }`
- ✅ Frontend renders health status with passing tests
- ✅ Playwright smoke test covers API + UI

See `.notes/features/bootstrap-web-health-mvp/progress.md` for full test results and implementation details.
