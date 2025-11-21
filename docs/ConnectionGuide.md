# Connection Guide

Track every port, endpoint, credential reference, and integration touchpoint here. Update it whenever a new service appears or an existing one changes.

## 1. Local Services

### Frontend (Bootstrap MVP)
- Name: Icebreaker Health Check Frontend
- Purpose: Health status UI (Bootstrap MVP)
- Port: 3000
- Startup command: `cd frontend && npm install && npm run dev`
- Notes: React + Vite, proxy to backend on /api routes
- **Two-Laptop Setup**: Set `VITE_API_URL` and `VITE_WS_URL` environment variables to connect to remote backend
- **HTTPS Support**: Use `npm run dev -- --https` for HTTPS (required for Geolocation API on non-localhost)

### Backend API (Bootstrap MVP + Onboarding)
- Name: Icebreaker API Server
- Purpose: Health endpoint + Onboarding API
- Port: 8000
- Startup command: `cd backend && npm install && npm run dev`
- Notes: Express.js server, CORS enabled for frontend, JSON body parsing
- **Two-Laptop Setup**: Set `HOST=0.0.0.0` and `CORS_ORIGIN=*` to allow remote connections
- **Firewall**: Ensure port 8000 is open for LAN access (Windows Firewall, macOS Security, Linux UFW)
- Endpoints:
  - `GET /api/health` - Health check endpoint
    - Returns: `{ status: "ok", websocket: { connected: boolean, connectionCount: number, sessionCount: number } }`
    - Used for: Uptime monitoring, general health checks
  - `GET /api/health/ready` - Readiness endpoint
    - Returns: `{ status: "ready" | "not ready", websocket: { connected: boolean } }`
    - Status codes: `200` (ready), `503` (not ready)
    - Used for: Deployment readiness checks (Kubernetes readiness probe, etc.)
  - `POST /api/onboarding` - Creates session from onboarding data
    - Request: `{ vibe: string, tags: string[], visibility: boolean, location?: { lat: number, lng: number } }`
    - Response: `{ sessionId: string, token: string, handle: string }`
    - Errors: `400` (validation error), `500` (server error)
  - `POST /api/safety/block` - Block a user (requires Authorization header with session token)
    - Request: `{ targetSessionId: string }`
    - Response: `{ success: boolean }`
    - Errors: `400` (validation error), `401` (unauthorized), `500` (server error)
  - `POST /api/safety/report` - Report a user (requires Authorization header with session token)
    - Request: `{ targetSessionId: string, category: 'harassment' | 'spam' | 'impersonation' | 'other' }`
    - Response: `{ success: boolean }`
    - Errors: `400` (validation error), `401` (unauthorized), `500` (server error)
  - `PUT /api/profile/visibility` - Update session visibility (requires Authorization header with session token)
    - Request: `{ visibility: boolean }`
    - Response: `{ success: boolean, visibility: boolean }`
    - Errors: `400` (validation error), `401` (unauthorized), `500` (server error)
  - `PUT /api/profile/emergency-contact` - Update session emergency contact (requires Authorization header with session token)
    - Request: `{ emergencyContact: string | null }` (phone: E.164 format +1234567890, or email: RFC 5322)
    - Response: `{ success: boolean, emergencyContact: string | null }`
    - Errors: `400` (validation error), `401` (unauthorized), `500` (server error)

### WebSocket Server (Radar View)
- Name: Real-time Radar Service
- Purpose: Radar updates, proximity monitoring, chat requests
- Port: 8000 (same as HTTP server, WebSocket upgrade on /ws)
- Startup command: `cd backend && npm run dev` (starts with HTTP server)
- Endpoint: `ws://localhost:8000/ws?token=<sessionToken>`
- Message Types:
  - Client → Server: `radar:subscribe`, `location:update`, `chat:request`, `chat:accept`, `chat:decline`, `chat:message`, `chat:end`, `panic:trigger`
  - Server → Client: `connected`, `radar:update`, `chat:request`, `chat:request:ack`, `chat:accepted`, `chat:declined`, `chat:message`, `chat:end`, `panic:triggered`, `error`
- Notes: Session token required for connection; heartbeat ping-pong every 30s
- Signal Engine Config: `backend/src/config/signal-weights.js` (tunable weights for compatibility scoring)
- Chat Rate Limiting: `backend/src/lib/rate-limiter.js` (max 10 messages/minute per chat)
- Chat Proximity Thresholds: Warning at 80m, termination at 100m (configurable in `backend/src/services/ChatManager.js`)
- Panic Button: `backend/src/services/PanicManager.js` (safety exclusion, session termination)
- Panic Exclusion Duration: Default 1 hour (configurable in `backend/src/services/PanicManager.js`)
- Chat Request Cooldowns: `backend/src/services/CooldownManager.js` (session-level cooldowns after 3 declines in 10 minutes)
- Cooldown Duration: Default 30 minutes (configurable via `COOLDOWN_DURATION_MS` environment variable)
- Cooldown Config: `backend/src/config/cooldown-config.js` (threshold: 3, window: 10 min, duration: 30 min, weights)

## 2. Remote APIs & Integrations

### Location Services
- Service: Browser Geolocation API / Device Location API
- Base URL / Endpoint: Native browser/device APIs
- Auth method: User permission (approximate location only)
- Environment variables required: None
- Owner: @Forge / @Link
- Notes: 
  - Approximate location only; no precise coordinates stored; session-based
  - **HTTPS Required**: Browser Geolocation API requires HTTPS for non-localhost origins
  - **Two-Laptop Testing**: Use tunneling (ngrok/Cloudflare) or mkcert for HTTPS certificates
  - **See**: `Docs/guides/two-laptop-field-test.md` for complete setup instructions

### OAuth Providers (Post-MVP)
- Service: Spotify / Reddit / X (Twitter) - for social enrichment
- Base URL / Endpoint: TBD
- Auth method: OAuth 2.0 (read-only scopes)
- Environment variables required: `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`, etc.
- Owner: @Forge (post-MVP)
- Notes: Opt-in only; used to auto-suggest tags; raw data discarded after mapping

## 3. Datastores

### Session Store (MVP)
- Type: In-memory Map (MVP), Redis (production scaling)
- Connection string / host: N/A (in-memory for MVP)
- Migration owner: @Forge
- Backup/rollback procedure: Data lost on server restart (ephemeral by design)
- Notes: Session-scoped data only; ephemeral by design; minimal metadata; TTL cleanup every minute (1 hour default expiration)
- Session data stored: sessionId, token, handle, vibe, tags, visibility, location (optional), createdAt, expiresAt, activeChatPartnerId, blockedSessionIds, reportCount

### Safety Metadata Store (TBD)
- Type: Database (Postgres / SQLite / TBD)
- Connection string / host: TBD
- Migration owner: @Forge
- Backup/rollback procedure: TBD
- Notes: Stores only: report category, timestamp, anonymized session ID, reporter ID (hashed), accused user ID. NO message content.

## 4. Messaging / Events

### Real-time Chat (TBD)
- Broker / channel: WebSocket / Server-Sent Events / TBD
- Schemas / payload contracts: TBD
- Replay or dead-letter process: None (ephemeral by design; messages not stored)

### Proximity Events (TBD)
- Broker / channel: TBD
- Schemas / payload contracts: TBD
- Replay or dead-letter process: None (session-based only)

## 5. Shared Resources & Ports

### Port Registry
- Resource: Development ports
- Current assignment: TBD
- Conflicts / history: None yet

### Environment Variables (TBD)
- Resource: `.env` file / environment config
- Required variables: TBD (will include location permissions, OAuth credentials if post-MVP)
- Notes: Never commit `.env`; use `env.example` template

## 6. Error Tracking & Monitoring

### Sentry Error Tracking
- **Service**: Sentry (free tier available)
- **Purpose**: Error tracking, performance monitoring, session replay
- **Frontend DSN**: `VITE_SENTRY_DSN` environment variable
- **Backend DSN**: `SENTRY_DSN` environment variable
- **Configuration**:
  - Frontend: `frontend/src/lib/sentry.ts` (initialized in `main.jsx`)
  - Backend: `backend/src/middleware/error-handler.js` (initialized in `index.js`)
  - Error Boundary: `frontend/src/components/ErrorBoundary.tsx` (wraps App)
- **Environment Variables**:
  - `SENTRY_DSN` - Backend Sentry DSN
  - `VITE_SENTRY_DSN` - Frontend Sentry DSN
  - `SENTRY_ENABLE_DEV` - Enable Sentry in development (default: false)
  - `VITE_SENTRY_ENABLE_DEV` - Enable Sentry in frontend development (default: false)
- **Dashboard Access**:
  - **Sentry Dashboard**: https://backslashbryant.sentry.io
  - **Organization**: backslashbryant
  - **Project**: icebreaker (shared project with separate DSNs for frontend/backend)
  - **Issues Dashboard**: View errors, stack traces, and error trends
  - **Performance Dashboard**: View performance metrics, latency, throughput
  - **Releases Dashboard**: Track deployments and release health
- **Production DSNs** (Configured):
  - **Frontend DSN**: `https://ddac06c38c223c1b6b154d33493be0f4@o4510093969195008.ingest.us.sentry.io/4510093972602880`
    - Configured in Vercel as `VITE_SENTRY_DSN` (Production, Preview, Development)
  - **Backend DSN**: `https://5ca041bf861fa637b7b2a4e9a2a54f5c@o4510093969195008.ingest.us.sentry.io/4510093972602880`
    - Configured in Railway as `SENTRY_DSN` (Production)
- **Setup Status**: ✅ **COMPLETE** - Both DSNs configured and active in production
- **MCP Integration**: 
  - Sentry MCP server configured in `.cursor/mcp.json` (hosted URL: `https://mcp.sentry.dev/mcp`)
  - Requires `SENTRY_AUTH_TOKEN` environment variable for authentication
  - Enables automated project/DSN management and alert configuration via CLI
- **Notes**: 
  - Only initializes if DSN is provided (graceful degradation)
  - Development errors filtered unless `SENTRY_ENABLE_DEV=true`
  - Performance monitoring: 10% sample rate in production, 100% in dev
  - Session replay: Masked for privacy (all text/media blocked)
  - Package: `@sentry/node` installed in backend (Issue #22 Step 1)
- **Owner**: @Nexus 🚀

## 7. MCP Servers (Model Context Protocol)

### Baseline MCPs (Required for Workflow)
- **Desktop Commander MCP**: Local shell/file automation with guardrails
  - Required Env: `GITHUB_TOKEN`
  - Fallback: Local terminal manually; respect `.cursor/tools/policy.md`
- **GitHub Operations**: Use GitHub CLI (`gh`) directly - no MCP needed
  - Setup: Run `gh auth login` once
  - Fallback: GitHub web UI

### Optional MCPs (Feature-Specific)
- **Playwright MCP**: UI testing, accessibility (axe), screenshots, Lighthouse
  - Required Env: `GITHUB_TOKEN`
  - Use Case: Accessibility testing (WCAG AA compliance required for MVP)
  - Fallback: Run Playwright locally (`npx playwright test`)
  - Recommendation: Keep for MVP (accessibility is core requirement)
- **Supabase MCP Lite**: Database schema diffs, SQL advisors, policy checks
  - Required Env: `SUPABASE_URL`, `SUPABASE_ANON_KEY` (conditional - only if Supabase chosen)
  - Use Case: Database operations (if Supabase is selected in tech stack)
  - Fallback: Supabase dashboard or SQL CLI
  - Status: Conditional - defer decision until tech stack research complete
- **Vercel MCP**: Deployments, project management, environment variables, domains
  - Required Env: None (OAuth authentication handled by Cursor)
  - Use Case: Deployment automation, project management, preview deployments
  - Endpoint: `https://mcp.vercel.com` (or project-specific: `https://mcp.vercel.com/<teamSlug>/<projectSlug>`)
  - Authentication: OAuth (click "Needs login" prompt in Cursor to authorize)
  - Fallback: Vercel CLI (`vercel`) or Vercel dashboard
  - Documentation: https://vercel.com/docs/mcp/vercel-mcp
- **Sentry MCP**: Error tracking, project management, DSN creation, issue analysis
  - Required Env: None (OAuth authentication handled by Cursor)
  - Use Case: Automated Sentry project/DSN management, error analysis, Seer integration
  - Endpoint: `https://mcp.sentry.dev/mcp`
  - Authentication: OAuth (click "Needs login" prompt in Cursor to authorize)
  - Fallback: Sentry CLI (`sentry-cli`) or Sentry dashboard
  - Documentation: https://docs.sentry.io/product/sentry-mcp
  - Status: ✅ Configured and active
- **Railway MCP**: REMOVED - Package has zod dependency error preventing connection
  - **Replacement**: Use Railway CLI directly (`railway` commands)
  - Railway CLI is authenticated and working perfectly
  - Available commands: `railway status`, `railway logs`, `railway variables`, `railway deploy`, `railway list`
  - **Status**: Railway CLI provides all needed functionality - MCP integration not required
  - Documentation: https://docs.railway.com/guides/cli
- **Filesystem MCP**: File operations, reading project structure, code navigation
  - Required Env: None
  - Use Case: Automated file operations, reading project files, navigating codebase structure
  - Package: `@modelcontextprotocol/server-filesystem` (via npx)
  - Scope: Limited to workspace directory for security (uses absolute path on Windows)
  - **Configuration**: Uses absolute path on Windows: `C:\Users\OrEo2\Desktop\DevOps\1. Projects\Icebreaker`
  - Fallback: Desktop Commander MCP (provides same functionality) or manual file operations
  - Documentation: https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem
- **Time MCP**: Time and date operations, timezone conversions, scheduling
  - Required Env: None
  - Prerequisites: `uvx` (uv package manager) or Python 3.10+ with pip
  - Use Case: Get current time, convert timezones, calculate time differences, format dates
  - Package: `mcp-server-time` (via uvx or pip)
  - Command: `uvx mcp-server-time` (recommended) or `python -m mcp_server_time`
  - Fallback: Native JavaScript Date API or date libraries
  - Documentation: https://github.com/modelcontextprotocol/servers/tree/main/src/time
- **Toolbox MCP**: Search for and discover additional MCP servers in Smithery registry
  - Required Env: None (uses Smithery key)
  - Use Case: Finding new MCP servers for project needs
  - Fallback: Manual search in Smithery registry

### MCP Configuration
- Config file: `.cursor/mcp.json`
- Managed by: Nexus (updates when stack/requirements change)
- Health check: `npm run preflight` validates baseline MCPs
- Documentation: See `docs/research.md` for detailed MCP baseline research

## 8. CI/CD Automation

### GitHub Actions Workflow
- **File**: `.github/workflows/ci.yml`
- **Trigger**: Pull requests to `main` or `master` branches
- **Jobs**:
  - `checks`: Template guardrails (lint, typecheck, persona smoke tests)
  - `health-mvp`: Health MVP test suite
    - Backend unit tests (Vitest)
    - Frontend unit tests (Vitest + React Testing Library)
    - E2E tests (Playwright)
    - Backend server starts automatically on port 8000
    - Frontend server starts automatically on port 3000 (via Playwright webServer)
- **Last Updated**: 2024 (Bootstrap Web Health MVP - Step 6)

## Maintenance Rules
- Nexus keeps this file in sync with CI/deployment changes.
- Implementers update it before handing off new services or ports.
- Muse references the relevant section in README updates and changelog entries.
- If a collision occurs (e.g., duplicate port usage), log it in `.notes/features/<slug>/progress.md` and fix it before continuing.
