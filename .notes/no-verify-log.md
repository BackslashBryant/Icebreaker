# No-Verify Log

This file logs instances where `--no-verify` was used to bypass git hooks.
See `.cursor/rules/11-workflow-appendix.mdc` for approved bypass patterns.

## Log Entries

### [2025-11-30 14:05:49 UTC] Branch: `main`
- **Reason**: Pre-push hook hanging due to health check timeout in Cursor/PowerShell (known issue #health-check). Workflow rules commit (non-app logic).
- **Commit**: `7ca101b`
- **Files changed**: .cursor/rules/00-core.mdc,.cursor/rules/01-workflow.mdc,.cursor/rules/02-quality.mdc,.cursor/rules/03-roster.mdc,.cursor/rules/04-integrations.mdc
