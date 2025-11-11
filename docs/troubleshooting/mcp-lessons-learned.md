# MCP Configuration Lessons Learned

**Date**: 2025-11-10  
**Summary**: Key learnings from migrating MCP servers from Smithery CLI to direct installations

## Critical Changes

### 1. Smithery CLI STDIO Support Discontinued (September 2025)

**Problem**: All MCP servers using `@smithery/cli run` commands were timing out.

**Root Cause**: Smithery discontinued STDIO support, requiring migration to Streamable HTTP or direct package installations.

**Solution**: Migrated all MCP servers to direct npm package installations:
- **Before**: `npx -y @smithery/cli@latest run @smithery-ai/github`
- **After**: `npx -y @modelcontextprotocol/server-github`

**Impact**: 
- All MCP configs must use direct packages
- Self-healing tool (`npm run mcp:heal`) detects deprecated Smithery CLI usage
- Preflight checks updated to validate direct package usage

### 2. Supabase Access Token vs Anon Key

**Problem**: Confusion between Personal Access Token (`sbp_...`) and Anonymous Key (`eyJ...`).

**Key Differences**:
- **Access Token** (`sbp_...`): For Supabase Management API, account/project management
- **Anon Key** (`eyJ...`): For database operations, respects RLS policies, required by MCP

**Solution**: 
- Use Management API with access token to get project info (URL, project ID)
- Get anon key from dashboard (Settings → API → `anon` `public` key)
- Documented in `docs/troubleshooting/supabase-access-token-vs-anon-key.md`

**Lessons**:
- Management API doesn't expose API keys (security restriction)
- Access tokens can retrieve project metadata but not database keys
- Always clarify which type of key is needed for which purpose

### 3. Ref Tools MCP Configuration

**Finding**: Ref Tools MCP requires no configuration - it runs on stdio automatically.

**Lesson**: Not all MCP servers need environment variables or complex setup. Check package documentation before assuming configuration is needed.

### 4. Environment Variable Management

**Best Practices**:
- Store tokens in `.env` file (git-ignored)
- Use `npm run mcp:load-env:win` to load from `.env` to system
- Set as **User-level** variables (not session) for Cursor to access
- Always restart Cursor completely after env var changes

**Common Mistakes**:
- Setting variables only in current PowerShell session (lost on close)
- Not restarting Cursor after setting variables
- Using wrong variable scope (session vs User-level)

### 5. MCP Server Package Discovery

**Process**:
1. Search npm registry: `npm search <keyword> mcp`
2. Verify package exists and is maintained
3. Check package README for configuration requirements
4. Test with `npx -y <package>` before adding to config

**Found Packages**:
- `@wonderwhy-er/desktop-commander` - Direct package (not via Smithery)
- `@playwright/mcp` - Official Playwright MCP package
- `supabase-mcp` - Community Supabase MCP (different from `supabase-mcp-lite`)
- `ref-tools-mcp` - Direct package, no config needed

### 6. Self-Healing and Validation

**Tools Created**:
- `npm run mcp:heal` - Detects and fixes common issues:
  - Missing `env` fields in config
  - Deprecated Smithery CLI usage
  - Missing environment variables
- `npm run preflight` - Validates MCP configuration on startup
- `npm run mcp:test-connectivity` - Tests network connectivity to MCP services

**Lessons**:
- Automated detection prevents configuration drift
- Self-healing reduces manual troubleshooting
- Validation catches issues before they cause failures

## Configuration Patterns

### Standard MCP Server Config

```json
{
  "mcpServers": {
    "server-name": {
      "command": "npx",
      "args": ["-y", "package-name"],
      "env": {
        "REQUIRED_VAR": "${env:REQUIRED_VAR}"
      }
    }
  }
}
```

### Servers Without Config

```json
{
  "mcpServers": {
    "server-name": {
      "command": "npx",
      "args": ["-y", "package-name"]
    }
  }
}
```

## Future Considerations

1. **Monitor for Package Updates**: Direct packages may have breaking changes
2. **Alternative Providers**: Consider Apify or other platforms if Smithery continues deprecating features
3. **HTTP Transport**: Future MCP servers may require HTTP/Streamable HTTP instead of STDIO
4. **Key Rotation**: Regularly rotate API keys and update environment variables

## Documentation Updates

All lessons learned have been incorporated into:
- `.cursor/rules/04-integrations.mdc` - MCP usage rules
- `docs/troubleshooting/mcp-troubleshooting.md` - Troubleshooting guide
- `docs/troubleshooting/mcp-setup-guide.md` - Setup instructions
- `docs/troubleshooting/supabase-access-token-vs-anon-key.md` - Supabase key clarification
- `.env` - Template with all required variables

