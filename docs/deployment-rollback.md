# Rollback Runbook

**Last Updated**: 2025-01-27
**Owner**: @Nexus 🚀

## Quick Reference

### Railway (Backend) Rollback
- **CLI**: `railway redeploy` (redeploys latest)
- **Dashboard**: Deployments → Previous → Redeploy
- **Emergency**: `git revert <commit>` + push

### Vercel (Frontend) Rollback
- **CLI**: `vercel rollback <deployment-url>` or `vercel promote <deployment-url>`
- **Dashboard**: Deployments → Previous → "Promote to Production"
- **Emergency**: `git revert <commit>` + push

## Rollback Procedures

### 1. Quick Rollback (Last Deployment)

#### Railway - Redeploy Latest
```bash
cd backend
railway redeploy --yes
```
**Time**: < 2 minutes
**Verification**: Check health endpoint after redeploy completes

#### Vercel - Promote Previous Deployment
```bash
cd frontend
vercel promote <deployment-url> --yes
```
**Time**: < 30 seconds
**Verification**: Check frontend URL loads correctly

### 2. Rollback to Specific Deployment

#### Railway - Redeploy Specific Deployment
1. Get deployment ID: `railway deployment list`
2. Redeploy: `railway redeploy <deployment-id>` (if CLI supports) OR use dashboard
3. **Dashboard**: Deployments → Select deployment → Redeploy

#### Vercel - Rollback to Specific Deployment
```bash
cd frontend
vercel rollback <deployment-url> --yes
# OR
vercel promote <deployment-url> --yes
```
**Time**: < 30 seconds

### 3. Emergency Rollback (Git Revert)

**Use when**: Need to revert code changes immediately

```bash
# 1. Identify problematic commit
git log --oneline -10

# 2. Revert the commit
git revert <commit-hash>

# 3. Push to trigger auto-deploy
git push origin main

# 4. Verify both platforms auto-deploy
# Railway: Check deployment list
# Vercel: Check deployments tab
```

**Time**: < 5 minutes (includes auto-deploy)
**Verification**: 
- Railway: `railway deployment list` (should show new deployment)
- Vercel: `vercel ls` (should show new production deployment)

### 4. Complete Rollback (Reset to Previous Commit)

**⚠️ Use with caution - rewrites history**

```bash
# 1. Identify target commit
git log --oneline -10

# 2. Reset to target commit
git reset --hard <commit-hash>

# 3. Force push (only if necessary)
git push origin main --force

# 4. Verify deployments
```

**Time**: < 5 minutes
**Risk**: High - rewrites git history

## Verification After Rollback

### Backend Verification
```bash
# Check health
curl https://airy-fascination-production.up.railway.app/api/health

# Check deployment status
cd backend && railway deployment list
railway logs --tail 20
```

### Frontend Verification
```bash
# Check deployment status
cd frontend && vercel ls --limit 1

# Check frontend loads
curl -I https://frontend-coral-two-84.vercel.app
```

### Full Verification
```bash
node scripts/verify-deployment.mjs
```

## Rollback Decision Tree

```
Problem Detected
    │
    ├─ Is it a recent deployment?
    │   ├─ Yes → Quick Rollback (Dashboard/CLI)
    │   └─ No → Git Revert
    │
    ├─ Is it a code issue?
    │   ├─ Yes → Git Revert + Auto-deploy
    │   └─ No → Platform Rollback (Dashboard)
    │
    └─ Is it critical/urgent?
        ├─ Yes → Emergency Rollback (Git Revert)
        └─ No → Standard Rollback (Dashboard)
```

## Testing Results

### Railway Rollback Test
- ✅ `railway redeploy` command available and working
- ✅ Dashboard rollback documented
- ✅ Git revert triggers auto-deploy

### Vercel Rollback Test
- ✅ `vercel rollback` command available
- ✅ `vercel promote` command available
- ✅ Dashboard rollback documented
- ✅ Git revert triggers auto-deploy

## Notes

- Both platforms support zero-downtime rollbacks
- Railway rollback: < 1 minute
- Vercel rollback: < 30 seconds
- Git revert: < 5 minutes (includes auto-deploy)
- Always verify after rollback using verification script

