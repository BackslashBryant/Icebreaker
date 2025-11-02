# Cursor Crew Playbook

This is the quick-start guide for working with your in-chat engineering team. Keep it pinned in Cursor so every session starts on the same page.

## Activation Options
- **Auto-routing (default)** – Persona rules in `.cursor/rules/persona-*.mdc` wake the right teammate as soon as you open the matching files (Plan.md → Vector 🎯, `/tests/**` → Pixel 🖥️, etc.).
- **Commands on demand** – `/vector-plan`, `/pixel-test`, `/scout-research`, and friends drop the full persona brief into any chat, even before files exist.
- **Saved agents (advanced)** – `npm run setup:agents` + `docs/agents/CREATE_AGENTS.md` let you keep dedicated agents in the sidebar; they coexist with the auto-routing rules.
- The orchestrator rule keeps handoffs clean when multiple personas are active or no files are attached.

## 1. Vision First
- Update `docs/vision.md` before kicking off a feature. Capture the product goal, user flow, acceptance tests, and open constraints.
- Vector reads the vision plus `.notes/features/<slug>/spec.md` and `docs/Plan.md` before proposing any change.
- If the AI drifts, point back to `docs/vision.md` and the numbered checkpoints in `docs/Plan.md`.

## 2. Kickoff Ritual
1. Run `npm run feature:new` (or confirm the active spec in `.notes/features/current.json`).
2. Fill in the spec and vision, then ask Vector to refresh `/docs/Plan.md` using `/vector-plan`.
3. Paste the Kickoff Message from `docs/agents/KICKOFF.md` into chat and assign the first checkpoint.
4. Explicitly tell the agent: “Do **not** continue to step X until I confirm.” Every handoff repeats this guardrail.

## 3. Handoff Cheat Sheet
- `@Vector` – Plans, acceptance tests, checkpoint updates (`/vector-plan` command).
- `@Pixel` – Test scaffolding, verification, repro steps (`/pixel-test` command).
- `@Forge/@Link/@Glide/@Apex/@Cider` – Implementation in their path scope. Reference the plan step, provide exact file targets, and demand tests immediately after the change.
- `@Muse` – Docs and release notes. Provide the tests/results they should cite.
- `@Nexus` – CI, env vars, automation guardrails. Share updates for `docs/ConnectionGuide.md`.
- `@Scout` – Research. Specify the precise question and expected deliverables in `/docs/research.md`.
- `@Sentinel` – Security review. Indicate the assets or flows to inspect.

## 4. Plan Mode → Act Mode
- Every agent must describe their intended diff, tests, and rollback before touching files.
- Approval format: `Proceed with checkpoint <n>`. Without it, the agent stops and asks for clarification.
- After action: paste the diff summary, test command/output, and any new “Current Issues” entry if something regresses.

## 5. Precision Rules
- Be stupidly specific: list filenames, selectors, colors, padding values, API payloads.
- Log every new service, port, or API in `docs/ConnectionGuide.md` before handing off.
- Never introduce mock data on live paths; confirm placeholders with the caller or Pixel.
- Ask before committing, pushing, or installing new tech. Share the planned command and wait for approval.

## 6. Loop Escape Hatch
- If an agent loops, stop immediately. Document the problem under `.notes/features/<slug>/progress.md` in **Current Issues** with:
  - What they tried
  - Result / error
  - Proposed next experiment
- Start a new chat, load the Current Issues notes, and retry with a fresh plan.

## 7. Testing Discipline
- Pixel (or the acting implementer) runs tests after every change using the smallest relevant command.
- Record the command and result inline. If a test fails, halt, tag the owner, and log it in Current Issues.

## 8. Quick Commands & References
- Personas auto-activate when you open their files; use these commands when you need them outside scope.
- `/vector-plan` – Generate or update the numbered plan.
- `/pixel-test` – Scaffold test cases for the current acceptance criteria.
- `npm run agents:prompt -- all` – Print full system prompts when you need to copy them into Cursor.
- `npm run status` – Verify setup health before a new session.

Pin this playbook, `docs/vision.md`, and `docs/ConnectionGuide.md` in your workspace. They anchor the crew, prevent drift, and keep every build session shippable.
