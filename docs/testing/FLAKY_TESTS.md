# Flaky Tests Tracking

**Purpose**: Track known flaky tests and their resolution status

## Flake Policy

### Retry Strategy
- **Smoke Suite**: 1 retry in CI (fast feedback, don't retry too much)
- **Full Suite**: 2 retries in CI (comprehensive, can afford more retries)
- **Health MVP**: 1 retry in CI (critical path, but fast)
- **Local Development**: 0 retries (fail fast for debugging)

### Quarantine Mechanism
- Use `test.describe.skip()` or `test.skip()` for known flaky tests
- Document reason and expected fix date
- Review and fix within 1 week

### Flake Tracking
- Log flaky test patterns in telemetry
- Review flaky tests weekly
- Fix or quarantine within 1 week

## Known Flaky Tests

_None yet. Add entries as flaky tests are identified._

### Template for New Entries

```markdown
### Test Name: `path/to/test.spec.ts` - `test description`
- **First Identified**: YYYY-MM-DD
- **Frequency**: High/Medium/Low
- **Symptoms**: Brief description of failure
- **Root Cause**: Known or suspected cause
- **Status**: Active/Quarantined/Fixed
- **Fix Date**: YYYY-MM-DD (if fixed)
- **Notes**: Additional context
```

## Resolution Log

_Add entries when flaky tests are fixed or quarantined._

