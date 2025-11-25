# UptimeRobot Setup Guide

**Last Updated**: 2025-11-20  
**Purpose**: Step-by-step guide for setting up UptimeRobot monitoring for Issue #22

## Overview

UptimeRobot provides free-tier uptime monitoring for our production health endpoint. This guide walks through account creation, monitor configuration, and alert setup.

## Prerequisites

- Production backend deployed and accessible
- Health endpoint verified: `https://airy-fascination-production.up.railway.app/api/health`
- Email address for alert notifications

## Step 1: Create UptimeRobot Account

1. Navigate to https://uptimerobot.com/
2. Click **"Sign Up"** (free tier)
3. Fill in account details:
   - Email address (for alerts)
   - Password
   - Username
4. Verify email if required
5. Log in to UptimeRobot dashboard

### Get API Key (for CLI configuration)

1. Go to **"My Settings"** → **"API Settings"**
2. Click **"Add API Key"**
3. Copy the API key (format: `u1234567-abc123def456...`)
4. Save securely (you'll need this for CLI configuration)

## Step 2: Create Monitor

### Option A: Via Dashboard (Manual)

1. In UptimeRobot dashboard, click **"+ Add New Monitor"**
2. Select monitor type: **"HTTP(s)"**
3. Configure monitor settings:
   - **Friendly Name**: `Icebreaker Backend Health`
   - **URL**: `https://airy-fascination-production.up.railway.app/api/health`
   - **Monitor Type**: HTTP(s)
   - **Monitoring Interval**: 5 minutes (free tier)
   - **Alert Contacts**: Select your email address
4. Click **"Create Monitor"**
5. Copy the monitor key (format: `m1234567-abc123...`) for CLI operations

### Option B: Via CLI (Automated)

Use the provided script to create monitor programmatically:

```bash
# Set API key as environment variable
export UPTIMEROBOT_API_KEY=u1234567-abc123def456...

# Create monitor
node tools/uptimerobot-config.mjs --action=create --api-key=$UPTIMEROBOT_API_KEY

# Or use environment variable
UPTIMEROBOT_API_KEY=u1234567-abc123def456... node tools/uptimerobot-config.mjs --action=create
```

The script will:
- Create monitor with correct settings
- Display monitor ID and key
- Save monitor key for future reference

**Monitor Key**: If you already have a monitor key (e.g., `m801829620-3594eb47c661420e347dae32`), you can verify it:

```bash
# Using npm script
npm run uptimerobot:get -- --monitor-key=m801829620-3594eb47c661420e347dae32

# Or directly
node tools/uptimerobot-config.mjs --action=get --monitor-key=m801829620-3594eb47c661420e347dae32
```

**✅ Monitor Configured**: Monitor ID `801829620` is already configured and monitoring:
- **URL**: `https://airy-fascination-production.up.railway.app/api/health`
- **Interval**: 300 seconds (5 minutes)
- **Status**: Check current status with the command above

**API Keys** (configured - stored securely):
- **Main API Key**: Available (for create/update operations)
- **Monitor Key**: Available (for read-only operations)
- **See**: `docs/monitoring/API-KEYS.md` for usage instructions

**CLI Commands Available**:
```bash
# Get monitor status (using monitor key)
npm run uptimerobot:get -- --monitor-key=$UPTIMEROBOT_MONITOR_KEY

# Get alert contacts (using main API key)
npm run uptimerobot:contacts -- --api-key=$UPTIMEROBOT_API_KEY

# Configure alerts (after alert contact created)
npm run uptimerobot:alerts -- --api-key=$UPTIMEROBOT_API_KEY --monitor-id=801829620
```

## Step 3: Configure Alert Settings

1. Go to **"My Settings"** → **"Alert Contacts"**
2. Verify email alert contact is configured
3. Go to monitor settings → **"Alert Settings"**
4. Configure alerts:
   - **Alert When Down**: After 3 consecutive failures (15 minutes downtime)
   - **Alert When Up**: After monitor recovers
   - **Response Time Alert**: Alert if response time > 1 second

## Step 4: Create Status Page (Optional but Recommended)

1. Go to **"My Settings"** → **"Status Pages"**
2. Click **"Add Status Page"**
3. Configure status page:
   - **Page Title**: `Icebreaker Status`
   - **Page URL**: Choose a custom URL (e.g., `icebreaker-status`)
   - **Monitors**: Select "Icebreaker Backend Health"
   - **Theme**: Choose preferred theme
4. Click **"Create Status Page"**
5. Copy the status page URL (e.g., `https://status.uptimerobot.com/icebreaker-status`)

## Step 5: Verify Monitor is Working

1. Wait 5-10 minutes for first check
2. Verify monitor shows **"Up"** status
3. Check response time is reasonable (< 500ms)
4. Test alert by temporarily stopping backend (or wait for actual downtime)
5. Verify email alert received when monitor detects downtime

## Step 6: Document Status Page URL

1. Update `docs/monitoring/DASHBOARDS.md`:
   - Add UptimeRobot status page URL to dashboard table
   - Update status from "PENDING" to "ACTIVE"
2. Update `docs/ConnectionGuide.md`:
   - Add UptimeRobot status page URL to monitoring section
3. Update `Docs/plans/Issue-22-plan-status-IN-PROGRESS.md`:
   - Mark Step 3 as complete
   - Document status page URL

## Expected Health Endpoint Response

The health endpoint should return:
```json
{
  "status": "ok",
  "websocket": {
    "connected": true,
    "connectionCount": 0,
    "sessionCount": 0
  }
}
```

**Status Codes**:
- `200`: Service is healthy
- `503`: Service is not ready (WebSocket server down)

## Troubleshooting

### Monitor Shows "Down" Immediately
- Verify health endpoint URL is correct
- Check backend is deployed and accessible
- Test endpoint manually: `curl https://airy-fascination-production.up.railway.app/api/health`
- Check Railway logs for errors

### No Alerts Received
- Verify email address in alert contacts
- Check spam folder
- Verify alert settings configured correctly
- Test alert by manually pausing monitor

### Status Page Not Updating
- Verify monitor is assigned to status page
- Check status page settings
- Wait 5-10 minutes for updates (monitoring interval)

## Free Tier Limitations

- **50 monitors** maximum
- **5-minute** monitoring intervals (minimum)
- **Email alerts** only (no Slack/SMS on free tier)
- **Status pages** available (public)

## Next Steps

After UptimeRobot setup is complete:
1. ✅ Monitor configured and active
2. → Proceed to Step 4: Configure alerting rules in Sentry
3. → Update `docs/monitoring/ALERTS.md` with UptimeRobot alert configuration
4. → Test end-to-end monitoring system

---

**For questions or issues, contact @Nexus 🚀**

