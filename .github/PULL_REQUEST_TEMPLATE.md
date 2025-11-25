# Summary
- Link to Issue: #<!-- issue number -->
- Brief description of the change and which agents were involved.

# Verification
- [ ] `npm run preflight`
- [ ] `npm run verify` (or stack-specific checks)
- [ ] Additional commands:
  ```bash
  # add extra commands here
  ```

# Checklist
- [ ] `/docs/Plan.md` updated or confirmed accurate
- [ ] Tests added/updated by Pixel
- [ ] Docs (README/CHANGELOG/guides) updated by Muse
- [ ] Research citations (if any) appended to `/docs/research.md`
- [ ] Labels updated (agent + status)

# Workflow Guardrails Compliance
<!-- Run `node tools/pre-merge-checklist.mjs` to auto-check these -->

## Branch Hygiene
- [ ] Branch rebased on latest `main` (no stale merge base)
- [ ] No `--no-verify` commits without logged reason in commit message
- [ ] Merged branches cleaned up locally

## CI/Matrix Alignment
- [ ] Matrix ≡ Config: GitHub Actions matrix matches Playwright project names
- [ ] No duplicate or legacy projects in Playwright config
- [ ] All matrix browsers have matching `npx playwright install` steps
- [ ] Job scopes respected (checks=unit only, smoke=minimal, full=comprehensive)

## Selector Discipline
- [ ] New UI interactions use `data-testid` + selector map (`tests/utils/selectors.ts`)
- [ ] No new raw `getByText`/`getByRole` locators (or justified in test file)

## Snapshot Policy
- [ ] Visual snapshots generated on CI (Ubuntu), not locally
- [ ] No placeholder PNGs or mock snapshots
- [ ] Snapshot changes committed in same PR as code changes

## Data Integrity
- [ ] No placeholder dates (`2025-01-XX`, future dates) - use Time MCP or system date
- [ ] No placeholder strings (`TODO`/`FIXME` without issue reference)
- [ ] Real values or explicit `TBD` with owner/date

## Flake Tracking
- [ ] New flaky tests logged in `Docs/testing/FLAKY_TESTS.md` with owner/date
- [ ] Flakes follow retry policy (1 smoke, 2 full, then quarantine)
- [ ] No unowned flakes older than 1 week

# Notes
- Risks, rollbacks, or follow-up issues
- Links to previews, artifacts, or logs (if available)
