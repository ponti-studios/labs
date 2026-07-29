# 09 — Horizontal overflow at 320px viewport width

**Category:** Responsive design
**Severity:** Medium (visual bug on smallest supported devices)

## Summary

At a 320px CSS-width viewport (the standard WCAG reflow test width, and the size of older/smaller phones like iPhone SE 1st-gen), the tile grid computes to a width slightly larger than the available container width. The overflow is silently clipped (not scrollable) because `overflow-x-hidden` is set globally on `<body>`, so the rightmost tile edge gets visually cut off rather than producing a visible bug report like a scrollbar would.

## Evidence

- `app/routes/games/realitea/realitea.css:5` — `--realitea-tile-size: clamp(54px, 15vw, 82px)`. Below ~360px viewport width, `15vw` < 54px, so the **54px floor is fixed regardless of viewport** — it can't shrink further no matter how narrow the screen gets.
- `app/routes/games/realitea/route.tsx:276` — route container has `px-4` (32px total horizontal padding).
- `app/routes/games/realitea/route.tsx:79,99,135` — tile rows use `gap-1.5` (6px) between tiles.
- Math at 320px viewport: available width = 320 − 32 = 288px. Row width = `5 × 54px + 4 × 6px` = 270 + 24 = **294px > 288px available** — a ~6px overflow.
- `app/root.tsx:48` — `overflow-x-hidden` on `<body>` masks this by clipping rather than scrolling, so it's not obvious without explicitly testing at this width.

## Why it matters

The rightmost tile (or part of it) is silently cut off on the smallest phones still in active use, without any visible error — this is the kind of bug that only surfaces via direct testing at narrow widths or from a user report ("the last letter box looks cut off").

## Suggested fix

Either:
- Lower the `clamp()` floor slightly (e.g. `clamp(50px, 15vw, 82px)`), or
- Reduce `gap-1.5`/padding at the smallest breakpoint, or
- Make the tile size formula account for the fixed gap/padding overhead explicitly (e.g. `calc((100vw - 32px - 24px) / 5)` style calculation) instead of a flat `vw` clamp.

## Open questions for discussion
- What's the actual minimum supported device width for this app? If nothing below ~360px is in scope, this may not be worth fixing.
- Worth combining with [10](10-keyboard-touch-target-width.md) since both stem from the same "mobile-first sizing math" area of `realitea.css`?
