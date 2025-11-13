#!/usr/bin/env node

/**
 * Create Issue #24 for Critical UX Fixes
 * 
 * Creates GitHub issue for the 3 critical UX issues from persona testing.
 */

import { getRepo, createIssue } from './lib/github-api.mjs';

const title = 'Fix Critical UX Issues from Persona Testing';
const body = `## Goal

Fix 3 critical UX issues identified in Issue #23 persona testing insights. These issues affect 67-76 users and have high impact scores (83-89/100).

## Critical Issues

### 1. Panic Button Visibility (Impact: 89/100, affects 76 users)

**Problem**: Panic button not detected in 82% of test runs, potentially impacting anxious users who need quick exit option.

**Affected Personas**: alex, casey, cross-persona, cross-persona-market-research, cross-persona-professional

**Tasks**:
- Verify panic button is rendered on Radar page with correct \`data-testid="panic-fab"\`
- Check CSS visibility/display properties - may be hidden by default
- Ensure panic button is visible after onboarding completes
- Add panic button to Profile page for consistency (recommendation from insight report)
- Test panic button functionality with screen readers

**Code References**:
- \`tests/utils/telemetry.ts:checkPanicButtonVisible()\` - Test helper function
- \`frontend/src/components/Radar.tsx\` - Verify panic button rendering
- \`frontend/src/components/Profile.tsx\` - Add panic button if missing

### 2. Visibility Toggle Detection (Impact: 88/100, affects 75 users)

**Problem**: Visibility toggle not found in 81% of test runs, affecting privacy-conscious users who need control over their visibility.

**Affected Personas**: alex, casey, cross-persona, cross-persona-market-research, cross-persona-professional

**Tasks**:
- Verify toggle is rendered on Profile page with correct \`data-testid\`
- Check accessibility attributes (ARIA labels, roles)
- Ensure toggle works correctly (toggles visibility state)
- Verify toggle is visible and accessible

**Code References**:
- \`tests/utils/telemetry.ts:checkVisibilityToggleVisible()\` - Test helper function
- \`frontend/src/components/Profile.tsx\` - Verify visibility toggle rendering

### 3. Error Banner Frequency (Impact: 83/100, affects 67 users)

**Problem**: Error banners appearing too frequently, may include false positives from informational alerts.

**Tasks**:
- Improve error detection logic to filter out informational alerts
- Only show error banners for actual errors (not location permission denied, etc.)
- Enhance WebSocket error handling - only show error after reconnection attempts exhausted
- Verify connection error banner only shows when truly disconnected

**Code References**:
- \`tests/utils/telemetry.ts:countErrorBanners()\` - Test helper function
- \`frontend/src/components/ConnectionStatus.tsx\` - Error banner display logic
- \`frontend/src/hooks/useWebSocket.ts\` - WebSocket error handling

## Scope & Constraints

**Must do**:
- Fix all 3 critical issues
- Ensure all 72 persona tests still pass
- Telemetry shows 0 missing affordances for panic button and visibility toggle
- Error banner count reduced (only real errors shown)

**Nice to have**:
- Add panic button usage analytics
- Improve error message clarity

**Out of scope**:
- New features
- Performance optimizations (covered in Issue #20)

## Acceptance Tests

- [ ] Panic button visible in 100% of test runs (currently 18%)
- [ ] Visibility toggle detected in 100% of test runs (currently 19%)
- [ ] Error banner count reduced (filter out informational alerts)
- [ ] All 72 persona tests passing
- [ ] Panic button accessible via keyboard navigation
- [ ] Panic button works correctly with screen readers
- [ ] Visibility toggle works correctly (toggles state)

## Source

**Insight Report**: \`Docs/testing/persona-insights-report.md\`
**Related Issue**: #23 - Run Persona Testing Suite & Generate Actionable UX Insights

## Plan Checklist

- [ ] Scout researches each issue and documents findings
- [ ] Vector creates plan with checkpoints
- [ ] Team reviews and approves plan
- [ ] Link implements frontend fixes
- [ ] Pixel verifies fixes with persona tests
- [ ] Muse documents changes

## Notes

These issues were identified through automated persona testing telemetry analysis. The insight report provides detailed recommendations and code references for each issue.`;

async function main() {
  try {
    const repo = getRepo();
    console.log('Creating issue...');
    
    const result = await createIssue(repo, {
      title,
      body,
      labels: ['status:plan', 'agent:link', 'agent:pixel', 'feature:ux', 'priority:critical']
    });
    
    console.log(`✅ Created issue #${result.number}: ${result.html_url}`);
    console.log(`\nNext steps:`);
    console.log(`1. Create branch: git checkout -b agent/link/${result.number}-fix-critical-ux`);
    console.log(`2. Scout researches each issue`);
    console.log(`3. Vector creates plan`);
  } catch (error) {
    console.error('❌ Error creating issue:', error.message);
    if (error.message.includes('401') || error.message.includes('Bad credentials')) {
      console.error('\n💡 Fix authentication:');
      console.error('   1. Run: gh auth login');
      console.error('   2. Select: GitHub.com');
      console.error('   3. Authenticate with browser');
    }
    process.exit(1);
  }
}

main();

