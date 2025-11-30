# Research Log

This log captures structured discovery work for every feature. Each entry summarizes the user problem, links to supporting artifacts, and calls out next steps so future agents can resume instantly.

## How to record

1. Create a dedicated research note under `docs/research/Issue-<number>-research.md` (or the equivalent feature slug).
2. Start with the research question and current blockers.
3. Capture primary findings, risks, and recommendations in bullet form.
4. List concrete next actions and reference any prototypes, telemetry, or user feedback documents.
5. Close the entry by tagging the owner and recording the date so health checks can verify freshness.

## Checklist for each lookup

- [ ] Link to the GitHub issue or feature slug.
- [ ] Document the user problem and why it matters now.
- [ ] Record sources (docs, telemetry, experiments, interviews).
- [ ] Summarize findings and explicit recommendations.
- [ ] Note at least one rollback/mitigation option.
- [ ] Add acceptance or validation criteria that downstream plans/tests can adopt.

## Example entry

**Issue**: #27 – Persona Insights Fixes  
**Owner**: Pixel 🖥️  
**Date**: 2025-11-20

- **Question**: Why are persona telemetry runs flagging missing panic button/visibility toggle affordances?
- **Sources**: `docs/testing/persona-feedback.md`, `tests/e2e/personas/*.spec.ts`, telemetry attachments from `artifacts/persona-insights/`.
- **Findings**:
  - Test selectors relied on text instead of `data-testid`, producing false negatives.
  - Telemetry summaries aggregate historical runs, so “critical” signals persisted even when fixes shipped.
  - Privacy reassurance copy was buried in onboarding; personas skipped it.
- **Recommendations**:
  1. Update tests to target `data-testid` attributes, not text nodes.
  2. Add panic button to every chat state and ensure toggle telemetry hits Profile page.
  3. Regenerate telemetry summaries after clearing stale historical files.
- **Next Steps**: Track implementation in `docs/plans/Issue-27-plan-status-IN-PROGRESS.md`, verify via `npm run test:personas`, and attach telemetry delta to the plan file.

> Need inspiration? Reuse the outline above and keep raw research in the per-issue files under `docs/research/` so the log stays evergreen.
