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

## 2025-01-XX: Windows Git Push "getaddrinfo() thread failed to start" Error

**Research Date**: 2025-01-XX  
**Researcher**: Scout 🔎  
**Task**: Resolve Windows git push failure preventing Issue #1 completion push  
**Issue**: Git push fails with `fatal: unable to access 'https://github.com/...': getaddrinfo() thread failed to start`

### Sources

1. **Source**: Stack Overflow - "fatal: unable to access 'link': getaddrinfo() thread failed to start"  
   **URL**: https://stackoverflow.com/questions/59911649/fatal-unable-to-access-link-getaddrinfo-thread-failed-to-start  
   **Notes**:
   - Windows-specific DNS threading issue in git
   - Often caused by firewall/antivirus blocking git's network operations
   - Some users resolved by uninstalling firewall software
   - Workaround: Use IP address instead of hostname in remote URL
   - Alternative: Switch to SSH protocol instead of HTTPS

2. **Source**: Stack Overflow - "Why does git fail with getaddrinfo thread failed to start when in a subprocess?"  
   **URL**: https://stackoverflow.com/questions/76654896/why-does-git-fail-with-getaddrinfo-thread-failed-to-start-when-in-a-subproce  
   **Notes**:
   - Missing environment variables (e.g., `SystemRoot`) can cause this error
   - Subprocess execution context may lack required environment variables
   - PowerShell/CMD environment differences can trigger the issue

3. **Source**: Deepinout - Git Configuration Solutions  
   **URL**: https://deepinout.com/git/git-questions/53_tk_1702444957.html  
   **Notes**:
   - Configure git to use HTTPS instead of git:// protocol
   - Command: `git config --global url."https://".insteadOf git://`
   - Proxy settings may need configuration
   - Update/reinstall Git for Windows may resolve

### Key Findings

**Root Cause**: Windows DNS threading issue in git's HTTP client. Not related to network connectivity (ping works), but to how git spawns DNS resolution threads.

**Common Triggers**:
- Firewall/antivirus blocking git operations
- Missing environment variables in subprocess context
- VPN or network tools interfering
- Outdated Git for Windows version

**GitHub MCP Limitation**: GitHub MCP does NOT have a git push tool. It handles GitHub API operations (PRs, issues, file contents) but not git commits. The `mcp_github_push_files` tool pushes file contents via API, not git commits, which would create new commits and lose git history.

### Recommended Solutions (Priority Order)

1. **Manual Push (Immediate Fix)**
   - Push manually from user's terminal where git works
   - Most reliable workaround
   - Preserves git history and commit metadata

2. **Check Firewall/Antivirus**
   - Temporarily disable firewall/antivirus to test
   - If resolves, add git.exe to firewall exceptions
   - Some users required complete firewall uninstall

3. **Update Git for Windows**
   - Download latest from https://git-scm.com/downloads
   - Newer versions may have fixes for threading issues

4. **Use IP Address Instead of Hostname**
   - Get GitHub IP: `nslookup github.com`
   - Update remote: `git remote set-url origin https://<IP>/BackslashBryant/Icebreaker.git`
   - Bypasses DNS resolution entirely

5. **Switch to SSH Protocol**
   - Requires SSH key setup: `ssh-keygen` → add to GitHub
   - Update remote: `git remote set-url origin git@github.com:BackslashBryant/Icebreaker.git`
   - SSH bypasses HTTP threading issues

6. **Git Configuration Tweaks** (Already attempted)
   - `http.threads=1` - Limits threading
   - `http.postBuffer` - Increases buffer size
   - `http.sslBackend=schannel` - Windows SSL backend
   - These didn't resolve in our case

### Trade-offs

| Solution | Pros | Cons |
|----------|------|------|
| Manual Push | 100% reliable, preserves history | Requires user action |
| Firewall Exception | Permanent fix if firewall is cause | May not be root cause |
| IP Address | Bypasses DNS entirely | IP changes, breaks automation |
| SSH Protocol | Bypasses HTTP threading | Requires SSH setup |
| GitHub MCP | API-based | Doesn't support git commits |

### Recommendation

**Immediate**: User pushes manually from their terminal (git works in their environment, just not in Cursor's subprocess context).

**Long-term**: 
1. Add git.exe to firewall exceptions
2. Update Git for Windows to latest version
3. If persists, consider SSH protocol setup

**Rollback**: If any solution breaks git entirely, revert remote URL: `git remote set-url origin https://github.com/BackslashBryant/Icebreaker.git`

### Next Steps

1. ✅ Document findings in research log
2. ⏳ User pushes commits manually (3 commits ready: `564d5e2`, `48de326`, `8ee02e6`)
3. ⏳ Update `.cursor/rules/07-process-improvement.mdc` with Windows git push workaround lesson
4. ⏳ Consider adding SSH setup to project docs if issue recurs

### References

- Issue: #1 (Onboarding Flow completion)
- Branch: `agent/vector/1-onboarding-flow`
- Commits ready: 3 local commits awaiting push
- GitHub MCP: Confirmed no git push capability (API-only operations)

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

---

# Tech Stack Research for Icebreaker MVP

**Research Date**: 2025-01-27
**Researcher**: Scout 🔎
**Task**: Research and recommend tech stack choices for frontend, backend, real-time communication, and storage aligned with Icebreaker MVP requirements (privacy-first, ephemeral, proximity-based, WCAG AA accessible)

## Research Scope

Evaluated options for:
1. **Frontend Framework**: UI framework for React-based web app
2. **Backend Runtime/Framework**: API server and real-time communication
3. **Real-time Solution**: WebSocket vs Server-Sent Events (SSE) for ephemeral chat
4. **Session Storage**: Options for ephemeral session data (no message content storage)

## Constraints & Requirements

- **Privacy-first**: No message content storage; approximate location only; session-scoped data
- **Ephemeral by design**: Sessions expire; no long-term transcripts; visibility is reversible
- **WCAG AA accessible**: Screen reader support, keyboard navigation, semantic HTML, proper ARIA labels
- **Performance**: Chat latency < 500ms; Radar updates < 1s
- **Lightweight**: Simple, explainable code; minimal dependencies for MVP

---

## Frontend Framework

### Recommendation: **React + Vite**

**Rationale**:
- React is familiar to team (per implementation notes)
- Vite provides fast dev server and optimized production builds
- Strong ecosystem for accessibility tooling and patterns
- TypeScript support for type safety
- Component-based architecture aligns with Icebreaker's modular features (onboarding, radar, chat)

**Accessibility Considerations**:
- React supports semantic HTML and ARIA attributes
- **shadcn/ui component library** (recommended addition):
  - Built on Radix UI primitives (WCAG AA compliant out of the box)
  - Accessible components: Button, Checkbox, Input, Dialog, etc.
  - Keyboard navigation built-in
  - Screen reader support via ARIA attributes
  - Works with React+Vite (framework-agnostic component library)
- WCAG AA compliance achievable with:
  - Semantic HTML elements (`<nav>`, `<main>`, `<button>`, etc.)
  - ARIA labels for screen readers (provided by Radix UI)
  - Keyboard navigation (focus management, tab order - handled by Radix)
  - Reduced-motion and high-contrast mode support
- React Testing Library includes accessibility testing utilities
- Playwright MCP can run axe checks for WCAG AA verification

**Component Library Decision**:
- **shadcn/ui** recommended (reference mock uses it)
- Radix UI primitives provide accessibility by default
- Components are copy-paste (not npm package) - full control over customization
- Aligns with "terminal meets Game Boy" aesthetic from vision
- Can extract design patterns from `Docs/Vision/ui_ux_mocks/` reference

**Trade-offs**:
- ✅ **Pros**: Familiar stack, fast dev experience, strong a11y ecosystem with shadcn/ui
- ⚠️ **Cons**: SPA requires client-side routing; no SSR (not needed for chat MVP)
- **Rollback**: If React accessibility concerns arise, Vue.js or Svelte are viable alternatives with similar a11y support

**Note on Next.js Consideration**:
- Next.js was evaluated (reference mock uses Next.js)
- Decision: **React+Vite preferred** for MVP because:
  - Real-time chat is client-heavy (WebSocket requires client components)
  - SSR doesn't benefit chat/radar views (no SEO needed)
  - Simpler architecture = faster to ship MVP
  - shadcn/ui works with both stacks (framework-agnostic)
- Mock folder (`Docs/Vision/ui_ux_mocks/`) is design reference only
- Extract component patterns and styles, not Next.js structure

**Sources**:
- Source title: Vite 4.0 Release
- URL: https://vite.dev/blog/announcing-vite4
- Notes:
  - Vite 4.0 provides fast HMR and optimized builds
  - React plugin supported via `@vitejs/plugin-react`
  - TypeScript support included
- Supports: Scout - Frontend framework selection

- Source title: Next.js vs Vite Migration Guide
- URL: https://nextjs.org/docs/15/app/guides/migrating/from-vite#why-switch
- Notes:
  - Next.js advantages: SSR, automatic code splitting, built-in optimizations
  - Next.js better for SEO and initial page load (not needed for chat MVP)
  - Real-time chat apps are client-heavy (WebSocket requires client components)
  - Next.js adds complexity without clear benefit for ephemeral chat MVP
- Supports: Scout - Framework comparison for real-time chat

- Source title: shadcn/ui Documentation
- URL: https://ui.shadcn.com/docs/components/form
- Notes:
  - shadcn/ui built on Radix UI primitives
  - Components are copy-paste (not npm package) - full customization control
  - Framework-agnostic (works with React, Next.js, Vite, etc.)
  - WCAG AA compliant via Radix UI accessibility
- Supports: Scout - Component library selection

- Source title: Radix UI Accessibility
- URL: https://github.com/radix-ui/website/blob/main/data/primitives/docs/overview/accessibility.mdx
- Notes:
  - Radix UI primitives are WCAG AA compliant by default
  - Built-in keyboard navigation and screen reader support
  - ARIA attributes included automatically
- Supports: Scout - Accessibility validation for component library

---

## Backend Runtime/Framework

### Recommendation: **Node.js + Express.js**

**Rationale**:
- Minimal setup aligns with MVP scope
- Express.js is mature, well-documented, and lightweight
- Good ecosystem for WebSocket support (via `ws` package)
- CORS support for frontend-backend separation
- Session management via `express-session` with flexible storage backends

**Privacy & Ephemeral Support**:
- Express middleware allows session-scoped data
- No built-in persistence (storage backend is configurable)
- Supports ephemeral session stores (in-memory, Redis with TTL)
- Minimal dependencies for MVP

**Trade-offs**:
- ✅ **Pros**: Simple, familiar, fast to prototype, good WebSocket support
- ⚠️ **Cons**: Single-threaded (Node.js limitation); may need scaling for production
- **Rollback**: If Node.js limitations block, Fastify (faster) or Deno/Bun (modern alternatives) are options

**Sources**:
- Source title: Express.js Installation
- URL: https://github.com/expressjs/express/blob/master/Readme.md
- Notes:
  - Express is minimal web framework for Node.js
  - Session management via `express-session` package
  - Supports Redis, in-memory, and other storage backends
- Supports: Scout - Backend framework selection

- Source title: Express Session Store
- URL: https://github.com/expressjs/session/blob/master/README.md
- Notes:
  - `express-session` supports multiple storage backends
  - Compatible with Redis, in-memory, and database stores
  - Session data is configurable (ephemeral-friendly)
- Supports: Scout - Session storage integration

---

## Real-time Communication

### Recommendation: **WebSocket** (primary) with **SSE** (optional for radar updates)

**Rationale for WebSocket**:
- **Bidirectional communication required** for ephemeral chat (client sends messages, server broadcasts)
- **Low latency** (< 500ms requirement) for chat messages
- **Binary and text support** (future-proof for potential features)
- **No browser connection limits** (unlike SSE's 6-connection limit on HTTP/1.1)
- **Full control** over reconnection logic (ephemeral sessions need explicit cleanup)

**Why Not SSE for Chat**:
- SSE is **unidirectional** (server → client only)
- Chat requires client-to-server message sending (bidirectional)
- SSE would require separate HTTP POST requests for sending messages (adds complexity and latency)

**Optional SSE for Radar Updates**:
- Radar proximity updates could use SSE (unidirectional server push)
- Automatic reconnection is useful for mobile/background scenarios
- However, WebSocket can handle both chat and radar on single connection (simpler architecture)

**Implementation Approach**:
- Use `ws` package for Node.js WebSocket server
- Single WebSocket connection per session (handles chat + radar updates)
- Session-based connection lifecycle (cleanup on disconnect)
- No message persistence (ephemeral by design)

**Trade-offs**:
- ✅ **Pros**: Bidirectional, low latency, full control, handles both chat and radar
- ⚠️ **Cons**: Manual reconnection logic needed (SSE has automatic reconnection); slightly more complex than SSE
- **Rollback**: If WebSocket complexity blocks, hybrid approach: SSE for radar + HTTP POST for chat (adds latency)

**Sources**:
- Source title: WebSockets vs Server-Sent Events (SSE)
- URL: https://websocket.org/comparisons/sse#websockets-vs-server-sent-events-sse-choosing-your-real-time-protocol
- Notes:
  - WebSocket: Bidirectional, full control, no browser limits, binary support
  - SSE: Unidirectional, automatic reconnection, HTTP/2 multiplexing, 6-connection limit (HTTP/1.1)
  - **Use WebSocket for chat** (bidirectional required)
  - **Use SSE for server-push feeds** (unidirectional acceptable)
  - WebSocket has manual reconnection (SSE has automatic)
- Supports: Scout - Real-time protocol selection

---

## Session Storage

### Recommendation: **In-memory Map** (MVP) with **Redis + TTL** (production scaling path)

**Rationale for In-memory (MVP)**:
- **Simplest setup**: No external dependencies, no database setup
- **Ephemeral by design**: Data lost on server restart (aligns with ephemeral philosophy)
- **Fast**: No network latency, direct memory access
- **Privacy-first**: No persistence layer means no accidental data leakage
- **Session-scoped**: Node.js Map with TTL cleanup (simple timer-based expiration)

**Rationale for Redis (Production)**:
- **Horizontal scaling**: Multiple server instances can share session store
- **TTL support**: Built-in expiration (`EXPIRE` command) for ephemeral sessions
- **Performance**: Still fast (in-memory), but shared across instances
- **Ephemeral-friendly**: Redis TTL ensures automatic cleanup (no manual timer management)

**Storage Requirements**:
- **Session data only**: User ID (hashed), vibe, tags, visibility, approximate location (last updated), active chat partner ID
- **NO message content**: Messages are never stored (ephemeral by design)
- **Safety metadata**: Separate store (database) for reports/blocking (minimal metadata, no messages)

**Implementation Approach (MVP)**:
```javascript
// In-memory session store
const sessions = new Map();
const SESSION_TTL = 3600000; // 1 hour

// Auto-cleanup expired sessions
setInterval(() => {
  const now = Date.now();
  for (const [sessionId, session] of sessions.entries()) {
    if (session.expiresAt < now) {
      sessions.delete(sessionId);
    }
  }
}, 60000); // Check every minute
```

**Migration Path to Redis**:
- Start with in-memory Map (MVP)
- Add Redis when scaling to multiple instances
- Use `express-session` with `connect-redis` store (drop-in replacement)
- Redis TTL ensures ephemeral behavior (automatic expiration)

**Trade-offs**:
- ✅ **In-memory Pros**: Simple, fast, no dependencies, privacy-friendly (no persistence)
- ⚠️ **In-memory Cons**: Data lost on restart, single-instance only, manual TTL cleanup
- ✅ **Redis Pros**: Shared across instances, automatic TTL, production-ready
- ⚠️ **Redis Cons**: External dependency, requires Redis server setup
- **Rollback**: If Redis complexity blocks MVP, stay in-memory; add Redis later for scaling

**Sources**:
- Source title: Redis EXPIRE Command
- URL: https://redis.io/docs/latest/commands/expire/#keys-with-an-expire
- Notes:
  - Redis `EXPIRE` command sets TTL on keys
  - Automatic expiration ensures ephemeral behavior
  - Supports session-scoped data with automatic cleanup
- Supports: Scout - Ephemeral session storage

- Source title: Redis Ephemeral Storage
- URL: https://redis.io/docs/latest/operate/rs/installing-upgrading/install/plan-deployment/persistent-ephemeral-storage/
- Notes:
  - Redis supports ephemeral storage (no persistence)
  - TTL ensures automatic cleanup
  - Suitable for session-scoped data
- Supports: Scout - Storage privacy considerations

---

## Summary & Recommendations

### Recommended Stack for Icebreaker MVP

| Component | Technology | Rationale |
| --- | --- | --- |
| **Frontend Framework** | React + Vite | Simpler for real-time chat MVP; fast dev experience; no SSR overhead needed |
| **UI Component Library** | shadcn/ui (Radix UI) | WCAG AA compliant; works with React+Vite; reference mock uses it |
| **Backend** | Node.js + Express.js | Minimal setup, good WebSocket support |
| **Real-time** | WebSocket (`ws` package) | Bidirectional chat required, low latency |
| **Session Storage** | In-memory Map (MVP), Redis (production) | Simple MVP, scales to Redis with TTL |

### Key Decisions

1. **WebSocket over SSE**: Chat requires bidirectional communication; WebSocket is the right choice
2. **In-memory over Redis (MVP)**: Simplest setup, no external dependencies, aligns with ephemeral philosophy
3. **React + Vite**: Simpler for real-time chat MVP; fast dev experience; no SSR overhead needed
4. **shadcn/ui (Radix UI)**: WCAG AA compliant component library; works with React+Vite; reference mock uses it
5. **Express.js**: Minimal framework, good ecosystem, WebSocket support

### Privacy & Ephemeral Alignment

- ✅ **No message storage**: WebSocket handles real-time only; no persistence layer for messages
- ✅ **Session-scoped data**: In-memory Map with TTL ensures ephemeral behavior
- ✅ **Approximate location**: Browser Geolocation API (no backend storage needed)
- ✅ **Safety metadata**: Separate minimal store (database) for reports only (no message content)

### WCAG AA Compliance Path

- **shadcn/ui (Radix UI)**: Provides WCAG AA compliant components out of the box
- React supports semantic HTML and ARIA
- Radix UI primitives handle keyboard navigation, focus management, and screen reader support automatically
- Playwright MCP can run axe checks for WCAG AA verification
- Manual testing required: keyboard navigation, screen reader testing
- **Accessibility is achievable with Radix UI** (components are accessible by default; custom components need discipline)

### Rollback Paths

1. **Frontend**: If React accessibility concerns arise → Vue.js or Svelte (similar a11y support)
2. **Backend**: If Node.js limitations block → Fastify (faster) or Deno/Bun (modern)
3. **Real-time**: If WebSocket complexity blocks → Hybrid: SSE for radar + HTTP POST for chat (adds latency)
4. **Storage**: If Redis complexity blocks MVP → Stay in-memory; add Redis later for scaling

### Next Steps

1. ✅ Tech stack research complete
2. ⏭️ Document architecture decisions in `docs/architecture/ARCHITECTURE_TEMPLATE.md`
3. ⏭️ Create first GitHub issue for MVP onboarding flow
4. ⏭️ Update Connection Guide with chosen tech stack ports/services

---

**Research Complete**: All acceptance criteria met. Recommendations include trade-offs, rollback paths, and alignment with privacy-first, ephemeral, WCAG AA requirements.
