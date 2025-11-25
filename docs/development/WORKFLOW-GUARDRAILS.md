# Workflow Guardrails Implementation

**Date**: 2025-11-25  
**Status**: ✅ Implemented

## Overview

Comprehensive guardrail rules and validation scripts to enforce workflow standards, prevent drift, and ensure self-correcting CI/workflow configurations.

## Guardrails Implemented

### 1. Job Scope Enforcement ✅

**Rule**: Each CI job has defined scope. `checks` = lint/type/unit only (BAN E2E). Smoke = minimal, time-bounded. Full = comprehensive matrix.

**Validation**: `tools/validate-job-scopes.mjs`
- Checks job steps against allowed/banned patterns
- Blocks E2E tests in `checks` job
- Warns on out-of-scope steps

**Enforcement**: Pre-commit hook (when workflow files change), CI workflow validation job

### 2. Config Alignment Enforcement ✅

**Rule**: GitHub Actions matrix values MUST match Playwright project names exactly. Remove legacy/deprecated projects when adding new ones.

**Validation**: `tools/validate-matrix-config.mjs`
- Checks matrix browsers have corresponding projects
- Detects duplicate projects
- Warns on legacy projects

**Enforcement**: Pre-commit hook, CI workflow validation job, pre-merge checklist

### 3. Dependency Validation ✅

**Rule**: Each CI job that runs Playwright MUST install matching browsers/channels.

**Validation**: `tools/validate-browser-deps.mjs`
- Checks matrix browsers have install steps
- Validates non-matrix jobs install required browsers

**Enforcement**: Pre-commit hook, CI workflow validation job

### 4. Placeholder Data Blocking ✅

**Rule**: Block placeholder dates (`2025-01-XX`, `2025-01-27`) and placeholder strings (TODO/FIXME without issue refs, PLACEHOLDER, XXX).

**Validation**: `tools/check-dates.mjs` (enhanced)
- Detects placeholder dates
- Detects placeholder strings (allows TODO/FIXME with issue refs)

**Enforcement**: Pre-commit hook (blocks commits)

### 5. Selector Standardization ⏸️

**Rule**: Require `data-testid` via central selector map. Disallow new text/role locators unless justified.

**Validation**: `tools/validate-selectors.mjs` (to be implemented)
- Flags raw `getByText`/`getByRole` for known elements
- Checks selector map usage

**Enforcement**: Pre-commit hook (warns), lint check

### 6. Snapshot/Baseline Policy ⏸️

**Rule**: Baselines must be generated on CI target OS (Ubuntu). No placeholder PNGs. Artifact → repo updates in same PR.

**Validation**: Manual checklist item, CI verification

**Enforcement**: Pre-merge checklist, CI artifact validation

### 7. Flake Handling ✅

**Rule**: Retry/quarantine policy (1 retry smoke, 2 full, then quarantine with owner/date). Track in single flake log. Block merges if flake unowned.

**Validation**: `tools/validate-flake-tracking.mjs`
- Checks all flakes have owners
- Detects stale flakes (> 1 week old, active, no fix)
- Validates flake log format

**Enforcement**: Pre-merge checklist, weekly review process

### 8. Branch Readiness ✅

**Rule**: Require merge base with main before CI checks. Discourage `--no-verify` pushes. Pre-push hook runs rebase check and minimal lint.

**Validation**: Pre-push hook
- Checks merge base with main
- Logs `--no-verify` usage with reason
- Runs minimal lint on changed files

**Enforcement**: Pre-push hook (warns, allows override)

## Validation Scripts

| Script | Purpose | Status |
|--------|---------|--------|
| `validate-matrix-config.mjs` | Matrix/config alignment | ✅ |
| `validate-browser-deps.mjs` | Browser dependency checks | ✅ |
| `validate-job-scopes.mjs` | Job scope validation | ✅ |
| `validate-flake-tracking.mjs` | Flake tracking validation | ✅ |
| `check-dates.mjs` | Placeholder date/string detection | ✅ Enhanced |
| `pre-merge-checklist.mjs` | Pre-merge validation runner | ✅ |
| `validate-selectors.mjs` | Selector standardization | ⏸️ To implement |

## Pre-Merge Checklist

Run `node tools/pre-merge-checklist.mjs` before merging:

- [ ] Matrix ≡ Config: GitHub Actions matrix matches Playwright projects
- [ ] No duplicate projects in config
- [ ] Legacy/deprecated projects removed
- [ ] All matrix browsers have install steps
- [ ] No placeholder dates/strings
- [ ] Selectors use central map (or justified)
- [ ] Snapshots generated on CI OS
- [ ] Flake tracking up to date (all flakes owned)
- [ ] Branch merged with main
- [ ] Pre-push checks passed

## CI Integration

### Workflow Validation Job

New `workflow-validation` job runs before all other jobs:
- Validates matrix/config alignment
- Validates browser dependencies
- Validates job scopes
- Blocks CI if validation fails

### Pre-Commit Hook

Enhanced to validate:
- Placeholder dates/strings (blocks)
- Matrix/config alignment (blocks if workflow/config files changed)
- Browser dependencies (blocks if workflow files changed)
- Job scopes (warns if workflow files changed)

### Pre-Push Hook

Enhanced to validate:
- Merge base with main (warns if behind)
- Logs `--no-verify` usage (tracks bypasses)
- Minimal lint on changed files (warns)
- Workflow guardrails (warns)

## Usage

### Before Committing
```bash
# Hooks run automatically
git add .
git commit -m "feat: ..."
# Pre-commit hook validates guardrails
```

### Before Pushing
```bash
# Pre-push hook runs automatically
git push origin branch-name
# Pre-push hook checks merge base, logs --no-verify
```

### Before Merging
```bash
# Run pre-merge checklist
node tools/pre-merge-checklist.mjs
```

### Manual Validation
```bash
# Validate specific guardrail
node tools/validate-matrix-config.mjs
node tools/validate-browser-deps.mjs
node tools/validate-job-scopes.mjs
node tools/validate-flake-tracking.mjs
```

## Exceptions

### Justified Exceptions
- Cross-agent bug fixes: `--no-verify` allowed with documented reason
- Emergency hotfixes: Scope expansion allowed with post-merge documentation
- Experimental features: Placeholder data allowed if clearly marked experimental

### Exception Process
1. Document exception in commit message or plan-status file
2. Create follow-up issue to remove exception
3. Update guardrails if exception becomes pattern

## Maintenance

### Adding New Guardrails
1. Add rule to `.cursor/rules/09-workflow-guardrails.mdc`
2. Create validation script in `tools/`
3. Add to pre-commit/pre-push hooks
4. Add to CI workflow validation job
5. Update pre-merge checklist
6. Document in this file

### Updating Validation Scripts
1. Edit script in `tools/`
2. Test locally: `node tools/validate-*.mjs`
3. Update hooks if needed
4. Update CI workflow if needed
5. Document changes

## Status

✅ **Implemented**: Job scopes, config alignment, browser deps, placeholder blocking, flake tracking, branch readiness  
⏸️ **To Implement**: Selector standardization, snapshot policy automation

All guardrails are self-enforcing via hooks and CI validation.

