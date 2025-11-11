# Supabase Access Token vs Anon Key

## Understanding the Difference

You provided a **Supabase Personal Access Token** (starts with `sbp_`), but the `supabase-mcp` package needs a different type of key.

## Two Different Types of Keys

### 1. Personal Access Token (PAT) - `sbp_...`
- **What it is**: A token for authenticating with Supabase's management API
- **Used for**: Account-level operations, project management
- **Format**: Starts with `sbp_` (like `sbp_62a678c17e7acc76c0b893f09921c8ae4901893b`)
- **Not used by**: Most MCP servers (they need the anon key instead)

### 2. Anonymous Key (Anon Key) - `eyJ...`
- **What it is**: A JWT token for database operations
- **Used for**: Client-side database access, respects RLS policies
- **Format**: Long JWT token starting with `eyJ` (JSON Web Token)
- **Used by**: `supabase-mcp` and most Supabase client libraries

## What You Need for supabase-mcp

The `supabase-mcp` package requires:
1. **SUPABASE_URL**: Your project URL (e.g., `https://xxxxx.supabase.co`)
2. **SUPABASE_ANON_KEY**: The `anon` `public` key from your API settings

## How to Get the Anon Key

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **API**
4. Find the **Project API keys** section
5. Look for **`anon` `public`** key
6. Click **Reveal** to show the key
7. Copy it (it's a long JWT token starting with `eyJ`)

## Setting Both Values

```powershell
# Set the project URL
[System.Environment]::SetEnvironmentVariable('SUPABASE_URL', 'https://your-project-id.supabase.co', 'User')

# Set the anon key (NOT the access token)
[System.Environment]::GetEnvironmentVariable('SUPABASE_ANON_KEY', 'your-anon-key-here', 'User')
```

## Why the Difference?

- **Access Token (`sbp_`)**: For managing your Supabase account/projects via API
- **Anon Key (`eyJ`)**: For accessing your database with RLS policies applied

The MCP server needs the anon key because it's designed to work with your database data, not manage your account.

## Quick Checklist

- [ ] Get your **SUPABASE_URL** from Settings → API
- [ ] Get your **SUPABASE_ANON_KEY** (the `anon` `public` key, not the access token)
- [ ] Set both as environment variables
- [ ] Restart Cursor

