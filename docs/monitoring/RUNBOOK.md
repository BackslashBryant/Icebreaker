# Monitoring Runbook

**Last Updated**: 2025-11-15  
**Purpose**: Incident response procedures for monitoring, observability, and error tracking

## Overview

This runbook provides step-by-step procedures for responding to incidents detected through our monitoring systems:
- **Sentry**: Error tracking and performance monitoring
- **UptimeRobot**: Uptime monitoring and health checks

## Incident Response Process

**Standard Flow**: Detect → Acknowledge → Investigate → Resolve → Document

1. **Detect**: Alert received (email, dashboard notification)
2. **Acknowledge**: Confirm incident, assess severity
3. **Investigate**: Follow procedure below based on incident type
4. **Resolve**: Fix issue, verify resolution
5. **Document**: Update incident log, note root cause and prevention

---

## Error Investigation Procedure

**Trigger**: Sentry alert for error rate > 5 errors/minute (warning) or > 10 errors/minute (critical)

### Step 1: Access Sentry Dashboard
1. Navigate to Sentry dashboard (URL documented in `docs/ConnectionGuide.md`)
2. Log in with team credentials
3. Select appropriate project (Frontend or Backend)

### Step 2: Check Error Grouping and Trends
1. Review **Issues** page for new or spiking errors
2. Check error grouping:
   - Are errors grouped correctly?
   - Is this a new error type or existing issue?
3. Review error trends:
   - When did errors start?
   - Is error rate increasing or stable?
   - Are errors isolated to specific sessions/users?

### Step 3: Review Stack Traces and Context
1. Click on error to view details:
   - **Stack trace**: Identify failing code path
   - **Context**: Check tags (sessionId, component, message.type)
   - **Breadcrumbs**: Review user actions leading to error
   - **User context**: Check session data, active chat partner
2. Identify root cause:
   - Code bug (null reference, type error)
   - External dependency failure (database, API)
   - Configuration issue (missing env var, invalid DSN)

### Step 4: Check Related Performance Metrics
1. Navigate to **Performance** tab in Sentry
2. Check if error correlates with performance degradation:
   - Slow transactions before error?
   - High latency on specific endpoints?
   - WebSocket connection issues?
3. Review related spans:
   - WebSocket message handling spans
   - Signal Engine calculation spans

### Step 5: Determine Severity and Action
- **Low**: Non-critical error, affects < 5% of users → Log for next sprint
- **Medium**: Affects functionality but has workaround → Fix in next deployment
- **High**: Affects core functionality → Hotfix deployment
- **Critical**: Service unavailable or data loss → Immediate fix + rollback if needed

### Step 6: Resolve and Verify
1. Fix root cause (code fix, config update, dependency update)
2. Deploy fix
3. Verify in Sentry:
   - Error rate decreases
   - No new errors appear
   - Performance metrics return to normal

---

## Performance Degradation Procedure

**Trigger**: Sentry alert for P95 latency > 1s (warning) or > 2s (critical)

### Step 1: Check Sentry Performance Dashboard
1. Navigate to Sentry Performance dashboard
2. Review **Transactions** view:
   - Which operations are slow?
   - P50, P95, P99 latencies
   - Throughput (requests/second)

### Step 2: Identify Slow Endpoints/Operations
1. Sort by P95 latency (descending)
2. Identify slowest operations:
   - WebSocket message handling
   - Signal Engine calculations
   - API endpoints
3. Check operation details:
   - Average duration
   - Sample rate
   - Error rate

### Step 3: Check WebSocket Connection Metrics
1. Review WebSocket spans:
   - Message handling duration
   - Connection count
   - Session count
2. Check for connection issues:
   - High connection count?
   - Connection errors in Sentry?
   - Slow message processing?

### Step 4: Review Recent Deployments
1. Check GitHub Actions deployment history
2. Identify recent changes:
   - Code changes in last 24 hours
   - Configuration changes
   - Dependency updates
3. Correlate deployment time with performance degradation start

### Step 5: Check Server Resources
1. Review server logs for resource issues:
   - High CPU usage
   - Memory leaks
   - Database connection pool exhaustion
2. Check deployment platform metrics (Vercel/Railway dashboards)

### Step 6: Resolve and Verify
1. Apply fix:
   - Optimize slow code paths
   - Add caching if appropriate
   - Scale resources if needed
   - Rollback deployment if recent change caused issue
2. Verify in Sentry:
   - P95 latency returns to normal (< 1s)
   - Throughput stable
   - No new performance regressions

---

## Service Downtime Procedure

**Trigger**: UptimeRobot alert for 3+ consecutive health check failures

### Step 1: Check UptimeRobot Status
1. Navigate to UptimeRobot dashboard
2. Review monitor status:
   - Is monitor showing "Down"?
   - When did downtime start?
   - Response time before failure?

### Step 2: Verify Health Endpoint
1. Manually test health endpoint: `GET /api/health`
   ```bash
   curl https://api.icebreaker.app/api/health
   ```
2. Check response:
   - Status code (200 = OK, 503 = Not Ready)
   - Response body: `{ status: "ok", websocket: { connected: true, ... } }`
3. If endpoint fails:
   - Check server logs
   - Verify server is running
   - Check deployment status

### Step 3: Check Server Logs
1. Access server logs (platform-specific):
   - Vercel: Dashboard → Logs
   - Railway: Dashboard → Logs
2. Look for:
   - Server startup errors
   - Crash logs
   - Out of memory errors
   - Database connection failures

### Step 4: Verify WebSocket Server Status
1. Check health endpoint response for WebSocket status:
   ```json
   {
     "status": "ok",
     "websocket": {
       "connected": true,
       "connectionCount": 5,
       "sessionCount": 3
     }
   }
   ```
2. If `websocket.connected === false`:
   - WebSocket server failed to initialize
   - Check WebSocket server logs
   - Verify WebSocket server code

### Step 5: Check Deployment Status
1. Review GitHub Actions deployment workflow
2. Check for:
   - Failed deployments
   - Deployment in progress
   - Rollback needed
3. Verify environment variables:
   - Are all required env vars set?
   - Are DSNs configured correctly?

### Step 6: Resolve and Verify
1. Apply fix:
   - Restart server if needed
   - Fix configuration issues
   - Rollback deployment if recent change caused issue
   - Scale resources if needed
2. Verify resolution:
   - Health endpoint returns 200
   - UptimeRobot monitor shows "Up"
   - WebSocket connections working
   - No errors in Sentry

---

## WebSocket Connection Issues Procedure

**Trigger**: Sentry alerts for WebSocket errors, high connection count, or connection failures

### Step 1: Check WebSocket Server Logs
1. Review server logs for WebSocket errors:
   - Connection errors
   - Message handling errors
   - Authentication failures
2. Look for patterns:
   - Specific sessionId causing issues?
   - High error rate for specific message types?
   - Connection limit exceeded errors?

### Step 2: Verify Connection Count
1. Check health endpoint: `GET /api/health`
2. Review WebSocket status:
   ```json
   {
     "websocket": {
       "connected": true,
       "connectionCount": 50,
       "sessionCount": 25
     }
   }
   ```
3. Check if connection count is abnormal:
   - Normal: 10-50 connections
   - High: > 100 connections (possible connection leak)
   - Low: < 5 connections (possible connection failures)

### Step 3: Check for Connection Errors in Sentry
1. Navigate to Sentry dashboard
2. Filter errors by:
   - Tag: `component: websocket`
   - Tag: `sessionId: <specific-session>`
3. Review error details:
   - Error type (connection error, message error)
   - Stack trace
   - Context (connectionCount, sessionId)

### Step 4: Verify Session Store Health
1. Check if session store is accessible:
   - Are sessions being created?
   - Are sessions being retrieved correctly?
   - Is session store connection healthy?
2. Review session-related errors in Sentry

### Step 5: Check Rate Limiting
1. Review rate limit errors:
   - Are too many connections per session?
   - Is connection limit (5 per session) being enforced?
2. Check for connection exhaustion:
   - Multiple connections from same session?
   - Connections not being cleaned up?

### Step 6: Resolve and Verify
1. Apply fix:
   - Fix connection handling code
   - Clean up connection leaks
   - Adjust connection limits if needed
   - Fix session store issues
2. Verify resolution:
   - Connection count returns to normal
   - No new WebSocket errors in Sentry
   - Health endpoint shows healthy WebSocket status

---

## Alert Thresholds Reference

### Sentry Alerts
- **Error Rate Warning**: > 5 errors/minute
- **Error Rate Critical**: > 10 errors/minute
- **Performance Warning**: P95 latency > 1s
- **Performance Critical**: P95 latency > 2s
- **New Error Type**: Alert on new error types (first occurrence)

### UptimeRobot Alerts
- **Downtime**: 3+ consecutive health check failures (5-minute intervals)
- **Performance**: Response time > 1s

### Response Time Targets
- **Health Endpoint**: < 100ms
- **WebSocket Message Handling**: < 500ms
- **Signal Engine Calculation**: < 200ms
- **Chat Start**: < 500ms (from vision.md)

---

## Escalation

If incident cannot be resolved using this runbook:

1. **Document**: Record what was tried, what failed, current state
2. **Escalate**: Contact team lead or on-call engineer
3. **Communicate**: Update team on incident status
4. **Post-Mortem**: Schedule post-mortem for critical incidents

---

## Quick Reference

### Dashboard URLs
- **Sentry**: See `docs/ConnectionGuide.md` for dashboard URLs
- **UptimeRobot**: See `docs/ConnectionGuide.md` for status page URL

### Health Endpoints
- **Health Check**: `GET /api/health`
- **Readiness Check**: `GET /api/health/ready`

### Key Metrics
- **Error Rate**: Should be < 5 errors/minute
- **P95 Latency**: Should be < 1s
- **Uptime**: Should be > 99.9%
- **WebSocket Connections**: Normal range 10-50

---

**For questions or updates to this runbook, contact @Nexus 🚀 or @Muse 🎨**

