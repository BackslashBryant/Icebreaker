## Why
Simulate venue realism and verify proximity scoring.

## Scope
- Add `tests/utils/geolocation.ts` granting geolocation permission and setting coordinates/floor metadata.
- Define canonical locations in `tests/fixtures/locations.json`.
- Add tests covering just-inside/outside range and floor offsets.

## Acceptance
- Persona tests call helper
- Assertions confirm Radar reacts correctly to geo changes

## Related
Part of Persona Sim Testing Phase 2 backlog.

