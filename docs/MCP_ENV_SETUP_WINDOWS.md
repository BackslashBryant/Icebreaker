# MCP Environment Variables Setup (Windows)

## Quick Setup Guide

> **💡 Recommended Workflow:**
> 1. Run `npm run setup:tokens` to create/update your `.env` file
> 2. Run `npm run mcp:load-env:win` to load `.env` values into system environment variables
> 3. Restart Cursor completely
>
> This keeps your tokens in `.env` (good for git-ignored local config) while making them available to Cursor MCP servers.

### Required Environment Variables

**For GitHub, DocFork, Desktop Commander, and Playwright MCPs:**
- `GITHUB_TOKEN` - Your GitHub Personal Access Token

**For Supabase MCP (if using):**
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Your Supabase anonymous key

---

## Method 1: System Environment Variables (Recommended - Permanent)

### Step-by-Step:

1. **Open Environment Variables:**
   - Press `Win + R`
   - Type: `sysdm.cpl`
   - Press Enter
   - Click "Advanced" tab
   - Click "Environment Variables" button

2. **Add User Variables:**
   - Under "User variables", click "New"
   - For each variable:
     - **Variable name:** `GITHUB_TOKEN`
     - **Variable value:** `your_token_here` (paste your actual token)
     - Click "OK"

3. **Repeat for Supabase (if needed):**
   - Add `SUPABASE_URL` with your Supabase project URL
   - Add `SUPABASE_ANON_KEY` with your Supabase anonymous key

4. **Restart Cursor:**
   - Close Cursor completely
   - Reopen Cursor
   - The MCP servers should now work

---

## Method 2: PowerShell Session (Temporary - Current Session Only)

If you prefer to set variables for just the current session:

1. **Open PowerShell**
2. **Set variables:**
```powershell
$env:GITHUB_TOKEN = "your_github_token_here"
$env:SUPABASE_URL = "your_supabase_url_here"
$env:SUPABASE_ANON_KEY = "your_supabase_key_here"
```

3. **Launch Cursor from that PowerShell window:**
```powershell
cursor .
```

**Note:** Variables set this way only last until you close PowerShell.

---

## Method 3: Load from .env File (Recommended if using token-wizard)

If you've used `npm run setup:tokens` to save tokens to a `.env` file, you can load those values into system environment variables:

**Option A: Using npm script (Windows):**
```powershell
npm run mcp:load-env:win
```

**Option B: Using PowerShell directly:**
```powershell
powershell -ExecutionPolicy Bypass -File .\tools\load-env-to-system.ps1
```

**Option C: Using Node.js script:**
```powershell
npm run mcp:load-env
```

This will:
1. Read your `.env` file
2. Set all variables as Windows User environment variables
3. Make them available to Cursor MCP servers

**After running this script, restart Cursor completely.**

---

## Getting Your Tokens

### GitHub Token:
1. Go to: https://github.com/settings/tokens/new
2. Name: `Cursor MCP`
3. Expiration: Choose your preference
4. Scopes: Check these boxes:
   - `repo` (Full control of private repositories)
   - `workflow` (Update GitHub Action workflows)
   - `read:org` (Read org and team membership)
5. Click "Generate token"
6. **Copy the token immediately** (you won't see it again)
7. Use this token as your `GITHUB_TOKEN` value

### Supabase Credentials:
1. Go to your Supabase project dashboard
2. Settings → API
3. Copy:
   - **Project URL** → `SUPABASE_URL`
   - **anon/public key** → `SUPABASE_ANON_KEY`

---

## Verification

After setting environment variables:

1. **Verify they're set (PowerShell):**
```powershell
echo $env:GITHUB_TOKEN
echo $env:SUPABASE_URL
echo $env:SUPABASE_ANON_KEY
```

2. **Restart Cursor completely**
3. **Check MCP status:**
   - Open Cursor Settings
   - Look for MCP server status
   - Or try using an MCP tool in chat

---

## Troubleshooting

### MCPs Still Not Working After Setting Variables

1. **Restart Cursor completely** - Close all Cursor windows and reopen
2. **Check variable names** - Must be exactly: `GITHUB_TOKEN`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`
3. **Check token validity** - Test GitHub token at: https://api.github.com/user (use Authorization header)
4. **Check Cursor logs** - Look for MCP error messages in Cursor's output panel

### Variables Not Persisting

- Make sure you added them as **User variables** (not System variables)
- System variables require admin rights and affect all users

### Still Having Issues?

Check:
- `.cursor/mcp.json` format is correct (should use `${env:VARIABLE_NAME}`)
- Environment variables are set in the same user account running Cursor
- Cursor has been restarted after setting variables
