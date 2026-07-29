# 11 — No landscape/orientation handling

**Category:** Responsive design
**Severity:** Medium

## Summary

The tile grid sizes itself off viewport *width* only. In landscape orientation on a typical phone, this produces the largest possible tiles exactly when vertical space is scarcest, and the onscreen keyboard — essential for play — can end up scrolled off-screen.

## Evidence

- `app/routes/games/realitea/realitea.css` — the only `@media` rule present is `prefers-reduced-motion` (`:263-271`); there are no orientation or height-based media queries anywhere.
- `app/routes/games/realitea/realitea.css:5` — `--realitea-tile-size: clamp(54px, 15vw, 82px)` reacts only to width.
- Rough landscape math (typical phone rotated, e.g. 667×375 viewport): `15vw` ≈ 100px, clamped to the 82px max — tiles render at their largest size when height is most constrained.
- Vertical budget in that landscape case: `AppNavigation` bar (`app/root.tsx:75-97`) + route header (`route.tsx:277`, ~48px) + 6 grid rows at 82px + 5×6px gaps (≈522px) + error text + keyboard (3 rows × 44px + gaps ≈144px) — far exceeds 375px of available height.
- `app/root.tsx:48` — `<body>` has `overflow-y-auto`, so the page scrolls rather than clipping/breaking, but this means the essential keyboard can be pushed below the fold, forcing a mid-game scroll.

## Why it matters

Landscape phone use is a real, if secondary, usage pattern, and right now it produces a materially worse experience: users have to scroll down to reach the keyboard mid-game, breaking the normal "everything visible at once" Wordle-style flow.

## Suggested fix

Add a landscape/short-viewport media query (e.g. `@media (orientation: landscape) and (max-height: 450px)`) that scales tile size down more aggressively based on height, not just width — could clamp against `min(15vw, 12vh)` or similar, or shrink header/clue chrome in landscape.

## Open questions for discussion
- Is landscape phone play a meaningfully common usage pattern for this game, or is it low priority given most Wordle-style play happens in portrait?
- Worth a quick device/orientation check in browser devtools to confirm severity before investing fix effort?
