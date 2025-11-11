# Git Push Hotwash - Issue #1 Completion

**Date**: 2025-11-06  
**Issue**: #1 (Onboarding Flow)  
**Problem**: Git push failed repeatedly, blocking Issue #1 completion

## Problem Timeline

### Phase 1: DNS Threading Error
- **Error**: `fatal: unable to access 'https://github.com/...': getaddrinfo() thread failed to start`
- **Attempts**: Multiple git config changes, credential manager updates, SSH setup
- **Root Cause**: Windows DNS threading bug in git's HTTP client within Cursor's subprocess context
- **Resolution**: PC restart resolved DNS issue

### Phase 2: Authentication Error (403)
- **Error**: `remote: Permission to BackslashBryant/Icebreaker.git denied to BackslashBryant`
- **Root Cause**: Token scope mismatch - PAT token lacked `repo` scope
- **Resolution**: Used GitHub CLI keyring token with correct scopes: `gh auth refresh -s repo`

### Phase 3: Branch Not Created
- **Issue**: Attempted push before branch existed on GitHub
- **Resolution**: Created branch FIRST via GitHub MCP: `mcp_github_create_branch`

## Final Solution

1. **PC Restart**: Resolved DNS threading error
2. **GitHub CLI Authentication**: `gh auth refresh -s repo` activated keyring token with `repo` scope
3. **Branch Creation**: Created branch on GitHub FIRST via GitHub MCP
4. **Push Success**: `git push origin agent/vector/1-onboarding-flow` succeeded

## Key Lessons

1. **PC Restart First**: Windows DNS threading errors often resolve with restart
2. **Token Scopes Matter**: PAT tokens may lack `repo` scope; GitHub CLI keyring tokens typically have correct scopes
3. **Create Branch First**: Always create branch on GitHub BEFORE attempting push
4. **GitHub MCP for Branch Creation**: Use `mcp_github_create_branch` for branch creation, not CLI

## Commands That Worked

```powershell
# Check GitHub CLI auth status
gh auth status

# Refresh with repo scope
gh auth refresh -s repo

# Create branch on GitHub (via GitHub MCP)
mcp_github_create_branch

# Push after branch exists
git push origin agent/vector/1-onboarding-flow
```

## Prevention Checklist

- [ ] Create branch on GitHub FIRST (via GitHub MCP)
- [ ] Verify token has `repo` scope: `gh auth status`
- [ ] If DNS error, suggest PC restart first
- [ ] If 403 error, check token scopes and use `gh auth refresh -s repo`
- [ ] **If "Invalid username or token" error**: Unset GITHUB_TOKEN env var if it's invalid: `$env:GITHUB_TOKEN = $null` (PowerShell) or `unset GITHUB_TOKEN` (bash)
- [ ] Verify branch exists: `git ls-remote --heads origin <branch>`

## Additional Fix: Invalid GITHUB_TOKEN Environment Variable

**Date**: 2025-11-11  
**Issue**: #10 (Performance Verification)  
**Error**: `remote: Invalid username or token. Password authentication is not supported for Git operations`

**Root Cause**: GITHUB_TOKEN environment variable is set but invalid, blocking git from using GitHub CLI's valid keyring token.

**Solution**: Unset GITHUB_TOKEN temporarily so git can use GitHub CLI's keyring token:

```powershell
# PowerShell
$env:GITHUB_TOKEN = $null
git push -u origin agent/pixel/10-performance-verification
```

```bash
# Bash
unset GITHUB_TOKEN
git push -u origin agent/pixel/10-performance-verification
```

**Why This Works**: GitHub CLI stores a valid token in the system keyring with correct scopes. When GITHUB_TOKEN env var is set (even if invalid), git tries to use it first and fails. Unsetting it allows git to fall back to GitHub CLI's credential helper which uses the keyring token.

**Prevention**: Check `gh auth status` - if it shows "Failed to log in using token (GITHUB_TOKEN)" but "Logged in to github.com account (keyring)", unset GITHUB_TOKEN before pushing.

## Documentation Updated

- ✅ `docs/troubleshooting/windows-git-push-fix.md`: Added PC restart and authentication solutions
- ✅ `.cursor/rules/07-process-improvement.mdc`: Added comprehensive lesson
- ✅ `docs/research.md`: Updated Windows git push research with new findings

