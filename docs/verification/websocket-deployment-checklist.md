# WebSocket Deployment Verification Checklist

**Date**: 2025-11-20  
**Commit**: `d987d84` - Fix WebSocket connection issues  
**Status**: ⏳ **VERIFICATION IN PROGRESS**

## Pre-Verification

### ✅ Backend Health Check
- [x] `/api/health` returns `{"status":"ok"}`
- [x] Backend is responding at `https://airy-fascination-production.up.railway.app`

### ⏳ Railway Deployment Status
**Action Required**: Verify latest deployment timestamp in Railway Dashboard

1. Open Railway Dashboard → `airy-fascination` service
2. Check **Deployments** tab - latest deployment should be **after** commit `d987d84`
3. If deployment is older:
   ```bash
   cd backend
   railway redeploy
   ```
   OR push to main again to trigger auto-deploy

### ⏳ SESSION_SECRET Verification
**Action Required**: Verify SESSION_SECRET exists and matches

**Generated Value** (for reference):
```
31d037c410b4a668af50acdffe0488a1b2e4a67ccbe76a4d995918e0881f3a79
```

**Steps**:
1. Railway Dashboard → Service → Variables
2. Verify `SESSION_SECRET` exists
3. **CRITICAL**: Value must match between:
   - Railway production environment
   - Local development (if testing locally)
4. If missing or different:
   - Generate new: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
   - Set in Railway → Variables
   - **Redeploy** after setting (environment variables require redeploy)

**Fallback Behavior**:
- If `SESSION_SECRET` is missing, code uses: `"icebreaker-mvp-secret-change-in-production"`
- This will cause `signature_mismatch` if tokens were generated with a different secret

## Log Monitoring

### Start Log Monitoring
```bash
cd backend
railway logs --tail 100
```

**OR** use Railway Dashboard → Logs tab

### Expected Log Messages

#### ✅ Success Case
```
WebSocket connected: <sessionId>
```

#### ❌ Failure Cases (with specific reasons)

**Missing Token**:
```
WebSocket connection rejected: Missing token
  Request URL: /ws
```

**Invalid Token Format**:
```
WebSocket connection rejected: Invalid token format (invalid_format)
```

**Signature Mismatch** (SESSION_SECRET mismatch):
```
WebSocket connection rejected: Invalid token signature (signature_mismatch)
```

**Expired Token**:
```
WebSocket connection rejected: Token expired (expired)
```

**Session Not Found**:
```
WebSocket connection rejected: Session not found (session_not_found)
```

**URL Parsing Error**:
```
WebSocket connection failed: URL parsing error - <details>
  Request URL: <url>
  Host: <host>
  Protocol detected: <protocol>
```

## Manual Browser Test

### Test URL
```
https://frontend-coral-two-84.vercel.app/?_vercel_share=QY43lDJ6z1IdNIOqKN73GcSmw56n0xhN
```
(Expires: 11/20/2025)

### Test Steps
1. Open shareable link in browser
2. Complete onboarding flow:
   - Welcome → Start onboarding
   - Age verification → Check 18+ → Continue
   - Location → Skip for now
   - Vibe → Select "Up for banter"
   - Tags → Optional
   - Enter Radar
3. **Verify Radar Status**:
   - Header should show: **"Connected"** (not "Disconnected")
   - Notification should show: "You're live" / "Ready to connect"
4. **Watch Railway Logs** during test:
   - Should see: `WebSocket connected: <sessionId>`
   - If error: Copy exact log message

## Troubleshooting

### If logs show "signature_mismatch"
- **Root Cause**: SESSION_SECRET mismatch between token generation and verification
- **Fix**: 
  1. Verify SESSION_SECRET in Railway matches the secret used when tokens were generated
  2. If tokens were generated with fallback secret, ensure Railway also uses fallback (or regenerate tokens)
  3. Redeploy after fixing

### If logs show "session_not_found"
- **Root Cause**: Session expired or was never created
- **Fix**: Complete onboarding again to create fresh session

### If logs show "expired"
- **Root Cause**: Token older than 1 hour (TOKEN_TTL)
- **Fix**: Complete onboarding again to generate fresh token

### If no structured log messages appear
- **Root Cause**: Deployment not running latest code (commit d987d84)
- **Fix**: 
  1. Verify deployment timestamp
  2. Trigger redeploy: `railway redeploy`
  3. Wait for deployment to complete
  4. Retest

## Success Criteria

- [ ] Railway deployment timestamp is after commit `d987d84`
- [ ] SESSION_SECRET is set in Railway Variables
- [ ] Railway logs show structured messages (not just generic errors)
- [ ] Browser test shows "Connected" status in Radar
- [ ] Railway logs show: `WebSocket connected: <sessionId>`

## Next Steps After Verification

Once WebSocket connection is working:
1. Update GitHub Issue #28 with verification results
2. Document any remaining issues
3. Mark plan-status file as COMPLETE if all issues resolved

