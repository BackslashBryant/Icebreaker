# Deployment Guide

**Last Updated**: 2025-11-10  
**Owner**: @Nexus 🚀

## Overview

This guide covers deployment procedures for the Icebreaker MVP, including production setup, environment configuration, and rollback procedures.

## Pre-Deployment Checklist

- [ ] All tests passing (unit, integration, E2E)
- [ ] Cross-browser tests passing (Chrome, Firefox, Edge)
- [ ] Accessibility audit passing (WCAG AA)
- [ ] Security audit complete (no high/critical vulnerabilities)
- [ ] Error tracking configured (Sentry DSNs set)
- [ ] Environment variables configured in hosting platform
- [ ] CI/CD pipeline verified
- [ ] Production domains configured
- [ ] SSL/TLS certificates configured (HTTPS)

## Environment Variables

### Frontend (Production)

```bash
VITE_API_URL=https://api.icebreaker.app
VITE_SENTRY_DSN=https://your-frontend-sentry-dsn@sentry.io/project-id
VITE_SENTRY_ENABLE_DEV=false
VITE_APP_VERSION=0.1.0
```

### Backend (Production)

```bash
NODE_ENV=production
PORT=8000
SENTRY_DSN=https://your-backend-sentry-dsn@sentry.io/project-id
SENTRY_ENABLE_DEV=false
APP_VERSION=0.1.0
CORS_ORIGIN=https://icebreaker.app
```

## Deployment Platforms

### Frontend Options

1. **Vercel** (Recommended for React/Vite)
   - Automatic deployments from GitHub
   - Built-in CI/CD
   - Free tier available
   - Setup: Connect GitHub repo, configure environment variables

2. **Netlify**
   - Automatic deployments from GitHub
   - Free tier available
   - Setup: Connect GitHub repo, build command: `cd frontend && npm run build`, publish directory: `frontend/dist`

3. **Cloudflare Pages**
   - Free tier available
   - Global CDN
   - Setup: Connect GitHub repo, build command: `cd frontend && npm run build`

### Backend Options

1. **Railway** (Recommended for Node.js)
   - Automatic deployments from GitHub
   - Free tier available
   - Setup: Connect GitHub repo, set root directory to `backend`, configure environment variables

2. **Render**
   - Free tier available
   - Automatic deployments from GitHub
   - Setup: Create Web Service, connect GitHub repo, set root directory to `backend`

3. **Fly.io**
   - Free tier available
   - Global edge deployment
   - Setup: `fly launch` from backend directory

## Deployment Steps

### Initial Deployment

1. **Set up hosting accounts**
   - Create accounts for frontend and backend hosting platforms
   - Connect GitHub repositories

2. **Configure environment variables**
   - Add all required environment variables in hosting platform dashboards
   - Verify Sentry DSNs are set correctly
   - Set `NODE_ENV=production` for backend

3. **Deploy backend first**
   - Backend must be running before frontend can connect
   - Verify backend health endpoint: `https://api.icebreaker.app/api/health`
   - Verify WebSocket endpoint: `wss://api.icebreaker.app/ws`

4. **Deploy frontend**
   - Set `VITE_API_URL` to production backend URL
   - Verify frontend loads: `https://icebreaker.app`
   - Test onboarding flow end-to-end

5. **Verify deployment**
   - Run smoke tests (health endpoints, onboarding)
   - Check Sentry dashboard for errors
   - Verify HTTPS is enforced
   - Test cross-browser compatibility

### Continuous Deployment

- **Automatic**: Deploys on push to `main` branch (if configured)
- **Manual**: Use `workflow_dispatch` trigger in GitHub Actions
- **Staging**: Consider deploying to staging environment first (separate branch or environment)

## Rollback Procedure

### Quick Rollback (Last Deployment)

1. **Frontend Rollback**:
   - Vercel: Dashboard → Deployments → Previous deployment → "Promote to Production"
   - Netlify: Dashboard → Deploys → Previous deploy → "Publish deploy"
   - Cloudflare Pages: Dashboard → Deployments → Previous deployment → "Retry deployment"

2. **Backend Rollback**:
   - Railway: Dashboard → Deployments → Previous deployment → "Redeploy"
   - Render: Dashboard → Manual Deploy → Select previous commit
   - Fly.io: `fly releases` → `fly releases rollback <release-id>`

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

- [ ] Frontend loads: `https://icebreaker.app`
- [ ] Backend health: `https://api.icebreaker.app/api/health`
- [ ] WebSocket connects: `wss://api.icebreaker.app/ws`
- [ ] Onboarding flow works end-to-end
- [ ] Radar view loads and updates
- [ ] Chat functionality works
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

