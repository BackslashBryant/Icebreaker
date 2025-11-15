# Issue #22 - Monitoring, Observability & Error Tracking

**Status**: IN-PROGRESS  
**Branch**: `agent/nexus/22-monitoring`  
**GitHub Issue**: #22  
**Created**: 2025-11-11  
**Last Updated**: 2025-11-15

## Research Summary

**Research Question**: What monitoring, observability, and error tracking tools and practices are needed for production readiness, including error tracking, performance monitoring, uptime monitoring, alerting, and incident response procedures?

**Constraints**:
- Free tier tools only, minimal setup overhead
- Sentry partially implemented (frontend + backend initialization code exists)
- Health endpoint exists but needs enhancement
- No performance monitoring verification, uptime monitoring, alerting rules, dashboards, or runbook

**Sources & Findings**:
- **Error Tracking**: Sentry free tier (5,000 events/month) - initialization code exists, need to install `@sentry/node`, create projects, configure DSNs
- **Performance Monitoring**: Sentry Performance Monitoring included in free tier - need to add spans for WebSocket and Signal Engine operations
- **Uptime Monitoring**: UptimeRobot free tier (50 monitors, 5-minute intervals) - use existing health endpoint, enhance with WebSocket status
- **Alerting**: Sentry and UptimeRobot alerting - configure error rate, performance degradation, uptime alerts
- **Dashboards**: Sentry built-in dashboards - create performance dashboard, document access
- **Runbook**: Incident response procedures - error investigation, performance degradation, service downtime, WebSocket issues

**Recommendations Summary**:
1. Complete Sentry setup (install package, create projects, configure DSNs, verify error capture)
2. Add WebSocket error tracking and performance spans
3. Enhance health endpoint, set up UptimeRobot monitoring
4. Configure alerting rules in Sentry and UptimeRobot
5. Create performance dashboard and document access
6. Create comprehensive monitoring runbook

**Rollback Options**:
- If Sentry setup fails: Fall back to console logging + structured logs
- If UptimeRobot fails: Use GitHub Actions scheduled workflow to ping health endpoint
- If alerting fails: Fall back to email-only, manual dashboard checks
- If dashboards unavailable: Use Sentry Issues page + manual log analysis

## Goals

- **GitHub Issue**: #22
- **Target**: Complete monitoring, observability, and error tracking setup for production readiness
- **Problem**: Sentry partially implemented but setup unclear. No performance monitoring verification, uptime monitoring, alerting rules, dashboards, or runbooks configured.
- **Desired Outcome**: 
  - Sentry error tracking operational (frontend + backend)
  - Performance monitoring verified and enhanced (WebSocket, Signal Engine spans)
  - Uptime monitoring active (UptimeRobot free tier)
  - Alerting rules configured (error rate, performance degradation)
  - Monitoring dashboards accessible and documented
  - Monitoring runbook created for incident response
- **Success Metrics**:
  - Sentry captures errors from frontend and backend
  - Performance metrics visible in Sentry dashboard
  - Uptime monitoring alerts on downtime
  - Alert response time < 5 minutes
  - Zero false-positive alerts
  - Team can respond to incidents using runbook

## Out-of-scope

- Prometheus + Grafana setup (post-MVP enhancement)
- Advanced business metrics (chat starts, radar updates) - basic metrics only
- Slack/PagerDuty alerting (email alerts only for MVP)
- Custom Grafana dashboards (use Sentry dashboards)
- Load/stress testing monitoring (deferred to post-launch)

## Steps

### Step 1: Complete Sentry Setup & Verification
**Owner**: @Nexus 🚀 + @Forge 🔗  
**Status**: IN-PROGRESS (code complete, manual steps pending)

**Intent**: Install missing Sentry package, create Sentry project, configure DSNs, and verify error capture

**File Targets**:
- `backend/package.json` (update - add `@sentry/node` dependency)
- `.env.example` (verify - Sentry DSN variables documented)
- `backend/src/middleware/error-handler.js` (verify - Sentry initialization correct)
- `frontend/src/lib/sentry.ts` (verify - Sentry initialization correct)
- `docs/ConnectionGuide.md` (update - document Sentry dashboard access)

**Acceptance Tests**:
- [x] `@sentry/node` installed in backend (`npm install @sentry/node`)
- [x] Sentry initialization code verified (frontend + backend)
- [x] Environment variables documented in `.env.example`
- [x] Connection Guide updated with Sentry dashboard access information
- [ ] Sentry project created (free tier) for frontend
- [ ] Sentry project created (free tier) for backend
- [ ] Frontend DSN configured in `.env` (`VITE_SENTRY_DSN`)
- [ ] Backend DSN configured in `.env` (`SENTRY_DSN`)
- [ ] Intentional error test: Frontend error appears in Sentry dashboard
- [ ] Intentional error test: Backend error appears in Sentry dashboard
- [ ] Error capture verified (test errors visible in Sentry)

**Done Criteria**:
- Sentry packages installed (frontend + backend)
- Sentry projects created and DSNs configured
- Error capture verified (test errors appear in Sentry)
- Dashboard access documented

**Rollback**: If Sentry setup fails, fall back to console logging + structured logs. Can add Sentry post-launch.

---

### Step 2: WebSocket Error Tracking & Performance Spans
**Owner**: @Forge 🔗  
**Status**: PENDING

**Intent**: Add Sentry error tracking to WebSocket error handler and create performance spans for WebSocket operations

**File Targets**:
- `backend/src/websocket/server.js` (update - add Sentry error tracking)
- `backend/src/websocket/handlers.js` (update - add Sentry spans for message handling)
- `backend/src/services/SignalEngine.js` (update - add Sentry spans for calculations)

**Acceptance Tests**:
- [ ] WebSocket errors captured in Sentry (`ws.on("error")` handler)
- [ ] Custom tags added: `sessionId`, `connectionCount`
- [ ] Performance span created for WebSocket message handling
- [ ] Performance span created for Signal Engine calculations
- [ ] WebSocket error test: Error appears in Sentry with correct tags
- [ ] Performance spans visible in Sentry Performance dashboard

**Done Criteria**:
- WebSocket errors tracked in Sentry
- Performance spans created for WebSocket and Signal Engine operations
- Custom tags added for context
- Performance data visible in Sentry dashboard

**Rollback**: If Sentry integration proves complex, start with basic error logging. Add spans incrementally.

---

### Step 3: Enhanced Health Endpoint & Uptime Monitoring
**Owner**: @Forge 🔗 + @Nexus 🚀  
**Status**: PENDING

**Intent**: Enhance health endpoint to check WebSocket status, add readiness endpoint, and set up UptimeRobot monitoring

**File Targets**:
- `backend/src/routes/health.js` (update - enhance health endpoint)
- `backend/src/websocket/server.js` (update - expose WebSocket status)
- `.env.example` (verify - no new variables needed)
- `docs/ConnectionGuide.md` (update - document health endpoints)

**Acceptance Tests**:
- [ ] Health endpoint returns: `{ status: "ok", websocket: "connected", sessions: <count> }`
- [ ] Health endpoint checks WebSocket server status (`wss.clients.size`)
- [ ] Readiness endpoint created: `GET /api/health/ready`
- [ ] Readiness endpoint returns: `{ status: "ready", websocket: "connected" }`
- [ ] UptimeRobot account created (free tier)
- [ ] UptimeRobot monitor configured: `GET /api/health` (5-minute intervals)
- [ ] UptimeRobot alert configured: 3+ consecutive failures = downtime alert
- [ ] Health endpoints documented in `docs/ConnectionGuide.md`
- [ ] UptimeRobot status page URL documented

**Done Criteria**:
- Health endpoint enhanced with WebSocket status
- Readiness endpoint created for deployment checks
- UptimeRobot monitoring active (health checks every 5 minutes)
- Uptime alerts configured (3+ consecutive failures)
- Documentation updated

**Rollback**: If UptimeRobot fails, use GitHub Actions scheduled workflow to ping health endpoint. Manual monitoring as last resort.

---

### Step 4: Alerting Rules Configuration
**Owner**: @Nexus 🚀  
**Status**: PENDING

**Intent**: Configure alerting rules in Sentry and UptimeRobot for error rate, performance degradation, and uptime

**File Targets**:
- Sentry dashboard (configure alert rules)
- UptimeRobot dashboard (configure alert settings)
- `docs/monitoring/ALERTS.md` (create - alert rules documentation)

**Acceptance Tests**:
- [ ] Sentry alert rule: Error rate > 10 errors/minute (critical)
- [ ] Sentry alert rule: Error rate > 5 errors/minute (warning)
- [ ] Sentry alert rule: Performance degradation P95 > 1s (warning)
- [ ] Sentry alert rule: Performance degradation P95 > 2s (critical)
- [ ] Sentry alert rule: New error type detected (alert on new issues)
- [ ] UptimeRobot alert: Health check fails 3+ times consecutively (downtime)
- [ ] UptimeRobot alert: Response time > 1s (performance alert)
- [ ] Alert channels configured: Email (default)
- [ ] Alert rules documented in `docs/monitoring/ALERTS.md`
- [ ] Test alert sent (verify email delivery)

**Done Criteria**:
- Sentry alert rules configured (error rate, performance degradation)
- UptimeRobot alerts configured (downtime, performance)
- Email alerts working (test alert received)
- Alert rules documented

**Rollback**: If alerting fails, fall back to email-only. Manual dashboard checks as interim solution.

---

### Step 5: Performance Monitoring Verification & Dashboard Setup
**Owner**: @Nexus 🚀 + @Pixel 🖥️  
**Status**: PENDING

**Intent**: Verify Sentry Performance Monitoring is working, create performance dashboard, and document access

**File Targets**:
- Sentry dashboard (create performance dashboard)
- `docs/ConnectionGuide.md` (update - document Sentry Performance dashboard)
- `docs/monitoring/DASHBOARDS.md` (create - dashboard access guide)

**Acceptance Tests**:
- [ ] Sentry Performance Monitoring verified (traces visible in dashboard)
- [ ] Performance dashboard created in Sentry (latency, throughput)
- [ ] WebSocket performance spans visible in dashboard
- [ ] Signal Engine performance spans visible in dashboard
- [ ] P50, P95, P99 latencies tracked for critical paths
- [ ] Performance dashboard access documented
- [ ] UptimeRobot status page URL documented
- [ ] Dashboard access guide created (`docs/monitoring/DASHBOARDS.md`)

**Done Criteria**:
- Sentry Performance Monitoring verified and working
- Performance dashboard created and accessible
- Dashboard access documented
- Team can access monitoring dashboards

**Rollback**: If dashboards unavailable, use Sentry Issues page + manual log analysis. Add Grafana post-MVP if needed.

---

### Step 6: Monitoring Runbook Creation
**Owner**: @Muse 🎨 + @Nexus 🚀  
**Status**: PENDING

**Intent**: Create comprehensive monitoring runbook for incident response

**File Targets**:
- `docs/monitoring/RUNBOOK.md` (create - incident response runbook)
- `docs/ConnectionGuide.md` (verify - monitoring details complete)

**Acceptance Tests**:
- [ ] Runbook created: `docs/monitoring/RUNBOOK.md`
- [ ] Error investigation procedure documented
- [ ] Performance degradation procedure documented
- [ ] Service downtime procedure documented
- [ ] WebSocket connection issues procedure documented
- [ ] Incident response process documented (Detect → Acknowledge → Investigate → Resolve → Document)
- [ ] Connection Guide updated with all monitoring details

**Done Criteria**:
- Monitoring runbook complete with all procedures
- Incident response process documented
- Team can follow runbook to respond to incidents
- Documentation complete and accurate

**Rollback**: If runbooks prove insufficient, document common issues in GitHub issues. Build runbook incrementally based on real incidents.

---

## Current Status

**Overall Status**: IN-PROGRESS - Step 1 (code complete, manual steps pending)

**Last Updated**: 2025-11-15  
**Completed By**: Nexus 🚀 (Step 1 code), Forge 🔗 (code verification)

**Step Completion**:
- ✅ Step 1: Code complete (package installed, initialization verified, docs updated)
- ⏸️ Step 1: Manual steps pending (Sentry account creation, DSN configuration, error capture verification)
- ⏸️ Step 2: PENDING
- ⏸️ Step 3: PENDING
- ⏸️ Step 4: PENDING
- ⏸️ Step 5: PENDING
- ⏸️ Step 6: PENDING

## Current Issues

**Manual Steps Required for Step 1**:
1. Create Sentry account (free tier): https://sentry.io/signup/
2. Create frontend project (React platform): "Icebreaker Frontend"
3. Create backend project (Node.js platform): "Icebreaker Backend"
4. Configure DSNs in `.env`: `SENTRY_DSN` and `VITE_SENTRY_DSN`
5. Test error capture: Trigger intentional errors, verify in Sentry dashboard

**Blockers**: None - manual steps can proceed in parallel with code work

## Next Steps

1. Complete Step 1 manual steps (Sentry account creation, DSN configuration)
2. Verify error capture works (frontend + backend)
3. Proceed to Step 2: WebSocket Error Tracking & Performance Spans

---

**Team Review**: ✅ **APPROVED** - Approval file: `.notes/features/monitoring-observability-error-tracking/team-review-approved.md`  
**Research**: ✅ **COMPLETE** - Research file: `docs/research/Issue-22-research.md`

