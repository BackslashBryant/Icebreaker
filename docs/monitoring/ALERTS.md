# Alerting Rules Configuration

**Last Updated**: 2025-11-15  
**Purpose**: Document alerting rules configured in Sentry and UptimeRobot

## Sentry Alert Rules

### Error Rate Alerts

**Warning Alert**: Error rate > 5 errors/minute
- **Trigger**: More than 5 errors per minute across all projects
- **Severity**: Warning
- **Action**: Review error trends, check for new error types
- **Channel**: Email

**Critical Alert**: Error rate > 10 errors/minute
- **Trigger**: More than 10 errors per minute across all projects
- **Severity**: Critical
- **Action**: Immediate investigation required, check for service degradation
- **Channel**: Email

### Performance Degradation Alerts

**Warning Alert**: P95 latency > 1s
- **Trigger**: 95th percentile latency exceeds 1 second
- **Severity**: Warning
- **Action**: Review performance dashboard, identify slow operations
- **Channel**: Email
- **Scope**: All transactions (WebSocket, Signal Engine, API endpoints)

**Critical Alert**: P95 latency > 2s
- **Trigger**: 95th percentile latency exceeds 2 seconds
- **Severity**: Critical
- **Action**: Immediate investigation, check for resource constraints or code issues
- **Channel**: Email
- **Scope**: All transactions

### New Error Type Alert

**Alert**: New error type detected
- **Trigger**: First occurrence of a new error type
- **Severity**: Warning
- **Action**: Review error details, determine if it's a regression or new issue
- **Channel**: Email
- **Note**: Helps catch regressions early

## UptimeRobot Alert Rules

### Downtime Alert

**Alert**: Health check fails 3+ times consecutively
- **Trigger**: 3 consecutive failed health checks (5-minute intervals = 15 minutes downtime)
- **Severity**: Critical
- **Action**: 
  1. Check UptimeRobot status page
  2. Verify health endpoint manually: `GET /api/health`
  3. Check server logs
  4. Verify WebSocket server status
  5. Check deployment status
- **Channel**: Email
- **Response Time Target**: < 5 minutes

### Performance Alert

**Alert**: Response time > 1s
- **Trigger**: Health endpoint response time exceeds 1 second
- **Severity**: Warning
- **Action**: Review server performance, check for resource constraints
- **Channel**: Email
- **Note**: Indicates server slowness even if endpoint is responding

## Alert Configuration Status

### Sentry Alerts
- [ ] Error rate > 5 errors/minute (warning) - **PENDING** (requires Sentry account)
- [ ] Error rate > 10 errors/minute (critical) - **PENDING** (requires Sentry account)
- [ ] P95 latency > 1s (warning) - **PENDING** (requires Sentry account)
- [ ] P95 latency > 2s (critical) - **PENDING** (requires Sentry account)
- [ ] New error type detected - **PENDING** (requires Sentry account)

### UptimeRobot Alerts
- [x] Health check fails 3+ times consecutively (downtime) - ✅ **CONFIGURED** (2025-11-19)
  - Monitor ID: 801829620
  - Alert Contact: backslashbryant@gmail.com (ID: 7923063)
  - Configured via CLI: `npm run uptimerobot:alerts`
  - Alert after 3 consecutive failures (15 minutes downtime)
  - Alert on recovery
- [ ] Response time > 1s (performance) - **PENDING** (can be configured in dashboard)

## Alert Channels

**Current Configuration**: Email only (free tier)

**Future Enhancement** (Post-MVP):
- Slack integration for team notifications
- PagerDuty for on-call escalation
- SMS for critical alerts

## Alert Testing

Once alerts are configured:

1. **Test Sentry Alerts**:
   - Trigger intentional error in development
   - Verify alert email received
   - Check alert appears in Sentry dashboard

2. **Test UptimeRobot Alerts**:
   - Temporarily stop server
   - Wait for 3 consecutive failures (15 minutes)
   - Verify alert email received
   - Restart server and verify "Up" notification

## Alert Response Procedures

See `docs/monitoring/RUNBOOK.md` for detailed incident response procedures:
- Error investigation (Sentry alerts)
- Performance degradation (Sentry alerts)
- Service downtime (UptimeRobot alerts)

## Configuration Notes

- **Alert Frequency**: Alerts are rate-limited to prevent spam (max 1 alert per 5 minutes per rule)
- **Alert Aggregation**: Similar alerts are grouped to reduce noise
- **False Positive Prevention**: Thresholds set conservatively to minimize false positives
- **Alert Fatigue**: If alerts become too frequent, review thresholds and adjust

---

**Next Steps**: Configure alerts in Sentry and UptimeRobot dashboards once accounts are created. See `Docs/plans/Issue-22-plan-status-IN-PROGRESS.md` Step 4 for detailed configuration steps.

