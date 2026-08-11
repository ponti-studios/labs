# 10 — Onscreen keyboard keys too narrow on small phones

**Status: Resolved for the practical AA target.** Letter keys now have a 24px minimum
width while preserving the existing compact three-row keyboard.

**Category:** Responsive design, accessibility
**Severity:** Medium

## Summary

Keyboard key height correctly meets the WCAG 44px guideline, but width is unconstrained and shrinks to fit — on narrow phones, letter keys end up roughly 27–30px wide, well short of a comfortable (or WCAG AAA 44×44) touch target.

## Evidence

- `app/components/games/onscreen-keyboard.tsx:34-35` — `min-h-11` (44px height) is set, but width uses `min-w-0 flex-1 px-0` (no minimum width).
- `app/routes/games/realitea/realitea.css:155` — CSS also enforces `min-height: 44px`, matching the height constraint, but no width equivalent.
- Computed width at 320px viewport (route container `px-4` = 32px total padding → 288px available):
  - Row 1 (`QWERTYUIOP`, 10 keys, `gap-0.5` pre-`sm` = 2px, 9 gaps = 18px): `(288 − 18) / 10 ≈ 27px` per key.
  - Row 2 (`ASDFGHJKL`, 9 keys): `(288 − 16) / 9 ≈ 30px` per key.
- Action keys (`Enter`/`⌫`) are `shrink-0 px-3` (`onscreen-keyboard.tsx:81-90,103-113`), so they keep comfortable width, which further compresses the remaining space available to letter keys.
- This passes WCAG 2.5.8 AA (24×24 minimum) but falls well short of AAA's 44×44 target — and is a well-known UX complaint pattern in Wordle-style games generally.

## Why it matters

Thumb-typing accuracy on 27–30px-wide keys is noticeably worse than on comfortably-sized keys, especially for users with larger fingers or motor-control difficulty. This is a real usability issue, not just a compliance checkbox.

## Suggested fix

Options, roughly in order of effort:
1. Accept AA compliance as sufficient (24×24 minimum is met) — no change.
2. Reduce inter-key gap further on narrow viewports to reclaim width for keys.
3. Reduce the size of `Enter`/`⌫` action keys slightly on narrow viewports to redistribute width to letter keys.
4. Consider a two-row keyboard layout variant on the narrowest viewports (bigger change).

## Open questions for discussion
- Is AAA-level touch target sizing a goal for this app, or is AA (already met) sufficient?
- Any user feedback/analytics suggesting mis-taps are actually a problem in practice, or is this purely a theoretical measurement?
