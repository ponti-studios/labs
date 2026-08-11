# 08 — Tile/keyboard state conveyed by color only

**Category:** Accessibility
**Severity:** High (core game feedback is inaccessible)

## Summary

The correctness state of each guessed letter — correct / present / absent — is conveyed purely through color (via `data-state` + CSS), with no text or ARIA alternative on either the guess-row tiles or the onscreen keyboard keys. This is the central feedback mechanism of the entire game, and it's currently invisible to screen-reader users and likely hard to parse for colorblind users without relying on shape/position cues alone.

## Evidence

- `app/routes/games/realitea/realitea-tile.tsx:30-43` (`RealiTeaTile`) — accepts an optional `ariaLabel` prop, but state is conveyed via `data-state` + CSS color only.
- `app/routes/games/realitea/route.tsx:146` — `CurrentGuessRow` passes an `ariaLabel` of `"Letter N"` (position only, not letter or state — the in-progress row has no state yet anyway).
- `app/routes/games/realitea/route.tsx:107-113` (`RevealedGuessRow`) and `route.tsx:81` (`EmptyGuessRow`) — **never** pass `ariaLabel`. After a guess is submitted and revealed, there is zero textual information about which letters were correct/present/absent.
- `realitea-tile.tsx:31` — the tile's root `div` has no `role`; an `aria-label` on a bare `div` without a semantic/ARIA role isn't reliably exposed to all assistive tech even where it is present.
- `app/components/games/onscreen-keyboard.tsx:91-102` — letter buttons render only the bare letter text; per-key state (`correct`/`present`/`absent`, from `letterStates[letter]`) is conveyed only via background-color classes (`keyboardKeyVariants`, `:37-44`), with no `aria-label`/`aria-pressed`/`title`.
- Contrast: the error-message region does this correctly — `role="status"` + `aria-live="polite"` + `aria-atomic="true"` (`route.tsx:351-358`), verified by tests.

## Why it matters

This is WCAG 1.4.1 (use of color) territory, but worse than a typical violation — there isn't even a redundant *visual* cue (like a checkmark icon or border pattern), let alone a text alternative. A screen-reader user completing a guess gets no indication of correctness at all beyond the raw letters they typed.

## Suggested fix

1. Add `ariaLabel` to `RevealedGuessRow` tiles, e.g. `"Letter {letter}: {state}"` (correct / present in word / not in word).
2. Give the tile root an appropriate `role` (e.g. `role="img"` with the label, or `role="gridcell"` if the row is structured as a grid).
3. Add `aria-label`/`title` to onscreen-keyboard keys reflecting guessed state, e.g. `"E — correct"`.

## Open questions for discussion
- Should this go through the `a11y-audit` skill for a formal WCAG pass, or is the fix above sufficient to just implement directly?
- Any existing design-system pattern (from `@ponti-studios/ui`) for labeling colored status indicators that should be reused here for consistency?
