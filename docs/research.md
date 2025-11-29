# Research Log

Central index for all Icebreaker research notes. Use it to record what was studied, why it matters, and the artifacts produced so future contributors can quickly find prior work.

## How to record

1. Create a dedicated markdown file in `docs/research/` scoped to the issue or topic (e.g., `Issue-12-research.md`).
2. Capture the research question, constraints, findings, and recommendations.
3. Link any relevant source files, experiments, or prototypes.
4. Reference the file in the corresponding issue plan/status doc so it is easy to find.

## Checklist for each lookup

- ✅ Define the research question and why it matters right now.
- ✅ List constraints/assumptions so later work knows the context.
- ✅ Document primary findings with linked sources.
- ✅ Add actionable recommendations (and possible rollback options).
- ✅ Note next steps or follow-on work required.

## Example entry

- **File**: `docs/research/Issue-12-research.md`
- **Question**: How do we validate UI look-and-feel across devices/themes/accessibility settings?
- **Highlights**:
  - Playwright can emulate color scheme, reduced motion, and custom classes.
  - Existing viewport utilities cover mobile/tablet/desktop; add small mobile if needed.
  - Dark mode CSS vars need to be defined before testing.
  - Visual regression suite should capture screenshots + Axe checks for each combo.
- **Outcome**: Plan created (`docs/plans/Issue-12-plan-status-IN-PROGRESS.md`), waiting on dark mode prerequisite before test automation work proceeds.
