# MCP Alternatives & Fixes Research

**Date**: 2025-01-27  
**Research Question**: Replace Ref Tools MCP and fix Filesystem/Railway MCPs  
**Researcher**: Scout 🔎

## 1. Ref Tools MCP Replacement

### Current Issue
- Error: "Ref is not correctly configured. Reach out to hello@ref.tools for help."
- Requires API key/account setup that's unclear
- Documentation says "no configuration needed" but error suggests otherwise

### Alternatives

#### Option 1: GitHub MCP Search (RECOMMENDED) ✅
- **Source**: GitHub MCP already configured and working
- **Capabilities**:
  - `search_code` - Search code across GitHub repositories
  - `search_repositories` - Find repositories
  - `search_issues` - Search GitHub issues
  - `get_file_contents` - Read documentation files from repos
- **Pros**:
  - Already configured and working
  - No additional setup needed
  - Can search public repos, private repos (with token), and specific codebases
  - Token-efficient (uses existing GITHUB_TOKEN)
- **Cons**:
  - Limited to GitHub-hosted documentation
  - Doesn't support PDFs or non-GitHub sources
- **Implementation**: Already available - just use `mcp_github_search_code` and `mcp_github_get_file_contents`
- **Rollback**: Use web_search tool or manual browser search

#### Option 2: Web Search Tool (FALLBACK) ✅
- **Source**: Built-in web_search tool available
- **Capabilities**:
  - Search web for documentation
  - Find official docs, Stack Overflow, etc.
- **Pros**:
  - No configuration needed
  - Works for any documentation source
  - Already available
- **Cons**:
  - Less token-efficient than Ref Tools
  - May return less relevant results
- **Implementation**: Already available - use `web_search` tool
- **Rollback**: Manual browser search

#### Option 3: Remove Ref Tools MCP (RECOMMENDED ACTION)
- **Source**: Current workflow analysis
- **Recommendation**: Remove Ref Tools MCP from config, use GitHub MCP + web_search
- **Rationale**:
  - GitHub MCP covers most documentation needs (code, repos, issues)
  - Web search covers everything else
  - Eliminates problematic dependency
  - No loss of functionality
- **Implementation Steps**:
  1. Remove `ref-tools-mcp` from `.cursor/mcp.json`
  2. Update rules to use GitHub MCP + web_search instead
  3. Update Connection Guide

### Recommendation
**Remove Ref Tools MCP** and use **GitHub MCP + web_search** combination. This provides better coverage with no configuration headaches.

## 2. Filesystem MCP Fix

### Current Issue
- Functions not directly visible (working via Desktop Commander)
- May have path resolution issues with `${workspaceFolder}` on Windows

### Solutions

#### Option 1: Fix Path Configuration (RECOMMENDED) ✅
- **Source**: MCP Filesystem Server documentation
- **Issue**: `${workspaceFolder}` may not resolve correctly on Windows
- **Fix**: Use absolute path or verify path resolution
- **Implementation**:
  ```json
  "filesystem": {
    "command": "npx",
    "args": [
      "-y",
      "@modelcontextprotocol/server-filesystem",
      "C:\\Users\\OrEo2\\Desktop\\DevOps\\1. Projects\\Icebreaker"
    ]
  }
  ```
- **Pros**: Direct fix, maintains separate filesystem MCP
- **Cons**: Hardcoded path (less portable)
- **Alternative**: Keep using Desktop Commander (already working)

#### Option 2: Use Desktop Commander (CURRENT WORKAROUND) ✅
- **Source**: Current working solution
- **Status**: Already working via Desktop Commander MCP
- **Functions Available**:
  - `mcp_desktop-commander_list_directory` ✅
  - `mcp_desktop-commander_read_file` ✅
  - `mcp_desktop-commander_write_file` ✅
  - All filesystem operations available
- **Pros**: Already working, no changes needed
- **Cons**: Not a "pure" filesystem MCP (but functionally equivalent)
- **Recommendation**: Keep current setup - it works perfectly

#### Option 3: Enhanced Filesystem MCP
- **Source**: https://github.com/redf0x1/MCP-Server-Filesystem
- **Features**: Enhanced glob patterns, better file operations
- **Pros**: More features
- **Cons**: Third-party, not official, adds complexity
- **Recommendation**: Not needed - Desktop Commander works fine

### Recommendation
**Keep using Desktop Commander MCP** for filesystem operations. It's working perfectly and provides all needed functionality. The separate filesystem MCP is redundant.

## 3. Railway MCP Fix

### Current Issue
- Functions not visible in Cursor tool list
- CLI authenticated (`railway whoami` works)
- Server may not be connecting properly

### Solutions

#### Option 1: Add Railway Token Environment Variable (RECOMMENDED) ✅
- **Source**: Railway MCP documentation
- **Issue**: Railway MCP may need explicit token even though CLI is authenticated
- **Fix**: Add Railway token to environment variables
- **Steps**:
  1. Get Railway token: `railway tokens` or Railway dashboard
  2. Add to `.env`: `RAILWAY_TOKEN=<token>`
  3. Update `.cursor/mcp.json`:
     ```json
     "railway": {
       "command": "npx",
       "args": ["-y", "@railway/mcp-server"],
       "env": {
         "RAILWAY_TOKEN": "${env:RAILWAY_TOKEN}"
       }
     }
     ```
  4. Restart Cursor
- **Pros**: Explicit authentication, more reliable
- **Cons**: Requires token management
- **Rollback**: Use Railway CLI directly

#### Option 2: Verify Railway CLI Authentication ✅
- **Source**: Railway MCP documentation
- **Check**: Ensure Railway CLI is properly authenticated
- **Commands**:
  ```bash
  railway whoami  # Should show user
  railway login   # Re-authenticate if needed
  ```
- **Status**: Already verified - CLI authenticated ✅
- **Next**: Try Option 1 (explicit token)

#### Option 3: Check Node.js Version ✅
- **Source**: Railway MCP requirements
- **Requirement**: Node.js 18+
- **Check**: `node --version` (should be 18+)
- **Status**: Already verified - Node.js 22.18.0 ✅

#### Option 4: Use Railway CLI Directly (FALLBACK) ✅
- **Source**: Current fallback option
- **Status**: Railway CLI works perfectly
- **Commands Available**:
  - `railway status`
  - `railway logs`
  - `railway variables`
  - `railway deploy`
- **Pros**: Already working, no MCP needed
- **Cons**: Manual commands instead of MCP integration
- **Recommendation**: Use if MCP continues to fail

### Recommendation
**Try Option 1 first** (add explicit Railway token). If that doesn't work after restart, use Railway CLI directly - it's already working and provides all needed functionality.

## Summary & Next Steps

### Ref Tools MCP
- **Action**: Remove from config
- **Replacement**: Use GitHub MCP + web_search
- **Impact**: No loss of functionality, eliminates problematic dependency

### Filesystem MCP
- **Action**: Keep current setup (Desktop Commander)
- **Status**: Already working perfectly
- **Impact**: No changes needed

### Railway MCP
- **Action**: Add explicit Railway token to config
- **Fallback**: Use Railway CLI directly (already working)
- **Impact**: Better integration if token works, otherwise CLI is sufficient

### Implementation Priority
1. **High**: Remove Ref Tools MCP (eliminates problem)
2. **Medium**: Add Railway token (may fix Railway MCP)
3. **Low**: Filesystem MCP (already working via Desktop Commander)

### Rollback Options
- Ref Tools: Use web_search (already available)
- Filesystem: Keep Desktop Commander (already working)
- Railway: Use Railway CLI (already working)

All alternatives are already available and working - no functionality loss.

