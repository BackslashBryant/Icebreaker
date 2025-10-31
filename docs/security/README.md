# Sentinel Notes

Use this folder to record security reviews and follow-up actions.

## File Naming
- Create one Markdown file per Issue or PR, e.g. `issue-1234-login-hardening.md`.
- Include sections for Status, Findings, Recommendations, and Next steps (match the Sentinel report template).

## Workflow
1. Sentinel reviews the change and writes findings here.
2. Reference the file in the GitHub Issue/PR.
3. Open follow-up Issues for unresolved risks and label them `agent:sentinel`.

Keep sensitive details out of the repo; refer to secrets by name only.
