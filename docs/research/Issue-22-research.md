# Research: Monitoring, Observability & Error Tracking (Issue #22)

**Research Date**: 2025-11-11  
**Researcher**: Scout 🔎  
**Issue**: #22 - Monitoring, Observability & Error Tracking  
**Status**: ✅ Complete

## Research Question

What monitoring, observability, and error tracking tools and practices are needed for production readiness, including error tracking, performance monitoring, uptime monitoring, alerting, and incident response procedures?

## Constraints

- **Stack**: React frontend, Express backend, WebSocket, Playwright E2E tests
- **MVP Constraints**: Free tier tools only, minimal setup overhead
- **Existing Infrastructure**: 
  - Sentry partially implemented (frontend + backend initialization code exists)
  - Health endpoint exists (`GET /api/health`)
  - No performance monitoring verification
  - No uptime monitoring
  - No alerting rules
  - No monitoring dashboards documented
  - No incident response runbook
- **Scope**: Complete monitoring setup for production launch readiness

## Sources & Findings

### 1. Error Tracking (Sentry)

**Source**: Issue #6 research (`docs/research/Issue-6-research.md`), Sentry documentation

**Findings**:
- **Current State**: Sentry initialization code exists in:
  - Frontend: `frontend/src/lib/sentry.ts` (uses `@sentry/react`)
  - Backend: `backend/src/middleware/error-handler.js` (lazy-loads `@sentry/node`)
- **Gap**: `@sentry/node` package not installed in backend, DSNs not configured
- **Free Tier**: 5,000 events/month, unlimited projects, error grouping, stack traces
- **Setup Required**: 
  - Create Sentry account (free tier)
  - Create frontend project (React platform)
  - Create backend project (Node.js platform)
  - Configure DSNs in `.env` (`VITE_SENTRY_DSN`, `SENTRY_DSN`)
  - Verify error capture (intentional error tests)

**Recommendation**: Complete Sentry setup, verify error capture works for both frontend and backend.

### 2. Performance Monitoring

**Source**: Sentry Performance Monitoring documentation

**Findings**:
- **Sentry Performance Monitoring**: Included in free tier, tracks transaction performance
- **WebSocket Monitoring**: Need to add performance spans for WebSocket operations
- **Signal Engine Monitoring**: Need to add performance spans for calculation operations
- **Sampling Rate**: 10% in production (configurable), 100% in development
- **Metrics**: P50, P95, P99 latencies, throughput, error rate

**Recommendation**: Add Sentry performance spans to WebSocket handlers and Signal Engine, verify traces visible in dashboard.

### 3. Uptime Monitoring

**Source**: UptimeRobot documentation, DevOps best practices

**Findings**:
- **UptimeRobot Free Tier**: 50 monitors, 5-minute intervals, email alerts
- **Health Endpoint**: Existing `GET /api/health` can be used for monitoring
- **Enhancement Needed**: Add WebSocket status check to health endpoint
- **Readiness Endpoint**: Create `GET /api/health/ready` for deployment checks
- **Alert Configuration**: 3+ consecutive failures = downtime alert

**Recommendation**: Set up UptimeRobot monitoring on health endpoint, configure alerts for downtime.

### 4. Alerting Rules

**Source**: Sentry alerting documentation, UptimeRobot alerting

**Findings**:
- **Sentry Alerts**: Error rate thresholds, performance degradation, new error types
- **UptimeRobot Alerts**: Downtime detection, response time thresholds
- **Alert Channels**: Email (free tier), Slack/PagerDuty (paid tiers)
- **Thresholds**:
  - Error rate > 10 errors/minute (critical)
  - Error rate > 5 errors/minute (warning)
  - Performance P95 > 1s (warning)
  - Performance P95 > 2s (critical)

**Recommendation**: Configure alerting rules in Sentry and UptimeRobot, document in `docs/monitoring/ALERTS.md`.

### 5. Monitoring Dashboards

**Source**: Sentry dashboard documentation

**Findings**:
- **Sentry Dashboards**: Built-in performance dashboard, error dashboard
- **Custom Dashboards**: Can create custom dashboards for specific metrics
- **Access**: Dashboard URLs need to be documented for team access
- **UptimeRobot Status Page**: Public status page URL for uptime visibility

**Recommendation**: Create performance dashboard in Sentry, document dashboard access in `docs/monitoring/DASHBOARDS.md`.

### 6. Incident Response Runbook

**Source**: DevOps best practices, incident response procedures

**Findings**:
- **Runbook Structure**: Error investigation, performance degradation, service downtime, WebSocket issues
- **Procedures Needed**:
  - Error investigation (Sentry dashboard, stack traces, context)
  - Performance degradation (Sentry Performance dashboard, slow endpoints)
  - Service downtime (UptimeRobot status, health endpoint, server logs)
  - WebSocket connection issues (server logs, connection count, errors)
- **Incident Response Process**: Detect → Acknowledge → Investigate → Resolve → Document

**Recommendation**: Create comprehensive runbook in `docs/monitoring/RUNBOOK.md` with all procedures.

## Recommendations Summary

### Priority 1: Critical for Production Launch
1. ✅ **Complete Sentry Setup**: Install `@sentry/node`, create projects, configure DSNs, verify error capture
2. ✅ **WebSocket Error Tracking**: Add Sentry error tracking to WebSocket error handler
3. ✅ **Performance Spans**: Add Sentry performance spans for WebSocket and Signal Engine operations
4. ✅ **Uptime Monitoring**: Set up UptimeRobot monitoring on health endpoint
5. ✅ **Alerting Rules**: Configure error rate and performance alerts in Sentry and UptimeRobot

### Priority 2: Important for Operations
1. ✅ **Performance Dashboard**: Create and document Sentry performance dashboard
2. ✅ **Monitoring Runbook**: Create incident response runbook with all procedures
3. ✅ **Documentation**: Document dashboard access, alert rules, health endpoints

## Rollback Options

1. **If Sentry setup fails**: Fall back to console logging + structured logs, add Sentry post-launch
2. **If UptimeRobot fails**: Use GitHub Actions scheduled workflow to ping health endpoint, manual monitoring as last resort
3. **If alerting fails**: Fall back to email-only alerts, manual dashboard checks as interim solution
4. **If dashboards unavailable**: Use Sentry Issues page + manual log analysis, add Grafana post-MVP if needed

## Next Steps

1. **@Nexus 🚀**: Complete Sentry setup (create account, projects, configure DSNs)
2. **@Forge 🔗**: Add WebSocket error tracking and performance spans
3. **@Nexus 🚀**: Set up UptimeRobot monitoring
4. **@Nexus 🚀**: Configure alerting rules
5. **@Nexus 🚀 + @Pixel 🖥️**: Verify performance monitoring and create dashboards
6. **@Muse 🎨 + @Nexus 🚀**: Create monitoring runbook

## References

- Sentry Error Tracking: https://sentry.io/
- Sentry Performance Monitoring: https://docs.sentry.io/product/performance/
- UptimeRobot: https://uptimerobot.com/
- Issue #6 Research: `docs/research/Issue-6-research.md` (monitoring section)
- Existing Sentry Code: `frontend/src/lib/sentry.ts`, `backend/src/middleware/error-handler.js`
- Health Endpoint: `backend/src/routes/health.js`

---

**Research Status**: ✅ Complete  
**Next Step**: Vector 🎯 to create plan with 6 checkpoints

