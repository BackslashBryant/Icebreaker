# Architecture Overview - Icebreaker MVP

**Last Updated**: 2025-11-10
**Status**: Planning Phase - MVP Architecture
**Reference**: `docs/vision.md`, `docs/research.md`, `docs/architecture/monorepo-decision.md`

---

## 1. Product Snapshot

**Problem Statement**:
Adults (18+) in shared spaces want lightweight, authentic contact without committing to identity performance. Other social apps are loud, performative, and permanent. IceBreaker offers a quiet, ephemeral alternative — a moment of connection, not a feed or forever.

**Primary Users**:
- Adults (18+) in shared spaces (campuses, events, coworking spots, dense neighborhoods)
- Values: control, subtlety, safety, vibe that doesn't try too hard
- Need: Real-world connection without social graphs, profiles, or permanence

**Success Criteria**:
- **Onboarding**: User reaches Radar in **under 30 seconds** (decisive user)
- **Understanding**: New user understands premise **within 10 seconds** on Welcome screen
- **Chat Start**: First chat is **one tap** and feels instant
- **Safety KPIs**: Report rate < 1% of sessions; Panic false-positive rate < 1%
- **Performance**: Chat starts in < 500ms; Radar updates in < 1s
- **Test Coverage**: ≥80% unit/integration coverage; Playwright smoke tests for critical flows
- **Accessibility**: WCAG AA compliance; reduced-motion and high-contrast modes work consistently
- **Brand Vibe**: Every screen feels like "terminal meets Game Boy" — deep navy/charcoal base, neon teal accents, IBM Plex Mono/Space Mono typography

---

## 2. Stack & Tooling

**Frontend Framework / Libraries**:
- **Framework**: React 19 + Vite 4 (SPA, fast dev experience, no SSR overhead needed)
- **Component Library**: shadcn/ui (Radix UI primitives) - WCAG AA compliant, framework-agnostic
- **Styling**: Tailwind CSS 4 (with custom IceBreaker brand colors: `oklch(0.7 0.12 195)` for neon teal)
- **Typography**: Space Mono / IBM Plex Mono (monospace for terminal aesthetic)
- **State Management**: React hooks (useState, useEffect) for MVP; consider Zustand if complexity grows
- **Routing**: React Router (client-side routing for SPA)
- **Real-time Client**: Native WebSocket API (browser WebSocket for chat/radar updates)

**Backend / API / Services**:
- **Runtime**: Node.js 20+
- **Framework**: Express.js (minimal, mature, good WebSocket support)
- **WebSocket Server**: `ws` package (bidirectional real-time communication)
- **Session Management**: `express-session` with in-memory store (MVP), Redis adapter (production scaling)
- **API Style**: RESTful endpoints for non-real-time operations (onboarding, profile, safety)

**Data Storage / Messaging**:
- **Session Storage (MVP)**: In-memory Map with TTL cleanup (ephemeral, no persistence)
- **Session Storage (Production)**: Redis with TTL expiration (horizontal scaling, automatic cleanup)
- **Safety Metadata Store**: Database (Postgres/SQLite) - stores only: report category, timestamp, anonymized session IDs, NO message content
- **Message Storage**: **NONE** - Messages are ephemeral, never persisted (WebSocket real-time only)

**Hosting / Deployment Targets**:
- **Frontend**: Static hosting (Vercel, Netlify, or similar) - SPA build
- **Backend**: Node.js hosting (Vercel Serverless Functions, Railway, Render, or similar)
- **WebSocket Server**: Same backend instance (Express.js + ws package) or separate WebSocket service
- **Session Store**: In-memory (MVP), Redis cloud (production)

**Third-party Integrations**:
- **Location Services**: Browser Geolocation API (native, no third-party service)
- **OAuth Providers** (Post-MVP): Spotify, Reddit, X (Twitter) - for social enrichment tag suggestions
- **No analytics or tracking** (privacy-first design)

**Design Reference**:
- **Mock Folder**: `Docs/Vision/ui_ux_mocks/` - Design reference for component patterns, styling, UI flows
- Extract patterns: BootSequence, PanicButton, RetroHeader, Scanlines, ASCII dividers
- Brand colors and typography from mock CSS variables

---

## 3. Module Breakdown

| Layer / Module | Responsibility | Key interfaces / contracts | Notes |
| --- | --- | --- | --- |
| **Frontend Packages** ||||
| `frontend/` | React SPA, UI components, routing | `src/App.tsx`, `src/routes/`, `src/components/` | React + Vite, shadcn/ui components |
| `frontend/src/components/ui/` | shadcn/ui base components | Button, Checkbox, Input, Dialog, etc. | Radix UI primitives, WCAG AA compliant |
| `frontend/src/components/custom/` | IceBreaker-specific components | BootSequence, PanicButton, RetroHeader, Scanlines | Terminal aesthetic, brand styling |
| `frontend/src/pages/` | Route components | Welcome, Onboarding, Radar, Chat, Profile | Core user flows |
| `frontend/src/hooks/` | Custom React hooks | `useWebSocket`, `useLocation`, `useSignalEngine` | Reusable logic |
| `frontend/src/lib/` | Utilities | WebSocket client, location helpers, username generator | Shared utilities |
| **Backend Packages** ||||
| `backend/` | Express.js API server, WebSocket server | `src/server.ts`, `src/routes/`, `src/websocket/` | Node.js + Express + ws |
| `backend/src/routes/` | REST API endpoints | `/api/onboarding`, `/api/profile`, `/api/safety` | Non-real-time operations |
| `backend/src/websocket/` | WebSocket connection handler | Chat messages, radar updates, session lifecycle | Real-time bidirectional communication |
| `backend/src/services/` | Business logic | SignalEngine, SessionManager, SafetyService | Core algorithms |
| `backend/src/storage/` | Session storage abstraction | InMemoryStore (MVP), RedisStore (production) | Ephemeral session data |
| **Shared Package** ||||
| `shared/` | TypeScript types, contracts | `src/types/`, `src/contracts/` | Shared between frontend/backend |
| `shared/src/types/` | TypeScript interfaces | Session, Message, Vibe, Tag, Signal | Type safety across packages |
| `shared/src/contracts/` | API contracts | WebSocket message formats, REST request/response | Contract definitions |

**Module Responsibilities**:

1. **Onboarding Module** (`frontend/src/pages/onboarding/`):
   - Welcome screen (brand moment, clear CTAs)
   - 18+ Consent (single checkbox)
   - Location Explainer (approximate location, skip option)
   - Vibe & Tags selection (5 vibes, optional tags, visibility toggle)

2. **Radar Module** (`frontend/src/pages/radar/`):
   - Proximity-based presence visualization (CRT sweep style or accessible list view)
   - Signal Engine integration (lightweight compatibility scoring)
   - One-tap chat initiation

3. **Chat Module** (`frontend/src/pages/chat/`):
   - Terminal-style ephemeral 1:1 messaging
   - WebSocket connection management
   - Message display (no history, no persistence)
   - Proximity monitoring (chat ends when proximity breaks)

4. **Signal Engine** (`backend/src/services/SignalEngine.ts`):
   - Lightweight compatibility scoring (vibe match, shared tags, visibility, proximity, safety)
   - Sorted radar display (highest signal first)
   - Default weights (tunable, may need A/B testing)

5. **Safety Module** (`backend/src/services/SafetyService.ts`):
   - Block/Report handling (from Radar and Chat)
   - Rate limiting (cooldowns after failed/declined invites)
   - Safety exclusions (Panic or multiple unique reports → temporary hidden from Radar)
   - Safety metadata storage (reports only, no message content)

6. **Session Management** (`backend/src/storage/`):
   - Session creation (onboarding completion)
   - Session data (user ID hashed, vibe, tags, visibility, approximate location, active chat partner)
   - TTL cleanup (automatic expiration for ephemeral behavior)
   - No message content storage

---

## 4. Data Flow

### Core Scenario 1: Onboarding → Radar → Chat

**Sequence**:
1. **Welcome Screen** (Frontend):
   - User lands on `/welcome`
   - Brand moment (logo, tagline, boot sequence optional)
   - User clicks "PRESS START" → navigates to `/onboarding`

2. **Onboarding Flow** (Frontend):
   - Step 1: "What is IceBreaker?" explainer (What We Are / What We're Not)
   - Step 2: 18+ Consent (single checkbox, required)
   - Step 3: Location Explainer (approximate location, skip option)
   - Step 4: Vibe & Tags (required vibe, optional tags, visibility toggle)
   - Frontend generates anonymous handle from vibe + tags
   - On completion → `POST /api/onboarding` with session data

3. **Session Creation** (Backend):
   - `POST /api/onboarding` creates session:
     - Session ID (hashed)
     - Vibe, tags, visibility
     - Approximate location (if granted)
     - TTL (1 hour default)
   - Returns session token to frontend
   - Session stored in-memory (MVP) or Redis (production)

4. **Radar View** (Frontend + Backend):
   - Frontend establishes WebSocket connection with session token
   - Backend Signal Engine calculates compatibility scores for all visible sessions
   - Backend sends radar updates via WebSocket (sorted by signal strength)
   - Frontend displays proximity visualization (CRT sweep or list view)
   - User can toggle between radar/list view (accessibility)

5. **Chat Initiation** (Frontend + Backend):
   - User taps person on radar → `WebSocket.send({ type: 'chat:request', targetSessionId })`
   - Backend validates (one-chat-at-a-time, safety checks, proximity)
   - Backend sends chat acceptance to target user
   - If accepted → WebSocket connection upgraded to chat mode
   - Both users' active chat partner ID updated in session

6. **Chat Communication** (Frontend + Backend):
   - Messages sent via WebSocket: `{ type: 'chat:message', text, timestamp }`
   - Backend broadcasts to chat partner (no storage, ephemeral)
   - Frontend displays messages in terminal-style UI
   - Proximity monitoring: if proximity breaks → chat ends automatically
   - Chat end: `{ type: 'chat:end', reason: 'proximity_lost' }`

7. **Chat End** (Frontend + Backend):
   - WebSocket connection returns to radar mode
   - Session updated (active chat partner ID cleared)
   - Frontend shows "Connection lost. Chat deleted." message
   - No message history persisted

### Core Scenario 2: Safety Controls (Block/Report/Panic)

**Sequence**:
1. **Block/Report** (Frontend + Backend):
   - User taps block/report from Radar or Chat
   - Frontend: `POST /api/safety/block` or `POST /api/safety/report`
   - Backend stores safety metadata (report category, timestamp, session IDs, NO message content)
   - Backend updates session (blocked users list, report count)
   - Safety exclusions applied (multiple unique reports → hidden from Radar temporarily)

2. **Panic Button** (Frontend + Backend):
   - User taps always-accessible FAB (fixed bottom-right)
   - Frontend: `POST /api/safety/panic` + emergency contact notification
   - Backend: Immediate session termination, safety exclusion applied
   - Frontend: Navigate to safety screen, clear all session data
   - Emergency contact notified (SMS/email if configured)

### Cross-cutting Concerns

- **Auth**: Session-based (no OAuth for MVP). Session token stored in memory (no persistence)
- **Logging**: Minimal logging (session events, safety events). No message content logging
- **Observability**: Health endpoint (`GET /api/health`). Future: Error tracking (Sentry), performance monitoring
- **Location Privacy**: Approximate location only (browser Geolocation API). No precise coordinates stored. Session-scoped only.

---

## 5. API & Contract Map

### REST Endpoints

**Onboarding**:
- `POST /api/onboarding`
  - **Request**: `{ vibe: string, tags: string[], visibility: boolean, location?: { lat: number, lng: number } }`
  - **Response**: `{ sessionId: string, token: string, handle: string }`
  - **Errors**: `400` (invalid data), `500` (server error)

**Profile**:
- `GET /api/profile` (requires session token)
  - **Response**: `{ handle: string, vibe: string, tags: string[], visibility: boolean }`
- `PUT /api/profile` (requires session token)
  - **Request**: `{ vibe?: string, tags?: string[], visibility?: boolean }`
  - **Response**: `{ success: boolean }`

**Safety**:
- `POST /api/safety/block` (requires session token)
  - **Request**: `{ targetSessionId: string }`
  - **Response**: `{ success: boolean }`
- `POST /api/safety/report` (requires session token)
  - **Request**: `{ targetSessionId: string, category: 'harassment' | 'spam' | 'impersonation' | 'other' }`
  - **Response**: `{ success: boolean }`
- `POST /api/safety/panic` (requires session token)
  - **Request**: `{ emergencyContact?: string }`
  - **Response**: `{ success: boolean }`

**Health**:
- `GET /api/health`
  - **Response**: `{ status: "ok" }`

### WebSocket Protocol

**Connection**:
- Client connects: `wss://api.icebreaker.app/ws?token=<sessionToken>`
- Server validates token, establishes session connection

**Message Types** (Client → Server):
- `{ type: 'radar:subscribe' }` - Subscribe to radar updates
- `{ type: 'chat:request', targetSessionId: string }` - Request chat with user
- `{ type: 'chat:accept', requestId: string }` - Accept chat request
- `{ type: 'chat:decline', requestId: string }` - Decline chat request
- `{ type: 'chat:message', text: string, timestamp: number }` - Send chat message
- `{ type: 'chat:end' }` - End current chat
- `{ type: 'location:update', location: { lat: number, lng: number } }` - Update approximate location

**Message Types** (Server → Client):
- `{ type: 'radar:update', people: Person[] }` - Radar proximity updates (sorted by signal)
  - `Person: { sessionId: string, handle: string, vibe: string, tags: string[], signal: number }`
- `{ type: 'chat:request', fromSessionId: string, fromHandle: string }` - Incoming chat request
- `{ type: 'chat:accepted', chatId: string }` - Chat request accepted
- `{ type: 'chat:declined' }` - Chat request declined
- `{ type: 'chat:message', text: string, timestamp: number, sender: 'me' | 'them' }` - Chat message
- `{ type: 'chat:end', reason: 'proximity_lost' | 'user_exit' | 'error' }` - Chat ended
- `{ type: 'error', code: string, message: string }` - Error notification

**Error Shapes**:
- `{ error: { code: string, message: string, details?: any } }`
- Common codes: `INVALID_TOKEN`, `SESSION_EXPIRED`, `CHAT_LIMIT`, `PROXIMITY_LOST`, `SAFETY_BLOCKED`

---

## 6. State & Storage

### Session Storage (Ephemeral)

**Storage Type**: In-memory Map (MVP), Redis with TTL (production)

**Data Stored**:
- `sessionId` (hashed, unique)
- `handle` (auto-generated from vibe + tags)
- `vibe` (required: "banter", "intros", "thinking", "killing-time", "surprise")
- `tags` (optional string array)
- `visibility` (boolean - show on radar)
- `location` (approximate: `{ lat: number, lng: number }`, last updated timestamp)
- `activeChatPartnerId` (session ID of current chat partner, null if no active chat)
- `createdAt` (timestamp)
- `expiresAt` (timestamp - TTL: 1 hour default)
- `blockedSessionIds` (array of blocked session IDs)
- `reportCount` (number of unique reports received)

**Access Patterns**:
- **Write**: Session creation (onboarding), location updates, chat state changes
- **Read**: Signal Engine (radar scoring), chat validation, safety checks
- **TTL**: Automatic expiration (in-memory timer cleanup or Redis TTL)
- **No persistence**: Data lost on server restart (ephemeral by design)

**Consistency**: Eventual consistency (single-instance MVP, Redis for multi-instance production)

### Safety Metadata Store (Persistent)

**Storage Type**: Database (Postgres/SQLite) - separate from session store

**Data Stored**:
- `reportId` (unique identifier)
- `reporterSessionId` (hashed, anonymized)
- `accusedSessionId` (hashed, anonymized)
- `category` ("harassment" | "spam" | "impersonation" | "other")
- `timestamp` (when report was made)
- `resolved` (boolean - for future appeals process)

**Access Patterns**:
- **Write**: Report creation (block/report endpoints)
- **Read**: Safety exclusions (check report count for session), appeals (post-MVP)
- **NO message content**: Reports never include message content (privacy-first)

**Consistency**: ACID transactions (database ensures data integrity)

### Message Storage

**Storage Type**: **NONE** - Messages are never stored (ephemeral by design)

**Rationale**: Privacy-first design. Messages exist only in WebSocket connection memory during active chat. No persistence layer for messages.

---

## 7. Testing Strategy

### Unit Test Focus Areas

**Frontend** (Vitest + React Testing Library):
- Component rendering (Welcome, Onboarding steps, Radar, Chat)
- User interactions (button clicks, form submissions, keyboard navigation)
- Accessibility (ARIA labels, keyboard navigation, screen reader support)
- WebSocket client hooks (`useWebSocket` - connection management, message handling)
- Location helpers (approximate location calculation, distance)

**Backend** (Vitest):
- Signal Engine (compatibility scoring algorithm, weight calculations)
- Session Management (creation, TTL cleanup, expiration)
- Safety Service (block/report logic, safety exclusions, rate limiting)
- WebSocket message handlers (chat request/accept/decline, message broadcasting)
- API routes (onboarding, profile, safety endpoints)

**Shared** (Vitest):
- Type validation (TypeScript types, contract validation)
- Utility functions (username generation, location helpers)

### Integration / E2E Approach

**E2E Tests** (Playwright):
- **Critical Flows**:
  1. Onboarding → Radar → Chat (happy path)
  2. Chat end (proximity lost, user exit)
  3. Block/Report (from Radar and Chat)
  4. Panic button (emergency exit)
  5. Accessibility flows (keyboard navigation, screen reader)

**Tooling**:
- **Unit Tests**: Vitest (fast, Vite-native)
- **Component Tests**: React Testing Library + Vitest
- **E2E Tests**: Playwright (browser automation, accessibility checks with axe)
- **Accessibility**: Playwright MCP (axe checks for WCAG AA compliance)

**Coverage Target**: ≥80% unit/integration coverage

---

## 8. Security & Compliance

### Auth/Authz Approach

**Session-Based Auth** (no OAuth for MVP):
- Session token generated on onboarding completion
- Token stored in memory (no persistence, ephemeral)
- WebSocket connection validated with session token
- Session expiration (TTL: 1 hour default)

**Authorization**:
- Session-scoped access (users can only access their own session data)
- Safety checks (blocked users cannot chat, reported users may be excluded)
- Rate limiting (cooldowns after failed/declined invites)

### Secrets & Configuration Handling

**Environment Variables**:
- `SESSION_SECRET` (session token signing)
- `REDIS_URL` (production - optional for MVP)
- `DATABASE_URL` (safety metadata store)
- `EMERGENCY_CONTACT_SERVICE` (SMS/email service for panic button - future)

**Secrets Management**:
- Never commit `.env` files
- Use `env.example` template
- GitHub Actions secrets for CI/CD (future)
- No API keys needed for MVP (browser Geolocation API is native)

### Threat Model / Notable Risks

**Privacy Risks**:
- **Location Privacy**: Mitigated by approximate location only, no precise coordinates stored
- **Message Content**: Mitigated by no message storage (ephemeral WebSocket only)
- **Session Data**: Mitigated by TTL expiration, no persistence (MVP)

**Safety Risks**:
- **Harassment**: Mitigated by block/report system, safety exclusions, rate limiting
- **Spam**: Mitigated by one-chat-at-a-time, rate limiting, cooldowns
- **Impersonation**: Mitigated by anonymous handles (no verification for MVP)

**Technical Risks**:
- **WebSocket Connection Drops**: Mitigated by reconnection logic (client-side)
- **Session Expiration**: Mitigated by TTL cleanup, graceful session end
- **Proximity Accuracy**: Mitigated by approximate location, soft proximity matching

**Compliance**:
- **18+ Only**: Explicit age confirmation required (onboarding step)
- **GDPR/CCPA**: Minimal data collection (session-scoped, ephemeral, no message storage)
- **Accessibility**: WCAG AA compliance (shadcn/ui Radix UI primitives, manual testing)

---

## 9. Operations

### Deployment Pipeline

**Frontend** (Static SPA):
- Build: `npm run build` (Vite production build)
- Deploy: Static hosting (Vercel, Netlify, or similar)
- CDN: Automatic (static assets cached)

**Backend** (Node.js + Express):
- Build: TypeScript compilation
- Deploy: Node.js hosting (Vercel Serverless Functions, Railway, Render, or similar)
- WebSocket: Same backend instance (Express.js + ws package) or separate WebSocket service

**Session Store**:
- MVP: In-memory (no separate deployment)
- Production: Redis cloud (separate service, shared across backend instances)

**Database** (Safety Metadata):
- MVP: SQLite (file-based, local)
- Production: Postgres (managed database service)

### Monitoring / Alerting

**Health Checks**:
- `GET /api/health` endpoint (returns `{ status: "ok" }`)
- Frontend health check (display connection status)

**Future Monitoring** (Post-MVP):
- Error tracking (Sentry or similar)
- Performance monitoring (response times, WebSocket latency)
- Safety metrics (report rate, panic usage, block rate)

### Rollback Strategy

**Frontend**:
- Static build rollback (deploy previous build version)
- Feature flags (if implemented) for gradual rollouts

**Backend**:
- Versioned deployments (rollback to previous version)
- Database migrations (idempotent, reversible)

**Session Store**:
- In-memory (MVP): No rollback needed (ephemeral, data lost on restart)
- Redis (production): Version compatibility (rollback backend if Redis schema changes)

---

## 10. Open Questions & TODOs

### Architecture Decisions Pending

- **Real-time Scaling**: How to handle WebSocket connections across multiple backend instances? (Redis pub/sub for message broadcasting?)
- **Location Accuracy**: How to balance proximity matching with privacy (approximate location granularity)?
- **Signal Engine Tuning**: Default weights may need A/B testing across contexts (campus vs. conference vs. coworking)

### Research Items

- **OAuth Integrations** (Post-MVP): Which providers (Spotify/Reddit/X) are most trusted and feasible for tag suggestions?
- **Client-side Encryption** (Post-MVP): Feasibility and UX impact for end-to-end message encryption?
- **Appeals Process** (Post-MVP): Lightweight, human-readable review flow for safety exclusions

### Risks to Revisit Later

- **Abuse Patterns**: How to detect and prevent spam without building surveillance?
- **Signal Engine Tuning**: Default weights may need adjustment based on user behavior
- **Proximity Matching**: Edge cases (indoor vs. outdoor, multi-floor buildings, GPS accuracy)
- **Session Expiration**: 1-hour TTL may need tuning based on usage patterns

### Design Reference

- **Mock Folder**: `Docs/Vision/ui_ux_mocks/` - Extract component patterns, styling, UI flows
- Components to extract: BootSequence, PanicButton, RetroHeader, Scanlines, ASCII dividers
- Brand colors and typography from mock CSS variables

---

**Keep this file in sync with reality; adjust as the project evolves.**
