# Two-Laptop Dry Run Checklist

**Status**: 📋 **READY FOR EXECUTION**  
**Created**: 2025-11-16

## Pre-Execution Checklist

- [ ] Review `Docs/guides/two-laptop-field-test.md` (field test guide)
- [ ] Review `Docs/guides/manual-two-laptop-dry-run.md` (dry run process)
- [ ] Open results template: `Docs/testing/two-laptop-dry-run-2025-11-16.md`
- [ ] Ensure two laptops available
- [ ] Verify both laptops have Node.js 18+ installed
- [ ] Verify both laptops on same network (or tunneling ready)

## Execution Steps

1. **Choose Scenario**:
   - [ ] LAN Setup (HTTP only - location won't work)
   - [ ] Tunneling Setup (HTTPS via ngrok - recommended)
   - [ ] HTTPS Setup (mkcert - advanced)

2. **Follow Field Test Guide**:
   - [ ] Host laptop: Start backend with `HOST=0.0.0.0 CORS_ORIGIN=*`
   - [ ] Guest laptop: Set `VITE_API_URL` and `VITE_WS_URL`
   - [ ] Guest laptop: Start frontend
   - [ ] Test all features per validation checklist

3. **Document Results**:
   - [ ] Fill in results template: `Docs/testing/two-laptop-dry-run-2025-11-16.md`
   - [ ] Note any issues encountered
   - [ ] Assess guide accuracy
   - [ ] Record performance observations

4. **Post-Execution**:
   - [ ] Update `Docs/Plan.md` with pass/fail status
   - [ ] Create GitHub issues for any bugs found
   - [ ] Update guides if improvements needed
   - [ ] Archive results document

## Quick Reference

**Field Test Guide**: `Docs/guides/two-laptop-field-test.md`  
**Dry Run Process**: `Docs/guides/manual-two-laptop-dry-run.md`  
**Results Template**: `Docs/testing/two-laptop-dry-run-2025-11-16.md`

## Success Criteria

- ✅ At least one scenario works end-to-end
- ✅ Both users complete onboarding
- ✅ Both users appear on each other's Radar
- ✅ Chat functionality works between laptops
- ✅ Guide is accurate and complete

---

**Ready to execute when two laptops are available.**

