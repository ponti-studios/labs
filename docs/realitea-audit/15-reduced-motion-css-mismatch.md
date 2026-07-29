# 15 — prefers-reduced-motion CSS references wrong/missing classes

**Category:** UI/design, accessibility
**Severity:** Low-Medium (easy fix, real accessibility miss)

## Summary

The `prefers-reduced-motion` media query in `realitea.css` is meant to disable animations for users who've opted out of motion, but it references a class name that doesn't exist elsewhere in the file, and it omits the class that drives the actual per-tile reveal-flip animation. As a result, users with reduced-motion preferences still get the full tile-flip animation.

## Evidence

- `app/routes/games/realitea/realitea.css:263-271` — the reduced-motion block disables `.realitea-tile`, `.realitea-row-shake`, `.realitea-tile-error`, and `.realitea-skeleton-tile`.
- The actual per-tile reveal-flip animation class is `.realitea-tile-reveal` (used at `realitea.css:142-144`, keyframes at `:217-234`) — this is **not** in the reduced-motion block at all.
- The skeleton class referenced in the reduced-motion block is `.realitea-skeleton-tile` (`:267` — as written), but the real class defined/used elsewhere in the file is `.realitea-tile-skeleton` (`:275`) — the two names are reversed word order, so the reduced-motion rule for the skeleton pulse never actually matches anything.

## Why it matters

This is a straightforward accessibility regression: the entire point of respecting `prefers-reduced-motion` is undermined for the game's most prominent animation (the tile reveal sequence on every guess), and the skeleton-loading pulse rule is dead code that silently does nothing.

## Suggested fix

In `realitea.css:263-271`:
1. Add `.realitea-tile-reveal` to the disabled-animation selector list.
2. Fix `.realitea-skeleton-tile` → `.realitea-tile-skeleton` to match the actual class name used at `:275`.

## Open questions for discussion
- None — this is a clear, low-risk, mechanical fix. Flagging mainly to confirm scope (should the shake/error animations also be double-checked for other typos while in this file?).
