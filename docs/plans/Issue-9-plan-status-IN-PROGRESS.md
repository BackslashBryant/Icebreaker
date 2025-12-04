# Issue #9 - Add persona presence fixture schema + baseline scripts

**Status**: IN-PROGRESS  
**Branch**: `agent/pixel/9-persona-presence-fixtures`  
**GitHub Issue**: #9  
**Created**: 2025-12-04  
**Completed**: _Pending completion_  
**Labels**: status:plan, agent:pixel, chore

## Research Summary

**Research Date**: 2025-12-04  
**Researcher**: Scout 🔎  
**Status**: Complete

### Research Question

What is the current state of persona presence fixtures, and what loader helper is needed to expose fixture data consistently to tests and WebSocket mocks?

### Constraints

- Must maintain backward compatibility with existing tests
- Must work with Playwright fixtures and WebSocket mocks
- Must support TypeScript type safety
- Must align with existing fixture structure

### Sources & Findings

**Source 1**: Existing fixture files (`tests/fixtures/persona-presence/`)
- `schema.d.ts` exists and defines `PersonaPresenceScript` interface ✅
- JSON fixtures exist: `campus-library.json`, `coworking-downtown.json`, `gallery-opening.json`, `chat-performance.json` ✅
- Schema matches Issue #9 requirements ✅

**Source 2**: Current usage patterns (`tests/e2e/personas/multi-user.spec.ts`, `tests/e2e/fixtures/ws-mock.setup.ts`)
- Tests import fixtures directly: `import campusLibraryScript from '../../fixtures/persona-presence/campus-library.json'`
- WebSocket mock setup uses fixtures as Playwright fixture options
- No centralized loader helper exists ❌

**Source 3**: Testing plan documentation (`Docs/testing/persona-sim-testing-plan.md`)
- Documents schema structure (lines 130-145)
- Shows example fixture usage (lines 147-172)
- Mentions loader helper concept but no implementation exists

**Source 4**: WebSocket mock implementation (`tests/mocks/websocket-mock.ts`)
- Accepts `PersonaPresenceScript` as constructor parameter
- Uses script data to simulate multi-user presence
- Would benefit from loader helper for consistent fixture access

### Recommendations Summary

1. **Create loader helper** (`tests/fixtures/persona-presence/loader.ts`):
   - Export functions to load fixtures by venue name
   - Provide type-safe access to fixture data
   - Support both direct imports and dynamic loading

2. **Update existing tests** to use loader helper (optional, for consistency):
   - Multi-user tests can use loader instead of direct imports
   - Maintains backward compatibility if direct imports still work

3. **Update documentation** (`Docs/testing/persona-sim-testing-plan.md`):
   - Document loader helper usage
   - Add examples of using loader in tests and mocks

### Rollback Options

- Keep direct imports as fallback (loader is additive)
- Schema and fixtures already exist, so minimal risk
- Can revert loader helper if issues arise

## Plan

### Step 1: Create Loader Helper
**Owner**: @Pixel 🖥️  
**Intent**: Create `tests/fixtures/persona-presence/loader.ts` with functions to load fixtures by venue name

**Acceptance Criteria**:
- [ ] `loadFixture(venue: string): PersonaPresenceScript` function exists
- [ ] `getAvailableVenues(): string[]` function exists
- [ ] TypeScript types are correct
- [ ] Loader works with existing fixture files

**Tests**:
- Unit test: `tests/fixtures/persona-presence/loader.test.ts` (if needed)
- Integration: Verify loader works in existing multi-user tests

### Step 2: Update WebSocket Mock Setup
**Owner**: @Pixel 🖥️  
**Intent**: Update `tests/e2e/fixtures/ws-mock.setup.ts` to optionally use loader helper

**Acceptance Criteria**:
- [ ] WebSocket mock setup can use loader helper
- [ ] Backward compatibility maintained (direct imports still work)
- [ ] Tests pass with loader helper

**Tests**:
- Run existing multi-user tests: `npm test -- tests/e2e/personas/multi-user.spec.ts`

### Step 3: Update Documentation
**Owner**: @Muse 🎨  
**Intent**: Update `Docs/testing/persona-sim-testing-plan.md` with loader helper usage

**Acceptance Criteria**:
- [ ] Loader helper documented with examples
- [ ] Usage patterns shown for tests and mocks
- [ ] Schema documentation remains accurate

**Tests**:
- Documentation review: Verify examples are correct

## Status Tracking

### Checkpoint 1: Loader Helper Created
- [ ] Step 1 complete
- [ ] Loader helper tested
- [ ] Ready for Step 2

### Checkpoint 2: WebSocket Mock Updated
- [ ] Step 2 complete
- [ ] Multi-user tests passing
- [ ] Ready for Step 3

### Checkpoint 3: Documentation Updated
- [ ] Step 3 complete
- [ ] Documentation reviewed
- [ ] Issue ready for completion

## Team Review

**Review Date**: 2025-12-04  
**Status**: ✅ **APPROVED**

### Review Summary

All agents have reviewed the plan and provided approval. Research is complete with accurate findings - schema and fixtures already exist, loader helper is the missing piece. Plan structure is clear with 3 well-defined steps. Implementation approach aligns with existing testing patterns. Documentation requirements are specific and actionable. Low risk - additive changes only, backward compatibility maintained.

### Team Approval

- ✅ **Scout 🔎**: Research complete and accurate. Verified schema.d.ts exists, JSON fixtures present (campus-library, coworking-downtown, gallery-opening, chat-performance), current usage patterns documented. Gap identified correctly: no centralized loader helper. Recommendations align with findings. Rollback options clear.
- ✅ **Vector 🎯**: Plan structure solid. 3 steps are clear with proper dependencies: loader creation → WS mock update → docs. Acceptance criteria specific and testable. Checkpoints well-defined. Owner assignments correct (@Pixel for Steps 1-2, @Muse for Step 3). Ready for implementation.
- ✅ **Pixel 🖥️**: Implementation approach approved. Loader helper pattern (`loadFixture(venue)`, `getAvailableVenues()`) aligns with existing test infrastructure. TypeScript types already defined in schema.d.ts. Backward compatibility maintained - direct imports still work. Step 2 (WS mock update) is optional but recommended for consistency. Integration test approach (verify with existing multi-user tests) is sound.
- ✅ **Muse 🎨**: Documentation requirements clear. Step 3 acceptance criteria specify: loader helper documented with examples, usage patterns for tests and mocks, schema docs remain accurate. Target file identified (`Docs/testing/persona-sim-testing-plan.md`). Examples should show both direct import and loader patterns for clarity.

**Team review complete - approved for implementation.**

## Current Issues

None yet.

