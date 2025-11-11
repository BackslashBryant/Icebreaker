# How to Get Your Supabase Project URL

You've set your Supabase API key. Now you need your **Project URL** to complete the setup.

## Quick Steps

1. **Go to Supabase Dashboard**: [https://supabase.com/dashboard](https://supabase.com/dashboard)

2. **Select Your Project** (the one that matches the key you just provided)

3. **Go to Settings → API**:
   - Click the **Settings** icon (gear) in the left sidebar
   - Click **API** in the settings menu

4. **Find Your Project URL**:
   - Look for the **Project URL** section at the top
   - It will look like: `https://xxxxxxxxxxxxx.supabase.co`
   - Copy the entire URL

5. **Set It as Environment Variable**:
   ```powershell
   [System.Environment]::SetEnvironmentVariable('SUPABASE_URL', 'https://your-actual-project-id.supabase.co', 'User')
   ```

6. **Verify It's Set**:
   ```powershell
   [System.Environment]::GetEnvironmentVariable('SUPABASE_URL', 'User')
   ```

7. **Restart Cursor** to load the new environment variable

## What It Looks Like

Your Project URL will be in this format:
```
https://abcdefghijklmnop.supabase.co
```

Where `abcdefghijklmnop` is your unique project reference ID.

## Need Help?

If you can't find it:
- Make sure you're in the correct project (the one matching your API key)
- Check the **Project Settings** → **General** tab - it might also show there
- The URL is always visible in the API settings page

Once you have the URL, share it and I'll help you set it up!

