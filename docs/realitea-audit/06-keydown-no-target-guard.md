# 06 — Global keydown listener has no event-target guard

**Category:** React correctness bug, accessibility
**Severity:** Medium

## Summary

The game's physical-keyboard input is wired via a single global `document.addEventListener("keydown", ...)`, with no check on `e.target`/`document.activeElement`. Any focused input element elsewhere on the page (present or future) would have its keystrokes hijacked into the game.

## Evidence

- `app/routes/games/realitea/use-game.ts:89-106` — the keydown handler filters `Enter`/`Backspace`/`a-zA-Z` and routes to `addLetter`/`removeLetter`/`submitGuess`, but never checks what element is currently focused.

## Why it matters

- If a future feature adds any focusable text input to the page (search box, feedback form, share-link edit field, etc.), typing into it would simultaneously feed letters into the game grid.
- It's also an accessibility/navigation concern: there's no natural tab-stop or focused control that "owns" typing for screen-reader users navigating by keyboard — input is captured globally regardless of focus state.

## Suggested fix

Add a guard at the top of the handler, e.g.:
```ts
if (e.target instanceof HTMLElement && ["INPUT", "TEXTAREA"].includes(e.target.tagName)) return;
```

## Open questions for discussion
- Is there a plan to add any other focusable inputs to this route (e.g. a comments/feedback box)? If never, this is lower priority — but it's a one-line defensive fix regardless.
- Should the game board itself become a focusable, ARIA-labeled region that owns keyboard capture only while focused, rather than a global document listener? (Bigger change, worth considering alongside [08](08-color-only-state-feedback.md) accessibility work.)
