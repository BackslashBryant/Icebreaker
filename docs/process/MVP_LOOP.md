# MVP Delivery Loop

The workspace is tuned for a solo developer working with Cursor to ship focused increments.  
Every feature flows through the same three stages and stops after the MVP lands. Agents always start in **Plan Mode**, wait for approval, then switch to **Act Mode** one checkpoint at a time.

## Stage 0 - Vision & Spec

- Update `docs/vision.md` with problem, audience, core experience, and constraints before any agent work.
- Run `npm run feature:new` (or the postinstall bootstrap on a fresh clone).
- Capture user, pain, outcome, success metrics, **Must-Haves**, and **Not Now** items.
- The script writes:
  - `.notes/features/<slug>/spec.md` - canonical spec, including the MVP DoD checklist.
  - `.notes/features/current.json` - tracks the active feature.
  - `docs/Plan.md` - reset with placeholders for Vector and the agents.
- Open the generated spec or create a GitHub Issue with the **0-Spec** template. Do not skip the MVP DoD checkboxes.
- Keep `docs/ConnectionGuide.md` handy; add ports/endpoints as soon as they appear.

## Stage 1 - Plan

- Assign the **1-Plan** issue template (or reuse the spec issue).
- Ask **Vector** to populate `docs/Plan.md` using the spec + vision and keep the plan to **3-5 numbered checkpoints** (open `docs/Plan.md` to auto-activate Vector or run `/vector-plan`).
- Explicitly tell Vector: “Do not continue to step N until I confirm.” Each checkpoint lists owner, file targets, tests, and rollback.
- Confirm every step maps to the MVP DoD items. Postpone anything outside the must-have list.
- @Pixel reviews the plan and acceptance tests before implementation begins and logs any missing coverage.

## Stage 2 - Build & Verify

- Use the **2-Build** template (or move the existing issue) when implementation starts.
- Order of agents:
  1. **Pixel** scaffolds tests from the DoD and records commands.
  2. **Implementers** (Forge, Link, etc.) deliver one checkpoint at a time—each change is followed immediately by the relevant test.
  3. **Pixel** reruns tests and reports GREEN/RED for the implemented checkpoint.
  4. **Muse** updates docs / release notes (including references to `docs/vision.md`, tests, and Connection Guide updates).
  5. **Nexus** ensures CI + preview / deployment and logs infrastructure changes in `docs/ConnectionGuide.md`.
  6. **Sentinel** runs when the plan calls for a security pass and cites findings in `docs/security/`.
- If an agent loops, stop, document the issue under `.notes/features/<slug>/progress.md` in **Current Issues**, and restart the chat with that context.
- Do not add new scope without creating a future feature spec.
- When all DoD checkboxes are GREEN and the Connection Guide/vision stay accurate, ship it and archive the spec in `.notes/features/<slug>/`.

## Guard Rails

- `npm run feature:new` refuses to overwrite an active feature without confirmation.
- `npm run status` and `npm run verify` fail if:
  - `.notes/features/current.json` is missing.
  - The spec lacks an MVP DoD section.
  - `docs/Plan.md` does not reference the current feature.
- `docs/vision.md` must exist before @Vector proceeds.
- `docs/ConnectionGuide.md` must list every active port/service before Nexus marks CI ready.
- Agents are aligned to this loop in their prompts; they stop once the MVP items are satisfied.
- To restart the loop, archive the previous spec (the script does this automatically) and run `npm run feature:new`.

**Remember:** ship the MVP, then capture follow-up ideas in `.notes/ideas.md` or a new spec issue. Never widen the current DoD mid-flight.
