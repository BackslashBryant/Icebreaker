# Railway CLI Authentication Research

**Date**: 2025-11-19  
**Research Question**: How to authenticate Railway CLI with a token to set environment variables and trigger redeploy?  
**Issue**: Railway CLI shows "Unauthorized" and "Project Token not found" even with token set  
**Context**: Need to set `HEALTH_CHECK_TEST_FAIL=true` and trigger redeploy for alert testing

## Problem

Railway CLI authentication failing:
- Token provided: `0f569896-9ba2-4362-8e20-a9ba7641b478`
- Tried: `RAILWAY_TOKEN` environment variable
- Tried: `RAILWAY_API_TOKEN` environment variable  
- Error: "Unauthorized. Please login with `railway login`"
- Error: "Project Token not found"
- CLI detects token ("Note: Using RAILWAY_TOKEN environment variable") but still fails

## Research Needed

1. Railway CLI token authentication method
2. Account token vs Project token differences
3. How to use token without browser login
4. Railway CLI `variables set` command availability
5. Alternative: Railway REST API for setting variables

## Findings

**Token Type Required**: Project Token (not Account Token)
- Project Token: For project-specific actions (deploy, variables, logs)
  - Set as `RAILWAY_TOKEN` environment variable
  - Generated from: Railway Dashboard → Project → Settings → Tokens → "New Token" → Select "Project Token"
  - According to [Railway docs](https://docs.railway.com/reference/integrations#project-tokens): "Project tokens allow the CLI to access all the environment variables associated with a specific project and environment"
  - Usage: `RAILWAY_TOKEN=XXXX railway run` (for running commands in Railway environment)
- Account Token: For account-wide actions (list projects, create projects)
  - Set as `RAILWAY_API_TOKEN` environment variable
  - Generated from: Railway Dashboard → Account → Tokens → "New Token" → Select "Account Token"

**Current Issue**: Token `0f569896-9ba2-4362-8e20-a9ba7641b478` authentication failing
- Error: "Found invalid RAILWAY_TOKEN" or "Unauthorized"
- Project Tokens are designed for `railway run` command (CI/remote servers)
- For `railway variables` and other commands, may need `railway link` first to select project
- Alternative: Use Railway Dashboard for setting variables (more reliable)

## Sources to Check

- Railway CLI documentation: https://docs.railway.com/guides/cli
- Railway Public API: https://docs.railway.com/reference/public-api
- Railway GraphQL API: https://backboard.railway.app/graphql/v1

## Next Steps

Research Railway CLI authentication and variable management methods.

## Resolution

**Date**: 2025-11-19

**Finding**: Project Tokens are limited in scope
- According to [Railway docs](https://docs.railway.com/reference/integrations#project-tokens), Project Tokens are designed for `railway run` command in CI/remote environments
- They allow access to environment variables, but NOT for interactive CLI commands like `railway variables`, `railway link`, etc.
- These commands require browser-based login session

**Workaround**: Use Railway Dashboard for variable management
- Dashboard → Service → Variables → Set/Edit variables
- More reliable than CLI for interactive use
- Dashboard is the recommended approach for manual variable management

**For Future Automation**:
- Use Railway's Public API or GraphQL API for programmatic variable management
- Project Tokens work for `railway run` in CI/CD pipelines
- Browser-based login required for full CLI functionality (`railway login`)

**Current Status**: 
- Variable `HEALTH_CHECK_TEST_FAIL=true` set via dashboard ✅
- Health endpoint returning 500 (test active) ✅
- Alert test proceeding successfully ✅

