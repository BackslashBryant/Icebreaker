# Issue #34 - Telemetry Hygiene: Date-Scoped Summaries for Persona Test Verification

**Status**: IN-PROGRESS  
**Branch**: `agent/forge/34-telemetry-date-filtering`  
**GitHub Issue**: #34  
**Created**: 2025-11-30  
**Labels**: enhancement

## Research Summary

**Research Date**: 2025-11-30  
**Researcher**: Scout 🔎  
**Status**: Complete

### Research Question

How should we implement date-based filtering for persona telemetry summaries to enable clean verification insights that exclude stale historical data?

### Constraints

- **Stack**: Node.js script (`tools/summarize-persona-runs.mjs`), telemetry files in `artifacts/persona-runs/`
- **Current Behavior**: Script reads ALL `.json` files from directory without filtering
- **Telemetry Format**: Each file contains `timestamp` field in ISO format (e.g., `2025-11-30T12:34:56.789Z`)
- **File Naming**: Files named as `${persona}-${timestamp}.json` where timestamp is ISO with colons/dots replaced
- **Problem**: After Issue #27 fixes were verified (all 72 tests passing on 2025-11-30), summary still showed "critical" flags because it aggregated 1,252 historical runs from before fixes
- **Existing Infrastructure**:
  - `tools/summarize-persona-runs.mjs` - Main summarization script
  - `tests/utils/telemetry.ts` - TelemetryCollector class that writes files with `timestamp` field
  - `docs/testing/persona-testing-runbook.md` - Documentation for running tests and generating summaries

### Sources & Findings

**Current Implementation Analysis**:
1. **File Reading** (`readTelemetryFiles()` function, lines 79-100):
   - Reads all `.json` files from `artifacts/persona-runs/`
   - No date filtering applied
   - Parses each file and adds to data array

2. **Telemetry Data Structure**:
   - Each telemetry file has `timestamp: string` field (ISO format)
   - Timestamp set in `TelemetryCollector` constructor: `this.data.timestamp = new Date().toISOString()`
   - Files also have timestamp in filename: `${persona}-${timestamp}.json`

3. **Problem Scenario**:
   - Historical runs (pre-fix) mixed with current runs (post-fix)
   - Aggregation includes all runs, making it impossible to see if fixes worked
   - Example: 1,252 historical runs + 72 new runs = summary shows pre-fix issues

**Solution Options**:

**Option A: Date Window Filtering** (Recommended)
- Add CLI flags: `--since <date>` or `--window <days>`
- Filter telemetry files by `timestamp` field before aggregation
- Example: `node tools/summarize-persona-runs.mjs --since 2025-11-30`
- Pros: Flexible, can analyze specific time periods, preserves historical data
- Cons: Requires date parsing logic

**Option B: Archive/Reset Before Verification**
- Move historical files to archive directory before verification runs
- Clean slate for each verification
- Pros: Simple, guaranteed clean summaries
- Cons: Loses historical data access, requires manual cleanup

**Option C: Separate Historical vs Current Summaries**
- Generate two summaries: historical (all data) and current (filtered)
- Pros: Preserves both views
- Cons: More complex, requires two summary files

**Recommended Approach**: **Option A** (Date Window Filtering)
- Most flexible and preserves historical data
- Enables verification of fixes with clean post-fix data
- Can still generate full historical summaries when needed
- Standard pattern for time-series data analysis

### Recommendations Summary

1. **Implement date filtering in `readTelemetryFiles()`**:
   - Add optional `sinceDate`` and `untilDate` parameters
   - Parse ISO timestamps and filter files before aggregation
   - Support both `--since <date>` and `--window <days>` CLI flags

2. **Update CLI interface**:
   - Add `--since <YYYY-MM-DD>` flag for absolute date filtering
   - Add `--window <N>d` flag for relative date filtering (e.g., `--window 7d` for last 7 days)
   - Default behavior: no filtering (backward compatible)

3. **Update documentation**:
   - Document filtering options in `docs/testing/persona-testing-runbook.md`
   - Add examples for verification workflows
   - Document date format requirements

4. **Verification workflow**:
   - Before verification: Note current date
   - Run tests: Generate new telemetry files
   - Generate summary: `node tools/summarize-persona-runs.mjs --since <date>`
   - Review: Summary shows only post-fix data

### Rollback Options

1. If date filtering causes issues: Remove filtering logic, revert to reading all files
2. If CLI parsing fails: Fall back to reading all files with warning message
3. If timestamp parsing fails: Skip file with error log, continue processing others

## Goals & Success Metrics

- **Target User**: QA team (@Pixel 🖥️), developers verifying fixes
- **Problem**: Telemetry summaries include stale historical data, making it impossible to verify if fixes worked
- **Desired Outcome**:
  - Summarization script supports date-based filtering (`--since`, `--window`)
  - Verification workflow can generate clean summaries from post-fix data only
  - Historical data still accessible for full analysis
  - Documentation updated with filtering options
- **Success Metrics**:
  - ✅ Script accepts `--since <date>` and `--window <days>` flags
  - ✅ Filtered summaries only include telemetry from specified time window
  - ✅ Default behavior (no flags) remains backward compatible (all files)
  - ✅ Documentation includes filtering examples
  - ✅ Verification workflow documented in runbook

## Plan Steps

1. **Step 1**: Add Date Filtering to `readTelemetryFiles()` Function
   - **Owner**: @Forge 🔗
   - **Status**: ✅ COMPLETE (2025-11-30)
   - **Acceptance**: Function accepts optional `sinceDate` and `untilDate` parameters, filters files by timestamp before aggregation
   - **Details**:
     - ✅ Modified `readTelemetryFiles()` to accept optional `sinceDate` and `untilDate` parameters
     - ✅ Added timestamp parsing from telemetry data (`parsed.timestamp`)
     - ✅ Filters files where `timestamp >= sinceDate` and `timestamp <= untilDate`
     - ✅ Skips files without timestamp with warning message
     - ✅ Returns filtered data array
     - ✅ Maintains backward compatibility (no parameters = all files)
     - ✅ Tested: Without flags shows 1,252 files, with `--since 2025-11-30` shows 80 files

2. **Step 2**: Add CLI Argument Parsing for Date Filters
   - **Owner**: @Forge 🔗
   - **Status**: ✅ COMPLETE (2025-11-30)
   - **Acceptance**: Script accepts `--since <date>` and `--window <days>` flags, parses dates correctly
   - **Details**:
     - ✅ Added `parseDateFilters()` function using `process.argv.slice(2)` (consistent with other tools)
     - ✅ Supports `--since <YYYY-MM-DD>` format (absolute date, parsed as UTC midnight)
     - ✅ Supports `--window <N>d` format (relative days, e.g., `--window 7d`)
     - ✅ Calculates `sinceDate` from current date minus window days
     - ✅ `--window` takes precedence over `--since` if both specified
     - ✅ Error handling for invalid date formats with warning messages
     - ✅ Passes date parameters to `readTelemetryFiles()`
     - ✅ Console output shows filtering info when dates are specified
     - ✅ Default: no filtering (backward compatible)
     - ✅ Tested: `--since 2025-11-30` filters to 80 files, `--window 7d` filters to 848 files

3. **Step 3**: Update Documentation with Filtering Options
   - **Owner**: @Muse 🎨
   - **Status**: ✅ COMPLETE (2025-11-30)
   - **Acceptance**: Runbook documents filtering options with examples, verification workflow updated
   - **Details**:
     - ✅ Updated `docs/testing/persona-testing-runbook.md`:
       - ✅ Added date filtering examples to Step 4 (Generate Telemetry Summary)
       - ✅ Documented `--since <YYYY-MM-DD>` and `--window <N>d` flags
       - ✅ Added "Verification Workflow" section with date filtering example
       - ✅ Documented date format requirements (YYYY-MM-DD for --since, <N>d for --window)
       - ✅ Added troubleshooting section for date parsing errors
       - ✅ Explained why date filtering is important for verification

4. **Step 4**: Test Date Filtering Implementation
   - **Owner**: @Pixel 🖥️
   - **Status**: ✅ COMPLETE (2025-11-30)
   - **Acceptance**: Filtering works correctly, backward compatibility maintained, edge cases handled
   - **Details**:
     - ✅ Tested with `--since` flag: `--since 2025-11-30` filtered to 80 files (from 1,252 total)
     - ✅ Tested with `--window` flag: `--window 7d` filtered to 848 files (last 7 days)
     - ✅ Tested without flags: All 1,252 files included (backward compatible)
     - ✅ Tested edge cases:
       - Invalid date format: Warning message displayed, script continues
       - Invalid window format: Warning message displayed, script continues
       - No files in range: Appropriate message displayed
     - ✅ Tested with actual telemetry files: Filtering works correctly with real data
     - ✅ Verified summary output matches filtered data: Console shows correct file count
     - ✅ Verified console output shows filtering info when dates are specified

## Status Tracking

- ✅ **Step 1**: Add Date Filtering to `readTelemetryFiles()` Function - **COMPLETE** (2025-11-30)
- ✅ **Step 2**: Add CLI Argument Parsing for Date Filters - **COMPLETE** (2025-11-30)
- ✅ **Step 3**: Update Documentation with Filtering Options - **COMPLETE** (2025-12-01, commit `55ab45e`)
- ✅ **Step 4**: Test Date Filtering Implementation - **COMPLETE** (2025-11-30, manual testing)

## Current Issues

**Documentation Status**: 
- ✅ Code implementation complete and committed (commit `69c6421`)
- ✅ Runbook documentation committed (commit `55ab45e`): 
  - Date filtering examples in Step 4: `--since` and `--window` flag examples
  - Date Filtering Options section: Flag descriptions and default behavior
  - Date Filtering Issues troubleshooting section: Error handling and solutions
  - Verification Workflow section: Step-by-step verification process

**Test Verification**:
- ✅ `npm run test` now runs successfully (path issue fixed in commit `9ab70fc`)
  - Fixed by using `shell: false` in `spawnSync()` to properly handle paths with spaces
  - Tests execute without path truncation errors
- ✅ Manual testing completed: `--since` and `--window` flags work correctly
  - Tested: `--since 2025-11-30` filters to 80 files (from 1,252 total) ✅
  - Tested: `--window 7d` filters to 848 files (last 7 days) ✅
  - Tested: Invalid dates show warnings and fall back gracefully ✅
  - Tested: Backward compatible (no flags = all files) ✅
- ✅ Automated test execution: Tests run successfully (path issue fixed in commit `000ea9d`)
  - Backend unit tests: ✅ Passing (247 tests)
  - Frontend unit tests: ✅ Passing
  - E2E accessibility tests: ✅ 29 tests passing (fixed in commit pending)
    - Fixed: Added consent checkbox check before Continue button click
    - Fixed: Selected tag class assertion (check aria-pressed state)
    - Fixed: Tab order test (focus checkbox directly then tab to button)
    - Fixed: Enter Radar button test (select vibe first, then click)
    - All Issue #26 accessibility tests now passing
  - E2E other tests: ⚠️ 3 failures in `tests/e2e/block-report.spec.ts` (test infrastructure issues, unrelated to Issue #34)
    - Issue: Block/Report functionality tests failing on menu interactions
    - Tests updated to use shared onboarding helper (commit `0322b2c`)
    - Tests updated with correct sessionStorage keys (commit pending)
    - Tests now complete onboarding and reach chat page successfully
    - **Current failure**: Menu button interactions not working (requires WebSocket/chat state setup)
    - **Not related to Issue #34**: These are safety control integration tests requiring proper WebSocket/chat infrastructure
    - **Test log**: `artifacts/test-logs/all-tests-2025-12-01T03-54-30.log`
    - **Action**: These failures should be addressed in a separate issue focused on chat/block-report test infrastructure
  - E2E performance tests: ⚠️ 1 interrupted test in `tests/e2e/performance.spec.ts` (pre-existing)
    - Issue: WebSocket/radar update test interrupted
    - **Not related to Issue #34**: This is a performance test
  - Test logs: `artifacts/test-logs/all-tests-2025-12-01T02-54-03.log`
  - **Note**: Issue #34 functionality (date filtering) is verified via manual testing. All Issue #26 accessibility tests are passing. Remaining failures are in unrelated test files.

## Team Review

**Review Date**: 2025-11-30  
**Status**: ✅ **APPROVED**

### Review Summary

All agents have reviewed the plan and provided approval. Plan structure is complete with 4 clear checkpoints covering date filtering implementation, CLI parsing, documentation, and testing. Solution approach (Option A: Date Window Filtering) is well-researched and recommended. Backward compatibility maintained. Verification workflow clearly defined.

### Team Approval

- ✅ **Scout 🔎**: Research complete, solution options well-evaluated, Option A (Date Window Filtering) is the right choice. Flexible, preserves historical data, enables clean verification. Plan aligns with findings.
- ✅ **Vector 🎯**: Plan created with 4 checkpoints covering implementation → CLI → docs → testing. Dependencies clear, acceptance criteria specific. Ready for implementation.
- ✅ **Forge 🔗**: Steps 1-2 approved (date filtering + CLI parsing). Using `process.argv.slice(2)` pattern consistent with other tools. Date parsing logic straightforward. Backward compatibility maintained.
- ✅ **Pixel 🖥️**: Step 4 approved (testing). Verification workflow makes sense - note date, run tests, filter summary. Edge cases covered (invalid dates, future dates, empty ranges). Will verify filtering works correctly.
- ✅ **Muse 🎨**: Step 3 approved (documentation). Runbook update needed with filtering examples. Verification workflow documentation will help QA team. Date format requirements clear.
- ✅ **Nexus 🚀**: No infrastructure changes required, scope is tooling-focused. Backward compatible, no breaking changes.

**Team review complete - approved for implementation.**

