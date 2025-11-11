# Supabase Keys Reference Guide

> **Purpose**: Reference guide for understanding and using Supabase keys  
> **Note**: For Supabase MCP setup, see `docs/guides/setup/mcp-setup.md` (no keys needed - uses browser auth)

## Understanding Supabase Keys

Supabase uses different types of keys for different purposes. Understanding the difference is crucial for proper setup.

## Key Types

### 1. Personal Access Token (PAT) - `sbp_...`

**What it is**: A token for authenticating with Supabase's Management API  
**Used for**: Account-level operations, project management  
**Format**: Starts with `sbp_` (e.g., `sbp_62a678c17e7acc76c0b893f09921c8ae4901893b`)  
**Not used by**: Most MCP servers (they need the anon key instead)

### 2. Anonymous Key (Anon Key) - `eyJ...`

**What it is**: A JWT token for database operations  
**Used for**: Client-side database access, respects RLS policies  
**Format**: Long JWT token starting with `eyJ` (JSON Web Token)  
**Used by**: Supabase client libraries, direct API access

### 3. Service Role Key - `eyJ...` (Secret)

**What it is**: A JWT token with full database access  
**Used for**: Server-side operations only  
**Format**: Long JWT token starting with `eyJ`  
**⚠️ WARNING**: Bypasses RLS - never expose in client-side code

## When to Use Which Key

### For Supabase MCP (Recommended)

**No keys needed** - The official hosted Supabase MCP server uses browser-based authentication. See `docs/guides/setup/mcp-setup.md`.

### For Client Libraries or Direct API Access

**Use Anonymous Key (`eyJ...`)**:
- Safe for client-side code
- Respects Row Level Security (RLS) policies
- Required for Supabase client libraries

**Optional: Service Role Key** (server-side only):
- Full database access
- Bypasses RLS
- Only use for server-side operations

## Getting Your Keys

### Step 1: Access API Settings

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **API**

### Step 2: Get Project URL

1. In **API Settings**, find **Project URL** section
2. Copy the URL (e.g., `https://xxxxxxxxxxxxx.supabase.co`)
3. This is your `SUPABASE_URL`

### Step 3: Get Anonymous Key

1. In **API Settings**, find **Project API keys** section
2. Look for **`anon` `public`** key
3. Click **Reveal** to show the key
4. Copy the key (long JWT token starting with `eyJ`)
5. This is your `SUPABASE_ANON_KEY`

### Step 4: (Optional) Get Service Role Key

⚠️ **Only if needed for server-side operations**

1. Find **`service_role` `secret`** key
2. Click **Reveal** to show the key
3. Copy securely
4. This is your `SUPABASE_SERVICE_ROLE_KEY`
5. **Never expose this key** in client-side code or public repositories

## Setting Environment Variables

### Windows (PowerShell)

```powershell
# Set SUPABASE_URL
[System.Environment]::SetEnvironmentVariable('SUPABASE_URL', 'https://your-project.supabase.co', 'User')

# Set SUPABASE_ANON_KEY
[System.Environment]::SetEnvironmentVariable('SUPABASE_ANON_KEY', 'your-anon-key-here', 'User')

# Set SUPABASE_SERVICE_ROLE_KEY (optional - server-side only)
[System.Environment]::SetEnvironmentVariable('SUPABASE_SERVICE_ROLE_KEY', 'your-service-role-key-here', 'User')
```

### Verify Environment Variables

```powershell
[System.Environment]::GetEnvironmentVariable('SUPABASE_URL', 'User')
[System.Environment]::GetEnvironmentVariable('SUPABASE_ANON_KEY', 'User')
```

**Important**: After setting environment variables, restart Cursor completely.

## Key Differences Summary

| Key Type | Format | Purpose | RLS Respect | Use Case |
|----------|--------|---------|-------------|----------|
| Access Token | `sbp_...` | Management API | N/A | Account/project management |
| Anon Key | `eyJ...` | Database access | ✅ Yes | Client libraries, MCP (if not using hosted) |
| Service Role | `eyJ...` | Database access | ❌ No | Server-side operations only |

## Security Best Practices

1. **Use `anon` key for client-side** - Respects RLS policies
2. **Never commit keys** - Keep in environment variables only
3. **Rotate keys regularly** - Supabase allows regeneration
4. **Use RLS policies** - Control data access even with `anon` key
5. **Service role key** - Only use server-side, never expose

## Troubleshooting

### Keys Not Working

- **Verify keys are correct**: Double-check you copied the entire key (they're long JWT tokens)
- **Check project status**: Ensure your Supabase project is active
- **Verify RLS policies**: If using `anon` key, ensure RLS policies allow your operations

### Environment Variables Not Loading

- **Restart Cursor**: Environment variables are loaded when Cursor starts
- **Check variable scope**: Must be **User** variables, not session variables
- **Verify in PowerShell**: Run verify commands above

## Related Documentation

- `docs/guides/setup/mcp-setup.md` - MCP setup (no keys needed for hosted server)
- `docs/troubleshooting/mcp-troubleshooting.md` - MCP troubleshooting
- `.cursor/rules/04-integrations.mdc` - MCP usage rules

