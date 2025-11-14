# UI Patterns: Golden Examples & Do/Don't Guide

**Last Updated**: 2025-11-13  
**Purpose**: Reference guide for implementing on-brand UI patterns. Shows correct usage with examples and common mistakes to avoid.

## Design Philosophy

**"Terminal meets Game Boy"** aesthetic:
- Fewer callouts, sharper corners
- Neutral borders/backgrounds
- Accent reserved for primary actions/headings
- More whitespace
- No decorative icons
- Typography for emphasis, not color

## Pattern 1: Subtle Callouts

### ✅ DO: Subtle Informational Callout

```tsx
<div className="p-3 sm:p-4 bg-muted/20 border-2 border-border rounded-md">
  <p className="text-xs font-mono text-muted-foreground leading-relaxed">
    → Approximate distance only
    <br />→ No background tracking
    <br />→ Session-based only
  </p>
</div>
```

**When to use**: Privacy info, empty states, general informational content.

### ❌ DON'T: Accent Callout

```tsx
// ❌ BAD: Using accent for non-primary elements
<div className="p-3 sm:p-4 bg-accent/10 border-2 border-accent rounded-xl">
  <p className="text-accent">Privacy info</p>
</div>
```

**Why it's wrong**: Accent should be reserved for primary CTAs, H1 headings, and critical alerts only.

## Pattern 2: Empty States

### ✅ DO: Subtle Empty State Callout

```tsx
<div className="p-6 sm:p-8 bg-muted/20 border-2 border-border rounded-md max-w-md text-center animate-fade-in">
  <p className="text-foreground text-sm sm:text-base font-mono font-semibold">
    No one nearby — yet.
  </p>
  <p className="text-muted-foreground text-xs sm:text-sm font-mono leading-relaxed mt-2">
    Check back soon or enable location for better matching.
  </p>
</div>
```

**When to use**: Empty states in Radar, Chat, or other list views.

### ❌ DON'T: Accent Empty State

```tsx
// ❌ BAD: Accent styling for empty state
<div className="p-6 bg-accent/10 border-2 border-accent/50 rounded-xl text-center">
  <p className="text-accent">No results</p>
</div>
```

## Pattern 3: Selected States

### ✅ DO: Neutral Selected State with Typography

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

**When to use**: Vibe selection, tag selection, category selection, shared tags.

**Key points**:
- Use `border-border bg-muted/20` for selected
- Use `font-semibold` for emphasis (typography, not color)
- Keep focus rings: `focus-visible:ring-2 focus-visible:ring-accent` (accent correct for focus)

### ❌ DON'T: Accent Selected State

```tsx
// ❌ BAD: Accent for selected state
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

## Pattern 4: Primary Buttons

### ✅ DO: Primary CTA with Accent

```tsx
<button className="retro-button bg-accent text-accent-foreground rounded-2xl">
  Continue
</button>
```

**When to use**: Primary actions only (Continue, Submit, Enable Location, etc.).

**Key points**:
- Use `.retro-button` class for chunky style
- Use `bg-accent` for primary actions
- Use `rounded-2xl` for buttons (not `rounded-md`)

### ❌ DON'T: Accent for Secondary/Tertiary Buttons

```tsx
// ❌ BAD: Accent for non-primary button
<button className="border-2 border-accent/50 text-accent hover:bg-accent/10">
  Cancel
</button>

// ✅ GOOD: Neutral for secondary/tertiary
<button className="border-2 border-border text-foreground hover:bg-muted/30">
  Cancel
</button>
```

## Pattern 5: Headings

### ✅ DO: H1 with Accent Glow

```tsx
<h1 className="text-2xl font-bold text-accent font-mono glow-accent">
  WELCOME
</h1>
```

**When to use**: Top-level headings (H1) only.

**Key points**:
- Use `.glow-accent` for H1 headings
- Use `text-accent` for H1
- Lower-level headings (H2, H3) should use `text-foreground` or `text-muted-foreground`

### ❌ DON'T: Accent for Non-H1 Headings

```tsx
// ❌ BAD: Accent for H2/H3
<h2 className="text-accent glow-accent">Section Title</h2>

// ✅ GOOD: Neutral for H2/H3
<h2 className="text-foreground font-bold">Section Title</h2>
```

## Pattern 6: Error States

### ✅ DO: Destructive for True Errors

```tsx
<div className="p-3 border-2 border-destructive rounded-md bg-destructive/10">
  <p className="text-xs text-destructive font-mono">Connection failed</p>
</div>
```

**When to use**: True error states (connection errors, critical failures).

### ✅ DO: Neutral for Informational Warnings

```tsx
<div className="p-4 border-2 border-border rounded-md bg-muted/20">
  <p className="font-semibold mb-1">Location access denied</p>
  <p className="text-xs text-muted-foreground">
    Proximity matching is unavailable.
  </p>
</div>
```

**When to use**: Informational warnings that aren't critical errors.

### ❌ DON'T: Accent for Errors

```tsx
// ❌ BAD: Accent for error state
<div className="p-3 border-2 border-accent/50 rounded-xl bg-accent/5">
  <p className="text-accent">Error message</p>
</div>
```

## Pattern 7: Interactive Containers

### ✅ DO: bg-card for Interactive Settings

```tsx
<div className="p-3 sm:p-4 border-2 border-border rounded-md bg-card space-y-4">
  {/* Settings toggles */}
</div>
```

**When to use**: Interactive containers (AccessibilityToggles, settings panels, forms).

**Key points**:
- Use `bg-card` for interactive containers
- Use `bg-muted/20` for informational callouts

### ❌ DON'T: Accent for Settings Containers

```tsx
// ❌ BAD: Accent border for settings
<div className="p-4 border-2 border-accent/30 rounded-xl bg-card">
  {/* Settings */}
</div>
```

## Pattern 8: Hover States

### ✅ DO: Subtle Hover for Discoverability

```tsx
// Tiles/Cards
<button className="border-2 border-muted/50 hover:bg-muted/30">
  Option
</button>

// Pills/Tags
<button className="border-2 border-muted/50 hover:border-border/80">
  Tag
</button>
```

**Key points**:
- Tiles/cards: `hover:bg-muted/30`
- Pills/tags: `hover:border-border/80`
- Keep hover states discoverable but subtle

### ❌ DON'T: Accent Hover for Non-Primary Elements

```tsx
// ❌ BAD: Accent hover for secondary elements
<button className="border-2 border-muted/50 hover:border-accent/50 hover:bg-accent/10">
  Option
</button>
```

## Pattern 9: Focus States

### ✅ DO: Accent Focus Ring (Correct Usage)

```tsx
<button className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-opacity-100">
  Button
</button>
```

**Key points**:
- Focus rings use `ring-accent` (correct - accent reserved for focus)
- Always include focus states for accessibility
- Verify focus ring contrast meets WCAG AA

## Pattern 10: Whitespace

### ✅ DO: Generous Whitespace

```tsx
<div className="space-y-8">
  <section className="space-y-6">
    {/* Content */}
  </section>
</div>
```

**Key points**:
- Use `space-y-8` for major sections
- Use `p-6` for callouts (not `p-4`)
- Use `mb-6` for spacing (not `mb-4`)

### ❌ DON'T: Tight Spacing

```tsx
// ❌ BAD: Too tight
<div className="space-y-4">
  <section className="p-4">
    {/* Content */}
  </section>
</div>
```

## Pattern 11: Icons

### ✅ DO: Functional Icons Only

```tsx
<MapPin className="w-6 h-6 text-muted-foreground" />
```

**When to use**: Functional icons that convey meaning (MapPin for location, Info for tooltips).

### ❌ DON'T: Decorative Icons

```tsx
// ❌ BAD: Decorative Clock icon
<Clock className="h-4 w-4" />
Cooldown active

// ✅ GOOD: Typography only
Cooldown active
```

## Quick Reference: Token Usage

| Element | Border | Background | Radius | Accent? |
|---------|--------|------------|--------|---------|
| Callout (info) | `border-border` | `bg-muted/20` | `rounded-md` | ❌ |
| Callout (error) | `border-destructive` | `bg-destructive/10` | `rounded-md` | ❌ |
| Selected state | `border-border` | `bg-muted/20` | `rounded-md` | ❌ |
| Primary button | `border-accent` | `bg-accent` | `rounded-2xl` | ✅ |
| H1 heading | N/A | N/A | N/A | ✅ (`.glow-accent`) |
| Focus ring | N/A | N/A | N/A | ✅ (`ring-accent`) |
| Critical alert | `border-destructive` | `bg-destructive/10` | `rounded-md` | ❌ (use destructive) |

## Enforcement

- **Lint preset**: Blocks `border-accent`, `bg-accent/*`, `rounded-xl` outside whitelist
- **CI gates**: Visual snapshots and a11y tests enforce token usage
- **Code review**: Verify token usage matches these patterns

## Related Documentation

- Design Tokens: `docs/ui-tokens.md`
- Plan: `Docs/plans/Issue-26-plan-status-IN-PROGRESS-v2.md`
- Brand Guidelines: `Docs/Vision/IceBreaker — Brand & UI Ethos.txt`

