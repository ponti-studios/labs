# 02 — No rate limiting on guess endpoint

**Category:** Security / integrity
**Severity:** Medium-High

## Summary

There is no rate limiting, throttling, or per-IP/session cooldown anywhere in the repository. The guess-validation endpoint is an unbounded-cost operation that can be called as fast as the network allows.

## Evidence

- Repo-wide grep for `rateLimit`/`throttle`/`express-rate-limit` returns no matches related to Realitea (or anything else in the app).
- `app/routes/api.games.realitea.guess.ts` — POST handler has no cooldown, CAPTCHA, or request-count gating.
- Each call to `evaluateGuessServer` (`app/lib/realitea/puzzle.server.ts:98-151`) does at least 2 DB round trips: `loadPuzzleForDate`, and `isValidWord` → `getStoredAnswers`, which does a full table scan of `dailyPuzzles` when the word isn't in the static dictionary (`app/lib/realitea/word-list.server.ts:29-42`, `app/lib/realitea/repository.ts:73-79`).

## Why it matters

Combined with [01 — no server-side attempt tracking](01-no-server-side-attempt-tracking.md), this makes the endpoint a cheap, unthrottled oracle: a script can hammer it to brute-force letter-state feedback with no cooldown, and each call has non-trivial DB cost (worst case a full table scan). This is both an abuse vector and a cost/availability concern if traffic spikes.

## Open questions for discussion
- Is this worth solving with app-level rate limiting (e.g. a simple in-memory or Redis-backed token bucket keyed by IP), or is it better handled at the infra/CDN layer (Cloudflare, Fly.io edge rules, etc.) if that's already in place for the rest of the app?
- Should the dictionary-check fallback in `word-list.server.ts` be optimized regardless (e.g. cached word list) independent of rate limiting?
