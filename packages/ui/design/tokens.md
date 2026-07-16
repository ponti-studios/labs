---
type: token-system
owner: ponti-studios
status: canonical
---

# Tokens

Tokens are the shared vocabulary between design decisions and implementation. The semantic contract is stable; the values may change only through an intentional system revision.

## Canonical semantic roles

### Surfaces

| Token | Meaning |
| --- | --- |
| `surface-canvas` | The page or app background. |
| `surface-panel` | A contained region or quiet control surface. |
| `surface-raised` | A surface above the page, such as a dialog or sheet. |
| `surface-inset` | A recessed region or input background. |
| `surface-hover` | Hover feedback on a neutral interactive surface. |
| `surface-pressed` | Pressed feedback on a neutral interactive surface. |
| `surface-selected` | Persistent selection or current location. |
| `surface-disabled` | Disabled control background. |
| `overlay-scrim` | Backdrop behind an attention-demanding surface. |

### Content

| Token | Meaning |
| --- | --- |
| `text-primary` | The main readable content. |
| `text-secondary` | Supporting content and labels. |
| `text-tertiary` | Quiet metadata and captions. |
| `text-disabled` | Disabled or unavailable content. |
| `text-accent` | An accent-colored link or active label. |
| `text-destructive` | Destructive or invalid content. |
| `text-success` | Positive status content. |
| `text-warning` | Cautionary status content. |
| `text-on-accent` | Content on an accent surface. |
| `text-on-destructive` | Content on a destructive surface. |
| `text-on-success` | Content on a success surface. |
| `text-on-warning` | Content on a warning surface. |

### Structure

| Token | Meaning |
| --- | --- |
| `border-subtle` | Quiet grouping or dividers. |
| `border-default` | Standard control and container borders. |
| `border-strong` | Deliberately emphasized structure. |
| `border-focus` | Keyboard focus and active control indication. |
| `border-accent` | Accent-colored structure. |
| `border-destructive` | Destructive or invalid structure. |
| `ring-focus` | The visible focus ring color. |

### Intent

| Token family | Meaning |
| --- | --- |
| `accent`, `accent-hover`, `accent-pressed`, `accent-subtle` | Primary action and selection. |
| `destructive`, `destructive-hover`, `destructive-pressed`, `destructive-subtle` | Irreversible or dangerous actions. |
| `success`, `success-subtle` | Positive completion or health. |
| `warning`, `warning-subtle` | Caution requiring attention. |

### Data visualization

Charts may use a small dedicated palette because multiple series must remain distinguishable. These are not general interface colors:

- `chart-1` through `chart-5` — ordered series colors.
- `chart-positive` — positive direction.
- `chart-negative` — negative direction.
- `chart-neutral` — neutral or comparison data.

Charts must still use labels, legends, patterns, or position so color is never the only way to interpret a value.

## Canonical palette

Ponti uses one neutral-first palette with light and dark modes. The current implementation values are defined in `packages/ui/src/styles.css`; this document owns their roles, not hexadecimal values.

There are no peer production systems. Primer and Apple are retired as theme names and must not appear in component APIs, Storybook toolbars, or application persistence.

## Rules

- Use semantic roles in components; never hardcode a palette value.
- Color is never the only carrier of state.
- Text and interactive contrast must meet WCAG AA.
- Borders may be subtle, but focus indicators must remain clearly visible.
- A new semantic token requires a documented user-facing meaning and contrast review.
- Product integrations such as provider-branded map colors belong in the product extension that needs them, not in the shared system.
