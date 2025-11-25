# Manual Two-Laptop Dry Run Process

**Purpose**: Validate the two-laptop field test guide (`Docs/guides/two-laptop-field-test.md`) works end-to-end in a real-world scenario.

**Status**: 📋 **PENDING** - Awaiting manual execution

---

## Prerequisites

- Two laptops available for testing
- Both laptops on same network (or tunneling setup ready)
- Node.js 18+ installed on both machines
- Git repository cloned on both machines (or at least host laptop)

---

## Test Scenarios

### Scenario 1: LAN Setup (HTTP Only)

**Goal**: Verify basic two-laptop connectivity without HTTPS

**Steps**:
1. **Host laptop**:
   - Follow "Option 1: LAN Setup" from field test guide
   - Start backend with `HOST=0.0.0.0 CORS_ORIGIN=*`
   - Note IP address
   - Verify backend accessible: `curl http://<HOST_IP>:8000/api/health`

2. **Guest laptop**:
   - Set `VITE_API_URL=http://<HOST_IP>:8000`
   - Set `VITE_WS_URL=ws://<HOST_IP>:8000`
   - Start frontend
   - Open browser to `http://localhost:3000`

3. **Validation**:
   - [ ] Frontend loads on guest laptop
   - [ ] Onboarding flow works (except location step - expected to fail on HTTP)
   - [ ] Can skip location step and continue
   - [ ] Radar view loads
   - [ ] WebSocket connection successful (check browser console)
   - [ ] Both users appear on each other's Radar
   - [ ] Chat request/accept works
   - [ ] Messages send/receive correctly

**Expected Issues**:
- Location step will fail silently (Geolocation requires HTTPS)
- This is expected behavior - document in results

---

### Scenario 2: Tunneling Setup (HTTPS via ngrok)

**Goal**: Verify full feature set including Geolocation API

**Steps**:
1. **Host laptop**:
   - Install ngrok: https://ngrok.com/download
   - Start backend: `cd backend && export HOST=0.0.0.0 CORS_ORIGIN=* && npm run dev`
   - Start ngrok tunnel: `ngrok http 8000`
   - Copy HTTPS URL (e.g., `https://abc123.ngrok.io`)

2. **Guest laptop**:
   - Set `VITE_API_URL=https://<TUNNEL_URL>`
   - Set `VITE_WS_URL=wss://<TUNNEL_URL>`
   - Start frontend: `npm run dev`
   - Open browser to `http://localhost:3000`

3. **Validation**:
   - [ ] Frontend loads on guest laptop
   - [ ] Onboarding flow works completely (including location step)
   - [ ] Location permission requested and granted
   - [ ] Radar view loads with location data
   - [ ] WebSocket connection successful (wss://)
   - [ ] Both users appear on each other's Radar
   - [ ] Proximity matching works (users appear in correct tiers)
   - [ ] Chat request/accept works
   - [ ] Messages send/receive correctly
   - [ ] Safety features work (block/report)
   - [ ] Panic button works

**Expected Success**: All features should work with HTTPS tunnel

---

### Scenario 3: HTTPS Setup (mkcert)

**Goal**: Verify local HTTPS certificates work for Geolocation

**Steps**:
1. **Host laptop**:
   - Install mkcert (see field test guide)
   - Generate certificates for host IP
   - Configure backend for HTTPS (if supported) or use frontend HTTPS only
   - Start services

2. **Guest laptop**:
   - Install mkcert CA
   - Set environment variables
   - Start frontend with `--https` flag

3. **Validation**:
   - [ ] Certificates work correctly
   - [ ] Browser accepts self-signed certificates
   - [ ] Geolocation API works
   - [ ] All features functional

**Note**: This scenario may require backend HTTPS support (currently not implemented). Document findings.

---

## Test Results Template

```markdown
# Two-Laptop Dry Run Results

**Date**: YYYY-MM-DD
**Testers**: [Names]
**Scenario**: [LAN / Tunneling / HTTPS]

## Setup Time
- Host setup: [X] minutes
- Guest setup: [X] minutes
- Total: [X] minutes

## Issues Encountered
1. [Issue description]
   - **Severity**: [Critical / High / Medium / Low]
   - **Workaround**: [If any]
   - **Fix Required**: [Yes / No]

## Features Tested
- [ ] Onboarding flow
- [ ] Location services (if HTTPS)
- [ ] Radar view
- [ ] WebSocket connection
- [ ] Chat functionality
- [ ] Safety features
- [ ] Panic button

## Guide Accuracy
- [ ] Guide steps were clear and accurate
- [ ] All commands worked as documented
- [ ] Troubleshooting section helpful
- [ ] Missing information: [List any gaps]

## Recommendations
- [Improvements to guide]
- [Additional scenarios to test]
- [Documentation updates needed]
```

---

## Success Criteria

The dry run is successful if:
1. ✅ At least one scenario (LAN or Tunneling) works end-to-end
2. ✅ Both users can complete onboarding
3. ✅ Both users appear on each other's Radar
4. ✅ Chat functionality works between laptops
5. ✅ Guide is accurate and complete (no major gaps)

---

## Post-Dry Run Actions

1. **Document Results**: Create `Docs/testing/two-laptop-dry-run-YYYY-MM-DD.md` with results
2. **Update Guide**: Fix any issues found in field test guide
3. **Update Plan.md**: Mark dry run as complete
4. **Create Issues**: File GitHub issues for any blockers found

---

## Troubleshooting During Dry Run

If issues occur:
1. Check browser console for errors
2. Check backend logs for connection attempts
3. Verify firewall settings (port 8000 open)
4. Test network connectivity: `ping <HOST_IP>` from guest
5. Test API connectivity: `curl http://<HOST_IP>:8000/api/health` from guest
6. Check CORS headers in browser Network tab
7. Verify environment variables are set correctly

---

**Next Steps**: Execute dry run and document results. Update guide based on findings.

