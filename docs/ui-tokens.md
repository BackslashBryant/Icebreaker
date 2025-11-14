# UI Design Tokens & Usage Rules

**Last Updated**: 2025-11-13  
**Purpose**: Single source of truth for design tokens used in IceBreaker UI. Ensures consistent, on-brand styling across all components.

## Token Source Locations

### Tailwind Theme (`frontend/tailwind.config.js`)

**Colors**:
- `border`: `oklch(0.2 0.02 250)` - Subtle navy border for callouts/cards
- `muted`: `oklch(0.18 0.02 250)` - Muted navy background
- `accent`: `oklch(0.7 0.12 195)` - Neon teal (reserved for primary actions)
- `destructive`: `oklch(0.577 0.245 27.325)` - Error/critical alert color

**Border Radius**:
- `md`: `calc(1rem - 2px)` - Standard corner radius for callouts/cards
- `lg`: `1rem` - Reserved for buttons only (via `rounded-2xl`)

### Global CSS Utilities (`frontend/src/index.css`)

**Classes**:
- `.glow-accent` - Text shadow effect (reserved for H1 headings only)
- `.pixel-border-bottom` - Pixel-style border (use sparingly for retro hints)
- `.retro-button` - Chunky button style (reserved for primary CTAs)

## Usage Rules

### Callouts & Cards

**✅ DO**:
- Use `border-border` for all callout/card borders
- Use `bg-muted/20` for informational callouts (privacy info, empty states, general info)
- Use `bg-card` for interactive containers (AccessibilityToggles, settings panels)
- Use `rounded-md` for all callouts/cards
- Use `border-destructive` only for true error states (connection errors, critical alerts)

**❌ DON'T**:
- Don't use `border-accent` for callouts/cards
- Don't use `bg-accent/*` for callouts/cards
- Don't use `rounded-xl` for callouts/cards (use `rounded-md`)
- Don't use accent color for non-primary elements

### Primary Actions & Headings

**✅ DO**:
- Use `.retro-button` for primary CTAs only
- Use `.glow-accent` for H1 headings only
- Use `ring-accent` for focus rings (correct - accent reserved for focus)
- Use `border-destructive` for critical alerts only

**❌ DON'T**:
- Don't use accent color for selected states
- Don't use accent color for hover states
- Don't use `.glow-accent` on non-H1 headings

### Selected States

**✅ DO**:
- Use `border-border bg-muted/20` for selected states
- Use `font-semibold` or `font-bold` for emphasis (typography, not color)
- Use `hover:bg-muted/30` for tiles/cards hover states
- Use `hover:border-border/80` for pills/tags hover states
- Keep focus rings: `focus-visible:ring-2 focus-visible:ring-accent` (accent correct for focus)

**❌ DON'T**:
- Don't use `border-accent` for selected states
- Don't use `bg-accent/*` for selected states
- Don't use `text-accent` for selected states

### Contrast Guardrails

**✅ DO**:
- Validate `bg-muted/20` + `text-foreground` meets WCAG AA:
  - ≥ 4.5:1 for body text
  - ≥ 3:1 for large text (18pt+ or 14pt+ bold)
- Verify `ring-accent` is visible against background
- Test contrast ratios before committing

**❌ DON'T**:
- Don't assume contrast ratios - always validate
- Don't use low-opacity backgrounds without contrast testing

## Examples

### ✅ Good: Subtle Callout

```tsx
<div className="p-3 sm:p-4 bg-muted/20 border-2 border-border rounded-md">
  <p className="font-semibold text-foreground">Privacy info</p>
  <p className="text-muted-foreground">Approximate location only.</p>
</div>
```

### ❌ Bad: Accent Callout

```tsx
<div className="p-3 sm:p-4 bg-accent/10 border-2 border-accent rounded-xl">
  <p className="text-accent">Privacy info</p>
</div>
```

### ✅ Good: Selected State

```tsx
<button
  className={`border-2 rounded-md ${
    isSelected
      ? "border-border bg-muted/20 font-semibold"
      : "border-muted/50 hover:bg-muted/30"
  }`}
>
  Option
</button>
```

### ❌ Bad: Accent Selected State

```tsx
<button
  className={`border-2 rounded-md ${
    isSelected
      ? "border-accent bg-accent/10 text-accent"
      : "border-muted/50"
  }`}
>
  Option
</button>
```

### ✅ Good: Primary Button

```tsx
<button className="retro-button bg-accent text-accent-foreground rounded-2xl">
  Continue
</button>
```

### ✅ Good: H1 Heading

```tsx
<h1 className="glow-accent text-accent font-mono">WELCOME</h1>
```

## Enforcement

- **Lint preset**: Blocks `border-accent`, `bg-accent/*`, `rounded-xl` outside whitelist
- **CI gates**: Visual snapshots and a11y tests enforce token usage
- **Code review**: Verify token usage matches these rules

## Rollback

If user feedback requests stronger affordances:
- Feature flag: `FEATURE_ACCENT_SELECTED_STATES` (default: false)
- Can restore accent color for selected states if needed
- Document decision in plan-status file

## Related Documentation

- Brand Guidelines: `Docs/Vision/IceBreaker — Brand & UI Ethos.txt`
- UI Patterns: `docs/ui-patterns.md` (to be created in Step 20)
- Plan: `Docs/plans/Issue-26-plan-status-IN-PROGRESS-v2.md`

