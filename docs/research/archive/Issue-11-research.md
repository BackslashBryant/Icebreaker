# Research: Production Deployment Infrastructure (Issue #21)

**Research Date**: 2025-01-27  
**Researcher**: Scout 🔎  
**Issue**: #11 - Production Deployment Infrastructure (originally #21)  
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

#### Vercel (Recommended)
- **Pros**:
  - Native Vite support, zero-config deployment
  - Automatic HTTPS/SSL, custom domains
  - Free tier: Unlimited bandwidth, 100GB/month
  - GitHub integration: Auto-deploy on push
  - Edge network: Global CDN included
  - Environment variables: Dashboard + CLI management
  - Preview deployments: Automatic for PRs
- **Cons**:
  - No WebSocket support (frontend-only, backend must be separate)
  - Free tier: 100GB bandwidth/month limit
- **Setup**: Connect GitHub repo, auto-detects Vite, configure env vars
- **Rollback**: Dashboard → Deployments → Promote previous deployment
- **Cost**: Free tier sufficient for MVP

#### Netlify
- **Pros**:
  - Free tier: 100GB bandwidth/month, 300 build minutes/month
  - GitHub integration: Auto-deploy on push
  - Environment variables: Dashboard management
  - Custom domains: Free SSL included
  - Build command: `cd frontend && npm run build`
  - Publish directory: `frontend/dist`
- **Cons**:
  - No WebSocket support (frontend-only)
  - Slightly more manual configuration than Vercel
- **Setup**: Connect GitHub repo, set build command, configure env vars
- **Rollback**: Dashboard → Deploys → Publish previous deploy
- **Cost**: Free tier sufficient for MVP

#### Cloudflare Pages
- **Pros**:
  - Free tier: Unlimited bandwidth, unlimited requests
  - Global CDN: Excellent performance
  - GitHub integration: Auto-deploy
  - Environment variables: Dashboard management
- **Cons**:
  - No WebSocket support (frontend-only)
  - Less common for React apps (better for static sites)
- **Setup**: Connect GitHub repo, set build command
- **Rollback**: Dashboard → Deployments → Retry previous deployment
- **Cost**: Free tier sufficient for MVP

**Recommendation**: **Vercel** - Best developer experience, zero-config, excellent GitHub integration, free tier sufficient.

**Rollback**: Vercel's dashboard rollback is simplest. Netlify and Cloudflare Pages also support rollback via dashboard.

---

### 2. Backend Deployment Platforms (Node.js/Express/WebSocket)

**Source**: Platform documentation and WebSocket support analysis

**Options Analyzed**:

#### Railway (Recommended)
- **Pros**:
  - **WebSocket support**: Full WebSocket support via TCP/HTTP upgrade
  - Free tier: $5 credit/month (sufficient for MVP)
  - GitHub integration: Auto-deploy on push
  - Environment variables: Dashboard + CLI management
  - Root directory: Set to `backend` for monorepo
  - Start command: `npm start` (uses `backend/package.json`)
  - Health checks: Automatic health endpoint monitoring
  - Logs: Real-time logs in dashboard
  - Custom domains: Free SSL included
- **Cons**:
  - Free tier: Limited to $5/month credit (may need paid plan for production)
  - No built-in database (but we use in-memory sessions for MVP)
- **Setup**: Connect GitHub repo, set root directory to `backend`, configure env vars
- **Rollback**: Dashboard → Deployments → Redeploy previous commit
- **Cost**: Free tier ($5 credit) may be sufficient for MVP, upgrade to $5/month plan if needed

#### Render
- **Pros**:
  - **WebSocket support**: Full WebSocket support
  - Free tier: Available (with limitations)
  - GitHub integration: Auto-deploy on push
  - Environment variables: Dashboard management
  - Health checks: Automatic health endpoint monitoring
  - Custom domains: Free SSL included
- **Cons**:
  - Free tier: Services spin down after 15 minutes of inactivity (not ideal for WebSocket)
  - Free tier: Limited to 750 hours/month
  - WebSocket may disconnect on spin-down
- **Setup**: Create Web Service, connect GitHub repo, set root directory to `backend`
- **Rollback**: Dashboard → Manual Deploy → Select previous commit
- **Cost**: Free tier has limitations, may need $7/month plan for always-on WebSocket

#### Fly.io
- **Pros**:
  - **WebSocket support**: Full WebSocket support
  - Free tier: 3 shared VMs, 3GB storage
  - Global edge deployment: Low latency worldwide
  - GitHub integration: Via GitHub Actions (not native)
  - Environment variables: CLI + dashboard management
  - Custom domains: Free SSL included
- **Cons**:
  - More complex setup: Requires `fly.toml` configuration
  - CLI-based: Less dashboard-friendly than Railway/Render
  - Free tier: Limited resources
- **Setup**: `fly launch` from backend directory, configure `fly.toml`
- **Rollback**: `fly releases rollback <release-id>` via CLI
- **Cost**: Free tier sufficient for MVP, but setup complexity higher

**Recommendation**: **Railway** - Best balance of WebSocket support, ease of setup, GitHub integration, and free tier. Render's spin-down limitation makes it less ideal for WebSocket apps.

**Rollback**: Railway dashboard rollback is simplest. Render and Fly.io also support rollback but require more manual steps.

---

### 3. GitHub Actions Deployment Workflow

**Source**: Existing `.github/workflows/deploy.yml` analysis and GitHub Actions best practices

**Current State**:
- Workflow exists but has TODOs for deployment steps
- Frontend build configured (Vite build with env vars)
- Backend build configured (npm ci)
- Missing: Actual deployment steps (Vercel, Railway, etc.)

**Workflow Patterns**:

#### Option 1: GitHub Actions → Platform APIs (Recommended)
- **Pros**:
  - Single source of truth (GitHub Actions)
  - Can add pre-deployment checks (tests, security scans)
  - Can coordinate frontend + backend deployment
  - Can add deployment notifications
- **Cons**:
  - More complex workflow configuration
  - Requires platform API tokens/secrets
- **Implementation**:
  - Use `vercel-action` for frontend
  - Use `railway-deploy` action or Railway CLI for backend
  - Add deployment status checks
  - Add rollback workflow

#### Option 2: Platform-Native Auto-Deploy (Simpler)
- **Pros**:
  - Zero configuration (connect GitHub repo)
  - Automatic deployments on push
  - Platform handles rollback
- **Cons**:
  - Less control over deployment process
  - Can't coordinate frontend + backend easily
  - Harder to add pre-deployment checks
- **Implementation**:
  - Connect GitHub repo in Vercel dashboard
  - Connect GitHub repo in Railway dashboard
  - Configure environment variables in dashboards
  - Deployments happen automatically

**Recommendation**: **Hybrid Approach** - Use platform-native auto-deploy for MVP (simplest), add GitHub Actions workflow later for coordination and checks.

**Rollback**: Platform-native rollback via dashboards is sufficient for MVP. GitHub Actions rollback workflow can be added later.

---

### 4. Environment Variables & Secrets Management

**Source**: Platform documentation and security best practices

**Requirements**:
- Frontend: `VITE_API_URL`, `VITE_SENTRY_DSN`, `VITE_SENTRY_ENABLE_DEV`, `VITE_APP_VERSION`
- Backend: `NODE_ENV`, `PORT`, `SENTRY_DSN`, `SENTRY_ENABLE_DEV`, `APP_VERSION`, `CORS_ORIGIN`

**Platform Support**:

#### Vercel
- **Method**: Dashboard → Project Settings → Environment Variables
- **Features**: 
  - Separate env vars for Production, Preview, Development
  - Encrypted storage
  - Can reference other env vars
- **CLI**: `vercel env add <key> <value>`
- **GitHub Secrets**: Not required (use dashboard)

#### Railway
- **Method**: Dashboard → Service → Variables
- **Features**:
  - Single environment (or separate staging/production services)
  - Encrypted storage
  - Can reference other variables
- **CLI**: `railway variables set <key>=<value>`
- **GitHub Secrets**: Required for GitHub Actions deployment (if using actions)

**Best Practices**:
- Never commit `.env` files
- Use platform dashboards for production secrets
- Use GitHub Secrets for CI/CD tokens (Vercel token, Railway token)
- Document required variables in `env.example`
- Verify all variables are set before deployment

**Recommendation**: Use platform dashboards for environment variables (simplest, most secure). Add GitHub Secrets only if using GitHub Actions deployment.

---

### 5. SSL/HTTPS & Domain Configuration

**Source**: Platform documentation

**All Platforms Provide**:
- Automatic SSL/TLS certificates (Let's Encrypt)
- Custom domain support
- HTTPS enforcement
- No additional configuration required

**Setup Process**:
1. Add custom domain in platform dashboard
2. Platform provides DNS records (CNAME or A record)
3. Update DNS at domain registrar
4. Platform automatically provisions SSL certificate
5. HTTPS enforced automatically

**Recommendation**: Use platform-provided SSL (automatic, free, no configuration needed). Custom domains can be added post-MVP if needed.

---

### 6. Rollback Procedures

**Source**: Platform documentation and incident response best practices

**Rollback Strategies**:

#### Quick Rollback (Last Deployment)
- **Vercel**: Dashboard → Deployments → Previous deployment → "Promote to Production"
- **Railway**: Dashboard → Deployments → Previous deployment → "Redeploy"
- **Time**: < 2 minutes
- **Use Case**: Recent deployment broke production

#### Emergency Rollback (Code Revert)
- **Method**: `git revert <commit-hash>` → `git push origin main`
- **Time**: < 5 minutes (includes deployment time)
- **Use Case**: Need to revert specific commit

#### Database/State Rollback
- **Not Applicable**: MVP uses in-memory sessions (ephemeral by design)
- **Future**: If adding persistent storage, need backup/restore strategy

**Recommendation**: Document both quick rollback (dashboard) and emergency rollback (git revert) procedures. Test rollback process before production launch.

---

### 7. Zero-Downtime Deployment

**Source**: Platform capabilities and deployment patterns

**Platform Support**:

#### Vercel
- **Zero-downtime**: Yes (automatic)
- **Method**: Blue-green deployment (new deployment → health check → switch traffic)
- **Time**: < 30 seconds

#### Railway
- **Zero-downtime**: Yes (with health checks)
- **Method**: New deployment → health check → switch traffic
- **Time**: < 1 minute
- **Requirement**: Health endpoint must return 200 OK

#### Render
- **Zero-downtime**: Yes (with health checks)
- **Method**: New deployment → health check → switch traffic
- **Time**: < 1 minute

**Recommendation**: All platforms support zero-downtime deployments with health checks. Ensure `/api/health` endpoint returns 200 OK for successful deployments.

---

### 8. Deployment Verification & Testing

**Source**: Best practices and existing test infrastructure

**Verification Steps**:
1. **Health Checks**: `GET /api/health` returns `{ status: "ok" }`
2. **WebSocket**: `wss://api.icebreaker.app/ws` connects successfully
3. **Frontend**: `https://icebreaker.app` loads correctly
4. **Onboarding Flow**: Complete onboarding → Radar view loads
5. **Sentry**: Errors appear in Sentry dashboard (if configured)
6. **HTTPS**: All requests use HTTPS (no mixed content)
7. **CORS**: Frontend can connect to backend (verify CORS_ORIGIN)

**Automated Testing**:
- Use Playwright smoke tests for post-deployment verification
- Run health check tests in CI/CD
- Monitor Sentry for errors post-deployment

**Recommendation**: Create post-deployment verification script (`scripts/verify-deployment.mjs`) that checks health endpoints, WebSocket connection, and frontend load.

---

## Recommendations

### Platform Selection

**Frontend**: **Vercel**
- Best developer experience
- Zero-config Vite deployment
- Excellent GitHub integration
- Free tier sufficient for MVP
- Easy rollback via dashboard

**Backend**: **Railway**
- Full WebSocket support
- Easy GitHub integration
- Free tier ($5 credit) sufficient for MVP
- Simple dashboard rollback
- Health check support for zero-downtime

### Deployment Workflow

**MVP Approach**: Platform-native auto-deploy
1. Connect GitHub repos in Vercel and Railway dashboards
2. Configure environment variables in dashboards
3. Deployments happen automatically on push to `main`
4. Use dashboards for rollback

**Future Enhancement**: GitHub Actions workflow
- Add pre-deployment checks (tests, security scans)
- Coordinate frontend + backend deployment
- Add deployment notifications
- Add automated rollback workflow

### Rollback Strategy

**Quick Rollback**: Use platform dashboards (< 2 minutes)
**Emergency Rollback**: Git revert + push (< 5 minutes)
**Documentation**: Create `docs/deployment/RUNBOOK.md` with step-by-step procedures

### Environment Variables

**Production**: Use platform dashboards (Vercel, Railway)
**CI/CD**: Use GitHub Secrets for platform tokens (if using GitHub Actions)
**Documentation**: Keep `env.example` updated with all required variables

### SSL/Domain

**MVP**: Use platform-provided domains (e.g., `icebreaker.vercel.app`, `icebreaker.up.railway.app`)
**Post-MVP**: Add custom domains (`icebreaker.app`, `api.icebreaker.app`) via platform dashboards

---

## Rollback Options

### If Vercel Doesn't Work
- **Fallback**: Netlify (similar features, slightly more manual setup)
- **Rollback**: Remove Vercel config, connect Netlify, redeploy

### If Railway Doesn't Work
- **Fallback**: Render (WebSocket support, but spin-down limitation)
- **Alternative**: Fly.io (more complex setup, but full WebSocket support)
- **Rollback**: Export environment variables, switch platform, redeploy

### If Auto-Deploy Fails
- **Fallback**: Manual deployment via CLI (`vercel deploy`, `railway up`)
- **Rollback**: Use platform dashboards for rollback

---

## Next Steps

1. **Vector**: Create detailed plan with checkpoints for platform setup, deployment workflow, rollback testing
2. **Nexus**: Execute platform setup (Vercel + Railway accounts, GitHub connections)
3. **Nexus**: Configure environment variables in platform dashboards
4. **Nexus**: Test deployment process (deploy → verify → rollback)
5. **Muse**: Document deployment runbook (`docs/deployment/RUNBOOK.md`)
6. **Nexus**: Update `.github/workflows/deploy.yml` (optional - can defer to post-MVP)

---

## Sources Cited

- Vercel Documentation: https://vercel.com/docs
- Railway Documentation: https://docs.railway.app
- Render Documentation: https://render.com/docs
- Fly.io Documentation: https://fly.io/docs
- GitHub Actions Documentation: https://docs.github.com/en/actions
- Existing deployment guide: `Docs/deployment.md`
- Existing workflow: `.github/workflows/deploy.yml`
- Connection Guide: `Docs/ConnectionGuide.md`

---

**Research Status**: ✅ **COMPLETE**  
**Ready for**: Vector to create detailed plan with checkpoints

