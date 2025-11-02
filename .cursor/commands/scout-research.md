# Scout Research Command

Research a topic using Scout's research workflow. Use this command when you need to gather facts, compare options, or find documentation.

## Usage

Type `/scout-research` in Cursor chat, then provide:
- Research topic or question
- Any specific constraints or requirements
- Issue number (if applicable)

## Command Template

```
@Scout Research [TOPIC/QUESTION].

Context:
- Issue: #[ISSUE_NUMBER] (if applicable)
- Topic: [WHAT_TO_RESEARCH]
- Constraints: [ANY_SPECIFIC_REQUIREMENTS_OR_CONSTRAINTS]
- Vision reference: docs/vision.md highlights [SECTION/DATE]

Requirements:
1. Use DocFork MCP first for official library/documentation
2. Use GitHub MCP for code examples and patterns
3. Supplement with trusted web results if needed

4. Cite 3-5 high-signal sources with:
   * Source title
   * URL
   * Version (if applicable)
   * Key takeaway

5. Highlight trade-offs and constraints
6. Recommend a default choice with reasoning
7. Propose a rollback path
8. Flag any licensing, pricing, maintenance, or security concerns

9. Document findings in `/docs/research.md` using Scout's format:
   ## [Topic]
   - Source: [Title] ([URL])
   - Notes: [bullet list of confirmations, constraints, caveats]
   - Recommendation: [default choice + why]
   - Rollback: [safe fallback]
   - Next steps: [actions for Vector or implementers]

10. Reference the Issue ID for traceability

Please follow the format from `docs/agents/prompts/scout.md` and `.cursor/rules/04-integrations.mdc` for MCP usage.
```

## Example

```
/scout-research

Topic: Best practices for JWT authentication in Node.js
Issue: #42
Constraints: Must support refresh tokens, must be secure, prefer TypeScript
```

## Related Documentation

- Scout prompt: `docs/agents/prompts/scout.md`
- MCP integrations: `.cursor/rules/04-integrations.mdc`
- Research log: `/docs/research.md`
