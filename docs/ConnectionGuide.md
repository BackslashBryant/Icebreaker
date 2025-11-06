# Connection Guide

Track every port, endpoint, credential reference, and integration touchpoint here. Update it whenever a new service appears or an existing one changes.

## 1. Local Services

### Frontend (Bootstrap MVP)
- Name: Icebreaker Health Check Frontend
- Purpose: Health status UI (Bootstrap MVP)
- Port: 3000
- Startup command: `cd frontend && npm install && npm run dev`
- Notes: React + Vite, proxy to backend on /api routes

### Backend API (Bootstrap MVP + Onboarding)
- Name: Icebreaker API Server
- Purpose: Health endpoint + Onboarding API
- Port: 8000
- Startup command: `cd backend && npm install && npm run dev`
- Notes: Express.js server, CORS enabled for frontend, JSON body parsing
- Endpoints:
  - `GET /api/health` - Returns `{ status: "ok" }`
  - `POST /api/onboarding` - Creates session from onboarding data
    - Request: `{ vibe: string, tags: string[], visibility: boolean, location?: { lat: number, lng: number } }`
    - Response: `{ sessionId: string, token: string, handle: string }`
    - Errors: `400` (validation error), `500` (server error)

### WebSocket Server (TBD - if needed)
- Name: Real-time Chat Service
- Purpose: Ephemeral chat messaging, proximity monitoring
- Port: TBD (typically 3002 or separate WebSocket port)
- Startup command: TBD
- Notes: No message content storage; session-based connections only

## 2. Remote APIs & Integrations

### Location Services (TBD)
- Service: Browser Geolocation API / Device Location API
- Base URL / Endpoint: Native browser/device APIs
- Auth method: User permission (approximate location only)
- Environment variables required: None
- Owner: @Forge / @Link
- Notes: Approximate location only; no precise coordinates stored; session-based

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

## 6. MCP Servers (Model Context Protocol)

### Baseline MCPs (Required for Workflow)
- **GitHub MCP**: Agent workflow automation (branches, PRs, issues, labels)
  - Required Env: `GITHUB_TOKEN` (PAT with `repo`, `workflow`, `issues` permissions)
  - Fallback: GitHub web UI or `gh` CLI
- **Ref Tools MCP**: Token-efficient documentation search for APIs, libraries, services
  - Required Env: None (uses Smithery key)
  - Fallback: Vendor docs in browser; cite manually in `/docs/research.md`
  - Note: Supports private GitHub repos and PDFs; more token-efficient than alternatives
- **Desktop Commander MCP**: Local shell/file automation with guardrails
  - Required Env: `GITHUB_TOKEN`
  - Fallback: Local terminal manually; respect `.cursor/tools/policy.md`

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
- **Toolbox MCP**: Search for and discover additional MCP servers in Smithery registry
  - Required Env: None (uses Smithery key)
  - Use Case: Finding new MCP servers for project needs
  - Fallback: Manual search in Smithery registry

### MCP Configuration
- Config file: `.cursor/mcp.json`
- Managed by: Nexus (updates when stack/requirements change)
- Health check: `npm run preflight` validates baseline MCPs
- Documentation: See `docs/research.md` for detailed MCP baseline research

## 7. CI/CD Automation

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
