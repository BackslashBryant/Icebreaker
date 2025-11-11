# GitHub CLI Token Permission Fix

## Problem
GitHub CLI (`gh`) cannot create issues or add comments because the token lacks the `issues` scope.

**Error**: `Resource not accessible by personal access token (createIssue)` / `(addComment)`

## Solution

### Option 1: Update Token Permissions (Recommended)
1. Go to: https://github.com/settings/tokens
2. Find your token (starts with `github_pat_11ARI63MQ0...`)
3. Edit the token
4. Check the `issues` scope checkbox
5. Update token
6. Update `.env` file with new token (if token was regenerated)
7. Run `npm run mcp:load-env:win` to reload
8. Restart Cursor

### Option 2: Create Issue Manually
1. Go to: https://github.com/BackslashBryant/Icebreaker/issues/new
2. Use body from: `.notes/temp-issue-3-body.md`
3. Add labels: `status:done`, `feature:chat`
4. Add completion comment from: `.notes/features/chat/github-comment.md`

### Option 3: Use GitHub Web UI
- Navigate to repo → Issues → New Issue
- Copy content from `.notes/temp-issue-3-body.md`

## Current Status
- ✅ Code complete and committed (`feat/3-chat` branch)
- ✅ Tests passing (117 backend, 14 frontend)
- ✅ Documentation updated
- ❌ Issue #2 needs to be created (token lacks `issues` scope)
- ❌ Completion comment needs to be added (token lacks `issues` scope)

## Next Steps
1. Update GitHub token to include `issues` scope, OR
2. Create Issue #2 manually via web UI
3. Add completion comment manually

**Files Ready**:
- Issue body: `.notes/temp-issue-3-body.md`
- Completion comment: `.notes/features/chat/github-comment.md`

