# Foundations

Tokens are the source of truth for every color, dimension, and duration in
screen code. They live in `@ponti-studios/ui` as DTCG token files, generated
into CSS custom properties and TypeScript constants. Hardcoding a value below
in route or screen code is a review failure.

The token system is exhaustive: if a token is not listed here, it does not
exist in `@ponti-studios/ui`. New tokens require a DTCG source change in the
package and a documented reason.

## Ceremony budget

Hierarchy comes from **typography and whitespace first**. Color, borders,
radius, and containers support hierarchy when type and space alone cannot
carry the distinction. Before adding a background, a heavier border, or a
larger radius, ask: _can a bigger gap or a heavier type token say this
instead?_ If yes, that is the answer.

This means:

- Cards and panels exist as named components with defined uses. They are
  not a default wrapper for every section of content.
- Borders use `--border-default`. Divider lines between list rows remain a
  rare, named exception — not a habit.
- Radius is chosen from a fixed scale. Components pick from the scale
  consistently; a component never invents an ad-hoc value.
- Color hierarchy within text defaults to `--text-primary` /
  `--text-secondary` / `--tertiary`. Additional hues communicate state
  (success, warning, destructive) or category (chart colors), never
  arbitrary decoration.

The system has four layers:

1. **Foundations** — the token set (color, spacing, radius, type, elevation,
   iconography, motion).
2. **Primitives** — the component set, each with a fixed contract (variants,
   sizes, states).
3. **Patterns** — how primitives compose into screens.
4. **Review gates** — the pass/fail check applied before anything ships.

---

## Color

### Semantic tokens

All color values are CSS custom properties with light and dark variants.
Screen code references the token name, never a hex value.

- `--background` — Page background. Every screen, row, and input sits on it.
- `--card` — Card and surface container background.
- `--popover` — Popover, dropdown, and overlay panel background.
- `--muted` — Muted and disabled control background.
- `--text-primary` — Primary reading text. Maps to `--foreground` in the shadcn layer.
- `--text-secondary` — Supporting text, secondary labels. Maps to `--muted-foreground`.
- `--tertiary` — Tertiary text: placeholders, metadata, timestamps.
- `--primary` — The single interactive accent color. Buttons, links, selection, focus rings.
- `--primary-foreground` — Text and icons on top of `--primary` fills.
- `--destructive` — Destructive action backgrounds and error indicators.
- `--destructive-foreground` — Text and icons on `--destructive` fills.
- `--text-destructive` — Standalone destructive text (no background fill). AA-compliant per theme.
- `--success` — Success state. Positive indicators, confirmed actions.
- `--warning` — Warning state. Caution indicators, attention flags.
- `--border-default` — The single border color. Inputs, card edges, table dividers.
- `--focus-ring` — Keyboard focus indicator. Always appears, never the sole state indicator.
- `--overlay-scrim` — Modal, sheet, and dialog backdrop. Always `#000` at reduced opacity.

### Chart colors

Used in data visualizations. Categorical, never communicate severity or
interactivity on their own.

- `--chart-1` through `--chart-5` — Five categorical hues.
- `--chart-positive` — Positive trend indicator.
- `--chart-negative` — Negative trend indicator.
- `--chart-neutral` — Neutral or baseline trend.

### shadcn mapping layer

The DTCG tokens above are mapped to shadcn's standard semantic roles in
`@ponti-studios/ui`'s `index.css`. This is an implementation detail, not a
second palette. The mapping is:

- `--color-background` ← `--background`
- `--color-foreground` ← `--text-primary`
- `--color-card` ← `--card`
- `--color-card-foreground` ← `--text-primary`
- `--color-popover` ← `--popover`
- `--color-popover-foreground` ← `--text-primary`
- `--color-primary` ← `--primary`
- `--color-primary-foreground` ← `--primary-foreground`
- `--color-secondary` ← `--card`
- `--color-secondary-foreground` ← `--text-primary`
- `--color-muted` ← `--muted`
- `--color-muted-foreground` ← `--text-secondary`
- `--color-accent` ← `--primary`
- `--color-accent-foreground` ← `--primary-foreground`
- `--color-destructive` ← `--destructive`
- `--color-destructive-foreground` ← `--destructive-foreground`
- `--color-destructive-text` ← `--text-destructive`
- `--color-success` ← `--success`
- `--color-warning` ← `--warning`
- `--color-border` ← `--border-default`
- `--color-input` ← `--border-default`
- `--color-ring` ← `--focus-ring`

### Color rules

- `--primary` is the one interactive accent. There is no second brand color.
- `--success` and `--warning` exist as standing tokens for state communication.
  They are not used as categorical or decorative colors.
- Text hierarchy is `--text-primary`, `--text-secondary`, or `--tertiary`.
  Do not invent a new text color by hand-picking a hue.
- `--border-default` is the default border. A `divider` line between rows is
  the one exception (List row in Primitives) — used only when adjacent rows
  would be genuinely ambiguous without it.
- Chart colors are reserved for data visualization. They do not appear in
  navigation, forms, or general-purpose UI.

## Spacing

Base unit is 4px. The full scale extends from 0 to 384px in 4px or 8px
increments. Common reference points:

- `--spacing-scale-1` — 4px — Icon-to-label gaps, tight internal alignment.
- `--spacing-scale-2` — 8px — Tightest gap between related elements.
- `--spacing-scale-4` — 16px — Screen horizontal gutter. Default group gap.
  Content never touches the screen edge.
- `--spacing-scale-6` — 24px — Gap between sections.
- `--spacing-scale-8` — 32px — Gap between major screen regions.
- `--spacing-scale-11` — 44px — Minimum tap target height.
- `--spacing-scale-12` — 48px — Empty-state and error-state padding.
- `--spacing-scale-16` — 64px — Reserved for full-page hero or error padding.

Any spacing value outside the defined scale is a bug. Mobile content uses
16px as the horizontal gutter; content never touches the screen edge.

## Radius

A fixed scale. Components pick from it consistently.

- `--radius-xs` — 2px — Rare, compact controls.
- `--radius-sm` — 4px — Badges, compact pills.
- `--radius-md` — 6px — Buttons, inputs, select triggers.
- `--radius-lg` — 8px — Dialogs, sheets.
- `--radius-xl` — 12px — Cards.
- `--radius-2xl` — 16px — Large panels.
- `--radius-3xl` — 24px — Surface panels.
- `--radius-4xl` — 32px — Rare, oversized containers.
- `--radius-full` — 9999px — Circles and capsules: avatars, icon buttons, pills, tab lists, switches.

## Typography

### Font families

- `--font-sans` — System UI stack. All body, heading, and UI text.
- `--font-mono` — UI monospace stack. Code, reference tags, data labels.

### Type scale

- `--text-xs` — 12px / ~16px — Badges, fine print, reference tags.
- `--text-sm` — 14px / ~20px — Secondary UI text, labels, help text.
- `--text-base` — 16px / 24px — Body text, button labels.
- `--text-lg` — 18px / ~28px — Dialog titles, emphasized text.
- `--text-xl` — 20px / 28px — Section titles.
- `--text-2xl` — 24px / 32px — Screen titles.
- `--text-3xl` — 30px / 36px — Hero titles.
- `--text-4xl` through `--text-9xl` — Display sizes. Reserved; do not use
  without a documented need.

### Display utilities

- `.display-1` — `clamp(2.5rem, 5vw, 6rem)`, weight 600, line-height 1.1, tracking tight. One per screen, if any.
- `.display-2` — `clamp(2rem, 3vw, 3.5rem)`, weight 600, line-height 1.15, tracking tight.

### Font weights

`--font-weight-normal` (400), `--font-weight-medium` (500), `--font-weight-semibold` (600), `--font-weight-bold` (700), plus thin (100) through black (900).

### Text treatment

- UI copy uses sentence case. All-caps rendering is reserved for the
  `SectionIntro` eyebrow utility and reference tags — not a general-purpose
  style.
- Tracking tokens: `--tracking-tight`, `--tracking-normal`, `--tracking-wide`.

## Elevation and shadows

### Shadow scale

- `--shadow-none` — No shadow. Default for most UI.
- `--shadow-xs` — Subtle. Switch and slider thumbs.
- `--shadow-sm` — Light. Dropdown sub-menus, floating panels.
- `--shadow-md` — Moderate. Elevated cards (rare).
- `--shadow-lg` — Pronounced. Dropdown menu sub-content, popovers at higher elevation.
- `--shadow-xl` and `--shadow-2xl` — Reserved. Do not use without a documented need.

Shadows separate a surface from the background. They are not decorative.
Every shadow below `--shadow-lg` is expected to have a functional reason
(e.g., making a floating element read as above a scrollable list).

### Z-index scale

`--z-index-0` through `--z-index-50`. Overlays (dialog, sheet, popover,
dropdown, select) all use `--z-index-50`.

## Iconography

- **Source:** Lucide by default, plus SF Symbols for native iOS surfaces.
  State (selected, unselected, disabled, pressed) is expressed by recoloring
  the same glyph, never by swapping to a different asset per state.
- **Custom icon sets** are legal only as a solid alpha mask — one flat shape,
  no internal color or shading, on a transparent background — supplied at
  `@1x/@2x/@3x` for native or as an SVG for web. A full-color or multi-tone
  bitmap icon is not a shortcut around the token system.
- Default icon size is 16px (`size-4` in Tailwind). Larger sizes are chosen
  from the spacing scale, not invented ad-hoc.

## Motion

### Easing

- `--ease-in` — `cubic-bezier(0.4, 0, 1, 1)`
- `--ease-out` — `cubic-bezier(0, 0, 0.2, 1)` — Default for UI transitions.
- `--ease-in-out` — `cubic-bezier(0.4, 0, 0.2, 1)`

### Duration tokens

- `--duration-75` — 75ms — Micro-interactions.
- `--duration-100` — 100ms — Press and tap feedback.
- `--duration-150` — 150ms — Toggles, small state changes. Default for UI animations.
- `--duration-200` — 200ms — Accordion chevron, sheet and modal entrance.
- `--duration-300` — 300ms — Full-screen transitions.
- `--duration-500` — 500ms — Reserved.
- `--duration-700`, `--duration-1000` — Reserved. Do not use without a documented need.

### Keyframe animations

- `--animate-spin` — Rotating spinner. `motion-safe` only.
- `--animate-pulse` — Skeleton loading shimmer. `motion-safe` only.
- `--animate-bounce` — Reserved for attention-grabbing feedback; rare.

### Reduced motion

`@media (prefers-reduced-motion: reduce)` forces all animation durations to
`0.01ms`. Every animated element must render correctly when motion is
disabled — no element may be invisible, displaced, or cut off in its static
resting state.
