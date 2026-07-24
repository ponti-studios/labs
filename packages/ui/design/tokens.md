---
type: token-system
owner: ponti-studios
status: canonical
---

# Tokens

Tokens are the shared vocabulary between design decisions and implementation. The semantic contract is stable; the values may change only through an intentional system revision.

## Canonical semantic roles

The shared system uses the shadcn/Tailwind semantic vocabulary wherever it
already expresses the role. Components should consume these names directly;
the generated CSS variables intentionally omit the `color-` prefix so the
Tailwind theme can map them without self-references.

| Token | Meaning |
| --- | --- |
| `background` | The page or app background. |
| `card` | A contained panel or quiet control surface. |
| `popover` | A raised transient surface such as a menu, dialog, or sheet. |
| `muted` | A recessed or quiet neutral surface. |
| `text-primary` | The main readable content. |
| `text-secondary` | Supporting content and labels. |
| `tertiary` | Quiet metadata and captions. |
| `primary` | Primary action and selection color. |
| `primary-foreground` | Content placed on a primary surface. |
| `destructive` | Destructive or invalid action and content color. |
| `destructive-foreground` | Content placed on a destructive surface. |
| `success` | Positive status color. |
| `warning` | Cautionary status color. |
| `border-default` | Standard control and container borders. |
| `focus-ring` | The visible keyboard focus indicator. |

### Intent

| Token family | Meaning |
| --- | --- |
| `primary` | Primary action and selection. |
| `destructive` | Irreversible or dangerous actions. |
| `success` | Positive completion or health. |
| `warning` | Caution requiring attention. |

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
