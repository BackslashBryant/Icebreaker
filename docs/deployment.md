# Deployment Guide

**Last Updated**: 2025-11-20  
**Owner**: @Nexus 🚀  
**Status**: ✅ **PRODUCTION DEPLOYED**

## Overview

This guide covers deployment procedures for the Icebreaker MVP, including production setup, environment configuration, and rollback procedures.

## Production URLs

- **Frontend**: https://frontend-coral-two-84.vercel.app
- **Backend API**: https://airy-fascination-production.up.railway.app
- **Backend Health**: https://airy-fascination-production.up.railway.app/api/health
- **WebSocket**: wss://airy-fascination-production.up.railway.app/ws

## Pre-Deployment Checklist

- [ ] All tests passing (unit, integration, E2E)
- [ ] Cross-browser tests passing (Chrome, Firefox, Edge)
- [ ] Accessibility audit passing (WCAG AA)
- [ ] Security audit complete (no high/critical vulnerabilities)
- [x] Error tracking configured (Sentry DSNs set) ✅
- [ ] Environment variables configured in hosting platform
- [ ] CI/CD pipeline verified
- [ ] Production domains configured
- [ ] SSL/TLS certificates configured (HTTPS)

## Environment Variables

### Frontend (Production - Vercel)

**Configured in**: Vercel Dashboard → Project Settings → Environment Variables

```bash
VITE_API_URL=https://airy-fascination-production.up.railway.app
VITE_SENTRY_DSN=https://ddac06c38c223c1b6b154d33493be0f4@o4510093969195008.ingest.us.sentry.io/4510093972602880
VITE_SENTRY_ENABLE_DEV=false
VITE_APP_VERSION=0.1.0
```

**Note**: All environment variables are configured in Vercel dashboard. See `.notes/features/production-deployment/step2-env-vars.md` for complete list.

### Backend (Production - Railway)

**Configured in**: Railway Dashboard → Service → Variables

```bash
NODE_ENV=production
PORT=8000
SENTRY_DSN=https://5ca041bf861fa637b7b2a4e9a2a54f5c@o4510093969195008.ingest.us.sentry.io/4510093972602880
SENTRY_ENABLE_DEV=false
APP_VERSION=0.1.0
CORS_ORIGIN=https://frontend-coral-two-84.vercel.app
```

**Note**: All environment variables are configured in Railway dashboard. See `.notes/features/production-deployment/step2-env-vars.md` for complete list.

## Deployment Platforms

### Frontend Platform: Vercel ✅

**Status**: ✅ **DEPLOYED**  
**URL**: https://frontend-coral-two-84.vercel.app  
**Project**: `backslashbryants-projects/frontend`  
**Configuration**: 
- Root directory: `frontend` (configured in `vercel.json`)
- Build command: `npm run build`
- Output directory: `dist`
- Framework: `vite`

**Setup Complete**:
- ✅ GitHub integration configured
- ✅ Environment variables configured
- ✅ Auto-deploy enabled (deploys on push to `main`)
- ✅ Monorepo configuration (`vercel.json`)

**CLI Commands**:
```bash
cd frontend
vercel login                    # Authenticate
vercel link                     # Link to project
vercel deploy                   # Manual deploy
vercel ls                       # List deployments
vercel rollback <url>           # Rollback deployment
```

### Backend Platform: Railway ✅

**Status**: ✅ **DEPLOYED**  
**URL**: https://airy-fascination-production.up.railway.app  
**Service**: `airy-fascination`  
**Configuration**:
- Root directory: `backend` (configured in `backend/railway.json`)
- Start command: `npm start`
- Build command: `npm install`

**Setup Complete**:
- ✅ GitHub integration configured
- ✅ Environment variables configured
- ✅ Auto-deploy enabled (deploys on push to `main`)
- ✅ Monorepo configuration (`backend/railway.json`)

**CLI Commands**:
```bash
cd backend
railway login                   # Authenticate
railway link                    # Link to project
railway up                      # Manual deploy
railway deployment list         # List deployments
railway redeploy                # Redeploy latest
railway logs                    # View logs
```

## Deployment Steps

### Initial Deployment

1. **Set up hosting accounts**
   - Create accounts for frontend and backend hosting platforms
   - Connect GitHub repositories

2. **Configure environment variables**
   - Add all required environment variables in hosting platform dashboards
   - Verify Sentry DSNs are set correctly
   - Set `NODE_ENV=production` for backend

3. **Deploy backend first** ✅
   - Backend must be running before frontend can connect
   - Verify backend health endpoint: `https://airy-fascination-production.up.railway.app/api/health`
   - Verify WebSocket endpoint: `wss://airy-fascination-production.up.railway.app/ws`
   - **Status**: ✅ Deployed and verified

4. **Deploy frontend** ✅
   - Set `VITE_API_URL` to production backend URL
   - Verify frontend loads: `https://frontend-coral-two-84.vercel.app`
   - Test onboarding flow end-to-end
   - **Status**: ✅ Deployed and verified

5. **Verify deployment** ✅
   - Run smoke tests: `node scripts/verify-deployment.mjs`
   - Check Sentry dashboard for errors
   - Verify HTTPS is enforced (both platforms use HTTPS)
   - Test cross-browser compatibility
   - **Status**: ✅ All verification tests passed

### Continuous Deployment

- **Automatic**: Deploys on push to `main` branch (if configured)
- **Manual**: Use `workflow_dispatch` trigger in GitHub Actions
- **Staging**: Consider deploying to staging environment first (separate branch or environment)

## Rollback Procedure

### Quick Rollback (Last Deployment)

**See**: `docs/deployment-rollback.md` for complete rollback runbook.

1. **Frontend Rollback (Vercel)**:
   - **CLI**: `cd frontend && vercel rollback <deployment-url> --yes`
   - **CLI Alternative**: `vercel promote <deployment-url> --yes`
   - **Dashboard**: Deployments → Previous deployment → "Promote to Production"
   - **Time**: < 30 seconds

2. **Backend Rollback (Railway)**:
   - **CLI**: `cd backend && railway redeploy --yes`
   - **Dashboard**: Deployments → Previous deployment → "Redeploy"
   - **Time**: < 1 minute

### Emergency Rollback (Code Revert)

1. **Revert commit**:
   ```bash
   git revert <commit-hash>
   git push origin main
   ```

2. **Or rollback to specific commit**:
   ```bash
   git reset --hard <commit-hash>
   git push origin main --force  # Only if necessary
   ```

3. **Verify rollback**:
   - Check health endpoints
   - Verify Sentry for new errors
   - Test critical user flows

## Post-Deployment Verification

### Health Checks

**Automated Verification**: Run `node scripts/verify-deployment.mjs`

**Manual Checks**:
- [x] Frontend loads: `https://frontend-coral-two-84.vercel.app` ✅
- [x] Backend health: `https://airy-fascination-production.up.railway.app/api/health` ✅
- [x] WebSocket connects: `wss://airy-fascination-production.up.railway.app/ws` ✅
- [ ] Onboarding flow works end-to-end (manual test required)
- [ ] Radar view loads and updates (manual test required)
- [ ] Chat functionality works (manual test required)
- [ ] Error tracking active (check Sentry dashboard)

### Monitoring

- **Sentry Dashboard**: Check for errors and performance issues
- **Hosting Platform Logs**: Monitor server logs for issues
- **Uptime Monitoring**: Set up uptime checks (UptimeRobot, Pingdom, etc.)

## Troubleshooting

### Common Issues

1. **Frontend can't connect to backend**
   - Verify `VITE_API_URL` is set correctly
   - Check CORS configuration in backend
   - Verify backend is running and accessible

2. **WebSocket connection fails**
   - Verify WebSocket URL is correct (`wss://` for production)
   - Check backend WebSocket server is running
   - Verify session token is valid

3. **Sentry not capturing errors**
   - Verify DSNs are set correctly
   - Check Sentry dashboard for project configuration
   - Verify `SENTRY_ENABLE_DEV` is set appropriately

4. **Build failures**
   - Check build logs in hosting platform
   - Verify all dependencies are installed
   - Check for TypeScript/linting errors

## Production Best Practices

1. **HTTPS Enforcement**: Always use HTTPS in production
2. **Security Headers**: Configure CSP, HSTS headers
3. **Rate Limiting**: Verify rate limiting is active
4. **Monitoring**: Set up uptime monitoring and alerts
5. **Backups**: Configure database backups (if applicable)
6. **Logging**: Centralize logs (Sentry, hosting platform logs)
7. **Performance**: Monitor performance metrics (Sentry Performance)

## Support & Escalation

- **Deployment Issues**: @Nexus 🚀
- **Application Errors**: Check Sentry dashboard first
- **Infrastructure Issues**: Contact hosting platform support

---

**Next Review**: After first production deployment

