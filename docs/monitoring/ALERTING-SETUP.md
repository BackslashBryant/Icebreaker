# Alerting Rules Setup Guide

**Last Updated**: 2025-01-27  
**Purpose**: Step-by-step guide for configuring alerting rules in Sentry and UptimeRobot (Issue #22 Step 4)

## Overview

This guide walks through configuring alerting rules for error rate, performance degradation, and uptime monitoring. All code work is complete; this is manual dashboard configuration.

## Prerequisites

- ✅ Sentry account active: https://backslashbryant.sentry.io
- ✅ UptimeRobot monitor active: ID `801829620`
- ✅ Email address configured for alerts

## Sentry Alert Configuration

### Option A: Via CLI/API (Recommended)

**Prerequisites**: 
1. Get Sentry auth token from https://backslashbryant.sentry.io/settings/auth-tokens/
2. Create token with scopes: `alerts:write`, `project:read`

**Using npm scripts**:
```bash
# Set auth token
export SENTRY_AUTH_TOKEN=your-auth-token
# Or Windows PowerShell:
# $env:SENTRY_AUTH_TOKEN="your-auth-token"

# List existing alert rules
npm run sentry:alerts:list

# Configure all recommended alert rules
npm run sentry:alerts:configure
```

**Using script directly**:
```bash
node tools/sentry-alerts-config.mjs --action=configure --auth-token=$SENTRY_AUTH_TOKEN --org=backslashbryant --project=icebreaker
```

The CLI will attempt to create:
- Error rate warning (>5/min)
- Error rate critical (>10/min)
- Performance warning (P95 >1s)
- Performance critical (P95 >2s)

**Note**: Sentry alert rules API requires paid tier or specific permissions. If API returns 403/404, use Option B (dashboard) instead. **Current Status**: API returns 403 - dashboard configuration required.

### Option B: Via Dashboard (Manual)

**Finding the Alerts Page**:
1. Navigate to https://backslashbryant.sentry.io
2. Log in with team credentials
3. In the top navigation bar, click **"Alerts"** (organization-level, not project-level)
4. You should see the "Alert Rules" tab with existing alert rules (if any)
5. Click **"Create Alert Rule"** button (top right)

**Note**: If you don't see "Alerts" in the top navigation:
- Make sure you're at the organization level (backslashbryant), not inside a specific project
- The Alerts page is at: https://backslashbryant.sentry.io/alerts/
- You can also access it via: Project → Settings → Alerts (project-level alerts)

**Creating Alert Rules**:

**Configure Error Rate Alerts**:
- **Alert Name**: `Error Rate Warning (>5/min)`
- **Conditions**: More than 5 events in 1 minute
- **Action**: Send email notification
- Repeat for critical: `Error Rate Critical (>10/min)` with threshold >10/min

**Configure Performance Alerts**:
- **Alert Name**: `Performance Warning (P95 >1s)`
- **Conditions**: P95 latency > 1000ms
- **Action**: Send email notification
- Repeat for critical: `Performance Critical (P95 >2s)` with threshold >2000ms

**Configure New Error Type Alert**:
- **Alert Name**: `New Error Type Detected`
- **Conditions**: A new issue is created
- **Action**: Send email notification

### Test Sentry Alerts

1. Trigger a test error in production (or development with `SENTRY_ENABLE_DEV=true`)
2. Verify alert email received
3. Check alert appears in Sentry dashboard
4. Document test results in `docs/monitoring/ALERTS.md`

## UptimeRobot Alert Configuration

### Option A: Via CLI (Recommended)

**Prerequisites**: Alert contact must be created in dashboard first (see Option B Step 1)

Once alert contact exists, configure alerts programmatically:

```bash
# Set API key
export UPTIMEROBOT_API_KEY=u3186125-69bc39536172fbc98b4195db

# Configure alerts (uses monitor ID 801829620)
npm run uptimerobot:alerts -- --api-key=$UPTIMEROBOT_API_KEY --monitor-id=801829620

# Or using environment variable
UPTIMEROBOT_API_KEY=u3186125-69bc39536172fbc98b4195db npm run uptimerobot:alerts
```

The CLI will:
- Fetch alert contacts
- Configure monitor to alert after 3 consecutive failures
- Configure monitor to alert on recovery

### Option B: Via Dashboard (Manual)

**Step 1: Create Alert Contact** (Required first)

1. Navigate to https://uptimerobot.com/
2. Log in with account credentials
3. Go to **"My Settings"** → **"Alert Contacts"**
4. Click **"Add Alert Contact"**
5. Select **"Email"**
6. Enter email address
7. Click **"Create Alert Contact"**
8. Note the alert contact ID (you'll need this for CLI)

**Step 2: Configure Monitor Alerts**

1. Find monitor: **"airy-fascination-production.up.railway.app/api/health"** (ID: 801829620)
2. Click on monitor → **"Edit"**
3. Go to **"Alert Settings"**
4. Configure:
   - **Alert When Down**: After 3 consecutive failures (15 minutes)
   - **Alert Contacts**: Select email address
   - **Alert When Up**: After monitor recovers
5. Click **"Save"**

**Step 3: Configure Performance Alert** (Optional)

1. In monitor settings → **"Alert Settings"**
2. Enable **"Response Time Alert"**
3. Set threshold: **> 1000ms** (1 second)
4. Select alert contact (email)
5. Click **"Save"**

### Test UptimeRobot Alerts

**Via CLI**:
```bash
# Check monitor status
npm run uptimerobot:get -- --monitor-key=m801829620-3594eb47c661420e347dae32

# Check alert contacts
npm run uptimerobot:contacts -- --api-key=$UPTIMEROBOT_API_KEY
```

**Manual Test**:
1. Temporarily pause monitor in dashboard (or wait for actual downtime)
2. Wait for 3 consecutive failures (15 minutes)
3. Verify alert email received
4. Resume monitor and verify "Up" notification received
5. Document test results in `docs/monitoring/ALERTS.md`

## Verification Checklist

After configuring all alerts:

- [ ] Sentry error rate alerts configured (warning + critical)
- [ ] Sentry performance alerts configured (warning + critical)
- [ ] Sentry new error type alert configured
- [ ] UptimeRobot downtime alert configured
- [ ] UptimeRobot performance alert configured
- [ ] All alerts tested (email delivery verified)
- [ ] `docs/monitoring/ALERTS.md` updated with configuration status
- [ ] Alert thresholds documented

## Alert Thresholds Summary

| Alert Type | Threshold | Severity | Action |
|------------|-----------|----------|--------|
| Error Rate | > 5/min | Warning | Review trends |
| Error Rate | > 10/min | Critical | Immediate investigation |
| Performance | P95 > 1s | Warning | Review dashboard |
| Performance | P95 > 2s | Critical | Immediate investigation |
| New Error | First occurrence | Warning | Review details |
| Downtime | 3+ failures | Critical | Check health endpoint |
| Response Time | > 1s | Warning | Check server performance |

## Troubleshooting

### Alerts Not Triggering
- Verify thresholds are correct
- Check alert conditions match expected behavior
- Verify email address in alert contacts
- Check spam folder for alert emails

### Too Many Alerts
- Review thresholds and adjust if needed
- Check for false positives
- Consider increasing thresholds slightly

### Missing Alerts
- Verify alert rules are enabled
- Check alert contacts configured correctly
- Verify email delivery (check spam folder)

---

**For questions or issues, contact @Nexus 🚀**

**Next**: After alerts are configured, proceed to end-to-end verification and mark Issue #22 complete.

