# Cursor Model Playbook

Use this cheat sheet to select the right AI model for each task and to avoid context surprises mid-session.

## Daily Defaults
- **Claude 3.7 Sonnet** - Balanced reasoning plus code generation, 200k context. Default for planning, refactors, and mixed code/doc work.
- **Gemini 2.5 Pro** - Fast code iteration, strong TypeScript and frontend ergonomics, 2M context. Prefer for UI scaffolding or large design docs.
- **OpenAI o4-mini** - Deterministic reasoning bursts, small context. Great for quick TDD loops or verifying logic.

## When to upscale
- Plans or reviews spanning many files (>100k tokens) - switch to the largest-context model available before requesting summaries.
- Multi-agent sessions - keep the lead persona on Sonnet/Gemini and drop to o4-mini for Pixel/Nexus verification bursts to save latency.

## Tips
- Announce model switches in `.notes/` so the next session knows the context window budget.
- If a model stalls or times out, retry with fewer attached files or ask Scout to trim context via `/scout-research`.
- Keep experiments lightweight; if a model feels off, switch quickly and log the observation in `/docs/process-improvement.mdc`.
