## Why
Keep persona/tag/geo data consistent across suites.

## Scope
- Create `tests/fixtures/persona-presence/schema.d.ts` and reusable JSON fixtures (campus, coworking, event).
- Loader helper exposes fixture data to tests and WS mock.
- Document fixture usage in testing plan.

## Acceptance
- Persona specs import fixtures
- Running tests references shared personas instead of inline definitions

## Related
Part of Persona Sim Testing Phase 2 backlog.

