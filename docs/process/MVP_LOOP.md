# MVP Delivery Loop

The workspace is tuned for a solo developer working with Cursor to ship focused increments.  
Every feature should flow through the same three stages and stop after the MVP lands.

## Stage 0 - Create / Spec

- Run `npm run feature:new` (or the postinstall bootstrap on a fresh clone).
- Capture the user, pain, outcome, success metrics, **Must-Haves**, and **Not Now** items.
- The script writes:
  - `.notes/features/<slug>/spec.md` - canonical spec, including the MVP DoD checklist.
  - `.notes/features/current.json` - tracks the active feature.
  - `docs/Plan.md` - reset with placeholders for Vector and the agents.
- Open the generated spec or create a GitHub Issue with the **0-Spec** template. Do not skip the MVP DoD checkboxes.

## Stage 1 - Plan

- Assign the **1-Plan** issue template (or reuse the spec issue).
- Ask **Vector** to populate `docs/Plan.md` using the new spec and keep the plan to **3-5 steps**.
- Confirm every step maps to the MVP DoD items. Postpone anything outside the must-have list.
- @Pixel reviews the plan and acceptance tests before implementation begins.

## Stage 2 - Build & Verify

- Use the **2-Build** template (or move the existing issue) when implementation starts.
- Order of agents:
  1. **Pixel** scaffolds tests from the DoD.
  2. **Implementers** (Forge, Link, etc.) deliver just the planned files.
  3. **Pixel** reruns tests and reports GREEN/RED.
  4. **Muse** updates docs / release notes.
  5. **Nexus** ensures CI + preview / deployment.
  6. **Sentinel** runs only when the plan calls for a security pass.
- Do not add new scope without creating a future feature spec.
- When all DoD checkboxes are GREEN, ship it and archive the spec in `.notes/features/<slug>/`.

## Guard Rails

- `npm run feature:new` refuses to overwrite an active feature without confirmation.
- `npm run status` and `npm run verify` fail if:
  - `.notes/features/current.json` is missing.
  - The spec lacks an MVP DoD section.
  - `docs/Plan.md` does not reference the current feature.
- Agents are aligned to this loop in their prompts; they stop once the MVP items are satisfied.
- To restart the loop, archive the previous spec (the script does this automatically) and run `npm run feature:new`.

**Remember:** ship the MVP, then capture follow-up ideas in `.notes/ideas.md` or a new spec issue. Never widen the current DoD mid-flight.
