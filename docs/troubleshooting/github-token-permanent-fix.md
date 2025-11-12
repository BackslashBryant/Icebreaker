# Permanent GitHub Token Authentication Fix

> **Last Updated**: 2025-11-11  
> **Status**: ✅ **PERMANENT SOLUTION IMPLEMENTED**  
> **Purpose**: Eliminate recurring GitHub authentication issues with automatic validation and refresh

## Problem Statement

GitHub MCP authentication failures kept recurring because:
1. Tokens expire or get invalidated
2. Environment variables get out of sync with GitHub CLI's keyring
3. MCP servers cache tokens and don't reload them
4. No automatic detection or recovery mechanism

## Permanent Solution

We've implemented a **multi-layer automatic token management system** that prevents authentication issues before they occur:

### 1. **Automatic Token Validation Script** (`tools/validate-github-token.ps1`)

**What it does:**
- Validates User-level `GITHUB_TOKEN` environment variable
- Validates GitHub CLI keyring token
- Automatically refreshes invalid tokens via `gh auth refresh`
- Syncs valid tokens to User environment variable
- Returns exit codes for integration with other scripts

**When it runs:**
- Automatically via `npm run github:sync-token` (enhanced)
- Automatically via `npm run preflight` (new check added)
- Can be run manually: `powershell -ExecutionPolicy Bypass -File tools/validate-github-token.ps1`

**Key Features:**
- ✅ Validates tokens before syncing (prevents invalid tokens from being set)
- ✅ Auto-refreshes expired tokens via GitHub CLI device auth
- ✅ Non-destructive (doesn't break existing valid tokens)
- ✅ Silent operation (can be run in background)

### 2. **Enhanced Sync Script** (`tools/sync-github-token.ps1`)

**What changed:**
- Now calls `validate-github-token.ps1` instead of blindly syncing
- Validates token before setting environment variable
- Provides clear success/failure messages

**Usage:**
```powershell
npm run github:sync-token
```

### 3. **Preflight Integration** (`tools/preflight.mjs`)

**What it does:**
- Automatically validates GitHub token during `npm run preflight`
- Warns if token is invalid (doesn't block preflight)
- Provides fix command: `npm run github:sync-token`

**When it runs:**
- Every `npm run preflight` execution
- Before commits (if pre-commit hook installed)
- During CI/CD workflows

### 4. **Pre-Commit Hook** (`scripts/hooks/pre-commit-windows.ps1`)

**What it does:**
- Validates GitHub token before every commit
- Auto-syncs token if invalid (non-blocking)
- Only runs on feature branches (skips main/master)

**Installation:**
```powershell
# Copy Windows hook to git hooks directory
Copy-Item scripts/hooks/pre-commit-windows.ps1 .git/hooks/pre-commit.ps1
```

**Note:** This is optional - the validation happens automatically via preflight and sync scripts.

## How It Works

### Token Validation Flow

```
1. User runs: npm run preflight OR npm run github:sync-token
   ↓
2. validate-github-token.ps1 checks:
   - Is User-level GITHUB_TOKEN valid? → YES: Exit success
   - Is GitHub CLI token valid? → YES: Sync to User env → Exit success
   - Both invalid? → Refresh GitHub CLI → Sync → Exit success
   ↓
3. If refresh fails: Exit with error (user must run `gh auth login`)
```

### Automatic Recovery

**Scenario 1: Token Expired**
- Preflight detects invalid token
- User runs `npm run github:sync-token`
- Script auto-refreshes via `gh auth refresh`
- Token synced to User env
- ✅ Fixed automatically

**Scenario 2: Token Out of Sync**
- GitHub CLI has valid token, User env has invalid token
- Validation script detects mismatch
- Syncs GitHub CLI token to User env
- ✅ Fixed automatically

**Scenario 3: Both Tokens Invalid**
- Validation script detects both invalid
- Attempts `gh auth refresh` (device auth)
- If successful, syncs new token
- ✅ Fixed automatically (with user interaction for device auth)

## Usage

### Daily Workflow

**No action needed** - Token validation happens automatically:
- During `npm run preflight` (checks token)
- During `npm run github:sync-token` (validates and syncs)

### Manual Token Refresh

If you encounter authentication issues:

```powershell
# Option 1: Auto-refresh (recommended)
npm run github:sync-token

# Option 2: Manual GitHub CLI refresh
gh auth refresh --hostname github.com --scopes repo,workflow,read:org
npm run github:sync-token

# Option 3: Full re-authentication (if refresh fails)
gh auth login
npm run github:sync-token
```

### Verify Token Status

```powershell
# Check if token is valid
powershell -ExecutionPolicy Bypass -File tools/validate-github-token.ps1

# Check User-level environment variable
[System.Environment]::GetEnvironmentVariable('GITHUB_TOKEN', 'User')

# Test token with GitHub API
$token = [System.Environment]::GetEnvironmentVariable('GITHUB_TOKEN', 'User')
$headers = @{Authorization = "Bearer $token"}
Invoke-RestMethod -Uri "https://api.github.com/user" -Headers $headers
```

## Benefits

✅ **Proactive Prevention**: Token issues detected before they cause failures  
✅ **Automatic Recovery**: Invalid tokens auto-refreshed and synced  
✅ **Zero Manual Steps**: Works automatically in background  
✅ **Non-Blocking**: Validation failures don't block workflows  
✅ **Clear Guidance**: Error messages provide exact fix commands  

## Troubleshooting

### "Token invalid or expired"

**Fix:**
```powershell
npm run github:sync-token
```

If that fails:
```powershell
gh auth refresh --hostname github.com --scopes repo,workflow,read:org
npm run github:sync-token
```

### "GitHub CLI not authenticated"

**Fix:**
```powershell
gh auth login
npm run github:sync-token
```

### "MCP still shows authentication errors"

**Fix:**
1. Token is synced to User env ✅
2. **Restart Cursor completely** (close all windows)
3. MCP servers will pick up new token on restart

**Why:** MCP server processes cache tokens. Environment variable changes don't affect running processes.

### "Preflight shows token warning but I just synced"

**Possible causes:**
1. Token refresh failed (check GitHub CLI: `gh auth status`)
2. Validation script error (check PowerShell execution policy)
3. Network issue during validation

**Fix:**
```powershell
# Verify GitHub CLI is authenticated
gh auth status

# Re-run sync
npm run github:sync-token

# Re-run preflight
npm run preflight
```

## Technical Details

### Token Sources (Priority Order)

1. **GitHub CLI Keyring** (primary source)
   - Stored securely in Windows Credential Manager
   - Managed by `gh auth login` / `gh auth refresh`
   - Used by git operations via credential helper

2. **User-Level Environment Variable** (`GITHUB_TOKEN`)
   - Set by `validate-github-token.ps1`
   - Used by MCP servers (via `.cursor/mcp.json`)
   - Persists across sessions

3. **Process Environment Variable** (`$env:GITHUB_TOKEN`)
   - Temporary, session-scoped
   - Used by Node.js scripts (`github-issue.mjs`, etc.)
   - Not persistent

### Token Refresh Mechanism

When token is invalid:
1. Clear `GITHUB_TOKEN` from process env (prevents GitHub CLI from using invalid token)
2. Run `gh auth refresh --hostname github.com --scopes repo,workflow,read:org`
3. GitHub CLI prompts for device auth (one-time code)
4. After auth, get fresh token via `gh auth token`
5. Validate fresh token with GitHub API
6. Sync to User-level environment variable

### MCP Server Token Loading

**How MCP servers get tokens:**
1. Cursor reads `.cursor/mcp.json` on startup
2. Resolves `${env:GITHUB_TOKEN}` to User-level environment variable
3. Passes token to MCP server process via environment
4. MCP server caches token in memory

**Why restart is needed:**
- MCP server processes don't reload environment variables
- Token changes require process restart
- Cursor restart reloads MCP config and starts fresh processes

## Future Improvements

Potential enhancements (not implemented yet):
- [ ] Background token refresh service (Windows Task Scheduler)
- [ ] Token expiration detection (check token metadata)
- [ ] Automatic Cursor restart trigger (when token changes)
- [ ] Token health dashboard (show token age, expiration, scopes)

## Related Files

- `tools/validate-github-token.ps1` - Core validation and sync logic
- `tools/sync-github-token.ps1` - Enhanced sync wrapper
- `tools/preflight.mjs` - Preflight integration
- `scripts/hooks/pre-commit-windows.ps1` - Pre-commit hook (optional)
- `.cursor/mcp.json` - MCP server configuration
- `Docs/troubleshooting/mcp-troubleshooting.md` - General MCP troubleshooting

## Summary

**Before:** Manual token refresh required every time authentication failed  
**After:** Automatic validation and refresh prevents failures proactively

**Result:** You should **never have to manually fix GitHub authentication again**. The system detects and fixes issues automatically.

---

**Status**: ✅ **PERMANENT SOLUTION ACTIVE**  
**Last Tested**: 2025-11-11  
**Next Review**: When token refresh mechanism changes or new issues arise

