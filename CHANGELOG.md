# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

#### MVP: Integration Testing & Launch Preparation (Issue #4)
- Cross-browser testing: Added Firefox and Edge browser projects to Playwright config for comprehensive cross-browser E2E testing
- Accessibility compliance: WCAG AA compliance verified across all pages using axe-core
- Security audit: Dependency vulnerability scan complete, no high/critical vulnerabilities in production dependencies
- Error tracking: Sentry configured for frontend and backend error tracking and performance monitoring
- CI/CD verification: GitHub Actions CI updated with cross-browser matrix strategy, deployment workflow created
- Deployment guide: Comprehensive deployment documentation with rollback procedures (`docs/deployment.md`)
- Launch checklist: Pre-launch, launch day, and post-launch checklists (`docs/launch-checklist.md`)

**Technical Details**:
- Cross-browser: Firefox and Edge projects added to `tests/playwright.config.ts`, CI matrix strategy for all browsers
- Accessibility: AxeBuilder tests added to all E2E test files, WCAG AA tags (`wcag2a`, `wcag2aa`, `wcag21aa`)
- Security: `npm audit` run on root, backend, and frontend (moderate vulnerabilities in dev dependencies only, low risk)
- Error tracking: Sentry React SDK (frontend), Sentry Node SDK (backend), Error Boundary component, error handler middleware
- CI/CD: `.github/workflows/deploy.yml` created with frontend/backend deployment jobs (platform-agnostic)
- Documentation: Connection Guide updated with Sentry configuration, deployment guide with platform options

**Verified**:
- ✅ Cross-browser tests configured (Chromium, Firefox, Edge)
- ✅ Accessibility tests passing (WCAG AA compliance)
- ✅ Security audit complete (no high/critical vulnerabilities)
- ✅ Sentry error tracking configured (frontend + backend)
- ✅ CI/CD pipeline verified (GitHub Actions)
- ✅ Deployment workflow ready (platform-agnostic)

See `docs/Plan.md` for complete implementation plan and acceptance criteria.

#### MVP: UX Review Fixes + Bootup Random Messages (Issue #7)
- Critical brand fixes: Removed HealthStatus component from Welcome screen, fixed page title to "IceBreaker"
- UX improvements: Tightened consent checkbox copy (split into "I am 18 or older" + separate agreement text), standardized all button border radius to `rounded-2xl` per brand guide
- Bootup random messages: Expanded message pool to 106 on-brand messages with random selection (4 messages + "READY" per boot sequence)
- Message categories: Technical but playful, Relatable to shared spaces, Playful but not trying too hard, Witty terminal vibes, Subtle and confident
- Brand compliance: All buttons now use `rounded-2xl` consistently across Welcome, Onboarding, LocationStep, ConsentStep, and PanicDialog components
- Test updates: ConsentStep test updated to match new checkbox label structure

**Technical Details**:
- Frontend: Welcome page cleanup, ConsentStep copy restructure, button component default radius update, BootSequence random message selection
- Message pool: `frontend/src/data/bootMessages.ts` with 106 messages, `selectBootMessages()` function for random selection
- Button standardization: Updated `frontend/src/components/ui/button.tsx` default from `rounded-xl` to `rounded-2xl`, updated 8+ button instances across components
- Page title: Changed from "Icebreaker Health Check" to "IceBreaker" in `frontend/index.html`

**Verified**:
- ✅ HealthStatus removed from Welcome screen (no dev-only content visible)
- ✅ Page title shows "IceBreaker" in browser tab
- ✅ Consent checkbox label is concise ("I am 18 or older") with separate agreement text
- ✅ All buttons use `rounded-2xl` consistently (brand guide compliance)
- ✅ Bootup messages randomly selected from 106-message pool
- ✅ ConsentStep test updated and passing
- ✅ No visual regressions from button radius changes

See `docs/Plan.md` for complete implementation plan and acceptance criteria.

#### MVP: Chat Request Cooldowns (Issue #6)
- Cooldown system: Session-level cooldowns after 3 declined chat invites within 10 minutes
- Cooldown duration: 30 minutes default (configurable 15-60 min via environment variables)
- Cooldown enforcement: Users cannot send chat requests during active cooldown
- Signal Engine integration: Users in cooldown appear lower in Radar results (soft sort-down, -5 per decline, max -15 penalty)
- Frontend feedback: Cooldown notice with countdown timer in PersonCard, toast notification on attempt
- Configuration: Tunable parameters in `backend/src/config/cooldown-config.js` (threshold, window, duration, weights)
- WebSocket error handling: Cooldown errors include `cooldownExpiresAt` and `cooldownRemainingMs` for frontend display
- Unit tests: CooldownManager (26 tests), ChatManager integration (25 tests), Signal Engine (21 tests), useCooldown hook (7 tests)
- E2E tests: Cooldown flow verification (5 tests)

**Technical Details**:
- Backend: CooldownManager service, ChatManager integration, Signal Engine decline penalty, WebSocket error payloads
- Frontend: useCooldown hook, PersonCard cooldown UI, toast notifications, countdown timer
- Configuration: `COOLDOWN_DECLINE_THRESHOLD`, `COOLDOWN_DECLINE_WINDOW_MS`, `COOLDOWN_DURATION_MS`, `COOLDOWN_W_DECLINE`, `COOLDOWN_MAX_DECLINE_PENALTY`
- Session fields: `declineCount`, `declinedInvites[]`, `cooldownExpiresAt`
- Signal weight: `w_decline: -5` (configurable via `SIGNAL_WEIGHT_DECLINE`)

**Verified**:
- ✅ Cooldown triggers after 3 declines in 10 minutes
- ✅ Cooldown prevents chat requests during active period
- ✅ Signal Engine soft sort-down working (users appear lower, not excluded)
- ✅ Frontend cooldown feedback with countdown timer
- ✅ All backend tests passing (81 tests)
- ✅ All frontend hook tests passing (7 tests)
- ✅ E2E tests created (5 tests)

See `docs/Plan.md` for complete implementation plan and acceptance criteria.

#### MVP: Profile/Settings Page (Issue #5)
- Profile page: Accessible from Radar and Chat headers, displays handle, visibility toggle, emergency contact, and accessibility settings
- Visibility toggle: Users can show/hide themselves on Radar (persisted in session)
- Emergency contact: Users can add phone (E.164) or email (RFC 5322) for Panic Button notifications
- Accessibility toggles: Reduced-motion and high-contrast modes with LocalStorage persistence
- API endpoints: `PUT /api/profile/visibility`, `PUT /api/profile/emergency-contact` (requires Authorization header)
- Session updates: Visibility and emergency contact stored in session (in-memory for MVP)
- Keyboard navigation: All interactive elements accessible via keyboard (Tab, Enter, Space, Escape)
- WCAG AA compliance: ARIA labels, screen reader support, keyboard navigation, high-contrast mode meets contrast ratios
- Unit tests: Profile endpoints (21/21), SessionManager updates (7/7)

**Technical Details**:
- Backend: Profile routes (`/api/profile/visibility`, `/api/profile/emergency-contact`), SessionManager updates (`updateSessionVisibility`, `updateEmergencyContact`)
- Frontend: Profile page (`/profile`), VisibilityToggle component, EmergencyContactInput component, AccessibilityToggles component
- Hooks: `useProfile` (API calls), `useAccessibility` (LocalStorage persistence)
- Validation: Phone (E.164: `+1234567890`), Email (RFC 5322: `user@example.com`)
- Accessibility: Reduced-motion disables animations, high-contrast adjusts theme variables (WCAG AA compliant)
- LocalStorage keys: `icebreaker:reduced-motion`, `icebreaker:high-contrast`

**Verified**:
- ✅ Profile page accessible from Radar and Chat headers
- ✅ Visibility toggle updates session and shows toast confirmation
- ✅ Emergency contact validates phone/email format and saves to session
- ✅ Accessibility toggles persist in LocalStorage and apply CSS classes
- ✅ Reduced-motion disables animations (`.reduced-motion` class)
- ✅ High-contrast mode meets WCAG AA contrast ratios (4.5:1 normal, 3:1 large)
- ✅ All unit tests passing: Backend (21/21), Frontend components created
- ✅ WCAG AA compliance verified (ARIA labels, keyboard nav, high-contrast)

See `docs/Plan.md` for complete implementation plan and acceptance criteria.

#### MVP: Block/Report (Safety Controls) (Issue #4)
- Block functionality: Users can block others from Chat header (⋯ menu) or PersonCard (tap-hold/right-click)
- Report functionality: Users can report others with categories (Harassment, Spam, Impersonation, Other)
- Safety exclusion: Users with ≥3 unique reports temporarily hidden from Radar (1 hour default)
- Signal Engine integration: Reported users (1-2 unique reports) appear lower in Radar results (negative weight: -3 per reporter)
- Authentication: All safety endpoints require session token (Authorization header)
- Duplicate prevention: Can't block/report yourself, can't duplicate reports from same reporter
- Privacy-first: No message content stored, only report metadata (category, timestamp, reporterId, targetId)
- Chat header menu: ⋯ button with Block/Report options (keyboard accessible)
- PersonCard tap-hold: Long-press (500ms) or right-click opens Block/Report menu
- Keyboard alternatives: Shift+Enter opens menu in PersonCard, Escape/Enter in dialogs
- WCAG AA compliance: ARIA labels, keyboard navigation, screen reader support
- Unit tests: Safety endpoints (19/19), SafetyManager (14/14), ReportManager (16/16), Signal Engine report penalty (17/17)

**Technical Details**:
- Backend: SafetyManager service, ReportManager service, authentication middleware, safety routes
- Frontend: BlockDialog, ReportDialog components, useSafety hook, ChatHeader menu, PersonCard tap-hold
- API endpoints: `POST /api/safety/block`, `POST /api/safety/report` (requires Authorization header)
- Report storage: In-memory Map (MVP) with unique reporter tracking
- Safety exclusion threshold: 3 unique reporters (configurable in SafetyManager)
- Signal Engine penalty: `w_report = -3` per unique reporter (configurable in signal-weights.js)
- Block behavior: Ends active chat if target is current partner, adds to blockedSessionIds array

**Verified**:
- ✅ Block endpoint requires authentication and validates inputs
- ✅ Report endpoint requires authentication, validates category, prevents duplicates
- ✅ Safety exclusion triggered when ≥3 unique reporters report same target
- ✅ Signal Engine applies negative weight for reported users (1-2 reports)
- ✅ Block ends chat when target is current partner
- ✅ Chat header menu accessible (keyboard navigation, ARIA labels)
- ✅ PersonCard tap-hold works (touch, mouse, right-click, keyboard)
- ✅ All unit tests passing: Backend (66/66), Frontend tests created
- ✅ WCAG AA compliance verified (ARIA labels, keyboard nav)

See `docs/Plan.md` for complete implementation plan and acceptance criteria.

#### MVP: Panic Button (Emergency Exit & Safety) (Issue #3)
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

#### MVP: Chat (Ephemeral 1:1 Messaging) (Issue #2)
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

#### MVP: Radar View (Proximity-Based Presence Visualization) (Issue #1)
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

## [0.1.0] - 2025-11-11

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
