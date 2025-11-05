# Research Log (Ref Tools/Search MCP)

Use this file to paste brief citations and summaries when any agent uses Ref Tools MCP, GitHub MCP, or other research tools.

## How to record
- Source title: <name>
- URL: <link>
- Notes (1-3 bullets):
  - What it confirms
  - Any constraints or version notes
  - Tradeoffs or caveats

## Checklist for each lookup
- [ ] Paste source title and URL
- [ ] Add 1-3 bullets summary
- [ ] Note version/tooling constraints if relevant
- [ ] Reference which agent/task this supports

## Example entry
- Source title: Express response.json reference
- URL: https://expressjs.com/en/5x/api.html#res.json
- Notes:
  - Shows res.json sends a JSON response
  - No body size default limit mentioned here; see body-parser for limits
  - Applies to Express 5 API docs
- Supports: Forge - /health endpoint implementation

---

# Minimum Baseline MCPs for Icebreaker MVP

**Research Date**: 2025-01-27
**Researcher**: Scout 🔎
**Task**: Identify minimum baseline MCP servers required for Icebreaker MVP development

## Executive Summary

Icebreaker MVP requires **3 baseline MCPs** (workflow essential) and **2 optional MCPs** (feature-specific). Core Icebreaker features (proximity matching, real-time chat, location services) use native browser/device APIs and do not require MCP support.

## MCP-to-Feature Mapping

| Icebreaker MVP Feature | MCP Support | MCP Server | Notes |
| --- | --- | --- | --- |
| **Workflow Management** | ✅ Required | GitHub MCP | Branches, PRs, issues, labels - core agent workflow |
| **Research & Documentation** | ✅ Required | DocFork MCP | Official docs lookup, code samples for stack decisions |
| **Local Operations** | ✅ Required | Desktop Commander MCP | Shell/file automation, port management |
| **UI Testing** | ⚠️ Optional | Playwright MCP | Accessibility (axe), screenshots, Lighthouse - MVP needs this |
| **Database Operations** | ⚠️ Conditional | Supabase MCP | Only if using Supabase (not decided yet) |
| **Real-time Chat** | ❌ None | N/A | WebSocket/SSE implementation - native API, no MCP |
| **Location Services** | ❌ None | N/A | Browser Geolocation API - native browser API, no MCP |
| **Signal Engine** | ❌ None | N/A | Backend logic - no MCP needed |
| **Accessibility Testing** | ⚠️ Optional | Playwright MCP | axe checks for WCAG AA compliance |

## Baseline MCPs (Required)

### 1. GitHub MCP
- **Status**: ✅ Required (workflow essential)
- **Purpose**: Agent workflow automation (branching, PRs, issues, labels)
- **Required Env**: `GITHUB_TOKEN` (PAT with `repo`, `workflow`, `issues` permissions)
- **Use Cases**:
  - Vector: Create branches, update issues, manage labels
  - Forge/Link/Glide/Apex/Cider: Branch pushes, PR creation
  - Nexus: CI/CD automation, workflow updates
- **Fallback**: GitHub web UI or `gh` CLI; log deviation in plan
- **Rollback**: Remove from config if GitHub workflow changes; agents use terminal git as fallback
- **Source**: `.cursor/mcp.json`, `.cursor/mcp.README.md`, `tools/health-check.mjs` (line 230)

### 2. DocFork MCP
- **Status**: ✅ Required (workflow essential)
- **Purpose**: Official documentation lookups, code examples, version notes
- **Required Env**: `GITHUB_TOKEN`
- **Use Cases**:
  - Scout: Research stack options, cite official docs
  - Forge: Backend framework documentation
  - Link: Frontend framework documentation
  - All agents: Reference official API docs during implementation
- **Fallback**: Vendor docs in browser; cite links manually in `/docs/research.md`
- **Rollback**: Remove if research workflow changes; manual doc lookup remains viable
- **Source**: `.cursor/mcp.json`, `.cursor/rules/04-integrations.mdc` (line 19), `tools/health-check.mjs` (line 230)

### 3. Desktop Commander MCP
- **Status**: ✅ Required (workflow essential)
- **Purpose**: Local shell/file automation with guardrails
- **Required Env**: `GITHUB_TOKEN`
- **Use Cases**:
  - Nexus: Port management, server startup/cleanup
  - All agents: File operations within `.cursor/tools/policy.md` allowlist
  - Local automation tasks (guarded by policy)
- **Fallback**: Local terminal manually; respect `.cursor/tools/policy.md` allowlist
- **Rollback**: Remove if automation needs change; terminal commands remain available
- **Source**: `.cursor/mcp.json`, `.cursor/rules/04-integrations.mdc` (line 22), `tools/health-check.mjs` (line 230)

## Optional MCPs (Feature-Specific)

### 4. Playwright MCP
- **Status**: ⚠️ Optional (highly recommended for MVP)
- **Purpose**: UI testing, accessibility checks (axe), screenshots, Lighthouse
- **Required Env**: `GITHUB_TOKEN`
- **Use Cases**:
  - Pixel: Accessibility testing (WCAG AA compliance required)
  - Pixel: UI screenshots for PR artifacts
  - Pixel: Lighthouse performance checks
  - Link: Visual regression testing
- **Fallback**: Run Playwright locally (`npx playwright test`); attach artifacts manually
- **Recommendation**: **Keep for MVP** - Accessibility is a core requirement (WCAG AA minimum)
- **Rollback**: Remove if testing strategy changes; local Playwright remains functional
- **Source**: `.cursor/mcp.json`, `.cursor/rules/02-quality.mdc` (line 53), `tools/health-check.mjs` (line 253)

### 5. Supabase MCP
- **Status**: ⚠️ Conditional (only if using Supabase)
- **Purpose**: Database schema diffs, SQL advisors, policy checks, Edge Functions
- **Required Env**: `SUPABASE_URL`, `SUPABASE_ANON_KEY`
- **Use Cases**:
  - Forge: Database schema management
  - Forge: SQL query validation
  - Forge: Migration assistance
  - Sentinel: Security policy checks
- **Condition**: Only needed if tech stack decision includes Supabase
- **Fallback**: Supabase dashboard or SQL CLI; capture notes in `/docs/research.md`
- **Recommendation**: **Defer decision** - Wait for tech stack research to determine if Supabase is chosen
- **Rollback**: Remove if different database chosen; no impact if Supabase not used
- **Source**: `.cursor/mcp.json`, `.cursor/rules/02-quality.mdc` (line 54), `tools/health-check.mjs` (line 253)

## Gaps Identified (No MCP Support Available)

### Real-time Chat
- **Feature**: Ephemeral 1:1 messaging via WebSocket/SSE
- **MCP Support**: ❌ None available
- **Solution**: Native implementation (WebSocket API, Server-Sent Events)
- **Impact**: No MCP needed; backend implementation handles real-time

### Location Services
- **Feature**: Approximate proximity matching via browser Geolocation API
- **MCP Support**: ❌ None available
- **Solution**: Native browser Geolocation API (user permission-based)
- **Impact**: No MCP needed; frontend handles location with user consent

### Signal Engine
- **Feature**: Lightweight compatibility scoring (vibe match, tags, proximity)
- **MCP Support**: ❌ None available
- **Solution**: Backend logic implementation
- **Impact**: No MCP needed; backend algorithm handles scoring

## Recommendations

### Minimum Baseline (Keep These)
1. ✅ **GitHub MCP** - Required for agent workflow
2. ✅ **DocFork MCP** - Required for research/documentation
3. ✅ **Desktop Commander MCP** - Required for local automation

### Recommended for MVP (Keep These)
4. ⚠️ **Playwright MCP** - Highly recommended; accessibility testing is core requirement (WCAG AA)

### Conditional (Defer Decision)
5. ⚠️ **Supabase MCP** - Only if tech stack includes Supabase (wait for stack research)

### Remove/Defer
- None - All currently configured MCPs serve a purpose

## Configuration Decision

**Current Config**: `.cursor/mcp.json` has 5 MCPs configured
- ✅ Keep: github, docfork, desktop-commander, playwright
- ⚠️ Keep conditionally: supabase (only if Supabase chosen)

**Action Items**:
1. Keep all 5 MCPs for now
2. Document Supabase MCP as conditional in Connection Guide
3. Revisit Supabase MCP after tech stack decisions complete

## Environment Variables Required

| Variable | MCP Server(s) | Required For | Notes |
| --- | --- | --- | --- |
| `GITHUB_TOKEN` | github, playwright, desktop-commander, docfork | All baseline MCPs | PAT with `repo`, `workflow`, `issues` permissions |
| `SUPABASE_URL` | supabase | Conditional | Only if Supabase chosen |
| `SUPABASE_ANON_KEY` | supabase | Conditional | Only if Supabase chosen |

## Rollback Paths

### If GitHub MCP Fails
1. Use GitHub web UI for branch/PR management
2. Use `gh` CLI for automation
3. Log deviation in plan (`.notes/features/<slug>/progress.md`)
4. Update `.cursor/rules/07-process-improvement.mdc` if workflow gap identified

### If DocFork MCP Fails
1. Use vendor documentation in browser
2. Cite links manually in `/docs/research.md`
3. Continue research workflow without MCP

### If Desktop Commander MCP Fails
1. Use local terminal manually
2. Respect `.cursor/tools/policy.md` allowlist
3. Continue automation tasks via terminal

### If Playwright MCP Fails
1. Run Playwright locally: `npx playwright test`
2. Attach artifacts manually to PRs
3. Continue accessibility testing workflow

### If Supabase MCP Fails (if used)
1. Use Supabase dashboard for schema management
2. Use SQL CLI for queries
3. Capture notes in `/docs/research.md`

## Sources Consulted

- Source title: MCP Configuration
- URL: `.cursor/mcp.json`
- Notes:
  - Current config shows 5 MCPs: github, supabase, playwright, desktop-commander, docfork
  - All use Smithery CLI (`@smithery/cli@latest`)
- Supports: Scout - MCP baseline identification

- Source title: Health Check Baseline Requirements
- URL: `tools/health-check.mjs` (lines 230-263)
- Notes:
  - Identifies 3 required baseline: github, docfork, desktop-commander
  - Identifies 2 optional: supabase, playwright
  - Confirms baseline vs optional distinction
- Supports: Scout - Baseline MCP identification

- Source title: MCP Integration Rules
- URL: `.cursor/rules/04-integrations.mdc`
- Notes:
  - Documents when to use each MCP (GitHub first, DocFork second, etc.)
  - Defines fallback protocols for each MCP
  - Establishes Plan Mode → Act Mode workflow for MCP usage
- Supports: Scout - MCP usage patterns and fallbacks

- Source title: MCP Server Documentation
- URL: `.cursor/mcp.README.md`
- Notes:
  - Documents all 5 configured MCPs with use cases
  - Provides fallback paths for each server
  - Includes environment variable requirements
- Supports: Scout - MCP capabilities and requirements

- Source title: Icebreaker Vision Document
- URL: `docs/vision.md`
- Notes:
  - Lists 14 MVP features (onboarding, radar, chat, safety, etc.)
  - Identifies accessibility as core requirement (WCAG AA)
  - Confirms no MCP needed for location/real-time (native APIs)
- Supports: Scout - Feature-to-MCP mapping

- Source title: MCP Suggest Tool
- URL: `tools/mcp-suggest.mjs`
- Notes:
  - Shows heuristics for detecting Supabase, Playwright, Vercel, Stripe
  - Confirms no MCPs exist for location/real-time services
  - Provides auto-detection for optional MCPs
- Supports: Scout - Available MCP ecosystem research

## Conclusion

Icebreaker MVP requires **3 baseline MCPs** (github, docfork, desktop-commander) for workflow automation. **Playwright MCP is highly recommended** for accessibility testing (core requirement). **Supabase MCP is conditional** and depends on tech stack decisions. Core Icebreaker features (proximity, real-time chat, location) use native APIs and do not require MCP support.

**Next Steps**:
1. ✅ MCP baseline research complete
2. ⏭️ Proceed with tech stack research (will inform Supabase MCP decision)
3. ⏭️ Update Connection Guide with MCP requirements

---

# Bootstrap Web Health MVP Research

**Research Date**: 2025-01-27
**Researcher**: Vector 🎯
**Task**: Health endpoint patterns and best practices for framework-agnostic bootstrap MVP

## Health Endpoint Patterns

### Source title: Health Check Endpoint Best Practices
- URL: General industry practice (no single source)
- Notes:
  - Health endpoints should return 200 OK with simple JSON response
  - Common response shape: `{ "status": "ok" }` or `{ "status": "healthy" }`
  - Should be lightweight, no database or external service checks for MVP
  - Typically served at `/health` or `/api/health` route
- Supports: Forge - Health endpoint implementation guidance

### Source title: Framework-Agnostic Health Endpoint Examples
- URL: Stack-agnostic approach
- Notes:
  - **Node.js**: Express/Fastify/Hono minimal route handler
  - **Response**: `res.json({ status: "ok" })` with 200 status code
  - **Frontend**: Simple fetch to `/api/health` and display status
  - **CORS**: May need to configure CORS if frontend and backend on different ports
- Supports: Forge/Link - Implementation guidance for bootstrap MVP

### Source title: Playwright E2E Testing for Health Checks
- URL: Playwright documentation (general practice)
- Notes:
  - Test should fetch API endpoint and verify JSON response
  - Test should navigate to frontend page and verify health status is displayed
  - Use `page.goto()` and `page.request.get()` for API + UI coverage
  - Minimal smoke test: verify response shape and UI contains status text
- Supports: Pixel - Playwright smoke test scaffolding

### Source title: Minimal Viable Stack Selection
- URL: Project template architecture
- Notes:
  - Backend: Choose minimal framework (Express.js for Node.js is common default)
  - Frontend: Choose minimal framework (React/Vite, Vue, or vanilla JS acceptable)
  - Testing: Vitest/Jest for unit tests, Playwright for E2E
  - Shared types: TypeScript shared types in `shared/` directory (optional for MVP)
- Supports: Implementers - Stack selection guidance

## Recommendations

1. **Health Endpoint**: Keep it simple - return `{ "status": "ok" }` with 200 status. No database checks, no external dependencies.
2. **Frontend Component**: Display the status text from API response. No styling required for MVP.
3. **Testing**: Unit test for API route, component test for UI, Playwright E2E for full flow.
4. **Stack Choice**: Use minimal viable stack (Express + React/Vite recommended for speed).

## Rollback Paths

- If chosen stack conflicts: Document in `.notes/features/bootstrap-web-health-mvp/progress.md` and choose alternative
- If port conflicts: Use `npm run ports:status` to check, then choose alternative ports
- If CORS issues: Add CORS middleware to backend (Express: `cors` package, Fastify: `@fastify/cors`)
