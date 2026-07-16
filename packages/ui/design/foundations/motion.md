---
type: foundation
name: motion
status: canonical
---

# Motion

Motion is punctuation. It explains arrival, change, consequence, and spatial relationship. If movement does not help the user understand one of those things, remove it.

## Core timing

| Token | Default | Use |
| --- | ---: | --- |
| `duration-enter` | 150ms | content arriving and settling |
| `duration-exit` | 120ms | content leaving without lingering |
| `duration-standard` | 120ms | small state changes |
| `duration-breezy` | 1800ms | ambient loading or atmospheric loops |

Use the enter easing for deceleration and the exit easing for acceleration. Distances should remain small: approximately 6px on entry and 4px on exit.

## Patterns

- Page and content arrival: opacity plus a small translation.
- Hover: a restrained color or surface change, not a theatrical scale.
- Press: immediate surface and position feedback.
- Loading: preserve geometry and use a restrained pulse or shimmer.
- Sheet: slide from the bottom on mobile and from the right on desktop.
- Dialog: use a short attention-guiding arrival with a scrim.

Every pattern has a `prefers-reduced-motion` behavior that removes nonessential translation, scale, and looping. The implementation owns animation names and class mechanics.
