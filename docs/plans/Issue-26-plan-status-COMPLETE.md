# Issue #26 - UI/UX Aesthetic Correction: On-Brand Retro-Minimal Design System

**Status**: COMPLETE  
**Branch**: `agent/link/26-remove-callouts-retro`  
**GitHub Issue**: #26  
**Created**: 2025-11-13  
**Last Updated**: 2025-11-13  
**Completed**: 2025-11-13

## Research Summary

**Research Date**: 2025-11-13  
**Researcher**: Scout 🔎  
**Status**: Complete

### Research Question

How can IceBreaker make the UI/UX truly on-brand ("terminal meets Game Boy"), utilize best practices from notable killer apps, yet retain its unique and standout look and feel?

### Constraints

- **Stack**: React + Tailwind CSS, existing brand guidelines
- **Scope**: UI/UX aesthetic correction across onboarding, profile, radar, boot sequence
- **No Backend Changes**: Frontend-only refactoring
- **Accessibility**: Must maintain or improve WCAG AA compliance
- **Testing**: E2E selectors may need updates, visual regression tests required

### Sources & Findings

1. **Brand Guidelines Analysis**: Subtle callouts with `border-border`, `bg-muted/20`, `rounded-md` align with "quiet, clean, and intentional" if accent is reserved for primary actions. Brand principle is about avoiding decorative elements, not functional visual hierarchy.

2. **Best Practices from Notable Apps**: Terminal/CLI apps (VS Code, iTerm) and retro-minimal apps (Linear, Notion) use subtle visual hierarchy (borders, backgrounds) but reserve accent colors for primary actions. Pattern: `border-border`, `bg-muted/20`, `rounded-md` for callouts; accent only for buttons, H1 headings, critical alerts.

3. **Current Implementation Analysis**: 28 files contain `border-accent`, `bg-accent`, or `rounded-xl` patterns. Accent color is overused for non-primary elements (selected states, callouts, borders), creating visual noise.

4. **Accessibility Implications**: Subtle callouts with proper ARIA roles improve accessibility. Using `font-semibold`/`font-bold` instead of accent color for emphasis improves readability.

5. **Whitespace and Visual Hierarchy**: Increased whitespace (`space-y-8`, `p-6`, `mb-6`) aligns with brand principle "let the moment breathe" and improves visual hierarchy.

6. **Icon Usage Analysis**: Decorative icons (Clock, Shield) add noise. Remove decorative icons, keep functional icons (MapPin), use typography for emphasis.

### Recommendations Summary

**Priority 1**: Standardize callout/card patterns - use `border-border`, `bg-muted/20`, `rounded-md` for all callouts/cards; reserve accent for primary buttons, H1 headings, critical alerts.

**Priority 2**: Replace accent usage in selected states - VibeStep, TagsStep, RadarList, PersonCard, Onboarding, AccessibilityToggles, Radar error/info callouts.

**Priority 3**: Increase whitespace - `space-y-6` → `space-y-8`, `p-4` → `p-6`, `mb-4` → `mb-6` across onboarding/profile sections.

**Priority 4**: Remove decorative icons - Clock/Shield icons removed, keep functional icons (MapPin), use typography for emphasis.

**Priority 5**: Create UI patterns documentation - golden examples, do/don't list, lint/preset checks.

### Rollback Options

1. **Git History**: Can restore previous accent usage and callout patterns
2. **Incremental**: Can revert specific components if user feedback indicates issues
3. **Hybrid**: Can keep accent for selected states if user feedback indicates need for stronger visual feedback

**Full research details**: `docs/research/Issue-26-research-v2.md`

## Goals & Success Criteria

- **Target User**: All users (UI/UX aesthetic affects entire app)
- **Problem**: Previous implementation removed callouts entirely, but user feedback indicates subtle, on-brand callouts are needed. Accent color is overused, creating visual noise. Whitespace is insufficient. Decorative icons add clutter.
- **Desired Outcome**:
  - No view has >1 callout; privacy callout is subtle, readable, and emphasized with typography
  - All callouts/cards use `border-border`, `rounded-md`, `bg-muted/20`; accent reserved for buttons/headings/critical alerts
  - Empty states are simplified and consistent across Radar sweep/list
  - Whitespace increases are visible; brand feels retro-minimal without losing clarity
  - WCAG AA passes; e2e/visual tests pass
- **Success Metrics**:
  - ✅ All callouts use `border-border`, `bg-muted/20`, `rounded-md`
  - ✅ Accent color only on primary buttons, H1 headings, critical alerts
  - ✅ Whitespace increased (`space-y-8`, `p-6`, `mb-6`)
  - ✅ Decorative icons removed (Clock, Shield)
  - ✅ ASCII art removed from BootSequence
  - ✅ WCAG AA compliance maintained/improved
  - ✅ E2E tests updated and passing
  - ✅ Visual regression tests passing
  - ✅ UI patterns documentation created

## Out-of-scope

- Backend changes
- New features or components
- Changes to interactive elements beyond styling (buttons, inputs keep existing behavior)
- Changes to Chat or Profile emergency contact beyond styling

## Design Tokens & Utilities Reference

**Source of Truth**: 
- **Tailwind Theme**: `frontend/tailwind.config.js` - `colors.border`, `colors.muted`, `borderRadius.md`, `borderRadius.lg`
- **Global CSS Utilities**: `frontend/src/index.css` - `.glow-accent`, `.pixel-border-bottom`, `.retro-button`
- **Usage Rules**: See Step 0 below

**Token Definitions**:
- `border-border`: `oklch(0.2 0.02 250)` - Subtle navy border for callouts/cards
- `bg-muted/20`: `oklch(0.18 0.02 250 / 0.2)` - Subtle background for callouts/cards
- `rounded-md`: `calc(1rem - 2px)` - Standard corner radius for callouts/cards
- `rounded-2xl`: `1rem` - Reserved for buttons only
- `.glow-accent`: Text shadow effect - Reserved for H1 headings only
- `.pixel-border-bottom`: Pixel-style border - Use sparingly for retro hints
- `.retro-button`: Chunky button style - Reserved for primary CTAs

**Background Selection Rules**:
- `bg-muted/20`: Use for informational callouts (privacy info, empty states, general info)
- `bg-card`: Use for interactive containers (AccessibilityToggles, settings panels)
- `border-destructive`: Use only for true error states (connection errors, critical alerts)

**Focus/Selected State Rules**:
- **Focus rings**: Always use `focus-visible:ring-2 focus-visible:ring-accent` (accent color correct for focus)
- **Selected states**: Use `border-border bg-muted/20` + `font-semibold` (no accent color)
- **Hover states**: 
  - Tiles/cards: `hover:bg-muted/30` (subtle background change)
  - Pills/tags: `hover:border-border/80` (subtle border change)
  - Ensure consistency per component type

**Contrast Guardrails**:
- **Text on `bg-muted/20`**: Must meet WCAG AA contrast ratio (≥ 4.5:1 for body text, ≥ 3:1 for large text)
- **Focus rings**: `ring-accent` must be visible against background (verify contrast)
- **Selected states**: `bg-muted/20` with `text-foreground` must pass contrast checks

## Plan Steps

### Phase 0: Design Tokens & Utilities Foundation

0. **Step 0**: Document Design Tokens & Usage Rules
   - **Owner**: @Link 🌐
   - **Status**: ✅ COMPLETE
   - **Target Date**: Day 1
   - **File Targets**: `docs/ui-tokens.md` (new file), update plan with token reference
   - **Impact**: M
   - **Intent**: Create single source of truth for design tokens. Document where `border-border`, `bg-muted/20`, `rounded-md`, `.glow-accent`, `.pixel-border-bottom`, `.retro-button` live (Tailwind theme vs global CSS). Write 1-pager "Usage Rules" for these tokens with do/don't examples.
   - **Code Anchors**: 
     - Tailwind config: `theme.extend.colors.border`, `theme.extend.colors.muted`, `theme.extend.borderRadius.md`
     - Global CSS: `.glow-accent` class, `.pixel-border-bottom` class, `.retro-button` class
   - **Acceptance**: 
     - Design tokens documented with source locations
     - Usage rules created (1-pager)
     - Do/don't examples included
     - Token reference added to plan
   - **Done When**: ✅ Documentation file created (`docs/ui-tokens.md`), token reference added to plan
   - **Tests**: Documentation review

### Phase 1: Boot Sequence & Core Callouts

1. **Step 1**: Remove ASCII Art from BootSequence
   - **Owner**: @Link 🌐
   - **Status**: ✅ COMPLETE
   - **Target Date**: Day 1
   - **File Targets**: `frontend/src/components/custom/BootSequence.tsx`
   - **Code Anchors**: `{/* ASCII Art with subtle pulse */}` comment block, `<pre>` element with ASCII art
   - **Impact**: S
   - **Intent**: Remove ASCII art block entirely. Keep logo + boot messages. Maintain retro aesthetic through typography and spacing.
   - **Acceptance**: 
     - ASCII art removed
     - Logo and boot messages remain
     - Retro aesthetic maintained through typography
   - **Tests**: Visual regression test (before/after screenshot)

2. **Step 2**: Add Subtle Callout to LocationStep Privacy
   - **Owner**: @Link 🌐
   - **Status**: ✅ COMPLETE
   - **Target Date**: Day 1
   - **File Targets**: `frontend/src/components/onboarding/LocationStep.tsx`
   - **Code Anchors**: Privacy bullet points section (search for "Approximate distance only"), `<div className="space-y-2">` containing privacy bullets
   - **Impact**: M
   - **Intent**: Wrap privacy bullets in subtle callout: `p-3 sm:p-4 bg-muted/20 border-2 border-border rounded-md`. Keep use cases as plain text. Increase section spacing to `space-y-8`.
   - **Acceptance**: 
     - Privacy bullets wrapped in subtle callout with `border-border`, `bg-muted/20`, `rounded-md`
     - Use cases remain plain text
     - Section spacing increased to `space-y-8`
     - Typography emphasis (`font-semibold`) used instead of accent color
     - Contrast ratio validated: `bg-muted/20` + `text-foreground` ≥ 4.5:1
   - **Done When**: PR merged with before/after screenshots, axe results, E2E selector updates (if any)
   - **Tests**: 
     - Visual regression test (before/after screenshot)
     - Accessibility test (screen reader can read content)
     - Component test (LocationStep renders correctly)
     - Contrast ratio test (bg-muted/20 vs text-foreground)

3. **Step 3**: Add Subtle Callouts to Radar Empty States
   - **Owner**: @Link 🌐
   - **Status**: ✅ COMPLETE
   - **Target Date**: Day 1
   - **File Targets**: `frontend/src/components/radar/RadarSweep.tsx`, `frontend/src/components/radar/RadarList.tsx`
   - **Code Anchors**: 
     - RadarSweep: Empty state return block (search for "No one nearby — yet")
     - RadarList: Empty state return block (search for "No one nearby — yet")
   - **Impact**: M
   - **Intent**: Wrap empty state messages in subtle callout: `p-6 sm:p-8 bg-muted/20 border-2 border-border rounded-md max-w-md text-center animate-fade-in`. Keep fade-in animation.
   - **Acceptance**: 
     - Empty state messages wrapped in subtle callout with `border-border`, `bg-muted/20`, `rounded-md`
     - Fade-in animation maintained
     - Consistent styling across RadarSweep and RadarList
   - **Tests**: 
     - Visual regression test (before/after screenshot)
     - Accessibility test (screen reader can read content)
     - Component test (empty states render correctly)

### Phase 2: Standardize Onboarding Callouts

4. **Step 4**: Fix Onboarding "We Are" / "We're Not" Callouts
   - **Owner**: @Link 🌐
   - **Status**: ✅ COMPLETE
   - **Target Date**: Day 2
   - **File Targets**: `frontend/src/pages/Onboarding.tsx`
   - **Code Anchors**: 
     - "We Are" callout: Search for `border-accent/50 rounded-xl bg-accent/5` or "WE ARE" heading
     - "We're Not" callout: Search for `border-muted/50 rounded-xl bg-muted/5` or "WE'RE NOT" heading
   - **Impact**: M
   - **Intent**: Change `border-accent/50 rounded-xl bg-accent/5` → `border-border rounded-md bg-muted/20` for "We Are". Change `border-muted/50 rounded-xl bg-muted/5` → `border-border rounded-md bg-muted/20` for "We're Not".
   - **Acceptance**: 
     - Both callouts use `border-border`, `rounded-md`, `bg-muted/20`
     - Accent color removed from callouts
     - Typography emphasis maintained
   - **Tests**: 
     - Visual regression test (before/after screenshot)
     - Component test (Onboarding renders correctly)

5. **Step 5**: Fix LocationStep Rounded Corners
   - **Owner**: @Link 🌐
   - **Status**: ✅ COMPLETE (no remaining rounded-xl found)
   - **Target Date**: Day 2
   - **File Targets**: `frontend/src/components/onboarding/LocationStep.tsx`
   - **Code Anchors**: Search for `rounded-xl` in callouts/errors (not buttons)
   - **Impact**: S
   - **Intent**: Replace any `rounded-xl` with `rounded-md` for callouts/errors.
   - **Acceptance**: 
     - All callouts/errors use `rounded-md` (not `rounded-xl`)
     - Buttons keep `rounded-2xl` (unchanged)
   - **Tests**: Visual regression test

### Phase 3: Replace Accent Usage in Selected States

6. **Step 6**: Fix VibeStep Selected State
   - **Owner**: @Link 🌐
   - **Status**: ✅ COMPLETE
   - **Target Date**: Day 3
   - **File Targets**: `frontend/src/components/onboarding/VibeStep.tsx`
   - **Code Anchors**: Vibe button selected state className (search for `border-accent bg-accent/10 text-accent`)
   - **Impact**: M
   - **Intent**: Change selected state from `border-accent bg-accent/10 text-accent` → `border-border bg-muted/20`. Use typography (`font-semibold`) for emphasis instead of accent color. **Keep focus states**: `focus-visible:ring-2 focus-visible:ring-accent` (accent correct for focus). **Hover state**: Use `hover:bg-muted/30` (tiles/cards pattern) for discoverability.
   - **Risk Rollback**: If user feedback requests stronger affordances, add feature flag to restore accent color for selected states. Flag: `FEATURE_ACCENT_SELECTED_STATES` (default: false).
   - **Acceptance**: 
     - Selected state uses `border-border`, `bg-muted/20`
     - Typography emphasis (`font-semibold`) used instead of accent color
     - Focus states still use accent (`focus-visible:ring-accent`) - correct
     - Hover state uses `hover:bg-muted/30` (consistent with tiles/cards pattern)
     - Contrast ratio validated: `bg-muted/20` + `text-foreground` ≥ 4.5:1
     - Keyboard navigation works correctly
   - **Done When**: PR merged with before/after screenshots, axe results, E2E selector updates (if any)
   - **Tests**: 
     - Visual regression test (before/after screenshot)
     - Component test (VibeStep selection works correctly)
     - Accessibility test (keyboard navigation works)
     - Contrast ratio test (bg-muted/20 vs text-foreground)

7. **Step 7**: Fix TagsStep Selected State
   - **Owner**: @Link 🌐
   - **Status**: ✅ COMPLETE
   - **Target Date**: Day 3
   - **File Targets**: `frontend/src/components/onboarding/TagsStep.tsx`
   - **Code Anchors**: Tag button selected state className (search for `border-accent bg-accent/10 text-accent`)
   - **Impact**: M
   - **Intent**: Change selected state from `border-accent bg-accent/10 text-accent` → `border-border bg-muted/20`. Use typography (`font-semibold`) for emphasis instead of accent color. **Keep focus states**: `focus-visible:ring-2 focus-visible:ring-accent` (accent correct for focus). **Hover state**: Use `hover:border-border/80` (pills/tags pattern) for discoverability.
   - **Risk Rollback**: If user feedback requests stronger affordances, add feature flag to restore accent color for selected states. Flag: `FEATURE_ACCENT_SELECTED_STATES` (default: false).
   - **Acceptance**: 
     - Selected state uses `border-border`, `bg-muted/20`
     - Typography emphasis (`font-semibold`) used instead of accent color
     - Focus states still use accent (`focus-visible:ring-accent`) - correct
     - Hover state uses `hover:border-border/80` (consistent with pills/tags pattern)
     - Contrast ratio validated: `bg-muted/20` + `text-foreground` ≥ 4.5:1
     - Keyboard navigation works correctly
   - **Done When**: PR merged with before/after screenshots, axe results, E2E selector updates (if any)
   - **Tests**: 
     - Visual regression test (before/after screenshot)
     - Component test (TagsStep selection works correctly)
     - Accessibility test (keyboard navigation works)
     - Contrast ratio test (bg-muted/20 vs text-foreground)

8. **Step 8**: Fix RadarList Selected State
   - **Owner**: @Link 🌐
   - **Status**: ✅ COMPLETE
   - **Target Date**: Day 3
   - **File Targets**: `frontend/src/components/radar/RadarList.tsx`
   - **Code Anchors**: Selected state className (search for `border-accent bg-accent/10`)
   - **Impact**: M
   - **Intent**: Change selected state from `border-accent bg-accent/10` → `border-border bg-muted/20`. Use typography (`font-semibold`) for emphasis instead of accent color. **Keep focus states**: `focus-visible:ring-2 focus-visible:ring-accent` (accent correct for focus). **Hover state**: Use `hover:bg-muted/30` (tiles/cards pattern) for discoverability.
   - **Risk Rollback**: If user feedback requests stronger affordances, add feature flag to restore accent color for selected states. Flag: `FEATURE_ACCENT_SELECTED_STATES` (default: false).
   - **Acceptance**: 
     - Selected state uses `border-border`, `bg-muted/20`
     - Typography emphasis (`font-semibold`) used instead of accent color
     - Focus states still use accent (`focus-visible:ring-accent`) - correct
     - Hover state uses `hover:bg-muted/30` (consistent with tiles/cards pattern)
     - Contrast ratio validated: `bg-muted/20` + `text-foreground` ≥ 4.5:1
     - Keyboard navigation works correctly
   - **Done When**: PR merged with before/after screenshots, axe results, E2E selector updates (if any)
   - **Tests**: 
     - Visual regression test (before/after screenshot)
     - Component test (RadarList selection works correctly)
     - Accessibility test (keyboard navigation works)
     - Contrast ratio test (bg-muted/20 vs text-foreground)

9. **Step 9**: Fix PersonCard Shared Tags
   - **Owner**: @Link 🌐
   - **Status**: ✅ COMPLETE
   - **Target Date**: Day 3
   - **File Targets**: `frontend/src/components/radar/PersonCard.tsx`
   - **Code Anchors**: Shared tag span className (search for `border-accent bg-accent/10 text-accent`)
   - **Impact**: M
   - **Intent**: Change shared tags from `border-accent bg-accent/10 text-accent` → `border-border bg-muted/20`. Use typography (`font-semibold`) for emphasis instead of accent color.
   - **Acceptance**: 
     - Shared tags use `border-border`, `bg-muted/20`
     - Typography emphasis (`font-semibold`) used instead of accent color
   - **Tests**: 
     - Visual regression test (before/after screenshot)
     - Component test (PersonCard renders correctly)

### Phase 4: Fix Accessibility & Error Callouts

10. **Step 10**: Fix AccessibilityToggles Callout
    - **Owner**: @Link 🌐
    - **Status**: ✅ COMPLETE
    - **Target Date**: Day 4
    - **File Targets**: `frontend/src/components/profile/AccessibilityToggles.tsx`
    - **Code Anchors**: Container div className (search for `border-accent/30 rounded-xl`)
    - **Impact**: S
    - **Intent**: Change `border-accent/30 rounded-xl` → `border-border rounded-md`. **Use `bg-card`** (interactive container rule) instead of `bg-muted/20` since this is an interactive settings panel.
    - **Acceptance**: 
      - Callout uses `border-border`, `rounded-md`
      - Background uses `bg-card` (interactive container - correct)
      - Functionality unchanged
    - **Tests**: 
      - Visual regression test (before/after screenshot)
      - Component test (AccessibilityToggles works correctly)
      - Accessibility test (toggles accessible via keyboard)

11. **Step 11**: Fix Radar Error/Info Callouts
    - **Owner**: @Link 🌐
    - **Status**: ✅ COMPLETE
    - **Target Date**: Day 4
    - **File Targets**: `frontend/src/pages/Radar.tsx`
    - **Code Anchors**: 
      - Location error: Search for "Location access denied" or `role="alert"` with location error
      - Connection error: Search for "Connection failed" or `border-destructive`
      - Debug info: Search for debug info div (dev only)
    - **Impact**: M
    - **Intent**: Change error/info callouts from `rounded-xl` → `rounded-md`. **Background rules**: Location error (info) uses `bg-muted/20` (informational callout rule). Connection error (true error) keeps `border-destructive` (critical alert - correct accent usage). Debug info uses `bg-card/50` (dev tool - interactive container rule).
    - **Acceptance**: 
      - Error/info callouts use `rounded-md`
      - Location error uses `border-border`, `bg-muted/20` (informational - correct)
      - Connection error keeps `border-destructive` (true error - correct accent usage)
      - Debug info uses `border-border`, `bg-card/50`, `rounded-md`
    - **Tests**: 
      - Visual regression test (before/after screenshot)
      - Component test (error states render correctly)
      - Accessibility test (error messages accessible)

### Phase 5: Increase Whitespace

12. **Step 12**: Increase Whitespace Across Onboarding/Profile Sections
    - **Owner**: @Link 🌐
    - **Status**: ✅ COMPLETE
    - **Target Date**: Day 5
    - **File Targets**: All onboarding/profile components
    - **Code Anchors**: Search for `space-y-6`, `p-4`, `mb-4` in onboarding/profile sections
    - **Impact**: M
    - **Intent**: Increase whitespace: `space-y-6` → `space-y-8`, `p-4` → `p-6`, `mb-4` → `mb-6` across onboarding/profile sections. Focus on sections with callouts and form elements.
    - **Acceptance**: 
      - Whitespace increased (`space-y-8`, `p-6`, `mb-6`) in onboarding/profile sections
      - Visual hierarchy improved
      - No content pushed below fold on mobile
    - **Tests**: 
      - Visual regression test (before/after screenshot)
      - Mobile responsive test (no content pushed below fold)
      - Component tests (all components render correctly)

### Phase 6: Remove Decorative Icons

13. **Step 13**: Remove Decorative Icons
    - **Owner**: @Link 🌐
    - **Status**: ✅ COMPLETE
    - **Target Date**: Day 5
    - **File Targets**: All components (search for Clock, Shield icons)
    - **Code Anchors**: Search for Clock/Shield icon imports and usage
    - **Impact**: S
    - **Intent**: Remove decorative Clock/Shield icons. Keep functional icons like MapPin. Use typography (`font-semibold`, `font-bold`) for emphasis instead.
    - **Acceptance**: 
      - Decorative Clock/Shield icons removed
      - Functional icons (MapPin) kept
      - Typography emphasis used instead of icons
    - **Tests**: 
      - Visual regression test (before/after screenshot)
      - Component tests (all components render correctly)
      - Accessibility test (no loss of semantic meaning)

### Phase 7: Global Standardization Sweep

14. **Step 14**: Codemod Sweep for Global Pattern Replacement
    - **Owner**: @Link 🌐
    - **Status**: ✅ COMPLETE (2025-11-13, all accent violations fixed: PanicDialog, Tooltip, Radar tertiary buttons, Profile buttons, EmergencyContactInput, RadarSweep canvas, Dialog, DevIndex, Onboarding error callout, BlockDialog, ReportDialog, proximity-context badges, ChatInput. Remaining accent usage is legitimate: primary buttons, H1 headings, focus rings, progress bars)
    - **Target Date**: Day 6
    - **File Targets**: All 28 files with `border-accent`, `bg-accent`, `rounded-xl`
    - **Code Anchors**: Run grep/codemod script to find all instances
    - **Impact**: L
    - **Intent**: Script a grep/codemod for `border-accent`, `bg-accent/(5|10|20)`, `rounded-xl` with a review checklist. Run it after targeted edits to catch stragglers. Systematic replacement:
      - `border-accent/30`, `border-accent/50` → `border-border`
      - `bg-accent/10`, `bg-accent/5`, `bg-accent/20` → `bg-muted/20`
      - `rounded-xl` → `rounded-md` (keep `rounded-2xl` for buttons only)
    - **Review Checklist**:
      - [x] Verify buttons keep `rounded-2xl` (not changed)
      - [x] Verify H1 headings keep `.glow-accent` (not changed)
      - [x] Verify focus rings keep `ring-accent` (not changed)
      - [x] Verify critical alerts keep `border-destructive` (not changed)
      - [x] Manual review of each file change
    - **Acceptance**: 
      - All accent usage replaced with neutral borders/backgrounds
      - Accent reserved for primary buttons, H1 headings, critical alerts only
      - Buttons keep `rounded-2xl` (unchanged)
    - **Done When**: Codemod script run, review checklist complete, PR merged with summary of changes
    - **Tests**: 
      - Visual regression test (before/after screenshots for all affected components)
      - Component tests (all components render correctly)
      - Accessibility test (no regressions)

### Phase 8: Testing & Verification

15. **Step 15**: Update E2E Test Selectors
    - **Owner**: @Pixel 🖥️
    - **Status**: ✅ COMPLETE
    - **Completed**: 2025-11-13
    - **Target Date**: Day 7
    - **File Targets**: E2E test files
    - **Code Anchors**: E2E tests that target callouts/empty states (search for class-based selectors)
    - **Impact**: M
    - **Intent**: Update selectors if DOM for callouts/empty states changed. **Switch to roles/text where callouts/empty states changed**. Prefer `role="status"`, `role="alert"`, or text content over class names for stability.
    - **Acceptance**: 
      - E2E tests updated with new selectors
      - Tests use roles/text where possible
      - All E2E tests passing
    - **Tests**: Run full E2E test suite

16. **Step 16**: Accessibility Verification
    - **Owner**: @Pixel 🖥️
    - **Status**: ✅ COMPLETE
    - **Completed**: 2025-11-13
    - **Target Date**: Day 7
    - **File Targets**: All modified components
    - **Impact**: M
    - **Intent**: Run axe/Lighthouse; verify contrast and focus rings still pass WCAG AA. **Explicitly verify focus ring contrast and keyboard order on Onboarding/Radar**. Ensure subtle callouts maintain accessibility. **Add axe checks for modified components**. **Contrast guardrails**: Validate `bg-muted/20` vs text meets ≥ 4.5:1 (body) / ≥ 3:1 (large text).
    - **Acceptance**: 
      - WCAG AA compliance maintained/improved
      - Contrast ratios pass: `bg-muted/20` + `text-foreground` ≥ 4.5:1 (body), ≥ 3:1 (large text)
      - Focus rings visible and accessible (verify `ring-accent` contrast)
      - Keyboard order correct on Onboarding/Radar
      - Screen reader experience improved
      - axe checks pass for all modified components
    - **Tests**: 
      - axe accessibility test (all modified components)
      - Lighthouse accessibility audit
      - Focus ring contrast verification
      - Keyboard navigation test (Onboarding/Radar)
      - Screen reader test (NVDA/JAWS)

17. **Step 17**: Visual Regression Testing & Golden Screens
    - **Owner**: @Pixel 🖥️
    - **Status**: ✅ COMPLETE
    - **Completed**: 2025-11-13
    - **Target Date**: Day 7
    - **File Targets**: All modified components
    - **Impact**: M
    - **Intent**: Capture before/after screenshots for LocationStep, Chat empty, Profile emergency, Radar empty states, Onboarding callouts, selected states. **Snapshot the five "Golden Screens"**: Welcome, Onboarding Step 0-3, Radar empty, Chat empty, Profile. Verify changes are perceptible and on-brand. **Require screenshots before merge**.
    - **Golden Screens Checklist**:
      - [x] Welcome screen
      - [x] Onboarding Step 0 (Consent)
      - [x] Onboarding Step 1 (Location)
      - [x] Onboarding Step 2 (Vibe)
      - [x] Onboarding Step 3 (Tags)
      - [x] Radar empty state
      - [x] Chat empty state
      - [x] Profile screen
    - **Acceptance**: 
      - Before/after screenshots captured for all changed areas
      - Golden Screens checklist complete
      - Changes are perceptible and on-brand
      - Visual regression tests passing
      - Screenshots attached to PR/issue
    - **Tests**: 
      - Visual regression test suite
      - Golden Screens snapshot comparison
      - Manual visual review

18. **Step 18**: Mobile Responsive Verification
    - **Owner**: @Pixel 🖥️
    - **Status**: ✅ COMPLETE
    - **Completed**: 2025-11-13
    - **Target Date**: Day 7
    - **File Targets**: All modified components
    - **Impact**: S
    - **Intent**: Validate spacing on small screens (no content pushed below fold). **Validate that `space-y-8`/`p-6` doesn't push primary actions below the fold on small screens**. Ensure callouts are readable on mobile.
    - **Acceptance**: 
      - No content pushed below fold on mobile
      - Primary actions remain accessible on small screens
      - Callouts readable on small screens
      - Whitespace appropriate for mobile
    - **Tests**: 
      - Mobile responsive test (various screen sizes: 320px, 375px, 414px)
      - Primary action visibility test (no actions below fold)
      - Touch target size verification

19. **Step 19**: Regression Testing
    - **Owner**: @Pixel 🖥️
    - **Status**: ✅ COMPLETE
    - **Completed**: 2025-11-13
    - **Target Date**: Day 8
    - **File Targets**: All components
    - **Impact**: M
    - **Intent**: Ensure `glow-accent` appears only on H1, accent only on primary CTAs (`.retro-button`). Verify no regressions in functionality. **Verify focus states remain visible and pass WCAG AA across modified components**.
    - **Acceptance**: 
      - `glow-accent` only on H1 headings (verify with grep)
      - Accent only on `.retro-button` (primary CTAs), H1 headings, critical alerts
      - Focus states remain visible and pass WCAG AA
      - No functionality regressions
    - **Tests**: 
      - Full test suite (unit, integration, E2E)
      - Focus state visibility test
      - Accent usage grep verification
      - Manual regression testing

### Phase 9: Documentation & Governance

20. **Step 20**: Create UI Patterns Documentation
    - **Owner**: @Muse 🎨
    - **Status**: ✅ COMPLETE
    - **Target Date**: Day 8
    - **File Targets**: `docs/ui-patterns.md` (new file)
    - **Impact**: M
    - **Intent**: Add short "UI patterns" doc with golden examples (retro callout, empty state, card) and a "do/don't" list. Reference brand guidelines and design tokens. Include code examples for each pattern.
    - **Acceptance**: 
      - UI patterns documentation created
      - Golden examples included (retro callout, empty state, card)
      - Do/don't list included
      - Aligned with brand guidelines
    - **Tests**: Documentation review

21. **Step 21**: Add Lint/Preset Check
    - **Owner**: @Nexus 🚀
    - **Status**: ✅ COMPLETE
    - **Target Date**: Day 9
    - **File Targets**: ESLint config, Tailwind config
    - **Impact**: M
    - **Intent**: Add lint/preset check to disallow `border-accent`, `bg-accent/*`, `rounded-xl` outside whitelisted components (`.retro-button`, H1 with `.glow-accent`, critical alerts with `border-destructive`). **Tokens enforced**: linter forbids accent misuse.
    - **Acceptance**: 
      - Lint/preset check added
      - Prevents future accent misuse
      - Whitelist for `.retro-button`, H1 headings, critical alerts
      - CI runs lint check on every commit
    - **Tests**: 
      - Lint check runs in CI
      - Test with invalid usage (should fail)
      - Test with whitelisted usage (should pass)

22. **Step 22**: Add Visual Snapshot CI Gates
    - **Owner**: @Nexus 🚀
    - **Status**: ✅ COMPLETE
    - **Target Date**: Day 9
    - **File Targets**: CI config (`.github/workflows/`)
    - **Impact**: M
    - **Intent**: Add visual snapshots for the five "Golden Screens" (Welcome, Onboarding Step 0-3, Radar empty, Chat empty, Profile); CI gates on snapshot diffs + a11y. **Block on diffs**: Require approval for visual changes.
    - **Acceptance**: 
      - Visual snapshot tests added (Golden Screens)
      - CI gates on snapshot diffs (blocks merge on unexpected changes)
      - CI gates on a11y tests (blocks merge on a11y regressions)
      - Approval workflow for intentional visual changes
    - **Tests**: 
      - CI pipeline runs visual snapshots
      - CI pipeline runs a11y tests
      - Test with visual diff (should block merge)
      - Test with a11y regression (should block merge)

## Current Status

**Overall Status**: COMPLETE - ALL STEPS FINISHED, ALL VERIFICATION PASSED

**Last Updated**: 2025-11-13  
**Completed**: 2025-11-13  
**Completed By**: Link 🌐 (implementation), Nexus 🚀 (governance), Pixel 🖥️ (testing)

### Implementation Summary

**Completed Phases (Steps 0-22):**
- ✅ Phase 0: Design Tokens & Utilities Foundation
- ✅ Phase 1: Boot Sequence & Core Callouts
- ✅ Phase 2: Standardize Onboarding Callouts
- ✅ Phase 3: Replace Accent Usage in Selected States
- ✅ Phase 4: Fix Accessibility & Error Callouts
- ✅ Phase 5: Increase Whitespace
- ✅ Phase 6: Remove Decorative Icons
- ✅ Phase 7: Global Standardization Sweep
- ✅ Phase 8: Testing & Verification (Steps 15-19) - **COMPLETE**
- ✅ Phase 9: Documentation & Governance (Steps 20-22) - **COMPLETE**

### Step Completion

- ✅ **Step 0**: Document Design Tokens & Usage Rules - **COMPLETE** (2025-11-13)
- ✅ **Step 1**: Remove ASCII Art from BootSequence - **COMPLETE** (2025-11-13)
- ✅ **Step 2**: Add Subtle Callout to LocationStep Privacy - **COMPLETE** (2025-11-13)
- ✅ **Step 3**: Add Subtle Callouts to Radar Empty States - **COMPLETE** (2025-11-13)
- ✅ **Step 4**: Fix Onboarding "We Are" / "We're Not" Callouts - **COMPLETE** (2025-11-13)
- ✅ **Step 5**: Fix LocationStep Rounded Corners - **COMPLETE** (2025-11-13, no remaining rounded-xl)
- ✅ **Step 6**: Fix VibeStep Selected State - **COMPLETE** (2025-11-13)
- ✅ **Step 7**: Fix TagsStep Selected State - **COMPLETE** (2025-11-13)
- ✅ **Step 8**: Fix RadarList Selected State (shared tags) - **COMPLETE** (2025-11-13)
- ✅ **Step 9**: Fix PersonCard Shared Tags - **COMPLETE** (2025-11-13)
- ✅ **Step 10**: Fix AccessibilityToggles Callout - **COMPLETE** (2025-11-13)
- ✅ **Step 11**: Fix Radar Error/Info Callouts - **COMPLETE** (2025-11-13)
- ✅ **Step 12**: Increase Whitespace - **COMPLETE** (2025-11-13)
- ✅ **Step 13**: Remove Decorative Icons - **COMPLETE** (2025-11-13)
- ✅ **Step 14**: Codemod Sweep - **COMPLETE** (2025-11-13, all accent violations fixed: PanicDialog, Tooltip, Radar tertiary buttons, Profile buttons, EmergencyContactInput, RadarSweep canvas, Dialog, DevIndex, Onboarding error callout, BlockDialog, ReportDialog, proximity-context badges, ChatInput. Remaining accent usage is legitimate: primary buttons, H1 headings, focus rings, progress bars)
- ✅ **Step 20**: UI Patterns Documentation - **COMPLETE** (2025-11-13, docs/ui-patterns.md created)
- ✅ **Step 21**: Lint/Preset Guard - **COMPLETE** (2025-11-13, tools/check-ui-tokens.mjs created with precise whitelist logic, npm run check:ui-tokens added, verified working - catches violations correctly)
- ✅ **Step 22**: Visual Snapshot + A11y Gates - **COMPLETE** (2025-11-13, CI workflow updated with `ui-visual-a11y` job, `golden-screens.spec.ts` created with all 8 Golden Screens)
- ✅ **Steps 15-19**: Testing & Verification - **COMPLETE** (2025-11-13, all tests passing, verification complete)

## Implementation Summary

### Files Modified (Steps 0-22)

**Design Tokens & Documentation:**
- ✅ `docs/ui-tokens.md` (created) - Design tokens reference
- ✅ `Docs/plans/Issue-26-plan-status-COMPLETE.md` (this file)

**Components Updated:**
- ✅ `frontend/src/components/custom/BootSequence.tsx` - Removed ASCII art
- ✅ `frontend/src/components/onboarding/LocationStep.tsx` - Added subtle callout, increased whitespace
- ✅ `frontend/src/components/onboarding/ConsentStep.tsx` - Increased whitespace
- ✅ `frontend/src/components/onboarding/VibeStep.tsx` - Fixed selected state, increased whitespace
- ✅ `frontend/src/components/onboarding/TagsStep.tsx` - Fixed selected state, increased whitespace
- ✅ `frontend/src/pages/Onboarding.tsx` - Fixed "We Are" / "We're Not" callouts
- ✅ `frontend/src/components/radar/RadarSweep.tsx` - Added subtle callout to empty state
- ✅ `frontend/src/components/radar/RadarList.tsx` - Added subtle callout, fixed shared tags
- ✅ `frontend/src/components/radar/PersonCard.tsx` - Fixed shared tags, removed Clock icon, fixed menu hover
- ✅ `frontend/src/pages/Radar.tsx` - Fixed error/info callouts
- ✅ `frontend/src/components/profile/AccessibilityToggles.tsx` - Fixed callout styling
- ✅ `frontend/src/pages/Profile.tsx` - Increased whitespace
- ✅ `frontend/src/components/chat/ChatHeader.tsx` - Fixed menu hover states
- ✅ `frontend/src/components/safety/ReportDialog.tsx` - Fixed selected state
- ✅ `frontend/src/components/panic/PanicDialog.tsx` - Fixed accent violations (uses destructive for emergency, accent for primary button)
- ✅ `frontend/src/components/ui/tooltip.tsx` - Fixed accent violations (neutral styling)
- ✅ `frontend/src/pages/Radar.tsx` - Fixed tertiary button accent violation
- ✅ `frontend/src/components/safety/BlockDialog.tsx` - Fixed accent violations (uses destructive for icon/container, neutral for title/cancel button, accent only for primary "Block" button)
- ✅ `frontend/src/components/safety/ReportDialog.tsx` - Fixed accent violations (uses destructive for icon/container, neutral for title/cancel button, accent only for primary "Submit Report" button)
- ✅ `frontend/src/lib/proximity-context.ts` - Fixed proximity badge accent violations (uses neutral borders/backgrounds with typography for emphasis)
- ✅ `frontend/src/components/profile/EmergencyContactInput.tsx` - Fixed hover state accent violation
- ✅ `frontend/src/components/chat/ChatInput.tsx` - Fixed input border accent violation (uses `border-border`, focus ring keeps `ring-accent` - correct)
- ✅ `docs/ui-patterns.md` (created) - UI patterns reference guide
- ✅ `tools/check-ui-tokens.mjs` (created) - Token enforcement script (verified working)
- ✅ `.github/workflows/ci.yml` (updated) - Added UI token check and visual/a11y gates
- ✅ `tests/e2e/visual/golden-screens.spec.ts` (created) - Golden Screens test file with all 8 screens

### Key Changes Applied

1. **Design Tokens Standardized:**
   - All callouts use `border-border`, `bg-muted/20`, `rounded-md`
   - Accent color reserved for primary buttons, H1 headings, critical alerts
   - Focus rings use `ring-accent` (correct usage)

2. **Selected States:**
   - Changed from `border-accent bg-accent/10 text-accent` → `border-border bg-muted/20 font-semibold`
   - Added hover states: `hover:bg-muted/30` (tiles), `hover:border-border/80` (pills)

3. **Whitespace Increased:**
   - `space-y-6` → `space-y-8`
   - `p-4` → `p-6` (where appropriate)
   - `mb-4` → `mb-6`

4. **Icons:**
   - Removed decorative Clock icon from PersonCard cooldown button
   - Kept functional icons (MapPin for location)

5. **Callouts:**
   - All callouts use subtle styling: `p-3 sm:p-4 bg-muted/20 border-2 border-border rounded-md`
   - Error states use `border-destructive` (correct)
   - Informational states use `bg-muted/20` (correct)

## Current Issues

_No blockers. All work complete and verified._

## Acceptance Tests

- [x] All callouts use `border-border`, `bg-muted/20`, `rounded-md`
- [x] Accent color only on `.retro-button` (primary CTAs), H1 headings (`.glow-accent`), critical alerts (`border-destructive`)
- [x] Focus states remain visible and pass WCAG AA across modified components
- [x] Focus rings use `ring-accent` (correct - accent reserved for focus)
- [x] Selected states use `border-border`, `bg-muted/20` + `font-semibold` (no accent)
- [x] Hover states remain discoverable (subtle border/background changes)
- [x] Whitespace increased (`space-y-8`, `p-6`, `mb-6`)
- [x] Decorative icons removed (Clock, Shield)
- [x] ASCII art removed from BootSequence
- [x] No view has >1 callout; privacy callout is subtle, readable, and emphasized with typography
- [x] Empty states are simplified and consistent across Radar sweep/list
- [x] Background selection rules followed: `bg-muted/20` for info callouts, `bg-card` for interactive containers
- [x] WCAG AA compliance maintained/improved
- [x] E2E tests updated and passing (selectors use roles/text)
- [x] Visual regression tests passing (Golden Screens checklist complete)
- [x] UI patterns documentation created
- [x] Design tokens documented
- [x] Lint/preset checks prevent future accent misuse
- [x] Tokens enforced: linter forbids `border-accent`, `bg-accent/*`, `rounded-xl` outside whitelist
- [x] Contrast guardrails validated: `bg-muted/20` + `text-foreground` ≥ 4.5:1 (body), ≥ 3:1 (large text)
- [x] Hover states consistent per component type (tiles: `hover:bg-muted/30`, pills: `hover:border-border/80`)

## Team Review

**Review Date**: 2025-11-13  
**Status**: APPROVED

### Review Summary

_Team review complete. All agents approved plan. Implementation completed successfully._

### Team Approval

_Approved by team. Implementation complete._

## Final Issue Summary

**Issue**: #26 - UI/UX Aesthetic Correction: On-Brand Retro-Minimal Design System  
**Status**: COMPLETE  
**Completion Date**: 2025-11-13  
**Branch**: `agent/link/26-remove-callouts-retro`  
**Commit**: `9f22233` (latest commit on branch)

### Verification Results

**All acceptance tests passed:**
- ✅ All callouts use `border-border`, `bg-muted/20`, `rounded-md`
- ✅ Accent color reserved for primary buttons, H1 headings, critical alerts only
- ✅ WCAG AA compliance maintained/improved
- ✅ E2E tests updated and passing
- ✅ Visual regression tests passing (Golden Screens complete)
- ✅ UI patterns documentation created
- ✅ Lint/preset checks prevent future accent misuse
- ✅ CI gates for visual snapshots + a11y implemented

### Files Created/Modified

**Documentation:**
- `docs/ui-tokens.md` - Design tokens reference
- `docs/ui-patterns.md` - UI patterns guide
- `tools/check-ui-tokens.mjs` - Token enforcement script

**Components Updated:**
- BootSequence, LocationStep, ConsentStep, VibeStep, TagsStep
- Onboarding, RadarSweep, RadarList, PersonCard, Radar
- AccessibilityToggles, Profile, ChatHeader
- PanicDialog, BlockDialog, ReportDialog, Tooltip
- EmergencyContactInput, ChatInput, proximity-context

**Testing & CI:**
- `tests/e2e/visual/golden-screens.spec.ts` - Golden Screens test
- `.github/workflows/ci.yml` - UI visual/a11y gates

### Next Steps

Issue #26 is complete. All UI/UX aesthetic corrections implemented, tested, and verified. Design system now fully on-brand with retro-minimal aesthetic.

