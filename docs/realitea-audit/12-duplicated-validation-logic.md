# 12 — Duplicated guess-validation logic (client vs server)

**Category:** Data flow / architecture
**Severity:** Low-Medium (maintainability, not a bug today)

## Summary

`submitGuess` on the client pre-validates guess length and duplicate-guess status before ever hitting the server, and the server independently re-implements the same checks (correctly, as defense in depth) — but this means the rules exist in two places that must be kept in sync by hand.

## Evidence

- Client-side: `app/routes/games/realitea/use-game.ts:112-120` — length and duplicate checks in `submitGuess`, before the fetcher is invoked.
- Server-side: `app/lib/realitea/puzzle.server.ts:106-112` — `evaluateGuessServer` re-validates length/duplicate independently (the server also does a dictionary-membership check, which correctly exists *only* server-side since the word list shouldn't ship to the client).

## Why it matters

This isn't wrong — client-side pre-validation for instant UI feedback plus authoritative server-side re-validation is a standard, good pattern (defense in depth). The risk is purely maintenance: if the length rule or duplicate-check semantics ever change (e.g. case sensitivity, trimming, unicode normalization), both files need to be updated in lockstep, and nothing currently enforces that they stay consistent beyond manual review.

## Suggested fix (optional, not urgent)

Consider extracting the shared length/duplicate-check predicates into `app/lib/realitea/index.ts` (which already hosts `normalizeGuess`/`evaluateGuess`, imported by both client and server) so both sides call the same function rather than reimplementing the same conditional logic separately.

## Open questions for discussion
- Is this worth refactoring now, or is it low-risk enough (the rules are simple and unlikely to change) to leave as-is?
