# 01 — No server-side attempt tracking

**Category:** Security / integrity
**Severity:** High

## Summary

The guess-evaluation endpoint has no server-side memory of how many guesses a player has made or which words they've already tried. It relies entirely on the `previousGuesses` array the client includes in each request body.

## Evidence

- `app/lib/server/db/schema/realitea.ts` — the `daily_puzzles` table (and the schema generally) has no `user_id`, `session_id`, or `attempts` table of any kind. There is no persisted per-player progress anywhere server-side.
- `app/lib/realitea/puzzle.server.ts:98-151` (`evaluateGuessServer`) — the "already guessed" check (`:110-112`) and the game-over/guess-count calculation (`:142-143`) both operate on the `previousGuesses` array passed in from the request body, not from any trusted server record.
- `app/routes/api.games.realitea.guess.ts:6-13` — the Zod schema caps `previousGuesses` at 6 array elements, but that's a shape constraint, not a truth constraint. A client can send `previousGuesses: []` on every request regardless of actual history.

## Why it matters

A scripted client can:
- Submit unlimited guesses by omitting or fabricating `previousGuesses`, bypassing the 6-guess limit.
- Re-submit an already-guessed word by lying about history, potentially using this as a Wordle-style oracle to brute-force letter states and recover the answer without ever exhausting attempts.

This is a stateless-by-design system (no auth, no accounts), so the fix isn't necessarily "add user accounts" — it could be a signed/HMAC'd guess-history token, a short-lived session cookie tying guesses to a server-tracked counter, or simply accepting this as an acceptable tradeoff for a free casual game with no leaderboard/competitive stakes.

## Open questions for discussion
- Does this matter for a puzzle game with no competitive ranking or prizes? (I.e., is "cheating" actually a meaningful threat here?)
- If it does matter, what's the right primitive — session cookie + server-side counter, signed guess-history blob, or per-IP guess ledger keyed by `dateKey`?
