# Verification Procedures

**Purpose**: Deployment verification, health validation, and rollback checklists for production operations.

## Overview

This directory contains verification procedures for:
- **Deployment verification**: How to verify deployments in production/staging
- **Health validation**: How to validate system health after changes
- **Rollback procedures**: How to rollback deployments when issues occur

## Quick Links

- **[Rollback Runbook](../deployment-rollback.md)** - Complete rollback procedures for Railway and Vercel
- **[WebSocket Deployment Checklist](websocket-deployment-checklist.md)** - Specific checklist for WebSocket deployments
- **[Connection Guide](../ConnectionGuide.md)** - Production endpoints and services

## Deployment Verification Checklist Template

Use this template when verifying deployments. Copy and customize for specific deployments.

```markdown
# Deployment Verification Checklist

**Date**: YYYY-MM-DD  
**Commit**: `<commit-hash>` - `<brief-description>`  
**Status**: ⏳ **VERIFICATION IN PROGRESS**

## Pre-Verification

### Backend Health Check
- [ ] `/api/health` returns `{"status":"ok"}`
- [ ] Backend is responding at `<production-url>`
- [ ] Health endpoint response time < 500ms

### Frontend Health Check
- [ ] Frontend loads at `<production-url>`
- [ ] No console errors in browser DevTools
- [ ] Page load time < 2s

### Deployment Status
- [ ] Railway deployment timestamp is after commit `<commit-hash>`
- [ ] Vercel deployment timestamp is after commit `<commit-hash>`
- [ ] Both deployments show "Active" status

## Environment Variables Verification

- [ ] All required environment variables are set in Railway
- [ ] All required environment variables are set in Vercel
- [ ] No sensitive values exposed in logs or responses

## Service-Specific Verification

### WebSocket (if applicable)
- [ ] WebSocket connection successful
- [ ] Connection count is normal (< 100)
- [ ] No connection errors in logs

### API Endpoints (if applicable)
- [ ] All critical endpoints responding
- [ ] Response times within targets
- [ ] No 5xx errors in logs

### Frontend Features (if applicable)
- [ ] Critical user flows work (onboarding, radar, chat)
- [ ] No JavaScript errors
- [ ] Accessibility features working (keyboard nav, screen reader)

## Log Monitoring

### Start Log Monitoring
```bash
# Railway
cd backend
railway logs --tail 100

# Vercel
cd frontend
vercel logs --follow
```

### Expected Log Messages
- [ ] No error messages in logs
- [ ] No warnings that indicate issues
- [ ] Structured log messages appear (if applicable)

## Manual Browser Test

### Test URL
```
<production-frontend-url>
```

### Test Steps
1. [ ] Open production URL in browser
2. [ ] Complete critical user flow
3. [ ] Verify expected behavior
4. [ ] Check browser console for errors

## Automated Verification

### Run Verification Script
```bash
node scripts/verify-deployment.mjs
```

- [ ] All verification checks pass
- [ ] No errors or warnings

### Run Production Health Check
```bash
npm run verify:production
```

- [ ] All health checks pass
- [ ] Response times within targets

## Troubleshooting

### If health check fails
- [ ] Check deployment status in platform dashboard
- [ ] Review logs for errors
- [ ] Verify environment variables
- [ ] Check for recent code changes

### If WebSocket fails
- [ ] Verify SESSION_SECRET matches between environments
- [ ] Check WebSocket server logs
- [ ] Verify connection count is not exceeded
- [ ] Review token generation/verification logic

### If frontend fails
- [ ] Check browser console for errors
- [ ] Verify API endpoints are accessible
- [ ] Check CORS configuration
- [ ] Verify environment variables (VITE_*)

## Success Criteria

- [ ] All pre-verification checks pass
- [ ] All service-specific checks pass
- [ ] No errors in logs
- [ ] Manual browser test successful
- [ ] Automated verification passes

## Next Steps After Verification

Once verification is complete:
1. [ ] Update GitHub issue with verification results
2. [ ] Document any issues found
3. [ ] Mark plan-status file as COMPLETE if all issues resolved
4. [ ] Update monitoring dashboards if needed

## Rollback Plan

If verification fails:
1. [ ] Document failure reason
2. [ ] Follow rollback procedures in [Rollback Runbook](../deployment-rollback.md)
3. [ ] Verify rollback successful
4. [ ] Create follow-up issue for fix
```

## Health Validation Procedures

### Production Health Check

Run automated health check:
```bash
npm run verify:production
```

This checks:
- Backend health endpoint (`/api/health`)
- Frontend accessibility
- Response times
- WebSocket connectivity (if applicable)

### Manual Health Check

1. **Backend Health**:
   ```bash
   curl https://airy-fascination-production.up.railway.app/api/health
   ```
   Expected: `{"status":"ok","websocket":{...}}`

2. **Frontend Health**:
   ```bash
   curl -I https://frontend-coral-two-84.vercel.app
   ```
   Expected: `200 OK`

3. **WebSocket Health** (if applicable):
   - Check connection count in health endpoint
   - Verify no connection errors in logs
   - Test WebSocket connection manually

### Health Check Frequency

- **After deployments**: Always run health check
- **Weekly**: Automated health check via GitHub Actions (see `.github/workflows/production-health-check.yml`)
- **On alert**: Run health check when monitoring alerts trigger

## Rollback Procedures

See **[Rollback Runbook](../deployment-rollback.md)** for complete procedures.

**Quick Reference**:
- **Railway**: `railway redeploy` or dashboard rollback
- **Vercel**: `vercel rollback <deployment-url>` or dashboard rollback
- **Emergency**: `git revert <commit>` + push (triggers auto-deploy)

## Verification Scripts

- **`scripts/verify-deployment.mjs`**: Full deployment verification
- **`scripts/verify-production-endpoints.mjs`**: Production endpoint validation
- **`npm run verify:production`**: Production health check

## Maintenance

- **Nexus** keeps verification procedures current
- **All agents** update verification checklists when procedures change
- **Document** any new verification steps in this README or specific checklists

For questions or updates to verification procedures, contact @Nexus 🚀 or @Muse 🎨

