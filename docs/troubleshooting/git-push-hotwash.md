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
- [ ] Verify branch exists: `git ls-remote --heads origin <branch>`

## Documentation Updated

- ✅ `docs/troubleshooting/windows-git-push-fix.md`: Added PC restart and authentication solutions
- ✅ `.cursor/rules/07-process-improvement.mdc`: Added comprehensive lesson
- ✅ `docs/research.md`: Updated Windows git push research with new findings

