# Vector Plan Command

Create a structured project plan using Vector's planning methodology. Use this command when starting a new feature or task from a GitHub Issue.

## Usage

Type `/vector-plan` in Cursor chat, then provide:
- GitHub Issue number or URL
- Brief description of the feature/task

## Command Template

```
@Vector Create a plan for GitHub Issue #[ISSUE_NUMBER].

Context:
- Issue: #[ISSUE_NUMBER] - [BRIEF_DESCRIPTION]
- Vision: Summarised in docs/vision.md (rev [DATE])
- Connection Guide: docs/ConnectionGuide.md (note any missing ports/services)

Requirements:
1. Create or update `/docs/Plan.md` with:
   - Goals section referencing the GitHub Issue
   - Out-of-scope items
   - 3-7 sequential steps with:
     * Intent and file targets (S/M/L impact)
     * Owner agent (Forge/Link/Glide/Apex/Cider)
     * Required tools/MCP
     * Acceptance tests
     * Done criteria

2. Ensure steps are:
   - Sequential and reversible
   - Scope-appropriate (not too large)
   - Clear about implementation delegation
   - Include "Do not proceed past step <n> without approval"

3. Document any needed research citations in `/docs/research.md`

4. Create a checklist mapping steps to owners and path scopes
5. Note any updates required in `docs/ConnectionGuide.md`

Deliverables:
- Updated `/docs/Plan.md`
- Research citations if needed
- Handoff plan for Pixel (test scaffolding) and implementers with explicit checkpoints

Please structure this as a proper Vector plan following the format in `.cursor/rules/01-workflow.mdc`.
```

## Example

```
/vector-plan

Issue: #42
Description: Add authentication to the API
Goal: Implement JWT-based authentication with login/logout endpoints
```

## Related Documentation

- Vector prompt: `docs/agents/prompts/vector.md`
- Workflow rules: `.cursor/rules/01-workflow.mdc`
- Plan template: `.cursor/plans/templates/`
