# Issue #21 Research - Production Deployment Infrastructure

**Research Date**: 2025-11-11  
**Researcher**: Scout 🔎  
**Status**: Complete

## Research Question

What are the best deployment platforms and workflows for a production-ready MVP with React/Vite frontend, Express/WebSocket backend, and what are the requirements for zero-downtime deployments, rollback procedures, and environment configuration?

## Constraints

- **Stack**: React + Vite frontend, Express + WebSocket backend (Node.js 20)
- **MVP Scope**: Free tier acceptable, simple deployment process
- **Requirements**:
  - WebSocket support (critical for Radar/Chat)
  - Environment variable management
  - SSL/HTTPS (required for production)
  - Rollback capability
  - GitHub Actions integration preferred
- **Performance Targets**: Deployment time < 5 minutes, zero-downtime preferred
- **Budget**: Free tier acceptable for MVP launch

## Sources & Findings

### 1. Frontend Deployment Platforms (React/Vite)

**Source**: Platform documentation and industry best practices

**Options Analyzed**:

**Vercel (Recommended)**:
- **Pros**: Native Vite support, zero-config deployment, automatic HTTPS/SSL, free tier sufficient, excellent GitHub integration, edge network CDN, environment variables dashboard + CLI
- **Cons**: No WebSocket support (frontend-only, backend must be separate), free tier 100GB bandwidth/month limit
- **Setup**: Connect GitHub repo, auto-detects Vite, configure env vars
- **Rollback**: Dashboard → Deployments → Promote previous deployment
- **Cost**: Free tier sufficient for MVP

**Netlify**:
- **Pros**: Free tier, GitHub integration, environment variables dashboard, custom domains with free SSL
- **Cons**: No WebSocket support, slightly more manual configuration than Vercel
- **Rollback**: Dashboard → Deploys → Publish previous deploy

**Cloudflare Pages**:
- **Pros**: Unlimited bandwidth, global CDN, GitHub integration
- **Cons**: No WebSocket support, less common for React apps

**Recommendation**: **Vercel** - Best developer experience, zero-config, excellent GitHub integration, free tier sufficient.

### 2. Backend Deployment Platforms (Node.js/Express/WebSocket)

**Source**: Platform documentation and WebSocket support analysis

**Options Analyzed**:

**Railway (Recommended)**:
- **Pros**: Full WebSocket support via TCP/HTTP upgrade, free tier $5 credit/month, GitHub integration, environment variables dashboard + CLI, health checks, real-time logs, custom domains with free SSL
- **Cons**: Free tier limited to $5/month credit (may need paid plan for production), no built-in database (but we use in-memory sessions for MVP)
- **Setup**: Connect GitHub repo, set root directory to `backend`, configure env vars
- **Rollback**: Dashboard → Deployments → Redeploy previous commit
- **Cost**: Free tier ($5 credit) may be sufficient for MVP, upgrade to $5/month plan if needed

**Render**:
- **Pros**: Full WebSocket support, free tier available, GitHub integration
- **Cons**: Free tier services spin down after 15 minutes of inactivity (not ideal for WebSocket), limited to 750 hours/month

**Fly.io**:
- **Pros**: Full WebSocket support, free tier, global edge deployment
- **Cons**: More complex setup (requires `fly.toml`), CLI-based, less dashboard-friendly

**Recommendation**: **Railway** - Best balance of WebSocket support, ease of setup, GitHub integration, and free tier. Render's spin-down limitation makes it less ideal for WebSocket apps.

### 3. GitHub Actions Deployment Workflow

**Source**: Existing `.github/workflows/deploy.yml` analysis

**Current State**: Workflow exists but has TODOs for deployment steps

**Options**:
1. **GitHub Actions → Platform APIs**: More control, pre-deployment checks, coordination
2. **Platform-Native Auto-Deploy**: Zero configuration, automatic deployments, platform handles rollback

**Recommendation**: **Hybrid Approach** - Use platform-native auto-deploy for MVP (simplest), add GitHub Actions workflow later for coordination and checks.

### 4. Environment Variables & Secrets Management

**Source**: Platform documentation and security best practices

**Requirements**:
- Frontend: `VITE_API_URL`, `VITE_SENTRY_DSN`, `VITE_SENTRY_ENABLE_DEV`, `VITE_APP_VERSION`
- Backend: `NODE_ENV`, `PORT`, `SENTRY_DSN`, `SENTRY_ENABLE_DEV`, `APP_VERSION`, `CORS_ORIGIN`

**Platform Support**:
- **Vercel**: Dashboard → Project Settings → Environment Variables, separate env vars for Production/Preview/Development, encrypted storage
- **Railway**: Dashboard → Service → Variables, encrypted storage, CLI support

**Recommendation**: Use platform dashboards for environment variables (simplest, most secure). Add GitHub Secrets only if using GitHub Actions deployment.

### 5. SSL/HTTPS & Domain Configuration

**Source**: Platform documentation

**All Platforms Provide**: Automatic SSL/TLS certificates (Let's Encrypt), custom domain support, HTTPS enforcement, no additional configuration required

**Recommendation**: Use platform-provided SSL (automatic, free, no configuration needed). Custom domains can be added post-MVP if needed.

### 6. Rollback Procedures

**Source**: Platform documentation and incident response best practices

**Rollback Strategies**:
- **Quick Rollback**: Platform dashboards (< 2 minutes) - Vercel: Promote previous deployment, Railway: Redeploy previous commit
- **Emergency Rollback**: Git revert + push (< 5 minutes)
- **Database/State Rollback**: Not applicable (MVP uses in-memory sessions)

**Recommendation**: Document both quick rollback (dashboard) and emergency rollback (git revert) procedures. Test rollback process before production launch.

### 7. Zero-Downtime Deployment

**Source**: Platform capabilities and deployment patterns

**Platform Support**:
- **Vercel**: Yes (automatic), blue-green deployment, < 30 seconds
- **Railway**: Yes (with health checks), < 1 minute, requires health endpoint returns 200 OK
- **Render**: Yes (with health checks), < 1 minute

**Recommendation**: All platforms support zero-downtime deployments with health checks. Ensure `/api/health` endpoint returns 200 OK for successful deployments.

### 8. Deployment Verification & Testing

**Source**: Best practices and existing test infrastructure

**Verification Steps**:
1. Health Checks: `GET /api/health` returns `{ status: "ok" }`
2. WebSocket: `wss://api.icebreaker.app/ws` connects successfully
3. Frontend: `https://icebreaker.app` loads correctly
4. Onboarding Flow: Complete onboarding → Radar view loads
5. Sentry: Errors appear in Sentry dashboard (if configured)
6. HTTPS: All requests use HTTPS (no mixed content)
7. CORS: Frontend can connect to backend (verify CORS_ORIGIN)

**Recommendation**: Create post-deployment verification script (`scripts/verify-deployment.mjs`) that checks health endpoints, WebSocket connection, and frontend load.

## Recommendations Summary

**Platform Selection**:
- **Frontend**: Vercel - Best developer experience, zero-config, excellent GitHub integration, free tier sufficient
- **Backend**: Railway - Full WebSocket support, easy GitHub integration, free tier sufficient, simple dashboard rollback

**Deployment Workflow**:
- **MVP Approach**: Platform-native auto-deploy (connect GitHub repos, configure env vars, deployments happen automatically)
- **Future Enhancement**: GitHub Actions workflow (pre-deployment checks, coordination, notifications)

**Rollback Strategy**:
- Quick Rollback: Platform dashboards (< 2 minutes)
- Emergency Rollback: Git revert + push (< 5 minutes)

**Environment Variables**: Use platform dashboards for production secrets

**SSL/Domain**: Use platform-provided domains for MVP, add custom domains post-MVP

## Rollback Options

- **If Vercel Doesn't Work**: Fallback to Netlify
- **If Railway Doesn't Work**: Fallback to Render or Fly.io
- **If Auto-Deploy Fails**: Fallback to manual deployment via CLI

## Next Steps

1. Create GitHub issue for production deployment
2. Set up Vercel account and connect GitHub repo
3. Set up Railway account and connect GitHub repo
4. Configure environment variables in platform dashboards
5. Deploy backend first (Railway)
6. Deploy frontend second (Vercel)
7. Verify deployments with verification script
8. Test rollback procedures
9. Document deployment runbook

