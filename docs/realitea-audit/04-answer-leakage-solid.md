# 04 — Answer leakage protections (confirmed solid, not a bug)

**Category:** Security / integrity
**Severity:** N/A — this is a positive finding, included for completeness

## Summary

Unlike the other security findings, this one is a confirmation that a specific risk is **well-mitigated**, not a bug to fix. Included so it's on record and can be revisited if the relevant code changes.

## Evidence

- `app/lib/realitea/types.ts:24-34` — `PublicDailyPuzzle` is explicitly typed as `Omit<DailyPuzzleDto, "answer">`, with a comment: `// Do not send the answer to the client.`
- `app/lib/realitea/puzzle.server.ts:30-44` (`toPublicDailyPuzzle`) — the only DTO mapper used for client-facing puzzle data; only maps `answerType`, `clue`, `dateKey`, `detail`, `sources` — never `answer`.
- `app/lib/realitea/puzzle.server.ts:98-151` (`evaluateGuessServer`) — returns only `states`/`isSolved`/`status`, never the raw answer.
- Test coverage confirms this at multiple layers:
  - `app/lib/realitea/__tests__/puzzle.server.test.ts:170` — explicitly asserts `(result as {answer?: string}).answer` is `undefined`.
  - `app/routes/games/realitea/__tests__/loader.test.tsx:47` — confirms `payload.puzzle.answer` is `undefined` at the HTTP boundary.
- `app/lib/realitea/share.ts` — share text only encodes letter-state emoji, never the word.
- `app/routes/api.games.realitea.health.ts:63-70` — the admin-only health dashboard exposes `answerType`/`clue` but not `answer` (reasonable, though it's admin-gated anyway).

## Why it's worth documenting

This is exactly the kind of guarantee that's easy to accidentally break during a refactor (e.g., someone adds a new DTO mapper, or the health endpoint gets a "debug mode" that dumps the full DB row). The type-level `Omit` plus the layered tests make this a well-defended boundary — worth preserving that pattern (single mapper function, type-level exclusion, explicit "no answer" test) if the puzzle data model changes.

## Open questions for discussion
- None currently — flagging only so the team is aware this was checked and passed, not overlooked.
