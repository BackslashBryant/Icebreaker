# Issue #9 - Add persona presence fixture schema + baseline scripts

**Status**: IN-PROGRESS  
**Branch**: `agent/pixel/9-persona-presence-fixtures`  
**GitHub Issue**: #9  
**Created**: 2025-12-04  
**Completed**: TBD  
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
**Status**: ⏳ **PENDING APPROVAL**

### Review Request

Plan is ready for team review. Research complete - schema and fixtures already exist. Main work is creating loader helper for consistency. Low risk - additive changes only.

**Requested Reviewers**: @Pixel 🖥️, @Muse 🎨, @Vector 🎯

### Review Summary

_Pending team review and approval_

### Team Approval

- [ ] **Scout 🔎**: Research review - verify findings are complete and accurate
- [ ] **Vector 🎯**: Plan structure review - verify 3 steps are clear and dependencies correct
- [ ] **Pixel 🖥️**: Implementation review - verify loader helper approach aligns with testing patterns
- [ ] **Muse 🎨**: Documentation review - verify Step 3 documentation requirements are clear

**Team review pending - awaiting approval before implementation.**

## Current Issues

None yet.

