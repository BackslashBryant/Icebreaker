# Testing Infrastructure Backlog

**Last Updated**: 2025-11-20  
**Purpose**: Document remaining testing infrastructure issues (#9-17) for team visibility and prioritization

## Overview

All core MVP features are complete. The remaining open issues are testing infrastructure enhancements that improve QA confidence, accessibility coverage, and test suite maintainability. These are **not launch blockers** but are valuable for production readiness.

## Remaining Testing Issues

### Issue #9: Persona Presence Fixture Schema + Baseline Scripts
**Status**: `status:plan` | **Owner**: @Pixel 🖥️  
**Why it matters**: Standardizes persona test data format, enables consistent multi-user scenarios, reduces test maintenance overhead. Foundation for persona testing suite improvements.

### Issue #11: Upgrade Persona E2E Suites to Dual-Context Flows (Phase 2)
**Status**: `status:plan` | **Owner**: @Pixel 🖥️  
**Why it matters**: Enables realistic multi-user testing scenarios (two personas interacting simultaneously), critical for testing chat flows and radar interactions. Builds on Issue #8 (WebSocket mock).

### Issue #12: Validate Look-and-Feel Across Devices, Themes, Reduced Motion
**Status**: `status:plan` | **Owner**: @Pixel 🖥️, @Link 🌐  
**Why it matters**: Ensures brand consistency and accessibility across different devices, themes, and user preferences. WCAG AA requirement for reduced-motion support.

### Issue #13: Add data-testid to Critical UI + Selector Map
**Status**: `status:plan` | **Owner**: @Pixel 🖥️, @Link 🌐  
**Why it matters**: Makes E2E tests more stable and maintainable by using semantic test IDs instead of fragile CSS selectors. Reduces test flakiness and speeds up test development.

### Issue #14: Emit Persona Run Telemetry + Summarize Results
**Status**: `status:plan` | **Owner**: @Pixel 🖥️, @Nexus 🚀  
**Why it matters**: Enables data-driven UX insights from persona testing runs, identifies friction points, and generates actionable reports. Unblocks persona testing suite effectiveness.

### Issue #15: Split Playwright Suites and Extend Browser Matrix
**Status**: `status:plan` | **Owner**: @Pixel 🖥️, @Nexus 🚀  
**Why it matters**: Improves CI performance by parallelizing test runs, extends coverage to Firefox/Edge browsers, and enables faster feedback loops. Production readiness enhancement.

### Issue #16: Add Keyboard-Only, Screen-Reader, and WS Failure Coverage
**Status**: `status:plan` | **Owner**: @Pixel 🖥️  
**Why it matters**: **HIGH PRIORITY** - Ensures WCAG AA compliance for keyboard navigation and screen readers, critical accessibility requirement. Also tests WebSocket failure scenarios for resilience.

### Issue #17: Add Playwright Visual Snapshots for Key Screens
**Status**: `status:plan` | **Owner**: @Pixel 🖥️  
**Why it matters**: Catches visual regressions automatically, ensures brand consistency, and provides visual documentation of UI states. Valuable for maintaining design system integrity.

## Priority Recommendations

### High Priority (Accessibility & QA Confidence)
1. **Issue #16** - Keyboard/screen-reader coverage (WCAG AA requirement, unblocks accessibility audit)
2. **Issue #14** - Persona run telemetry (unblocks persona testing insights, data-driven improvements)

### Medium Priority (Test Infrastructure)
3. **Issue #13** - data-testid additions (improves test stability, faster development)
4. **Issue #11** - Dual-context flows (enables realistic multi-user testing)

### Lower Priority (Polish & Optimization)
5. **Issue #12** - Look-and-feel validation (important but can be done incrementally)
6. **Issue #15** - Browser matrix extension (performance optimization)
7. **Issue #17** - Visual snapshots (nice-to-have, can be added incrementally)
8. **Issue #9** - Persona fixture schema (foundation work, enables other improvements)

## MVP Blocker Status

✅ **No MVP blockers remaining** - All core features complete:
- ✅ Onboarding Flow (Issue #1)
- ✅ Radar View (Issue #2) 
- ✅ Chat Interface (Issue #4)
- ✅ Panic Button (Issue #5)
- ✅ Block/Report (Issue #24)
- ✅ Profile/Settings (Issue #19)
- ✅ Chat Request Cooldowns (Issue #25)
- ✅ Production Deployment (Issue #21)
- ✅ Monitoring & Error Tracking (Issue #22)

All remaining issues are **testing infrastructure enhancements** that improve quality and maintainability but are not required for MVP launch.

## Next Steps

1. **Start with Issue #16** (keyboard/screen-reader coverage) - Highest leverage for accessibility compliance
2. **Or start with Issue #14** (persona telemetry) - Unblocks persona testing insights
3. **Or start with Issue #13** (data-testid) - Quick win, improves test stability

See individual issue pages for detailed acceptance criteria and implementation plans.

---

**Note**: This backlog is actively maintained. Update this file when issues are completed or priorities change.

