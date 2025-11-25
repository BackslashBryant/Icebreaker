# Issue #13: Add data-testid to Critical UI + Selector Map

**Research Date**: 2025-11-23  
**Researcher**: @Pixel 🖥️  
**Status**: Research Complete

## Research Question

What data-testid attributes are missing from critical UI components, and which tests need to be migrated to use the centralized selector map?

## Constraints

- Must not break existing tests
- Must maintain accessibility (ARIA attributes still required)
- Selector map already exists at `tests/utils/selectors.ts`
- Many components already have data-testid attributes

## Sources & Findings

### 1. Current State Analysis

**Selector Map Status**:
- ✅ `tests/utils/selectors.ts` exists and is comprehensive
- ✅ Contains selectors for: Welcome, Onboarding, Vibe, Tags, Panic, Visibility, Chat, Radar
- ✅ Helper functions: `getTagSelector()`, `getVibeSelector()`

**Component Coverage**:
- ✅ Welcome page: `cta-press-start`, `cta-not-for-me` - **COMPLETE**
- ✅ Onboarding: All steps and buttons have data-testid - **COMPLETE**
- ✅ VibeStep: All vibe options have data-testid - **COMPLETE**
- ✅ TagsStep: All tag chips have data-testid - **COMPLETE**
- ✅ PanicButton: `panic-fab`, `panic-dialog`, `panic-confirm`, `panic-cancel` - **COMPLETE**
- ✅ VisibilityToggle: `visibility-toggle`, `visibility-toggle-checkbox` - **COMPLETE**
- ✅ Chat: `chat-accept`, `chat-decline`, `chat-end`, `chat-input`, `chat-send`, `chat-header` - **COMPLETE**
- ❌ **Radar page**: Missing `radar-heading`, `radar-view-toggle`, `radar-profile-button` - **INCOMPLETE**

**Test Migration Status**:
- ✅ `college-students.spec.ts`: Partially migrated (uses SEL for onboarding, but still uses `getByRole` for Radar)
- ❌ `professionals.spec.ts`: 63 instances of `getByText`/`getByRole` - **NOT MIGRATED**
- ❌ `market-research.spec.ts`: 122 instances of `getByText`/`getByRole` - **NOT MIGRATED**
- ❌ `multi-user.spec.ts`: 16 instances of `getByText`/`getByRole` - **NOT MIGRATED**
- ❌ Other E2E tests: 20 test files still use text/role-based selectors

### 2. Missing data-testid Attributes

**Radar Page (`frontend/src/pages/Radar.tsx`)**:
1. **Radar Heading** (line 85-87):
   - Current: `<h1>RADAR</h1>`
   - Needed: `data-testid="radar-heading"`
   - Selector: `SEL.radarHeading` (already defined in selector map)

2. **View Toggle Buttons** (lines 108-127):
   - Current: Two icon buttons for sweep/list view
   - Needed: `data-testid="radar-view-toggle"` on container or individual buttons
   - Selector: `SEL.radarViewToggle` (already defined in selector map)
   - Note: May need separate selectors for sweep/list buttons

3. **Profile Button** (lines 99-107):
   - Current: Icon button with `aria-label="Go to profile"`
   - Needed: `data-testid="radar-profile-button"`
   - Selector: `SEL.radarProfileButton` (already defined in selector map)

### 3. Test Migration Targets

**High Priority** (Persona tests - most flaky):
1. `tests/e2e/personas/professionals.spec.ts` - 63 instances
2. `tests/e2e/personas/market-research.spec.ts` - 122 instances
3. `tests/e2e/personas/multi-user.spec.ts` - 16 instances
4. `tests/e2e/personas/college-students.spec.ts` - Partial (Radar selectors need migration)

**Medium Priority** (Other E2E tests):
- `tests/e2e/radar.spec.ts`
- `tests/e2e/onboarding.spec.ts`
- `tests/e2e/onboarding-radar.spec.ts`
- `tests/e2e/profile.spec.ts`
- `tests/e2e/visual/*.spec.ts`
- `tests/e2e/accessibility/*.spec.ts`
- `tests/e2e/regression/*.spec.ts`
- `tests/e2e/mobile/*.spec.ts`
- `tests/e2e/cooldown.spec.ts`
- `tests/e2e/block-report.spec.ts`
- `tests/e2e/performance.spec.ts`

**Common Patterns to Replace**:
- `page.getByRole("heading", { name: /RADAR/i })` → `page.locator(SEL.radarHeading)`
- `page.getByRole("button", { name: /Go to profile/i })` → `page.locator(SEL.radarProfileButton)`
- `page.getByText(/text/i)` → Use SEL selector if available, or add data-testid
- `page.getByLabelText(/label/i)` → Use SEL selector if available, or add data-testid

### 4. Selector Map Gaps

**Already Defined** (but not used in components):
- `SEL.radarHeading` - defined but Radar page h1 missing data-testid
- `SEL.radarViewToggle` - defined but Radar view toggle missing data-testid
- `SEL.radarProfileButton` - defined but Radar profile button missing data-testid

**May Need Additional Selectors**:
- Radar view toggle buttons (sweep vs list) - may need separate selectors
- PersonCard dialog elements (if not already covered)
- RadarSweep/RadarList empty states (if not already covered)

## Recommendations Summary

### Phase 1: Add Missing data-testid Attributes
1. **Radar Page** (`frontend/src/pages/Radar.tsx`):
   - Add `data-testid="radar-heading"` to h1 element
   - Add `data-testid="radar-profile-button"` to profile button
   - Add `data-testid="radar-view-toggle"` to view toggle container or individual buttons
   - Consider separate selectors for sweep/list buttons if needed

### Phase 2: Migrate High-Priority Tests
1. **Persona Tests** (most flaky):
   - Migrate `professionals.spec.ts` (63 instances)
   - Migrate `market-research.spec.ts` (122 instances)
   - Migrate `multi-user.spec.ts` (16 instances)
   - Complete migration in `college-students.spec.ts` (Radar selectors)

2. **Migration Pattern**:
   - Replace `getByRole("heading", { name: /RADAR/i })` with `locator(SEL.radarHeading)`
   - Replace `getByRole("button", { name: /.../ })` with `locator(SEL.radarProfileButton)` or appropriate SEL selector
   - Keep ARIA-based selectors for accessibility tests (a11y tests should verify ARIA, not rely on it)

### Phase 3: Migrate Remaining Tests
1. Migrate other E2E tests systematically
2. Update selector map if new selectors are needed
3. Document selector naming convention

## Rollback Options

- If data-testid additions break accessibility: Keep ARIA attributes, add data-testid alongside
- If test migrations cause failures: Migrate incrementally, keep old selectors as fallback temporarily
- If selector map becomes unwieldy: Split into domain-specific files (onboarding, radar, chat, etc.)

## Next Steps

1. Add missing data-testid attributes to Radar page
2. Verify selector map has all needed selectors
3. Migrate persona tests first (highest impact)
4. Migrate remaining E2E tests
5. Update documentation with selector naming convention

