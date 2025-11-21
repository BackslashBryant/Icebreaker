# Railway MCP Removal - Final Status

**Date**: 2025-11-20  
**Decision**: Remove Railway MCP from config

## Issue Summary

Railway MCP (`@railway/mcp-server`) has a persistent package dependency error:
```
Error [ERR_MODULE_NOT_FOUND]: Cannot find module 'zod/v3/external.js'
```

This error prevents Railway MCP from connecting, even with:
- ✅ Railway CLI authenticated (`railway whoami` works)
- ✅ Railway API token configured (`RAILWAY_TOKEN` in `.env`)
- ✅ Token loaded into system environment
- ✅ Multiple Cursor restarts

## Solution

**Remove Railway MCP** and use **Railway CLI directly**.

### Why This Works

Railway CLI provides all the same functionality:
- `railway status` - Project status
- `railway logs` - View deployment logs
- `railway variables` - Environment variables
- `railway deploy` - Deploy services
- `railway list` - List projects
- `railway open` - Open dashboard

### Changes Made

1. ✅ Removed Railway MCP from `.cursor/mcp.json`
2. ✅ Updated Connection Guide to document Railway CLI usage
3. ✅ Railway token remains in `.env` (may be useful for other tools)

## Final MCP Status

**Working MCPs**: 6/6 (100%)
- Desktop Commander ✅
- Supabase ✅
- Vercel ✅
- GitHub ✅
- Playwright ✅
- Filesystem ✅

**Removed MCPs**:
- Ref Tools MCP (configuration errors)
- Railway MCP (package dependency error)

**Fallbacks**:
- Ref Tools → GitHub MCP + web_search
- Railway MCP → Railway CLI (works perfectly)

## Recommendation

Railway CLI is more reliable than Railway MCP and provides the same functionality. No loss of capability by removing the MCP.

