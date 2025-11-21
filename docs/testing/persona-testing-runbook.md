# Persona Testing Runbook

**Last Updated**: 2025-11-20  
**Owner**: QA Team (@Pixel 🖥️)

This runbook provides step-by-step instructions for running the persona testing suite, collecting telemetry data, and generating actionable UX insights.

---

## Overview

The persona testing suite consists of 72 automated E2E tests across 4 test suites, simulating 13 different user personas. Tests collect telemetry data during execution, which is then analyzed to generate actionable UX insights.

### Test Suites

- **College Students** (`tests/e2e/personas/college-students.spec.ts`) - 17 tests
- **Professionals** (`tests/e2e/personas/professionals.spec.ts`) - 19 tests
- **Market Research** (`tests/e2e/personas/market-research.spec.ts`) - 28 tests
- **Multi-User Scenarios** (`tests/e2e/personas/multi-user.spec.ts`) - 8 tests

### Prerequisites

- Node.js 18+ installed
- Dependencies installed (`npm install` in project root and `tests/` directory)
- Backend and frontend servers can start (handled automatically by Playwright)
- `artifacts/persona-runs/` directory exists (created automatically)

---

## Execution Steps

### Step 1: Navigate to Tests Directory

```bash
cd tests
```

### Step 2: Run Persona Test Suite

```bash
npm test -- tests/e2e/personas
```

**Expected Output**:
- All 72 tests should pass
- Telemetry files will be written to `artifacts/persona-runs/` (project root)
- Test execution time: ~2-3 minutes

**Note**: Tests automatically start backend/frontend servers via Playwright `webServer` configuration.

### Step 3: Verify Telemetry Collection

```bash
# From project root
ls artifacts/persona-runs/*.json | wc -l
```

**Expected**: ~93 telemetry files (one per test run)

### Step 4: Generate Telemetry Summary

```bash
# From project root
node tools/summarize-persona-runs.mjs
```

**Output**:
- Summary appended to `docs/testing/persona-feedback.md`
- Console output showing top friction patterns and actionable insights

### Step 5: Review Generated Reports

1. **Telemetry Summary**: `docs/testing/persona-feedback.md`
   - Overall statistics
   - Per-persona statistics
   - Top friction patterns
   - Actionable insights

2. **Insight Report**: `docs/testing/persona-insights-report.md`
   - Executive summary
   - Detailed issue analysis
   - Prioritized action plan
   - Metrics summary

---

## Troubleshooting

### Tests Fail to Start

**Problem**: Tests fail with "Cannot connect to server" errors

**Solution**:
1. Check if ports 3000 (frontend) and 3001 (backend) are available
2. Verify `playwright.config.ts` webServer configuration
3. Check server startup logs in test output

### No Telemetry Files Generated

**Problem**: Tests pass but no telemetry files in `artifacts/persona-runs/`

**Solution**:
1. Verify `artifacts/persona-runs/` directory exists (created automatically)
2. Check test output for telemetry write errors
3. Verify `TelemetryCollector.writeToFile()` is called in test `finally` blocks
4. Check file permissions on `artifacts/` directory

### Telemetry Files in Wrong Location

**Problem**: Telemetry files written to `tests/artifacts/persona-runs/` instead of project root

**Solution**:
- This was fixed in Issue #23 - TelemetryCollector now resolves project root correctly
- If still occurring, check `tests/utils/telemetry.ts:writeToFile()` implementation

### Summarization Script Fails

**Problem**: `node tools/summarize-persona-runs.mjs` fails with syntax errors

**Solution**:
1. Verify Node.js version (18+ required)
2. Check script syntax (should be valid JavaScript, not TypeScript)
3. Verify all dependencies are installed

---

## CI/CD Integration

### GitHub Actions

The persona test suite runs automatically in CI:

- **Smoke Tests**: Run on every push/PR (`npm run test:smoke`)
- **Full Suite**: Runs nightly or on-demand
- **Telemetry Summary**: Generated automatically after full suite runs

### Manual CI Trigger

To trigger full suite run manually:

```bash
# From project root
cd tests
npm run test:ci -- tests/e2e/personas
node ../tools/summarize-persona-runs.mjs
```

---

## Best Practices

### When to Run Full Suite

- **Before major releases**: Verify all personas still work correctly
- **After UX changes**: Ensure changes don't break persona flows
- **Weekly/Monthly**: Regular monitoring of UX metrics
- **After bug fixes**: Verify fixes don't introduce regressions

### Interpreting Results

See [Insight Interpretation Guidelines](#insight-interpretation-guidelines) below.

### Maintaining Tests

- **Update telemetry collection** when adding new metrics
- **Add new personas** when user research identifies new segments
- **Update insight templates** when new friction patterns emerge
- **Review and update recommendations** based on fix effectiveness

---

## Insight Interpretation Guidelines

### Understanding Impact Scores

Impact scores (0-100) combine:
- **Frequency** (60%): How often the issue occurs
- **Severity** (40%): How severe the issue is

**Scoring**:
- **70-100**: Critical priority - immediate action required
- **50-69**: High priority - address soon
- **30-49**: Medium priority - monitor and plan fixes
- **0-29**: Low priority - consider for future improvements

### Priority Levels

- **CRITICAL**: Affects user safety, privacy, or core functionality
- **HIGH**: Significantly impacts user experience
- **MEDIUM**: Noticeable but not blocking
- **LOW**: Minor improvements

### Affected Personas

Lists which personas experience the issue. Use this to:
- Prioritize fixes based on target user segments
- Understand user impact
- Plan persona-specific improvements

### Recommendations

Each insight includes prioritized recommendations:
- **Immediate**: Fix in current sprint
- **Short-term**: Fix in next sprint
- **Long-term**: Plan for future improvements

### Code References

Points to specific files/functions to investigate:
- Test helpers: Where telemetry is collected
- Frontend components: Where UI issues may exist
- Backend routes: Where API issues may exist

---

## Metrics Explained

### Boot Time

Time from page load to app ready (not currently captured - telemetry enhancement needed).

**Target**: < 2 seconds  
**Acceptable**: < 3 seconds  
**Needs Improvement**: > 3 seconds

### Onboarding Time

Time to complete onboarding flow (not currently captured - telemetry enhancement needed).

**Target**: < 20 seconds  
**Acceptable**: < 30 seconds  
**Needs Improvement**: > 30 seconds

### Error Banners

Count of error banners displayed during test run.

**Target**: 0 errors  
**Acceptable**: < 10% of runs  
**Needs Improvement**: > 10% of runs

### Accessibility Violations

WCAG AA violations detected by axe-core.

**Target**: 0 violations  
**Acceptable**: 0 violations (WCAG AA requirement)  
**Needs Improvement**: Any violations

### Affordance Issues

Missing critical UI affordances (panic button, visibility toggle).

**Target**: 0 missing  
**Acceptable**: < 5% of runs  
**Needs Improvement**: > 5% of runs

---

## Example Workflow

### Weekly UX Monitoring

```bash
# 1. Run tests
cd tests
npm test -- tests/e2e/personas

# 2. Generate summary
cd ..
node tools/summarize-persona-runs.mjs

# 3. Review insights
cat docs/testing/persona-insights-report.md

# 4. Create issues for critical items
# (Manual step - create GitHub issues for critical insights)
```

### After UX Changes

```bash
# 1. Run tests
cd tests
npm test -- tests/e2e/personas

# 2. Compare with baseline
# (Compare new telemetry with previous run)

# 3. Verify no regressions
# (Check that impact scores haven't increased)

# 4. Document improvements
# (Update insight report if issues resolved)
```

---

## Related Documentation

- **Persona Definitions**: `docs/personas/`
- **Test Scenarios**: `docs/testing/persona-scenarios.md`
- **Questionnaire**: `docs/testing/persona-questionnaire.md`
- **Feedback Log**: `docs/testing/persona-feedback.md`
- **Insight Report**: `docs/testing/persona-insights-report.md`

---

## Support

For questions or issues:
- **QA Team**: @Pixel 🖥️
- **Product Team**: For prioritization questions
- **Engineering Team**: For implementation questions

---

**Last Updated**: 2025-11-20  
**Maintained By**: QA Team

