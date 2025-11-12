# Vercel Dashboard Configuration Guide

**Goal**: Ensure frontend is publicly accessible and properly configured

## Steps to Check/Configure

### 1. Check Deployment Protection
**URL**: https://vercel.com/backslashbryants-projects/frontend/settings/deployment-protection

**What to check**:
- Look for "Password Protection" or "Deployment Protection" settings
- If enabled for Production, disable it (or note the password if you want to keep it)
- Ensure Production deployments are publicly accessible

**Action**: Disable password protection for Production environment if enabled

### 2. Check Project Visibility
**URL**: https://vercel.com/backslashbryants-projects/frontend/settings/general

**What to check**:
- Verify project visibility settings
- Ensure project is set to "Public" (not Private)
- Check if there are any access restrictions

**Action**: Set project to Public if it's currently Private

### 3. Verify Git Integration
**URL**: https://vercel.com/backslashbryants-projects/frontend/settings/git

**What to check**:
- Verify GitHub repository is connected: `BackslashBryant/Icebreaker`
- Check Root Directory is set to: `frontend`
- Verify Production Branch is: `main`
- Check Framework Preset is: `Vite` (or auto-detected)

**Action**: Connect GitHub repo if not connected, verify root directory

### 4. Check Environment Variables
**URL**: https://vercel.com/backslashbryants-projects/frontend/settings/environment-variables

**What to verify**:
- `VITE_API_URL` = `https://airy-fascination-production.up.railway.app`
- `VITE_APP_VERSION` = `0.1.0`
- `VITE_SENTRY_ENABLE_DEV` = `false`

**Action**: Verify all variables are set correctly for Production environment

### 5. Check Domains/Aliases
**URL**: https://vercel.com/backslashbryants-projects/frontend/settings/domains

**What to check**:
- Verify main alias: `frontend-backslashbryants-projects.vercel.app`
- Check if there are any domain restrictions
- Note: Deployment-specific URLs (like `frontend-coral-two-84.vercel.app`) should work regardless

**Action**: Ensure main alias doesn't have restrictions

## Quick Fix Priority

**Most Important**: 
1. **Deployment Protection** - Disable for Production if enabled
2. **Git Integration** - Verify GitHub repo is connected and root directory is `frontend`

## After Changes

After making changes, verify access:
```powershell
Invoke-WebRequest -Uri "https://frontend-backslashbryants-projects.vercel.app" -UseBasicParsing | Select-Object StatusCode
```

Expected: StatusCode 200

## Current Status

- ✅ Deployment is working and accessible via deployment URLs
- ⚠️ Main alias may have protection enabled
- ✅ All backend services verified and working

