# GitHub MCP Authentication Fix

## Problem
GitHub MCP server returns "Requires authentication" error despite `GITHUB_TOKEN` being set in Windows User environment variables.

## Root Cause
Cursor IDE may not be reading environment variables correctly, or the MCP server process isn't inheriting them.

## Solutions

### Solution 1: Restart Cursor (Most Common Fix)
1. **Close Cursor completely** (all windows)
2. **Reopen Cursor**
3. MCP servers should now read the environment variables

### Solution 2: Verify Environment Variable Format
The `.cursor/mcp.json` should use:
```json
"env": {
  "GITHUB_TOKEN": "${env:GITHUB_TOKEN}"
}
```

NOT:
- `${GITHUB_TOKEN}` (missing `env:`)
- `"GITHUB_TOKEN"` (hardcoded value - don't do this!)

### Solution 3: Test Token Manually
```powershell
# Verify token is set
[System.Environment]::GetEnvironmentVariable('GITHUB_TOKEN', 'User')

# Test GitHub API
$token = [System.Environment]::GetEnvironmentVariable('GITHUB_TOKEN', 'User')
$headers = @{Authorization = "token $token"}
Invoke-RestMethod -Uri "https://api.github.com/user" -Headers $headers
```

### Solution 4: Reload Environment Variables
```powershell
# Reload from .env file
npm run mcp:load-env:win

# Then restart Cursor
```

### Solution 5: Check Cursor MCP Logs
1. In Cursor: View → Output
2. Select "MCP Logs" from dropdown
3. Look for specific error messages about authentication

### Solution 6: Try Global Config Location
Copy `.cursor/mcp.json` to global location:
```powershell
Copy-Item ".cursor\mcp.json" "$env:USERPROFILE\.cursor\mcp.json"
```
Then restart Cursor.

### Solution 7: Clear npx Cache
```powershell
Remove-Item -Recurse -Force "$env:LOCALAPPDATA\npm-cache\_npx"
```
Then restart Cursor.

### Solution 8: Verify Token Permissions
Your GitHub PAT needs these scopes:
- `repo` - Full control of private repositories
- `workflow` - Update GitHub Action workflows  
- `read:org` (optional) - Read org membership

Check at: https://github.com/settings/tokens

### Solution 9: Test MCP Server Directly
```powershell
$env:GITHUB_TOKEN = [System.Environment]::GetEnvironmentVariable('GITHUB_TOKEN', 'User')
npx -y @modelcontextprotocol/server-github
```
If this works but Cursor doesn't, it's a Cursor configuration issue.

## Current Status
✅ Token is valid (tested with GitHub API)
✅ Token is set in User environment variables
✅ MCP config format is correct
✅ mcp:heal reports no issues

**Next Step**: Restart Cursor completely and check MCP status in Settings.

## If Still Not Working
1. Check Cursor version (update if outdated)
2. Check Node.js version (`node --version` - needs 18+)
3. Try removing and re-adding GitHub MCP server in config
4. Check Cursor's MCP logs for specific error messages

