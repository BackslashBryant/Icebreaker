# MCP Setup Guide

> **Last Updated**: 2025-11-11  
> **Purpose**: Complete setup guide for MCP servers in Cursor IDE

## Overview

MCP (Model Context Protocol) tools enhance Cursor IDE capabilities for development. This guide covers initial setup, configuration, and environment variable management.

## Required MCP Servers

- **GitHub MCP** (`@modelcontextprotocol/server-github`) - Issue management, branch/PR operations
- **Supabase MCP** (Hosted server) - Database operations, schema queries, project management
- **Playwright MCP** (`@playwright/mcp`) - UI testing, screenshots, accessibility checks
- **Desktop Commander MCP** (`@wonderwhy-er/desktop-commander`) - Local shell/file automation
- **Ref Tools MCP** (`ref-tools-mcp`) - Documentation search (no configuration needed)

## Quick Setup

### Step 1: Environment Variables (Windows)

**Recommended Workflow:**
1. Run `npm run setup:tokens` to create/update your `.env` file
2. Run `npm run mcp:load-env:win` to load `.env` values into system environment variables
3. Restart Cursor completely

**Required Environment Variables:**

- `GITHUB_TOKEN` - GitHub Personal Access Token (required for GitHub, Desktop Commander, Playwright MCPs)
- **Supabase MCP**: No environment variables needed - uses browser-based authentication

**Setting Environment Variables:**

**Method 1: Using npm script (Recommended)**
```powershell
npm run mcp:load-env:win
```
Then restart Cursor completely.

**Method 2: Manual Setup (Windows)**
1. Press `Win + R`, type `sysdm.cpl`, press Enter
2. Click "Advanced" tab → "Environment Variables"
3. Under "User variables", click "New"
4. Add `GITHUB_TOKEN` with your token value
5. Restart Cursor completely

**Getting Your GitHub Token:**
1. Go to: https://github.com/settings/tokens/new
2. Name: `Cursor MCP`
3. Scopes: Check `repo`, `workflow`, `read:org`
4. Generate and copy token immediately
5. Use as `GITHUB_TOKEN` value

### Step 2: MCP Configuration

The MCP configuration is located in `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "${env:GITHUB_TOKEN}"
      }
    },
    "supabase": {
      "url": "https://mcp.supabase.com/mcp?project_ref=YOUR_PROJECT_REF&features=docs%2Caccount%2Cdatabase%2Cdebugging%2Cdevelopment%2Cfunctions%2Cbranching%2Cstorage"
    },
    "playwright-mcp": {
      "command": "npx",
      "args": ["-y", "@playwright/mcp"],
      "env": {
        "GITHUB_TOKEN": "${env:GITHUB_TOKEN}"
      }
    },
    "desktop-commander": {
      "command": "npx",
      "args": ["-y", "@wonderwhy-er/desktop-commander"],
      "env": {
        "GITHUB_TOKEN": "${env:GITHUB_TOKEN}"
      }
    },
    "ref-tools-mcp": {
      "command": "npx",
      "args": ["-y", "ref-tools-mcp"]
    }
  }
}
```

**Important**: Environment variable format must be `${env:VARIABLE_NAME}` (not `${VARIABLE_NAME}` or hardcoded values).

### Step 3: Supabase Setup

**Using Official Hosted Supabase MCP Server** (Recommended):

1. **No environment variables needed** - The hosted server uses browser-based authentication
2. **Get your project reference**:
   - Go to Supabase Dashboard → Your Project
   - Copy the project reference from the URL (e.g., `awqcctsqyrlgaygpmgrq`)
3. **Configure in `.cursor/mcp.json`** (see example above)
4. **First-time authentication**:
   - Restart Cursor completely
   - Cursor will prompt you to authenticate via browser
   - Log in to your Supabase account and grant organization access

**Benefits of Hosted Server**:
- No manual token management
- Automatic authentication via browser
- Project-scoped access
- Official Supabase support

**Note**: If you need Supabase keys for client libraries or direct API access, see `docs/guides/reference/supabase-keys.md`.

### Step 4: Verification

After setup:
1. **Restart Cursor completely** (close all windows)
2. **Check MCP status**: Cursor Settings → MCP
3. **Verify environment variables**:
   ```powershell
   [System.Environment]::GetEnvironmentVariable('GITHUB_TOKEN', 'User')
   ```
4. **Run preflight**: `npm run preflight` validates MCP configuration

## Automation Helpers

- `npm run preflight` - Validates baseline MCPs before agents run
- `npm run mcp:heal` - Detects and fixes common MCP configuration issues
- `npm run mcp:suggest` - Analyzes dependencies and recommends MCPs
- `npm run mcp:load-env:win` - Loads `.env` file into system environment variables

## Troubleshooting

See `docs/troubleshooting/mcp-troubleshooting.md` for detailed troubleshooting steps.

**Quick Fixes:**
1. **Restart Cursor completely** - Most common fix
2. **Run `npm run mcp:heal`** - Auto-fixes configuration issues
3. **Verify environment variables** - Must be User-level, not session
4. **Check `.cursor/mcp.json` format** - Must use `${env:VARIABLE_NAME}`

## Related Documentation

- `docs/troubleshooting/mcp-troubleshooting.md` - Detailed troubleshooting guide
- `docs/guides/reference/supabase-keys.md` - Supabase key reference (for client libraries)
- `.cursor/rules/04-integrations.mdc` - MCP usage rules for agents

