# Realitea Audit — Index

Deep-dive analysis of the Realitea game feature (`app/routes/games/realitea/`, `app/lib/realitea/`), performed via five parallel research passes: UI design, data flow, React best practices, responsive design, and security/testing.

Each finding below has its own doc so it can be discussed and resolved independently.
Statuses: resolved means implemented; partially resolved means a deliberate product
tradeoff remains; still open means no change was made in this batch.

## Security / integrity
- [01 — No server-side attempt tracking](01-no-server-side-attempt-tracking.md) — partially resolved
- [02 — No rate limiting on guess endpoint](02-no-rate-limiting.md) — resolved for authenticated players
- [03 — generation.ts has zero test coverage + prompt-injection surface](03-generation-untested-prompt-injection.md) — resolved
- [04 — Answer leakage protections (confirmed solid, not a bug)](04-answer-leakage-solid.md)

## React correctness bugs
- [05 — lastProcessedWordRef never reset on puzzle rollover](05-stale-processed-word-ref.md) — resolved by submission reset
- [06 — Global keydown listener has no event-target guard](06-keydown-no-target-guard.md) — resolved
- [07 — ErrorBoundary can't read the loader's Response error](07-error-boundary-response-type-mismatch.md) — resolved

## Accessibility
- [08 — Tile/keyboard state conveyed by color only](08-color-only-state-feedback.md) — resolved

## Responsive design
- [09 — Horizontal overflow at 320px viewport width](09-horizontal-overflow-320px.md) — resolved for practical target
- [10 — Onscreen keyboard keys too narrow on small phones](10-keyboard-touch-target-width.md) — resolved at 24px minimum
- [11 — No landscape/orientation handling](11-no-orientation-handling.md) — resolved for 667×375

## Data flow / architecture
- [12 — Duplicated guess-validation logic (client vs server)](12-duplicated-validation-logic.md) — resolved
- [13 — Fetcher-result effect needs two idempotency guards](13-fetcher-effect-double-guard.md) — resolved with request state machine
- [14 — Silent stale-puzzle fallback](14-silent-stale-puzzle-fallback.md) — resolved with disclosure

## UI/design
- [15 — prefers-reduced-motion CSS references wrong/missing classes](15-reduced-motion-css-mismatch.md) — resolved
- [16 — Undefined keyboard key CSS classes (specificity race)](16-undefined-keyboard-css-classes.md) — resolved

## Support target and remaining tradeoff

The supported mobile target is no clipping or horizontal overflow at 320px portrait,
and a usable, reachable three-row keyboard and board at 667×375 landscape. Letter
keys use a 24px minimum width: the practical AA target for the existing compact
keyboard, not a redesign to 44px AAA keys.

Anonymous play remains intentionally limited to one stateless free guess. Authenticated
players receive authoritative attempt tracking, duplicate checks, guess caps, and rate
limits. A determined anonymous client can replay or alter its client-reported count;
the game has no competitive leaderboard or sensitive data, so a server session or
signed token remains a product tradeoff rather than a required fix.
