# Research Log (Ref Tools/Search MCP)

Use this file to paste brief citations and summaries when any agent uses Ref Tools MCP, GitHub MCP, or other research tools.

---

# MCP Server Status Indicators (Red → Yellow → Never Green)

**Research Date**: 2025-01-27  
**Researcher**: Scout 🔎  
**Task**: Investigate why MCP servers show red then yellow but never green status in Cursor IDE  
**Issue**: MCP connection troubleshooting

## Sources Consulted

### Cursor Forum - MCP Status Detection Failures
- **Source**: Cursor IDE Forum - MCP Status Detection Failures ([forum.cursor.com](https://forum.cursor.com/t/mcp-status-detection-failures/100397))
- **Notes**:
  - MCP status colors indicate connection states: Red = failed, Yellow = attempting/partial, Green = fully connected
  - Red → Yellow transition means Cursor is attempting to connect but failing to complete handshake
  - Check MCP Logs in Output panel (View → Output → "MCP Logs" dropdown) for detailed error messages
  - Common causes: missing environment variables, incorrect paths, npx cache issues
- **Supports**: Nexus - MCP troubleshooting and configuration

### Cursor Forum - MCP Server Name Caching Issue
- **Source**: Cursor IDE's MCP Server Name Caching Issue ([forum.cursor.com](https://forum.cursor.com/t/cursor-ides-mcp-server-name-caching-issue-always-red-status/136058))
- **Notes**:
  - **Critical finding**: Cursor caches MCP server names after failed connection attempts
  - Servers can remain in red/yellow status even after underlying issues are fixed
  - **Workaround**: Rename MCP server to completely new name in `mcp.json`, then restart Cursor
  - This bypasses the cached failure state
- **Supports**: Nexus - MCP configuration fixes

### Medium - FastMCP Setup Guide
- **Source**: Turn Cursor into a Local AI Agent Platform with FastMCP ([medium.com](https://medium.com/@jeremy.deats/turn-cursor-into-a-local-ai-agent-platform-with-fastmcp-5907914f88b6))
- **Notes**:
  - Verify MCP servers work manually before troubleshooting Cursor integration
  - Test commands directly: `npx -y @smithery/cli@latest run <server-name>`
  - If manual test works but Cursor shows errors, it's a Cursor configuration issue
  - Ensure absolute paths in `mcp.json` (though Smithery servers use npx, not file paths)
- **Supports**: Nexus - MCP validation

### Internal Documentation
- **Source**: `Docs/troubleshooting/mcp-troubleshooting.md`
- **Notes**:
  - Missing environment variables is #1 cause of MCP failures
  - Windows requires `npm run mcp:load-env:win` to set User-level env vars
  - Cursor must be **completely restarted** (all windows closed) after env var changes
  - npx cache can cause issues: `Remove-Item -Recurse -Force "$env:LOCALAPPDATA\npm-cache\_npx"`
  - Current config uses `cmd /c` wrapper which is correct for Windows
- **Supports**: Nexus - MCP troubleshooting workflow

## Key Findings

### Status Color Meanings
- **Red**: Connection failed immediately (server not found, command error, missing env vars)
- **Yellow**: Connection attempt in progress but handshake incomplete (timeout, auth failure, partial startup)
- **Green**: Fully connected and operational (server responding to requests)

### Root Causes for Red → Yellow → Never Green
1. **Missing Environment Variables** (Most Common)
   - MCP config doesn't include `"env"` field to pass variables to servers
   - Windows User-level env vars not loaded into Cursor's process
   - Solution: Add `"env"` field to each server config OR ensure User-level vars are set

2. **Cursor Server Name Caching**
   - Cursor caches failed server names and won't retry properly
   - Even after fixing issues, status remains red/yellow
   - Solution: Rename servers in config, restart Cursor

3. **npx Cache Corruption**
   - Stale npx cache can cause command execution failures
   - Solution: Clear cache and restart

4. **Missing `env` Field in mcp.json**
   - Current config lacks `"env"` field to pass GITHUB_TOKEN to servers
   - Servers may start but fail authentication, causing yellow status
   - Solution: Add `"env": { "GITHUB_TOKEN": "${env:GITHUB_TOKEN}" }` to each server

## Recommendation

**Immediate Actions:**
1. Add `"env"` field to all MCP server configs in `.cursor/mcp.json` to pass environment variables
2. Verify environment variables are set: `[System.Environment]::GetEnvironmentVariable('GITHUB_TOKEN', 'User')`
3. If vars are missing, run `npm run mcp:load-env:win`
4. Clear npx cache: `Remove-Item -Recurse -Force "$env:LOCALAPPDATA\npm-cache\_npx"`
5. **Rename all MCP servers** in config (add `-v2` suffix) to bypass Cursor's caching
6. **Completely restart Cursor** (close all windows)
7. Check MCP Logs in Output panel for specific error messages

**Default Choice**: Add `env` field to config + rename servers + full restart

**Rollback**: If issues persist, try global config location (`%USERPROFILE%\.cursor\mcp.json`) or test with single server first

**Next Steps**: 
- Update `.cursor/mcp.json` with `env` fields
- Create script to rename MCP servers automatically
- Update `Docs/troubleshooting/mcp-troubleshooting.md` with caching workaround

---

# MCP "Error - ShowOutput" - Smithery CLI Timeout Issue

**Research Date**: 2025-01-27  
**Researcher**: Scout 🔎  
**Task**: Investigate "Error - ShowOutput" status for MCP servers after configuration fixes  
**Issue**: MCP connection troubleshooting - timeout errors

## Sources Consulted

### Manual Testing Results
- **Source**: Direct command execution test
- **Command Tested**: `npx -y @smithery/cli@latest run @smithery-ai/github --key <key> --profile <profile>`
- **Error Observed**: `Request timed out: TimeoutError: The operation was aborted due to timeout`
- **Notes**:
  - Manual test confirms the issue is with Smithery CLI connection, not Cursor configuration
  - Timeout occurs when Smithery CLI tries to connect to Smithery's servers
  - This explains "Error - ShowOutput" - the timeout error is in stderr output
- **Supports**: Nexus - Network/connectivity troubleshooting

### Cursor GitHub Issues - Network Connectivity
- **Source**: Cursor GitHub Issues - MCP Connection Problems ([github.com](https://github.com/cursor/cursor/issues/3314))
- **Notes**:
  - Cursor's sandboxed environment may restrict network requests to `127.0.0.1`
  - Some MCP servers require external network access which may be blocked
  - Smithery CLI needs to connect to Smithery's servers to authenticate and fetch server configs
- **Supports**: Nexus - Network configuration

### Cursor Forum - MCP Update Issues
- **Source**: Cursor Forum - MCP Error with Latest Update ([forum.cursor.com](https://forum.cursor.com/t/im-getting-mcp-error-with-the-latest-update/72733))
- **Notes**:
  - Users report MCP errors after Cursor updates
  - Some issues resolved by checking network connectivity
  - Smithery CLI requires internet connection to function
- **Supports**: Nexus - Update-related troubleshooting

## Key Findings

### Root Cause: Smithery CLI Timeout
The "Error - ShowOutput" status indicates:
1. **Smithery CLI Connection Failure**: The CLI is timing out when trying to connect to Smithery's servers
2. **Network/Connectivity Issue**: Either network is blocked, Smithery service is down, or firewall is blocking
3. **Authentication Timeout**: The key/profile combination may be invalid, expired, or the auth service is unreachable

### Error Flow
1. Cursor starts MCP server via `cmd /c npx @smithery/cli@latest run ...`
2. Smithery CLI attempts to connect to Smithery servers for authentication/config
3. Connection times out (no response from Smithery servers)
4. Error is written to stderr
5. Cursor shows "Error - ShowOutput" (indicating stderr output available)

## Recommendations

### Immediate Actions
1. **Check Network Connectivity**:
   - Test if Smithery servers are reachable: `curl https://smithery.ai` or `ping smithery.ai`
   - Check if behind corporate firewall/proxy that blocks external connections
   - Verify internet connection is active

2. **Verify Smithery Key/Profile**:
   - Check if Smithery key is still valid (may have expired)
   - Verify profile name is correct
   - Try regenerating key/profile in Smithery dashboard

3. **Test Without Profile**:
   - Try removing `--profile` argument to see if that's causing the timeout
   - Some servers may work without profile parameter

4. **Check Firewall/Proxy Settings**:
   - Windows Firewall may be blocking npx/node connections
   - Corporate proxy may require configuration
   - Antivirus may be blocking network requests

5. **Alternative: Use Direct MCP Servers**:
   - Instead of Smithery CLI, use direct MCP server installations
   - Example: `npx -y @modelcontextprotocol/server-github` instead of Smithery wrapper
   - This bypasses Smithery's authentication layer

### Default Choice
1. Test network connectivity to Smithery servers
2. Verify key/profile validity
3. If timeout persists, switch to direct MCP server installations (bypass Smithery)

### Rollback
- If direct MCP servers work, migrate config to use direct installations
- Keep Smithery config as backup if service becomes available

### Next Steps
- Create network connectivity test script
- Document direct MCP server installation as alternative
- Update troubleshooting guide with timeout-specific solutions
- Consider adding timeout detection to self-healing tool

---

# Smithery CLI Connection Method Research

**Research Date**: 2025-01-27  
**Researcher**: Scout 🔎  
**Task**: Research Smithery documentation to understand correct connection method and diagnose timeout issues  
**Issue**: MCP timeout errors with Smithery CLI  
**Source**: [Smithery Documentation](https://smithery.ai/docs)

## Sources Consulted

### Smithery Documentation - Connection Methods
- **Source**: Smithery Documentation - Connect to servers ([smithery.ai/docs](https://smithery.ai/docs))
- **Notes**:
  - Smithery servers use **Streamable HTTP** connections, not STDIO
  - Correct URL format: `https://server.smithery.ai/@org/server/mcp?api_key=YOUR_API_KEY&profile=YOUR_PROFILE`
  - Example config shows HTTP-based connection, not command-line execution
  - The `@smithery/cli` command may be attempting STDIO when HTTP is required
- **Supports**: Nexus - MCP configuration correction

### GitHub Issues - Authentication Errors
- **Source**: Smithery CLI GitHub Issues - 401 Unauthorized ([github.com/smithery-ai/cli/issues/292](https://github.com/smithery-ai/cli/issues/292))
- **Notes**:
  - Users report 401 Unauthorized errors during connection attempts
  - Timeout errors may mask underlying authentication failures
  - OAuth-style authentication flow required for some servers
  - Token exchange and user redirects must be handled correctly
- **Supports**: Nexus - Authentication troubleshooting

### Smithery Service Status
- **Source**: Smithery Status Page ([smithery.instatus.com](https://smithery.instatus.com))
- **Notes**:
  - Service reported operational as of November 2025
  - No recent outages reported
  - However, critical vulnerability was patched in June 2025 affecting 3000+ servers
  - API key rotations may have invalidated old keys
- **Supports**: Nexus - Service availability verification

### Alternative Connection Methods
- **Source**: Sammy Labs Documentation - MCP Configuration ([docs.sammylabs.com](https://docs.sammylabs.com/features/mcp))
- **Notes**:
  - Shows correct HTTP-based configuration format
  - Uses `streamableHttp` type with URL including `api_key` and `profile` parameters
  - Example: `https://server.smithery.ai/@BlackSand-Software/hubspot-mcp/mcp?api_key=YOUR_API_KEY&profile=YOUR_PROFILE`
  - Debug mode available: `debug: true` for verbose logging
- **Supports**: Nexus - Configuration format correction

## Key Findings

### Root Cause: STDIO Support Discontinued
**CRITICAL FINDING**: Smithery discontinued STDIO support as of September 7, 2025 ([blog.apify.com](https://blog.apify.com/smithery-alternative/))

The timeout issue is caused by:
1. **Deprecated Connection Method**: The `@smithery/cli run` command uses STDIO, which Smithery no longer supports
2. **Required Migration**: All MCP servers must use Streamable HTTP protocols, not STDIO
3. **CLI Command Obsolete**: The `npx @smithery/cli run` approach is no longer functional for production connections
4. **Timeout Explanation**: CLI attempts STDIO connection → Smithery rejects it → Connection times out waiting for response

### Correct Smithery Connection Method
Based on documentation:
- **HTTP/Streamable HTTP**: Smithery servers are accessed via HTTP endpoints
- **URL Format**: `https://server.smithery.ai/@org/server/mcp?api_key=KEY&profile=PROFILE`
- **Not STDIO**: The servers don't use standard input/output communication
- **Direct URL Access**: Can be tested with `curl` to verify connectivity

### Authentication Requirements
- **OAuth Flow**: Some servers require OAuth-style login and token exchange
- **Client Handling**: Client must manage OAuth flow, token storage, and redirects
- **401 Errors**: Unauthorized errors may be masked as timeouts if authentication fails silently

## Recommendations

### Immediate Actions
1. **Test Direct HTTP Connection**:
   ```powershell
   curl "https://server.smithery.ai/@smithery-ai/github/mcp?api_key=361d670b-15ef-4f3e-9b93-16d7839e6e8b&profile=spectacular-piranha-CUJgZQ"
   ```
   This will verify if the HTTP endpoint is reachable and if authentication works.

2. **Check if CLI Command is Correct**:
   - Review Smithery CLI documentation for correct usage
   - The `run` command may be for local development, not production connections
   - Verify if CLI should use HTTP endpoints instead of STDIO

3. **Enable Debug Mode**:
   - If using HTTP-based config, enable `debug: true`
   - This will show detailed connection logs

4. **Verify API Key Permissions**:
   - Check if key has correct permissions for the servers being accessed
   - Verify profile name matches exactly (case-sensitive)

### Default Choice
**Immediate Action Required**: Migrate from STDIO-based CLI commands to HTTP/Streamable HTTP endpoints

1. **Option A: Use Direct HTTP Endpoints** (Recommended if staying with Smithery):
   - Update MCP config to use HTTP URLs instead of CLI commands
   - Format: `https://server.smithery.ai/@org/server/mcp?api_key=KEY&profile=PROFILE`
   - Requires finding correct server paths for each MCP

2. **Option B: Migrate to Direct MCP Servers** (Recommended for reliability):
   - Use `@modelcontextprotocol/server-*` packages directly
   - Bypasses Smithery entirely, uses STDIO locally
   - More reliable and doesn't depend on Smithery service

3. **Option C: Migrate to Apify** (If need cloud hosting):
   - Apify still supports STDIO-based MCP servers
   - Full compatibility without code changes
   - Alternative to Smithery for cloud deployment

### Rollback
- If Smithery CLI method doesn't work, switch to direct MCP server installations
- Use `@modelcontextprotocol/server-*` packages directly (bypasses Smithery entirely)
- Keep Smithery config as backup if service becomes available

### Next Steps
- **URGENT**: Update MCP config to remove STDIO-based CLI commands
- Migrate to direct MCP server installations (`@modelcontextprotocol/server-*`)
- OR update to HTTP/Streamable HTTP endpoints if staying with Smithery
- Document migration path in troubleshooting guide
- Update self-healing tool to detect and fix STDIO-based configs

---

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

# Radar View Implementation Research

**Research Date**: 2025-11-06  
**Researcher**: Scout 🔎
**Task**: Research Radar View requirements, WebSocket patterns, Signal Engine implementation, and proximity matching for Issue #2  
**Issue**: #2 (Radar View - Proximity-Based Presence Visualization)

## Sources Consulted

### Vision Documents (Internal)
- **Source**: Radar & Chat Vision (`Docs/Vision/IceBreaker — Radar & Chat Vision.txt`)
- **Notes**:
  - Radar displays proximity-based presence (CRT sweep or accessible list)
  - No avatars, no profiles, no pressure
  - Sorted by lightweight compatibility (Signal Engine)
  - Empty state: "No one here — yet."
  - Visibility ON → eligible to appear
  - Skipping tags → reduced discoverability (soft penalty)
  - Score hints: higher score = closer to center / stronger pulse
- **Supports**: Link - Radar UI implementation

- **Source**: Signal Engine Vision (`Docs/Vision/IceBreaker — Signal Engine Vision.txt`)
- **Notes**:
  - MVP scoring formula: `score(A,B) = w_vibe * VIBE_MATCH + w_tag * MIN(shared_tags, 3) + w_vis * VISIBILITY_ON + w_tagless * TAGLESS + w_dist * PROXIMITY_TIER`
  - Default weights: `w_vibe = +10`, `w_tag = +5` (per tag, max 3), `w_vis = +3`, `w_tagless = -5`, `w_dist = +2`
  - Safety rule: if `safety_flag == true` → exclude from results
  - Tie-breakers: stable random seed per session, then alphabetical handle
  - Higher score → closer to center of Radar / stronger pulse
- **Supports**: Forge - Signal Engine service implementation

- **Source**: Product Vision (`docs/vision.md`)
- **Notes**:
  - Radar success criteria: Radar updates in < 1s
  - Accessibility: WCAG AA compliance, reduced-motion, high-contrast, keyboard navigation
  - Performance: Radar updates < 1s
  - Brand vibe: "terminal meets Game Boy" - deep navy/charcoal base, neon teal accents
- **Supports**: All agents - Success criteria and constraints

- **Source**: Architecture Template (`docs/architecture/ARCHITECTURE_TEMPLATE.md`)
- **Notes**:
  - WebSocket protocol: `wss://api.icebreaker.app/ws?token=<sessionToken>`
  - Message types: `radar:subscribe`, `radar:update`, `chat:request`, etc.
  - Signal Engine: `backend/src/services/SignalEngine.ts`
  - Radar Module: `frontend/src/pages/radar/`
  - Session data: vibe, tags, visibility, approximate location, active chat partner
- **Supports**: Forge + Link - Implementation architecture

- **Source**: UI Mock (`Docs/Vision/ui_ux_mocks/app/radar/page.tsx`)
- **Notes**:
  - React component with CRT sweep visualization
  - Toggle between radar/list view modes
  - Selected person card with handle, vibe, tags, signal score
  - One-tap chat initiation: "START CHAT →" button
  - PanicButton component (always accessible FAB)
  - RetroHeader with view toggle and PROFILE link
- **Supports**: Link - Component structure and UI patterns

### Technical Research (External)

- **Source**: WebSocket.org - Building a WebSocket App
- **URL**: https://websocket.org/guides/building-a-websocket-app
- **Notes**:
  - WebSocket patterns for real-time applications
  - Connection lifecycle management
  - Heartbeat/ping-pong pattern for connection health
  - Scaling considerations for WebSocket applications
- **Supports**: Forge - WebSocket server implementation

- **Source**: WebSocket API Reference - Heartbeat/Ping-Pong Pattern
- **URL**: https://websocket.org/reference/websocket-api#heartbeatping-pong-pattern
- **Notes**:
  - Ping-pong pattern maintains connection health
  - Prevents connection timeouts
  - Useful for ephemeral sessions (detect stale connections)
- **Supports**: Forge - WebSocket connection management

## Key Findings

### Radar View Requirements
1. **Visualization**: CRT sweep style OR accessible list view (user toggle)
2. **Real-time Updates**: WebSocket connection for proximity updates
3. **Signal Engine**: Compatibility scoring (vibe match, shared tags, visibility, proximity, safety)
4. **Empty States**: "No one here — yet." when no nearby sessions
5. **GPS States**: Graceful handling of denied/off location permissions
6. **One-tap Chat**: Tap person on radar → initiate chat request
7. **Accessibility**: WCAG AA, reduced-motion, high-contrast, keyboard navigation

### Signal Engine Implementation
1. **Scoring Formula**: Weighted sum of compatibility factors
2. **Default Weights**: Tunable via config file (A/B testing capability)
3. **Safety Exclusion**: Recent panic → hide from Radar
4. **Proximity Tiers**: Coarse buckets (within room / venue / nearby)
5. **Tie-breakers**: Stable random seed + alphabetical handle

### WebSocket Protocol
1. **Connection**: `wss://api.icebreaker.app/ws?token=<sessionToken>`
2. **Client Messages**: `radar:subscribe`, `chat:request`, `location:update`
3. **Server Messages**: `radar:update`, `chat:request`, `chat:accepted`, `error`
4. **Heartbeat**: Ping-pong pattern for connection health
5. **Session-based**: Connection lifecycle tied to session token

### Proximity Matching
1. **Approximate Location**: Browser Geolocation API (user permission)
2. **Privacy-first**: No precise coordinates stored
3. **Proximity Tiers**: Coarse buckets (room/venue/nearby)
4. **Distance Calculation**: Haversine formula or simple distance (approximate)
5. **GPS Denied**: Graceful fallback (reduced experience)

### Performance Requirements
1. **Radar Updates**: < 1s (real-time proximity updates)
2. **Signal Engine**: Efficient scoring for all visible sessions
3. **WebSocket Latency**: < 500ms for chat initiation
4. **Accessibility**: No performance degradation for screen readers

### Accessibility Requirements
1. **WCAG AA**: Minimum compliance standard
2. **Reduced Motion**: Disable sweeps, blinks, pulses
3. **High Contrast**: Brighten teal, ensure text contrast
4. **Keyboard Navigation**: Full keyboard paths
5. **Screen Reader**: ARIA labels on dots, list items, FAB

## Implementation Recommendations

### Frontend (Link)
1. **Radar Component**: CRT sweep visualization with toggle to list view
2. **WebSocket Hook**: `useWebSocket` for connection management
3. **Signal Display**: Visual hints (closer to center = higher score)
4. **Empty States**: Clear messaging for no nearby sessions
5. **Accessibility**: Keyboard navigation, screen reader support, reduced-motion

### Backend (Forge)
1. **Signal Engine Service**: Compatibility scoring algorithm
2. **WebSocket Server**: Connection handler for radar updates
3. **Proximity Calculation**: Distance-based proximity tiers
4. **Safety Exclusions**: Filter out blocked/reported sessions
5. **Configurable Weights**: Tunable Signal Engine weights

### Testing (Pixel)
1. **Unit Tests**: Signal Engine scoring algorithm
2. **Integration Tests**: WebSocket connection + radar updates
3. **E2E Tests**: Onboarding → Radar → Chat flow
4. **Accessibility Tests**: WCAG AA compliance, keyboard navigation
5. **Performance Tests**: Radar update latency < 1s

## Trade-offs

| Decision | Pros | Cons |
|----------|------|------|
| WebSocket for Radar | Real-time updates, single connection | Manual reconnection logic |
| Approximate Location | Privacy-first, no precise tracking | Less accurate proximity matching |
| Signal Engine Scoring | Explainable, tunable weights | May need A/B testing for optimal weights |
| CRT Sweep Visualization | Unique brand aesthetic | May be challenging for accessibility |

## Next Steps

1. ✅ Research complete
2. ⏭️ Vector creates comprehensive plan with all agents
3. ⏭️ Forge implements Signal Engine service
4. ⏭️ Link implements Radar UI components
5. ⏭️ Pixel creates test suite
6. ⏭️ Muse updates documentation

---

## 2025-11-06: Radar View Implementation Research

**Research Date**: 2025-11-06  
**Researcher**: Scout 🔎
**Task**: Research Radar View requirements, WebSocket patterns, Signal Engine implementation, and proximity matching for Issue #2  
**Issue**: #2 (Radar View - Proximity-Based Presence Visualization)

### Sources Consulted

**Vision Documents (Internal)**:
- Radar & Chat Vision: CRT sweep or list view, Signal Engine sorting, empty states, one-tap chat
- Signal Engine Vision: MVP scoring formula with tunable weights, safety exclusions, tie-breakers
- Architecture Template: WebSocket protocol, message types, module structure
- UI Mock: React component patterns, view toggle, selected person card
- Product Vision: Performance targets, accessibility requirements, brand vibe

**Technical Research (External)**:
- WebSocket.org: Real-time app patterns, connection lifecycle, heartbeat/ping-pong
- WebSocket API Reference: Heartbeat pattern for connection health

### Key Findings

**Radar View Requirements**:
1. CRT sweep OR accessible list view (user toggle)
2. WebSocket for real-time proximity updates
3. Signal Engine compatibility scoring
4. Empty states, GPS denied handling
5. One-tap chat initiation
6. WCAG AA accessibility

**Signal Engine**:
- Formula: `score(A,B) = w_vibe * VIBE_MATCH + w_tag * MIN(shared_tags, 3) + w_vis * VISIBILITY_ON + w_tagless * TAGLESS + w_dist * PROXIMITY_TIER`
- Default weights: `w_vibe = +10`, `w_tag = +5` (max 3), `w_vis = +3`, `w_tagless = -5`, `w_dist = +2`
- Safety: Recent panic → exclude from results
- Tie-breakers: Stable random seed + alphabetical handle

**WebSocket Protocol**:
- Connection: `wss://api.icebreaker.app/ws?token=<sessionToken>`
- Messages: `radar:subscribe`, `radar:update`, `chat:request`, `location:update`
- Heartbeat: Ping-pong pattern for connection health

**Proximity Matching**:
- Approximate location (Browser Geolocation API)
- Coarse proximity tiers (room/venue/nearby)
- Privacy-first: No precise coordinates stored

### Implementation Recommendations

**Frontend (Link)**: Radar component, WebSocket hook, signal display, empty states, accessibility  
**Backend (Forge)**: Signal Engine service, WebSocket server, proximity calculation, safety exclusions  
**Testing (Pixel)**: Unit tests, integration tests, E2E tests, accessibility tests, performance tests

### Trade-offs

- WebSocket: Real-time updates vs manual reconnection
- Approximate Location: Privacy-first vs less accurate matching
- Signal Engine: Explainable/tunable vs may need A/B testing
- CRT Sweep: Unique aesthetic vs accessibility challenges

**Next Steps**: Vector creates comprehensive plan with all agents involved

---

## 2025-11-09: Supabase MCP Migration to Hosted Server

**Research Date**: 2025-11-09  
**Researcher**: Nexus 🚀  
**Task**: Migrate from npm package `supabase-mcp` to official hosted Supabase MCP server  
**Issue**: Supabase MCP configuration simplification

### Sources Consulted

**Official Supabase Documentation**:
- **Source**: [Supabase MCP Documentation](https://supabase.com/docs/guides/getting-started/mcp)
- **Notes**:
  - Supabase now provides official hosted MCP server at `https://mcp.supabase.com/mcp`
  - Uses dynamic client registration for authentication (no PAT needed)
  - Browser-based authentication flow
  - Project-scoped access via `project_ref` query parameter
  - Feature groups: docs, account, database, debugging, development, functions, branching, storage
  - No environment variables required
  - Previously required `MCP_API_KEY` (npm package only)

### Key Findings

**Hosted Server Benefits**:
1. **No environment variables** - Authentication handled automatically via browser
2. **Simpler configuration** - Just a URL, no command/args/env needed
3. **Official support** - Maintained by Supabase team
4. **Project scoping** - Limited to specific project via `project_ref`
5. **Feature control** - Enable/disable specific tool groups

**Configuration Change**:
- **Before**: npm package `supabase-mcp` with `MCP_API_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- **After**: Hosted server URL with `project_ref` and `features` query parameters

**Migration Steps**:
1. Update `.cursor/mcp.json` to use hosted server URL
2. Remove `MCP_API_KEY` from environment variables (no longer needed)
3. Remove Supabase env vars from MCP config (still useful for client libraries)
4. Restart Cursor - browser authentication prompt on first use

### Implementation

**Updated Configuration**:
```json
{
  "mcpServers": {
    "supabase": {
      "url": "https://mcp.supabase.com/mcp?project_ref=awqcctsqyrlgaygpmgrq&features=docs%2Caccount%2Cdatabase%2Cdebugging%2Cdevelopment%2Cfunctions%2Cbranching%2Cstorage"
    }
  }
}
```

**Documentation Updates**:
- Updated `docs/troubleshooting/mcp-setup-guide.md` - Reflect hosted server
- Updated `docs/troubleshooting/mcp-env-setup-windows.md` - Remove Supabase env vars
- Updated `docs/troubleshooting/supabase-key-setup.md` - Mark as optional/for other uses
- Updated `docs/troubleshooting/mcp-troubleshooting.md` - Update Supabase section
- Updated `tools/mcp-self-heal.mjs` - Skip env checks for hosted server
- Updated `tools/health-check.mjs` - Recognize hosted server doesn't need env vars
- Updated `.env` - Removed `MCP_API_KEY`, added note about hosted server

### Trade-offs

**Pros**:
- Simpler setup (no env vars)
- Official support
- Better security (browser-based auth)
- Project scoping built-in

**Cons**:
- Requires browser for authentication
- Less control over authentication flow
- Requires internet connection

**Next Steps**: All MCPs now working with simplified configuration

---
 
 - - -  
  
 # #   G i t H u b   M C P   A u t h e n t i c a t i o n   I s s u e   ( 2 0 2 5 - 1 1 - 1 0 )  
  
 * * R e s e a r c h   D a t e * * :   2 0 2 5 - 1 1 - 1 0  
 * * R e s e a r c h e r * * :   S c o u t    
 * * T a s k * * :   F i x   G i t H u b   M C P   \  
 R e q u i r e s  
 a u t h e n t i c a t i o n \   e r r o r  
 * * I s s u e * * :   G i t H u b   M C P   a u t h e n t i c a t i o n   f a i l i n g   d e s p i t e   v a l i d   t o k e n  
  
 # # #   F i n d i n g s  
 -     T o k e n   i s   v a l i d   ( t e s t e d   w i t h   G i t H u b   A P I )  
 -     T o k e n   i s   s e t   i n   W i n d o w s   U s e r   e n v i r o n m e n t   v a r i a b l e s  
 -     M C P   c o n f i g   f o r m a t   i s   c o r r e c t  
 -     M C P   s e r v e r   s t a r t s   c o r r e c t l y   w h e n   r u n   d i r e c t l y  
 -     C u r s o r   I D E   i s   n o t   p a s s i n g   e n v i r o n m e n t   v a r i a b l e s   t o   M C P   s e r v e r   p r o c e s s e s  
  
 * * S o l u t i o n * * :   R e s t a r t   C u r s o r   c o m p l e t e l y   ( c l o s e   a l l   w i n d o w s ) .   S e e   \ d o c s / t r o u b l e s h o o t i n g / g i t h u b - m c p - a u t h - f i x . m d \   f o r   f u l l   t r o u b l e s h o o t i n g   g u i d e .  
 