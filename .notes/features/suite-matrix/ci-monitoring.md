# CI Monitoring Plan - Issue #15 Browser Matrix

**Date**: 2025-11-25  
**Branch**: `agent/vector/15-suite-matrix`  
**Status**: Monitoring active

## Monitoring Checklist

### 1. Guardrail Scripts Validation ✅
- [ ] `workflow-validation` job passes
- [ ] Matrix/config alignment validated
- [ ] Browser dependencies validated
- [ ] Job scopes validated

### 2. Leaner Matrix Performance
- [ ] Smoke suite runs in < 3 minutes (4 projects: chromium/webkit desktop+mobile)
- [ ] Full suite runs successfully (stateful + 8 browser/viewport projects)
- [ ] No duplicate test runs detected
- [ ] Runtime improvements vs. previous runs

### 3. msedge-mobile Viewport Behavior
- [ ] msedge-mobile project runs successfully on Ubuntu CI
- [ ] Viewport-only setup works (no channel/device conflicts)
- [ ] If quirks detected: Document and consider adding userAgent/deviceScaleFactor

### 4. Flake Tracking
- [ ] Monitor for new flakes from expanded matrix
- [ ] Log flakes to `Docs/testing/FLAKY_TESTS.md` with:
  - Test name and path
  - First identified date
  - Frequency (High/Medium/Low)
  - Owner assignment
  - Status (Active/Quarantined/Fixed)

### 5. Artifact Review (After First Full Run)
- [ ] Review artifact sizes
- [ ] Check retention periods (smoke: 7 days, full: 30 days)
- [ ] Review runtimes - trim retention or shard if runtimes spike
- [ ] Verify HTML reports publish correctly
- [ ] Verify screenshots/videos only on failure

### 6. Production Health Check (Dec 1, 09:00 UTC)
- [ ] Monitor production health check workflow run
- [ ] Verify endpoints report cleanly
- [ ] Check for any issues or alerts

**Check Status**:
```bash
# List production health check runs
gh run list --workflow "Production Health Check" --limit 5

# View specific run
gh run view <run-id> --json status,conclusion,jobs

# Watch run in real-time
gh run watch <run-id>
```

**Note**: Production health check runs weekly on Monday at 9 AM UTC. Dec 1, 2025 is a Monday, so it will run automatically.

## CI Run Tracking

### Latest Run
**Run ID**: TBD  
**Status**: TBD  
**URL**: TBD

**Check Status**:
```bash
# Monitor latest CI run
node tools/monitor-ci-guardrails.mjs agent/vector/15-suite-matrix

# Or use gh CLI directly
gh run list --branch agent/vector/15-suite-matrix --workflow "Guardrails CI" --limit 1
gh run view <run-id> --json status,conclusion,jobs
```

**Results**:
- workflow-validation: TBD
- persona-smoke: TBD (4 projects: chromium/webkit desktop+mobile)
- persona-full: TBD (stateful + 8 projects: all browsers × desktop/mobile)
- health-mvp: TBD (4 browsers: chromium/firefox/webkit/msedge)

**Issues Found**:
- None yet

### msedge-mobile Monitoring
- [ ] Check if msedge-mobile runs successfully on Ubuntu CI
- [ ] Verify viewport-only approach works (no channel conflicts)
- [ ] If quirks detected: Document in this file and consider adding userAgent/deviceScaleFactor

## Notes

- msedge-mobile uses viewport-only approach (390x844) to avoid channel conflicts on Ubuntu
- If true mobile UA needed: Add `userAgent` and `deviceScaleFactor` to match mobile profile
- Guardrails will catch duplicate projects, missing browsers, scope violations automatically

