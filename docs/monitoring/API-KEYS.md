# Monitoring API Keys Reference

**Last Updated**: 2025-11-20  
**Purpose**: Reference for monitoring service API keys (Issue #22)

**⚠️ SECURITY NOTE**: API keys are stored securely (not in this file). Set as environment variables or use CLI parameters.

## UptimeRobot API Keys

### Main API Key
- **Type**: Account-specific (full access)
- **Usage**: Create/update monitors, configure alerts
- **Environment Variable**: `UPTIMEROBOT_API_KEY`
- **Status**: ✅ Configured (stored securely)

### Monitor-Specific Key
- **Type**: Monitor-specific (read-only)
- **Usage**: Get monitor status for ID `801829620`
- **Environment Variable**: `UPTIMEROBOT_MONITOR_KEY`
- **Monitor ID**: `801829620`
- **Status**: ✅ Configured (stored securely)

## Usage Examples

### Get Monitor Status
```bash
# Using monitor key
npm run uptimerobot:get -- --monitor-key=$UPTIMEROBOT_MONITOR_KEY

# Or with API key
npm run uptimerobot:get -- --api-key=$UPTIMEROBOT_API_KEY
```

### Get Alert Contacts
```bash
npm run uptimerobot:contacts -- --api-key=$UPTIMEROBOT_API_KEY
```

### Configure Alerts
```bash
npm run uptimerobot:alerts -- --api-key=$UPTIMEROBOT_API_KEY --monitor-id=801829620
```

## Setting Environment Variables

**Windows (PowerShell)**:
```powershell
$env:UPTIMEROBOT_API_KEY="your-api-key"
$env:UPTIMEROBOT_MONITOR_KEY="your-monitor-key"
```

**Linux/Mac**:
```bash
export UPTIMEROBOT_API_KEY="your-api-key"
export UPTIMEROBOT_MONITOR_KEY="your-monitor-key"
```

**Note**: Keys are provided separately and should be stored in a secure password manager or environment configuration.

## Security Notes

- **DO NOT** commit API keys to git
- Store keys securely (password manager, environment variables)
- Rotate keys periodically
- Use monitor-specific keys when possible (read-only access)

## Sentry Configuration

### DSNs
Sentry DSNs are configured in production environment variables:
- **Frontend**: `VITE_SENTRY_DSN` (Vercel)
- **Backend**: `SENTRY_DSN` (Railway)

See `docs/ConnectionGuide.md` for production DSNs (not stored here for security).

### Auth Token (for CLI)
- **Purpose**: Configure alert rules via API
- **Environment Variable**: `SENTRY_AUTH_TOKEN`
- **Get Token**: https://backslashbryant.sentry.io/settings/auth-tokens/
- **Required Scopes**: `alerts:write`, `project:read`

### Organization & Project
- **Organization**: `backslashbryant`
- **Project**: `icebreaker`
- **Environment Variables**: `SENTRY_ORG`, `SENTRY_PROJECT`

## Sentry CLI Usage

### List Alert Rules
```bash
npm run sentry:alerts:list -- --auth-token=$SENTRY_AUTH_TOKEN
```

### Configure All Alert Rules
```bash
npm run sentry:alerts:configure -- --auth-token=$SENTRY_AUTH_TOKEN
```

### Manual Configuration
```bash
node tools/sentry-alerts-config.mjs --action=configure --auth-token=$SENTRY_AUTH_TOKEN --org=backslashbryant --project=icebreaker
```

---

**For questions, contact @Nexus 🚀**

