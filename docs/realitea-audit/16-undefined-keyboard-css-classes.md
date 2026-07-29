# 16 — Undefined keyboard key CSS classes (specificity race)

**Category:** UI/design
**Severity:** Low

## Summary

The onscreen keyboard generates a CSS class name per key state, including `realitea-key-inactive` and `realitea-key-action`, but `realitea.css` only defines rules for `realitea-key-correct`/`realitea-key-present`/`realitea-key-absent`. The two undefined states fall back to whatever Tailwind utility classes happen to be present, creating a CSS-specificity race whose winner depends on stylesheet import order rather than explicit design intent.

## Evidence

- `app/components/games/onscreen-keyboard.tsx:67` — generates `realitea-key-${state}` for every state value, including `"inactive"` and `"action"`.
- `app/routes/games/realitea/realitea.css:172-203` — only defines `.realitea-key-correct`, `.realitea-key-present`, `.realitea-key-absent`.
- For the undefined states, keys fall back to Tailwind classes from the `cva` variant definitions: `onscreen-keyboard.tsx:38` (`inactive`: `border-border bg-background text-foreground hover:bg-muted`) and `:42` (`action`: `border-border bg-muted text-foreground hover:bg-card`), layered against the `.realitea-key` base rule (`realitea.css:154-164`) at equal specificity.

## Why it matters

Right now this likely "works" visually by accident (whichever rule happens to load/cascade last wins), but it's not deterministic by design — a future change to import order, a new Tailwind class, or a build-tool change to CSS ordering could silently change how inactive/action keys look with no code change signaling why.

## Suggested fix

Add explicit `.realitea-key-inactive` and `.realitea-key-action` rules to `realitea.css` alongside the existing correct/present/absent rules, so all four+ states are deterministically styled by the same system rather than three explicit + two accidental-fallback.

## Open questions for discussion
- Should inactive/action keys use the bespoke `--realitea-*` color system (matching correct/present/absent) for full visual consistency, or is relying on the shared Tailwind token classes for these two "neutral" states actually the intended design (i.e., only guessed-letter states get the custom lacquer/gold treatment)?
