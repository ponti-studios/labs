---
type: foundation
name: spacing
status: canonical
---

# Spacing and Sizing

Spacing expresses Ma: the interval between things gives them meaning. Use a 4px atomic unit with an 8px primary rhythm.

| Token | Value | Use |
| --- | ---: | --- |
| `space-1` | 4px | icon/text or tightly related detail |
| `space-2` | 8px | compact relationships |
| `space-3` | 12px | dense controls and rows |
| `space-4` | 16px | control padding and compact panels |
| `space-5` | 24px | content padding |
| `space-6` | 32px | section and group separation |
| `space-7` | 48px | major layout separation |
| `space-8` | 64px | page-level breathing room |

Use component density tiers deliberately: compact for dense data, regular for working controls, and generous for editorial content. A component may use a smaller value internally only when its relationship is genuinely tight.

Sizing contracts must preserve a 44px minimum interactive target. Widths and heights should be content-safe and should not rely on fixed viewport calculations that fail on mobile.
