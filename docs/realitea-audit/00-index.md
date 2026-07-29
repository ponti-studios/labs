# Realitea Audit — Index

Deep-dive analysis of the Realitea game feature (`app/routes/games/realitea/`, `app/lib/realitea/`), performed via five parallel research passes: UI design, data flow, React best practices, responsive design, and security/testing.

Each finding below has its own doc so it can be discussed and resolved independently.

## Security / integrity
- [01 — No server-side attempt tracking](01-no-server-side-attempt-tracking.md)
- [02 — No rate limiting on guess endpoint](02-no-rate-limiting.md)
- [03 — generation.ts has zero test coverage + prompt-injection surface](03-generation-untested-prompt-injection.md)
- [04 — Answer leakage protections (confirmed solid, not a bug)](04-answer-leakage-solid.md)

## React correctness bugs
- [05 — lastProcessedWordRef never reset on puzzle rollover](05-stale-processed-word-ref.md)
- [06 — Global keydown listener has no event-target guard](06-keydown-no-target-guard.md)
- [07 — ErrorBoundary can't read the loader's Response error](07-error-boundary-response-type-mismatch.md)

## Accessibility
- [08 — Tile/keyboard state conveyed by color only](08-color-only-state-feedback.md)

## Responsive design
- [09 — Horizontal overflow at 320px viewport width](09-horizontal-overflow-320px.md)
- [10 — Onscreen keyboard keys too narrow on small phones](10-keyboard-touch-target-width.md)
- [11 — No landscape/orientation handling](11-no-orientation-handling.md)

## Data flow / architecture
- [12 — Duplicated guess-validation logic (client vs server)](12-duplicated-validation-logic.md)
- [13 — Fetcher-result effect needs two idempotency guards](13-fetcher-effect-double-guard.md)
- [14 — Silent stale-puzzle fallback](14-silent-stale-puzzle-fallback.md)

## UI/design
- [15 — prefers-reduced-motion CSS references wrong/missing classes](15-reduced-motion-css-mismatch.md)
- [16 — Undefined keyboard key CSS classes (specificity race)](16-undefined-keyboard-css-classes.md)
