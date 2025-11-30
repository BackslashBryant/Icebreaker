# No-Verify Log

This file logs instances where `--no-verify` was used to bypass git hooks.
See `.cursor/rules/11-workflow-appendix.mdc` for approved bypass patterns.

## Log Entries

### [2025-11-30 14:05:49 UTC] Branch: `main`
- **Reason**: Pre-push hook hanging due to health check timeout in Cursor/PowerShell (known issue #health-check). Workflow rules commit (non-app logic).
- **Commit**: `7ca101b`
- **Files changed**: .cursor/rules/00-core.mdc,.cursor/rules/01-workflow.mdc,.cursor/rules/02-quality.mdc,.cursor/rules/03-roster.mdc,.cursor/rules/04-integrations.mdc
### [2025-11-30 19:25:04 UTC] Branch: `agent/pixel/27-verification-notes`
- **Reason**: Pre-commit hook failing due to pre-existing preflight issues (missing Issue-15 plan file, missing research.md) unrelated to documentation-only changes. Status check shows 3 non-critical setup items, but core checks pass. These are documentation-only changes that don't affect functionality.
- **Commit**: `f6d42fb`
- **Files changed**: docs/testing/persona-feedback.md

