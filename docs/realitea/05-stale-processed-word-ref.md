# 05 — lastProcessedWordRef never reset on puzzle rollover

**Category:** React correctness bug
**Severity:** Medium (latent, low-frequency trigger)

## Summary

`use-game.ts` uses a ref (`lastProcessedWordRef`) to guard against double-processing a single fetcher result. That ref is never cleared when the puzzle changes (e.g. at midnight rollover to a new day's puzzle), so if a future puzzle's guessed word happens to match a word processed under a previous puzzle, the guard could silently swallow a legitimate new guess.

## Evidence

- `app/routes/games/realitea/use-game.ts:79` — `lastProcessedWordRef` declared.
- `app/routes/games/realitea/use-game.ts:159` — guard: `if (lastProcessedWordRef.current === result.word) return;`
- `app/routes/games/realitea/use-game.ts:61-67` — the puzzle-date-rollover effect resets `guesses`, calls `typing.setCurrentGuess`, and `anim.resetAnimation`, but does **not** reset `lastProcessedWordRef.current`.

## Why it matters

If a player guesses word "CRANE" on day 1, then plays again on day 2 (new puzzle, same session without a full page reload) and also guesses "CRANE" — the stale ref value from day 1 could cause the day-2 guess-result-processing effect to bail out early via the guard at `use-game.ts:159`, meaning the tile row for that guess never renders even though the server validated it.

## Suggested fix

Add `lastProcessedWordRef.current = null` alongside the other resets in the puzzle-rollover effect at `use-game.ts:61-67`.

## Open questions for discussion
- How often does this trigger in practice? (Only matters if a session survives a midnight puzzle rollover without a full reload — worth checking how common that is given the app's revalidation-on-tz-mismatch behavior.)
- Should guess-result processing be redesigned as an explicit reducer/state machine instead of effect + dual ref/state guards (see [13](13-fetcher-effect-double-guard.md)), which would eliminate this whole class of bug at once?
