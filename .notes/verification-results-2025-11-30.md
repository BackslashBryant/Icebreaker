# Verification Automation - Issue #27 (2025-11-30)

## What changed

- Added `tools/run-precommit.mjs` and updated `npm run precommit` so every guardrail step (status, date validation, lint) runs through one entry point and emits JSON logs under `artifacts/verification/` (gitignored). Inspect `artifacts/verification/latest.json` for the most recent trace.
- Updated `.cursor/rules/01-workflow.mdc` and `.cursor/rules/02-quality.mdc` to reference the new artifact instead of requiring manual Markdown dumps.
- Added `scripts/hooks/post-commit.sample` so commits that include `[no-verify: <reason>]` automatically append to `.notes/no-verify-log.md` via `npm run log:no-verify`.
- Relaxed the non-app logic policy so workflow/tooling tweaks can live on the active feature branch, provided they are documented in the plan and split before merging.
- Scoped `tools/health-check.mjs` and `tools/preflight.mjs` to the current branch (parse `agent/<agent>/<issue>-<slug>`) so verification no longer blocks on unrelated Issue #15 artifacts.

## How to cite verification now

1. Run `npm run precommit`.
2. Reference the generated file path (`artifacts/verification/precommit-<timestamp>.json`) in the plan-status doc or status update.
3. Include manual notes only when extra validation was performed (e.g., UI walkthroughs). The JSON already contains stdout/stderr for the guardrail commands.

## Historical context

Older manual notes for Issue #27 live in Git history (commit `f6d42fb`). This file documents the automation put in place on 2025-11-30 so future verification runs use the scripted flow instead of ad-hoc Markdown edits.
