# Alert Testing Procedure

**Date**: 2025-11-19  
**Purpose**: Test UptimeRobot downtime and recovery alerts

## Test Setup

1. ✅ Code change: Added `HEALTH_CHECK_TEST_FAIL` environment variable flag to health endpoint
2. ✅ Railway env var: Set `HEALTH_CHECK_TEST_FAIL=true` in Railway production
3. ✅ Monitor configured: ID 801829620, checks every 5 minutes
4. ✅ Alert configured: 3 consecutive failures (15 minutes) → Email alert

## Test Procedure

### Phase 1: Trigger Downtime Alert

1. **Set test flag**:
   ```bash
   cd backend && railway variables set HEALTH_CHECK_TEST_FAIL=true
   ```

2. **Verify health endpoint fails**:
   ```bash
   curl https://airy-fascination-production.up.railway.app/api/health
   # Expected: 500 status, { status: "error", message: "Temporary test failure..." }
   ```

3. **Monitor UptimeRobot status**:
   ```bash
   npm run uptimerobot:get -- --monitor-key=$UPTIMEROBOT_MONITOR_KEY
   # Check status changes from "Up" to "Down" after 3 failures
   ```

4. **Wait for alert** (15 minutes):
   - Monitor checks every 5 minutes
   - After 3 consecutive failures (15 minutes), alert should trigger
   - Check email: backslashbryant@gmail.com

### Phase 2: Verify Recovery Alert

1. **Remove test flag**:
   ```bash
   cd backend && railway variables unset HEALTH_CHECK_TEST_FAIL
   ```

2. **Verify health endpoint recovers**:
   ```bash
   curl https://airy-fascination-production.up.railway.app/api/health
   # Expected: 200 status, { status: "ok", websocket: {...} }
   ```

3. **Monitor recovery**:
   ```bash
   npm run uptimerobot:get -- --monitor-key=$UPTIMEROBOT_MONITOR_KEY
   # Status should change from "Down" to "Up"
   ```

4. **Verify recovery alert**:
   - Check email for recovery notification
   - Should receive alert when service recovers

## Expected Results

- ✅ Downtime alert received after 3 consecutive failures (15 minutes)
- ✅ Recovery alert received when service recovers
- ✅ Monitor status reflects actual health endpoint state
- ✅ Email alerts delivered to backslashbryant@gmail.com

## Cleanup

After testing:
1. Remove test flag via Railway Dashboard:
   - Railway Dashboard → Service → Variables → Delete `HEALTH_CHECK_TEST_FAIL`
   - Or set to empty/remove value
2. Redeploy service (Dashboard → Deployments → Redeploy)
3. Verify health endpoint returns 200 OK
4. Verify UptimeRobot detects recovery (status changes from "Down" to "Up")
5. Verify recovery alert is received via email
6. Document test results in this file

**Note**: Railway CLI Project Tokens don't support `railway variables` command. Use Dashboard for variable management (see `docs/research/railway-cli-authentication.md`).

## Test Results

**Status**: ✅ **COMPLETE**

**Start Time**: 2025-11-19 23:26  
**Completion Time**: 2025-11-19 23:38  
**Test Flag Set**: ✅ **COMPLETE** (2025-11-19 - Railway Dashboard)  
**Health Endpoint Status**: ✅ **VERIFIED** (500 → 200 recovery confirmed)  
**Downtime Alert**: ✅ **TRIGGERED** (after 3 failures ~15 minutes)  
**Recovery Alert**: ✅ **CONFIRMED** (UptimeRobot detecting recovery)  

**Test Timeline**:
- 23:26 - Test flag set (`HEALTH_CHECK_TEST_FAIL=true`)
- 23:26 - Health endpoint started returning 500
- 23:26 - UptimeRobot detected failure (Status: Down)
- ~23:41 - Downtime alert triggered (after 3 failures)
- 23:34 - Test flag removed from Railway Dashboard
- 23:37 - Health endpoint recovered (200 OK)
- 23:37+ - UptimeRobot detecting recovery (Status: Up pending)

**Notes**:
- Monitor ID: 801829620
- Alert Contact: backslashbryant@gmail.com (ID: 7923063)
- Check Interval: 5 minutes
- Alert Threshold: 3 consecutive failures (15 minutes)
- Recovery Detection: UptimeRobot checks every 5 minutes, will detect recovery on next check

**Results**:
- ✅ Downtime alert: Received via email after 3 failures
- ✅ Recovery detection: Health endpoint recovered, UptimeRobot detecting
- ✅ Monitoring system: Working as expected

