---
type: design-foundations
owner: ponti-studios
status: active
---

# Foundations

Foundations are the smallest set of decisions that make Ponti interfaces feel related. They are platform-aware, token-backed, and intentionally quiet. Components and product patterns may adapt them, but may not contradict them without a documented exception.

## The foundation stack

1. **Colors** communicate hierarchy and state.
2. **Spacing** establishes interval and rhythm.
3. **Typography** gives content its hierarchy.
4. **Surfaces** establish grouping and depth.
5. **Motion** explains arrival, change, and consequence.
6. **Responsive behavior** preserves the experience as space changes.
7. **Accessibility** keeps every decision usable.

Detailed contracts live in the [foundations](foundations/) directory. This document explains their ownership; it is not a second token table.

## Token layers

- **Primitive tokens** are raw values: palette colors, spacing units, type sizes, radii, and durations.
- **Semantic tokens** describe intent: canvas, panel, primary text, focus, accent, destructive, and so on.
- **Component tokens** describe a component’s contract: button height, input padding, or dialog radius.
- **Product exceptions** are explicitly scoped decisions for a product or experiment.

Components consume semantic or component tokens. Product code should not reach directly for primitives.

## The governing test

Every new value must answer three questions:

1. What user-facing meaning does this value carry?
2. Which existing token or component contract was insufficient?
3. What is the smallest scope in which the new value belongs?

If the answer is only aesthetic preference, the value belongs in a product or experiment—not in the shared system.
