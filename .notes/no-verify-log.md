# --no-verify Usage Log

**Purpose**: Track all `--no-verify` git operations to ensure accountability.

## Policy

When using `--no-verify` (commit or push), you MUST:
1. Include `[no-verify: <reason>]` in your commit message
2. The reason will be auto-logged here by the pre-push hook

## Usage Log

| Date | Branch | User | Reason |
|------|--------|------|--------|
| _Auto-populated by hooks_ | | | |

## Acceptable Reasons

- `cross-agent-bugfix` - Fixing bugs across agent boundaries during testing
- `emergency-hotfix` - Critical production fix requiring immediate deploy
- `hygiene-commit` - Routine cleanup/maintenance commits
- `ci-workaround` - Temporary CI issue requiring bypass (must create follow-up issue)

## Review Process

- Weekly: Review log for patterns
- If same reason appears 3+ times: Create issue to address root cause
- If no reason provided: Flag for team discussion

