# MCP Troubleshooting Guide

> **Last Updated**: 2025-11-11  
> **Purpose**: Detailed troubleshooting guide for MCP server issues  
> **Related**: See `docs/guides/setup/mcp-setup.md` for initial setup

## Quick Checks

### 1. Verify Environment Variables Are Set

**Windows PowerShell:**
```powershell
[System.Environment]::GetEnvironmentVariable('GITHUB_TOKEN', 'User')
```

Should return your token. If empty, run:
```powershell
npm run mcp:load-env:win
```

Then **restart Cursor completely**.

### 2. Verify MCP Configuration Location

Cursor supports two locations:
- **Project-level**: `<project-root>/.cursor/mcp.json` (your current setup)
- **Global**: `%USERPROFILE%\.cursor\mcp.json` (Windows)

If project-level isn't working, try copying to global:
```powershell
Copy-Item ".cursor\mcp.json" "$env:USERPROFILE\.cursor\mcp.json"
```

### 3. Clear npx Cache

Sometimes npx cache causes issues:
```powershell
Remove-Item -Recurse -Force "$env:LOCALAPPDATA\npm-cache\_npx"
```
Then restart Cursor.

### 4. Test MCP Command Manually

Test if the MCP server command works:
```powershell
$env:GITHUB_TOKEN = "your_token_here"
npx -y @modelcontextprotocol/server-github
```

If this works but Cursor shows errors, it's a Cursor configuration issue.

### 5. Check Cursor MCP Status

In Cursor:
1. Open Settings (Ctrl+,)
2. Search for "MCP" or "Model Context Protocol"
3. Check if servers are enabled
4. Look for error messages

### 6. Verify Environment Variable Format

Your `.cursor/mcp.json` should use:
```json
"env": {
  "GITHUB_TOKEN": "${env:GITHUB_TOKEN}"
}
```

NOT:
- `${GITHUB_TOKEN}` (missing `env:`)
- `"GITHUB_TOKEN"` (hardcoded value)

## Common Errors & Solutions

### Error: "Environment variable not found"

**Solution:**
1. Run `npm run mcp:load-env:win`
2. Verify variable is set: `[System.Environment]::GetEnvironmentVariable('GITHUB_TOKEN', 'User')`
3. **Restart Cursor completely** (close all windows)

### Error: "Requires authentication" (GitHub MCP)

**Root Cause**: Cursor IDE may not be reading environment variables correctly, or the MCP server process isn't inheriting them.

**Solutions:**

1. **Restart Cursor** (Most Common Fix)
   - Close Cursor completely (all windows)
   - Reopen Cursor
   - MCP servers should now read the environment variables

2. **Verify Environment Variable Format**
   - Must use `${env:GITHUB_TOKEN}` (not `${GITHUB_TOKEN}` or hardcoded)

3. **Test Token Manually**
   ```powershell
   [System.Environment]::GetEnvironmentVariable('GITHUB_TOKEN', 'User')
   $token = [System.Environment]::GetEnvironmentVariable('GITHUB_TOKEN', 'User')
   $headers = @{Authorization = "Bearer $token"}
   Invoke-RestMethod -Uri "https://api.github.com/user" -Headers $headers
   ```

4. **Reload Environment Variables**
   ```powershell
   npm run mcp:load-env:win
   ```
   Then restart Cursor.

5. **Check Cursor MCP Logs**
   - View → Output
   - Select "MCP Logs" from dropdown
   - Look for specific error messages about authentication

6. **Try Global Config Location**
   ```powershell
   Copy-Item ".cursor\mcp.json" "$env:USERPROFILE\.cursor\mcp.json"
   ```
   Then restart Cursor.

7. **Clear npx Cache**
   ```powershell
   Remove-Item -Recurse -Force "$env:LOCALAPPDATA\npm-cache\_npx"
   ```
   Then restart Cursor.

8. **Verify Token Permissions**
   Your GitHub PAT needs these scopes:
   - `repo` - Full control of private repositories
   - `workflow` - Update GitHub Action workflows
   - `read:org` (optional) - Read org membership
   
   Check at: https://github.com/settings/tokens

9. **Test MCP Server Directly**
   ```powershell
   $env:GITHUB_TOKEN = [System.Environment]::GetEnvironmentVariable('GITHUB_TOKEN', 'User')
   npx -y @modelcontextprotocol/server-github
   ```
   If this works but Cursor doesn't, it's a Cursor configuration issue.

### Error: "Command not found" or "npx failed"

**Solution:**
1. Clear npx cache (see step 3 above)
2. Test command manually (see step 4 above)
3. Verify Node.js/npm are working: `node --version` and `npm --version`

### Error: "MCP server failed to start"

**Solution:**
1. Check if you have the required permissions for the token
2. Verify token is valid (test with GitHub API)
3. Check Cursor's output/logs panel for detailed error messages

### All MCPs Show Errors

**If ALL servers show errors:**
1. **Run self-healing tool**: `npm run mcp:heal` - Automatically fixes missing env fields
2. **Restart Cursor completely** - This is the #1 fix
3. Verify `.cursor/mcp.json` syntax is valid JSON
4. Try moving config to global location (see step 2)
5. Check Cursor version - update if outdated

### MCPs Show Red → Yellow → Never Green

**This indicates connection attempts but handshake failures:**
1. **Run self-healing tool**: `npm run mcp:heal` - Detects and fixes missing `env` fields
2. **Rename servers** - Cursor caches failed server names. If servers were renamed to `-v2`, they should work. If not, manually rename in config.
3. **Check environment variables** - Ensure `GITHUB_TOKEN` is set: `[System.Environment]::GetEnvironmentVariable('GITHUB_TOKEN', 'User')`
4. **Clear npx cache**: `Remove-Item -Recurse -Force "$env:LOCALAPPDATA\npm-cache\_npx"`
5. **Restart Cursor completely** (close all windows)
6. **Check MCP Logs** - View → Output → "MCP Logs" dropdown for specific errors

### Error: "Error - ShowOutput" (Deprecated - Should Not Occur)

**Note**: This error should no longer occur after migration to direct MCP servers. If you see this, your config may still be using deprecated Smithery CLI commands.

**CRITICAL: Smithery discontinued STDIO support as of September 7, 2025**

**If you see this error, it means your config is still using the deprecated Smithery CLI method:**

**Symptoms:**
- All MCP servers show "Error - ShowOutput"
- Manual test shows: `Request timed out: TimeoutError`
- MCP Logs show timeout errors
- HTTP endpoint tests return 400/404 errors (wrong format)

**Root Cause:**
- **STDIO Support Discontinued**: The `@smithery/cli run` command uses STDIO, which Smithery no longer supports
- Smithery now requires **Streamable HTTP** protocols only
- CLI commands are obsolete for production connections

**Solutions:**
1. **MIGRATE TO DIRECT MCP SERVERS** (Required):
   - **Remove**: `@smithery/cli@latest run @smithery-ai/github` (STDIO - deprecated)
   - **Use**: `npx -y @modelcontextprotocol/server-github` (direct installation)
   - This bypasses Smithery entirely and uses STDIO locally
   - See migration guide below

2. **Run self-healing tool**: `npm run mcp:heal` - Detects deprecated Smithery CLI usage

3. **Test network connectivity** (if staying with Smithery HTTP):
   ```powershell
   curl https://smithery.ai
   Test-NetConnection smithery.ai -Port 443
   ```

## Step-by-Step Fix

1. **Load environment variables:**
   ```powershell
   npm run mcp:load-env:win
   ```

2. **Verify they're set:**
   ```powershell
   [System.Environment]::GetEnvironmentVariable('GITHUB_TOKEN', 'User')
   ```

3. **Clear npx cache:**
   ```powershell
   Remove-Item -Recurse -Force "$env:LOCALAPPDATA\npm-cache\_npx"
   ```

4. **Close Cursor completely** (all windows)

5. **Reopen Cursor**

6. **Check MCP status in Cursor Settings**

## Still Not Working?

1. **Check Cursor logs:**
   - Help → Toggle Developer Tools
   - Look for MCP-related errors in Console

2. **Try global config location:**
   - Copy `.cursor/mcp.json` to `%USERPROFILE%\.cursor\mcp.json`
   - Restart Cursor

3. **Verify Node.js version:**
   - Cursor requires Node.js 18+ for MCP servers
   - Check: `node --version`

4. **Test with minimal config:**
   - Temporarily remove all but one MCP server
   - See if that one works
   - Add others back one by one

## Migration from Smithery CLI to Direct MCP Servers

**Why**: Smithery discontinued STDIO support (September 2025). CLI commands no longer work.

**Migration Steps**:

1. **Update `.cursor/mcp.json`** - Replace CLI commands with direct server installations:

**Before (STDIO - No longer works):**
```json
{
  "mcpServers": {
    "github-v2": {
      "command": "cmd",
      "args": ["/c", "npx", "-y", "@smithery/cli@latest", "run", "@smithery-ai/github", "--key", "..."]
    }
  }
}
```

**After (Direct MCP - Works):**
```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "${env:GITHUB_TOKEN}"
      }
    },
    "ref-tools-mcp": {
      "command": "npx",
      "args": ["-y", "ref-tools-mcp"]
    }
  }
}
```

2. **Available Direct MCP Servers**:
   - **GitHub**: `@modelcontextprotocol/server-github` (direct package)
   - **Desktop Commander**: `@wonderwhy-er/desktop-commander` (direct package)
   - **Playwright**: `@playwright/mcp` (direct package)
   - **Ref Tools**: `ref-tools-mcp` (direct package)
   - **Supabase**: Official hosted server at `https://mcp.supabase.com/mcp` (recommended - no npm package needed)

3. **Run self-healing tool**: `npm run mcp:heal` - Detects deprecated Smithery CLI usage and suggests fixes

4. **Restart Cursor completely** after migration

## Related Documentation

- `docs/guides/setup/mcp-setup.md` - Initial setup guide
- `docs/guides/reference/supabase-keys.md` - Supabase key reference
- `.cursor/rules/04-integrations.mdc` - MCP usage rules for agents
