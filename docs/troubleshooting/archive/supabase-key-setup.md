# Supabase Key Setup Guide

> **Note**: This guide is for setting up Supabase keys for **direct API access** or **client libraries**.  
> **For Supabase MCP**: The official hosted Supabase MCP server doesn't require these keys - it uses browser-based authentication.  
> See `docs/troubleshooting/mcp-setup-guide.md` for MCP configuration.

This guide walks you through getting your Supabase API keys for use with Supabase client libraries or direct API access.

## Step 1: Access Your Supabase Project

1. **Go to Supabase Dashboard**: Navigate to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. **Sign in** to your account
3. **Select your project** (or create a new one if you don't have one)

## Step 2: Navigate to API Settings

1. In your project dashboard, click on **Settings** (gear icon in the left sidebar)
2. Click on **API** in the settings menu

## Step 3: Get Your Project URL

1. In the **API Settings** page, find the **Project URL** section
2. Copy the **Project URL** (it looks like: `https://xxxxxxxxxxxxx.supabase.co`)
3. This is your `SUPABASE_URL`

## Step 4: Get Your API Keys

In the **API Settings** page, you'll see two keys:

### Option A: Anonymous Key (Recommended for MCP)

1. Find the **Project API keys** section
2. Look for the **`anon` `public`** key
3. Click **Reveal** to show the key
4. Copy the key (it's a long JWT token starting with `eyJ`)
5. This is your `SUPABASE_ANON_KEY`

**Note**: The `anon` key is safe to use in client-side code and MCP servers. It respects your Row Level Security (RLS) policies.

**Important**: If you have a Personal Access Token (starts with `sbp_`), that's different from the anon key. The MCP server needs the `anon` key from the API settings page, not the access token.

### Option B: Service Role Key (Optional - for server-side operations)

⚠️ **WARNING**: The service role key bypasses RLS and has full access to your database. Only use this for server-side operations.

1. Find the **`service_role` `secret`** key
2. Click **Reveal** to show the key
3. Copy the key securely
4. This is your `SUPABASE_SERVICE_ROLE_KEY`
5. **Never expose this key** in client-side code or public repositories

**Note**: The hosted Supabase MCP server doesn't require this key - it handles authentication automatically.

## Step 5: Set Environment Variables

### Windows (PowerShell)

```powershell
# Set SUPABASE_URL
[System.Environment]::SetEnvironmentVariable('SUPABASE_URL', 'https://your-project.supabase.co', 'User')

# Set SUPABASE_ANON_KEY
[System.Environment]::SetEnvironmentVariable('SUPABASE_ANON_KEY', 'your-anon-key-here', 'User')

# Set SUPABASE_SERVICE_ROLE_KEY (optional - for server-side operations only)
[System.Environment]::SetEnvironmentVariable('SUPABASE_SERVICE_ROLE_KEY', 'your-service-role-key-here', 'User')

### Windows (Command Prompt)

```cmd
setx SUPABASE_URL "https://your-project.supabase.co"
setx SUPABASE_ANON_KEY "your-anon-key-here"
```

### Verify Environment Variables

```powershell
# Check if variables are set
[System.Environment]::GetEnvironmentVariable('SUPABASE_URL', 'User')
[System.Environment]::GetEnvironmentVariable('SUPABASE_ANON_KEY', 'User')
```

## Step 6: Restart Cursor

After setting the environment variables:
1. **Close Cursor completely** (all windows)
2. **Restart Cursor** to load the new environment variables
3. Check MCP status in **Cursor Settings → MCP**

## Troubleshooting

### Keys Not Working

- **Verify the keys are correct**: Double-check you copied the entire key (they're long JWT tokens)
- **Check project status**: Ensure your Supabase project is active and not paused
- **Verify RLS policies**: If using `anon` key, make sure your Row Level Security policies allow the operations you need

### Environment Variables Not Loading

- **Restart Cursor**: Environment variables are loaded when Cursor starts
- **Check variable scope**: Make sure you set them as **User** variables, not just session variables
- **Verify in PowerShell**: Run the verify commands above to confirm they're set

### MCP Server Still Shows Errors

- **Check MCP Logs**: View → Output → "MCP Logs" dropdown
- **Verify config**: Run `npm run mcp:heal` to check configuration
- **Test connection**: Try accessing your Supabase project dashboard to ensure it's accessible

## Security Best Practices

1. **Use `anon` key for MCP**: The anonymous key is sufficient for most MCP operations and respects RLS
2. **Never commit keys**: Keep keys in environment variables, never in code or config files
3. **Rotate keys regularly**: Supabase allows you to regenerate keys if needed
4. **Use RLS policies**: Set up Row Level Security to control data access even with the `anon` key

## Next Steps

After setting up your Supabase keys (for client libraries or direct API access):
1. Restart Cursor (if using environment variables)
2. Test your Supabase client connection

**For Supabase MCP**: See `docs/troubleshooting/mcp-setup-guide.md` - no keys needed, uses browser authentication.

