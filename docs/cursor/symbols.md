# Cursor Symbols & Context Shortcuts

Symbols are Cursor's fast lane for injecting the right context without wading through menus. Reference this sheet while planning or mid-implementation.

## Core symbols
- `@Files` or `@path/to/file` - attach specific files or folders.
- `@Folder` + name - include entire directories (Cursor will summarize large trees automatically).
- `@Code` - ask Cursor to gather relevant code snippets from the workspace.
- `@Docs` - pull indexed documentation (repo docs first, then external sources if configured).
- `@Git` - surface recent commits, diffs, or blame info.
- `@Branch` - compare current branch against default, great for sanity-checking changes.

## Built-in commands
- `Summarize` - compress the current conversation and context window.
- `@Definitions`, `@Recent Changes`, etc., are now auto-resolved: mention the need and Cursor self-fetches.

## Best practices
1. When drafting a plan, add symbol reminders in `/docs/Plan.md` so agents know what to query (for example "Use `@Code` for related utilities").
2. During implementation, start prompts with the symbol so the right files load and the model stays focused.
3. For reviews, combine `@Branch` + `@Git` + `Summarize` to generate high-signal diffs.

## Quick reference
- `Shift + Cmd/Ctrl + I` opens the context search palette to insert symbols without typing full paths.
- Cursor icons in the input bar show which symbols are attached; hover to see details, click to remove.

Log symbol strategies that work well in `.notes/` so the team learns which combos produce the best responses.
