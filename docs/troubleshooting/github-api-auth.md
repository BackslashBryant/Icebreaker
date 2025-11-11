# GitHub API Authentication Troubleshooting

**Date Added**: 2025-01-27  
**Trigger**: GitHub API 401 errors when creating issues via Node.js scripts or GitHub CLI  
**Lesson**: PowerShell direct API calls with token from `.env` file are more reliable than Node.js scripts or `gh` CLI on Windows  
**Rule Update**: Always try PowerShell direct API calls as fallback when GitHub operations fail

## Problem

GitHub API operations (creating issues, comments, etc.) fail with 401 "Bad credentials" errors even when:
- `GITHUB_TOKEN` is set in `.env` file
- Environment variables are loaded via `npm run mcp:load-env:win`
- GitHub CLI shows authenticated status (`gh auth status`)

**Common Errors**:
- `GitHub API error (401): {"message":"Bad credentials"}`
- `HTTP 401: Bad credentials (https://api.github.com/graphql)`
- Node.js scripts fail to authenticate despite token being present

## Root Causes

1. **Node.js scripts may not inherit environment variables correctly** - Even after loading `.env`, Node.js `process.env` may not reflect Windows User-level variables
2. **GitHub CLI keyring vs environment variable conflict** - `gh` CLI uses keyring token, but scripts expect `GITHUB_TOKEN` env var
3. **Token format issues** - Token may have quotes or whitespace that aren't stripped correctly
4. **Cursor process isolation** - Cursor's subprocess environment may not inherit all environment variables

## Solutions (In Order of Preference)

### Solution 1: PowerShell Direct API Calls (MOST RELIABLE)

**When to use**: When Node.js scripts or `gh` CLI fail with 401 errors

**PowerShell Script Pattern**:
```powershell
# Load token directly from .env file
$token = (Get-Content .env | Select-String "^GITHUB_TOKEN=" | ForEach-Object { 
    $_.Line.Split('=', 2)[1].Trim('"''') 
})

# Set up headers
$headers = @{
    "Authorization" = "Bearer $token"
    "Accept" = "application/vnd.github+json"
    "X-GitHub-Api-Version" = "2022-11-28"
}

# Make API call
$body = @{
    title = "Issue Title"
    body = "Issue body"
    labels = @("label1", "label2")
} | ConvertTo-Json -Depth 10

$response = Invoke-RestMethod -Uri "https://api.github.com/repos/OWNER/REPO/issues" `
    -Method Post -Headers $headers -Body $body -ContentType "application/json"

Write-Host "Created issue #$($response.number): $($response.html_url)"
```

**Why this works**:
- Reads token directly from `.env` file (no environment variable dependency)
- Uses PowerShell's native `Invoke-RestMethod` (no external dependencies)
- Bypasses Node.js environment variable issues
- Works reliably in Cursor's PowerShell context

**Script Location**: `tools/create-persona-issues.ps1` (example implementation)

### Solution 2: Verify Token Format

**Check token in `.env`**:
```powershell
# Should be: GITHUB_TOKEN=gho_xxxxxxxxxxxxx (no quotes, no spaces)
Get-Content .env | Select-String "^GITHUB_TOKEN="
```

**Fix if needed**:
- Remove quotes: `GITHUB_TOKEN="token"` → `GITHUB_TOKEN=token`
- Remove trailing spaces
- Ensure token starts with `gho_` (classic) or `github_pat_` (fine-grained)

### Solution 3: Test Token Manually

**Verify token works**:
```powershell
$token = (Get-Content .env | Select-String "^GITHUB_TOKEN=" | ForEach-Object { 
    $_.Line.Split('=', 2)[1].Trim('"''') 
})
$headers = @{ "Authorization" = "Bearer $token"; "Accept" = "application/vnd.github+json" }
Invoke-RestMethod -Uri "https://api.github.com/user" -Headers $headers
```

**Expected**: Returns your GitHub user info  
**If fails**: Token is invalid or expired - regenerate at https://github.com/settings/tokens

### Solution 4: Refresh GitHub CLI Auth

**If using `gh` CLI**:
```powershell
# Check current auth
gh auth status

# Refresh with required scopes
gh auth refresh -s repo -s issues -s workflow

# Note: May require clearing GITHUB_TOKEN env var first
$env:GITHUB_TOKEN = $null
gh auth refresh -s repo -s issues
```

**Limitation**: `gh` CLI uses keyring token, which may differ from `.env` token

### Solution 5: Reload Environment Variables

**Reload from `.env`**:
```powershell
npm run mcp:load-env:win
```

**Then restart Cursor** (environment variables loaded into User profile require restart)

## Automatic Fallback Strategy

**When GitHub operations fail**:

1. **First attempt**: Use existing Node.js script or `gh` CLI
2. **If 401 error**: Immediately switch to PowerShell direct API calls
3. **Load token from `.env`**: Parse directly, don't rely on `process.env`
4. **Use `Invoke-RestMethod`**: Native PowerShell HTTP client
5. **Log the approach**: Document which method worked in issue comments

## Prevention

**For new scripts**:
- Prefer PowerShell scripts for GitHub API operations on Windows
- Always read token directly from `.env` file
- Use `Invoke-RestMethod` instead of `fetch()` or `gh` CLI
- Include error handling with clear fallback messages

**For existing Node.js scripts**:
- Add PowerShell fallback wrapper
- Document PowerShell alternative in script comments
- Test both approaches during development

## Example: Batch Issue Creation

See `tools/create-persona-issues.ps1` for a complete example of:
- Loading token from `.env`
- Creating multiple issues via API
- Error handling and reporting
- Success confirmation with issue URLs

## Related Documentation

- `Docs/troubleshooting/github-cli-permissions.md` - Token scope issues
- `Docs/troubleshooting/github-mcp-auth-fix.md` - MCP server authentication
- `Docs/troubleshooting/git-push-hotwash.md` - Git push authentication issues

## Key Takeaways

1. **PowerShell direct API calls are most reliable** on Windows for GitHub operations
2. **Read token from `.env` file directly** - don't rely on environment variables
3. **Always have a PowerShell fallback** for GitHub API operations
4. **Test token manually first** before debugging script issues
5. **Document which approach worked** for future reference

