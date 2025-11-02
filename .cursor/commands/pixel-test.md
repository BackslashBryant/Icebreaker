# Pixel Test Command

Generate comprehensive test cases using Pixel's testing methodology. Use this command when you need to scaffold tests or verify acceptance criteria.

## Usage

Type `/pixel-test` in Cursor chat, then provide:
- Feature or component to test
- Acceptance criteria (if available)
- Issue number (if applicable)

## Command Template

```
@Pixel Generate test cases for [FEATURE/COMPONENT_NAME].

Context:
- Issue: #[ISSUE_NUMBER] (if applicable)
- Feature: [FEATURE_DESCRIPTION]
- Acceptance Criteria: [LIST_CRITERIA_OR_REFERENCE_TO_PLAN]
- Vision: docs/vision.md summary
- Connection Guide impact: [note if new ports/services appear]

Requirements:
1. Provide at least one happy path test case
2. Provide at least one edge case test case
3. For each test, include:
   * Test name and description
   * Setup requirements
   * Test steps
   * Expected results
   * File:line references where applicable

4. Document test commands (e.g., `npm run verify`, stack-specific commands)

5. Reference the Issue in output and note which labels should be updated
6. Remind implementers to run the recorded command after every change and report GREEN/RED.
7. If tests fail repeatedly, add a **Current Issues** entry in `.notes/features/<slug>/progress.md` before retrying.

If acceptance criteria are unclear, flag with @Vector and pause.

Output Format:
- Test cases in runnable format
- Repro commands
- Expected file locations (`/tests/**`)
- Integration with existing test framework

Please structure this following Pixel's format from `docs/agents/prompts/pixel.md`.
```

## Example

```
/pixel-test

Feature: User authentication API endpoint
Issue: #42
Acceptance Criteria:
- POST /api/auth/login accepts email/password
- Returns JWT token on success
- Returns 401 on invalid credentials
- Returns 400 on missing fields
```

## Related Documentation

- Pixel prompt: `docs/agents/prompts/pixel.md`
- Quality rules: `.cursor/rules/02-quality.mdc`
- Test directory: `/tests/**`
