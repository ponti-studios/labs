# 13 — Fetcher-result effect needs two idempotency guards

**Category:** Data flow / architecture, React best practices
**Severity:** Medium (fragility, not a confirmed bug beyond [05](05-stale-processed-word-ref.md))

## Summary

The effect that processes a new guess-validation result from `useFetcher` needs two separate, manually-maintained guards to avoid double-appending a guess to state. Needing both a ref-based guard and an inline state-based guard for a single async transition is a sign this should be modeled as an explicit discrete event (e.g. a reducer keyed on a request id) rather than effect-based reconciliation.

## Evidence

- `app/routes/games/realitea/use-game.ts:137-171` — the result-processing effect fires whenever `wordValidator.data`, `wordValidator.state`, or `guesses.length` changes.
- Guard 1: `lastProcessedWordRef` (declared `:79`, checked `:159`) — `if (lastProcessedWordRef.current === result.word) return;`
- Guard 2: inline idempotency check inside the `setGuesses` updater itself (`:163-167`) — `if (prev.at(-1)?.word === result.word) return prev;`
- The dependency on `guesses.length` (`:171`) is itself unusual: it's included specifically to re-trigger the guard logic after `setGuesses` commits, conflating "new fetcher data arrived" with "guesses array changed for any reason."
- Network-failure detection (`:140-146`) similarly infers failure from a *state transition* captured in `prevFetcherStateRef` (`:71-74`) — "submitting → idle without data" — rather than from any explicit error signal, because `useFetcher` doesn't surface non-2xx/network errors as data directly.

## Why it matters

This is the most tangled part of the Realitea client code. It currently works (the dual guards do prevent double-processing), but it's fragile: [05](05-stale-processed-word-ref.md) is a concrete bug that stems directly from this design (the ref not being reset on puzzle rollover). Any future change to this effect's dependencies or timing has a real chance of reintroducing double-processing or dropped-guess bugs, because the correctness of the whole thing depends on the interaction between two separate guards rather than one clear invariant.

## Suggested fix (larger refactor, not urgent)

Model guess submission as a reducer or explicit state machine keyed on a request identifier (e.g. `{status: "idle" | "submitting" | "settled", requestId, ...}`) instead of inferring transitions from `useFetcher`'s generic state/data changes. This would let a single check ("is this result for the current in-flight request?") replace both current guards, and would also make network-failure detection explicit rather than inferred.

## Open questions for discussion
- Is this worth a proactive refactor, or should it wait until/unless another bug surfaces from this area (beyond the already-identified [05](05-stale-processed-word-ref.md))?
