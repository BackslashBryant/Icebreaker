# MCP Troubleshooting Guide

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
# Copy project config to global location
Copy-Item ".cursor\mcp.json" "$env:USERPROFILE\.cursor\mcp.json"
```

### 3. Clear npx Cache

Sometimes npx cache causes issues:

```powershell
# Windows
Remove-Item -Recurse -Force "$env:LOCALAPPDATA\npm-cache\_npx"
```

Then restart Cursor.

### 4. Test MCP Command Manually

Test if the MCP server command works:

```powershell
# Set env var in current session
$env:GITHUB_TOKEN = "your_token_here"

# Test GitHub MCP
npx -y @smithery/cli@latest run github
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
1. **Restart Cursor completely** - This is the #1 fix
2. Verify `.cursor/mcp.json` syntax is valid JSON
3. Try moving config to global location (see step 2)
4. Check Cursor version - update if outdated

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

## Getting Help

If still not working, gather:
- Exact error messages from Cursor
- Output of `npm run mcp:load-env:win`
- Cursor version
- Node.js version
- Contents of `.cursor/mcp.json` (redact tokens!)
