# Agent Browser Cheatsheet

Cursor's Agent Browser lets the AI research the web, capture screenshots, and pull citations without leaving the flow.

## When to use it
- Market and competitor research, library comparisons, changelog digging.
- Validating APIs or tutorials beyond your docs.
- Collecting screenshots or structured data for documentation.

## Launching
1. In chat, click the globe icon -> Open Browser.
2. Or run `Agent: Open Browser` from the Command Palette.
3. Provide the search terms or URLs; the agent navigates and reports back.

## Best practices
- Keep prompts thin and targeted ("Find the official API docs for X and list breaking changes").
- For every result, capture citations in `/docs/research.md` (source, URL, notes).
- Close the browser when finished so the session tokens are not reused unexpectedly.

## Artifacts
- Screenshots and transcripts can be saved under `artifacts/<issue>/research/`.
- If the agent discovers actionable steps (like installation commands), copy them into `.notes/` for reproducibility.

Pair the browser with `npm run mcp:suggest` so research-driven tooling gaps become new MCP additions.
