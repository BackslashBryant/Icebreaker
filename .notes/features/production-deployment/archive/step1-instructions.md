# Step 1: Platform Account Setup & GitHub Connection

**Owner**: @Nexus 🚀
**Status**: 🚀 **IN PROGRESS**
**Issue**: #21

## Objective

Set up accounts on Vercel and Railway, connect GitHub repositories, and configure basic project settings for auto-deployment.

## Actions Required (Manual Steps)

### 1. Vercel Account Setup (Frontend)

**Steps**:
1. Go to https://vercel.com/signup
2. Sign up with GitHub (recommended) or email
3. After signup, click "Add New Project"
4. Import GitHub repository: `BackslashBryant/Icebreaker`
5. Configure project settings:
   - **Framework Preset**: Vite (should auto-detect)
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `dist` (default)
   - **Install Command**: `npm install` (default)
6. **DO NOT** deploy yet (wait for Step 4 after backend is deployed)
7. Note the project name and dashboard URL

**Acceptance Criteria**:
- ✅ Vercel account created
- ✅ GitHub repository connected
- ✅ Project configured with root directory `frontend`
- ✅ Framework preset set to Vite
- ✅ Project visible in Vercel dashboard

### 2. Railway Account Setup (Backend)

**Steps**:
1. Go to https://railway.app/signup
2. Sign up with GitHub (recommended) or email
3. After signup, click "New Project"
4. Select "Deploy from GitHub repo"
5. Select repository: `BackslashBryant/Icebreaker`
6. Configure service settings:
   - **Root Directory**: `backend`
   - **Start Command**: `npm start` (or `npm run dev` for development)
   - **Node Version**: 20 (set in `package.json` engines or Railway settings)
7. **DO NOT** deploy yet (wait for Step 3 after environment variables are configured)
8. Note the service name and dashboard URL

**Acceptance Criteria**:
- ✅ Railway account created
- ✅ GitHub repository connected
- ✅ Service configured with root directory `backend`
- ✅ Node.js version set to 20
- ✅ Service visible in Railway dashboard

### 3. GitHub Integration Verification

**Steps**:
1. Verify both platforms have access to the repository
2. Check that auto-deploy is enabled (default for both platforms)
3. Verify branch protection (should deploy from `main` branch by default)

**Acceptance Criteria**:
- ✅ Vercel connected to GitHub repository
- ✅ Railway connected to GitHub repository
- ✅ Auto-deploy enabled on both platforms
- ✅ Both platforms can access repository

## Rollback

If account setup fails:
- Use alternative authentication method (email instead of GitHub, or vice versa)
- Verify GitHub repository is public or Railway/Vercel have access permissions
- Check GitHub account settings for authorized applications

## Next Steps

After Step 1 completion:
- Proceed to Step 2: Environment Variables Configuration
- Will configure production environment variables in both platforms

## Notes

- Free tiers are sufficient for MVP launch
- Railway free tier: $5 credit/month (may need upgrade for production)
- Vercel free tier: 100GB bandwidth/month (sufficient for MVP)
- Both platforms provide automatic SSL/HTTPS (no configuration needed)

