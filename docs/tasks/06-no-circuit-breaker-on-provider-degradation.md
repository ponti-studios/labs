# 06 — Cron generation has no circuit breaker, burns the full 30-minute budget on a bad provider day

**Status:** Fixed
**Category:** Reliability / operations
**Severity:** Medium — not a correctness bug, but a real operational cost and blast-radius problem

## Summary

`scripts/realitea-generate.ts` iterates every active game, and for each game
`runGenerateWindow` (`app/lib/realitea/ops.ts:117-162`) iterates every
missing `dateKey` in the window, calling `generatePuzzleForGame` once per
date. Each of those calls already retries internally up to `maxAttempts`
(default 3) with exponential backoff. None of these loops know about each
other's failure history — a systemic problem (the LLM provider degraded,
rate-limited, or down) is invisible to the loop, so it retries every single
attempt for every single date for every single game before giving up,
instead of noticing "the last N attempts all failed the same way" and
aborting the run early.

This isn't hypothetical: the workflow run on 2026-08-16 hit exactly this.
`deepseek/deepseek-v4-flash` returned empty/malformed content on every one of
~30 attempts across every game and date in the window (see investigation in
[docs/tasks/01](01-cost-tracking-silently-broken.md) and the conversation
that produced this ticket — confirmed as a likely transient provider-side
issue, not a code bug, since the exact same calls succeeded cleanly once
retried manually afterward). The job ran for the full 30-minute
`timeout-minutes` budget and was killed by GitHub Actions rather than
recognizing the pattern and stopping itself.

## Evidence

- `.github/workflows/realitea-generate.yml` — `timeout-minutes: 30`, one job,
  `concurrency: { group: realitea-generate, cancel-in-progress: false }`.
- `app/lib/realitea/ops.ts:132-136` (force path) and `:149-153` (gap-fill
  path) — both `for (const dateKey of ...)` loops call
  `generatePuzzleForGame` unconditionally for every remaining date, with no
  shared failure counter or early-exit condition between iterations.
- `scripts/realitea-generate.ts:90-91` — the outer `for (const game of
  games)` loop has the same property one level up: a provider outage during
  game 1 doesn't stop the script from repeating the same futile attempts for
  every subsequent game.
- `generatePuzzleForGame`'s own per-date retry loop (`generate.server.ts`,
  `maxAttempts` default 3, exponential backoff `Math.pow(2, attempt) *
  1000`) is a reasonable retry policy *within* one date — the gap is
  entirely at the level above it, across dates/games within one invocation.
- Workflow run [31960833898](https://github.com/ponti-studios/labs/actions/runs/31960833898)
  (2026-08-16 17:11 UTC): 30 consecutive `GENERATION_API_ERROR` events
  (`"LLM returned empty content"` ×27, malformed-JSON ×3) across `page-six`,
  `rhobh`, and `sports`, before the job was cancelled at the 30-minute mark.
  Run [31727641658](https://github.com/ponti-studios/labs/actions/runs/31727641658)
  (2026-08-13) shows the same cancelled-on-timeout pattern.

## Why it matters

- **Wasted spend:** every futile attempt is a real (if small) OpenRouter
  charge — confirmed non-zero per call now that cost tracking is verified
  working (ticket 01). Thirty wasted attempts on a bad provider day is
  thirty wasted charges.
- **Wasted CI minutes and a stuck-looking job:** a 30-minute timeout-kill
  looks like a hang to anyone checking the Actions tab, when the actual
  failure was knowable after the first handful of attempts.
- **Delayed recovery:** because `concurrency.cancel-in-progress: false`,
  a stuck run doesn't get superseded by the next day's scheduled run either
  — it just also queues/fails the same way until someone notices.
- **No alerting signal:** nothing distinguishes "one date failed, unusual"
  from "the provider is down, everything will fail" in the current run
  output — an operator has to read the full log to tell the difference.

## Suggested fix

Add a simple circuit breaker at the `runGenerateWindow`/outer-loop level:
track consecutive `GENERATION_API_ERROR` (or general `llmError`) results
across dates/games within one invocation, and abort the remainder of the run
once a threshold is hit (e.g. 5–6 consecutive failures across different
dates — high enough to tolerate a couple of genuinely bad individual
articles, low enough to bail well before the 30-minute timeout). On abort:

- Stop iterating remaining dates/games rather than attempting each one.
- Record a distinct admin-action audit entry (e.g. `GENERATION_CIRCUIT_OPEN`)
  so it's visually distinct from "date-specific failures" in the audit log.
- Exit non-zero so the workflow run is clearly marked `failure`, not
  ambiguously `cancelled` by the timeout.

Lower-effort complementary options worth considering alongside this:
- Reduce `timeout-minutes` so a stuck run fails faster and more visibly
  even without the circuit breaker (doesn't address wasted spend, just
  wasted wall-clock time).
- Add a health-check/canary call before the main loop (one cheap completion)
  to fail the whole run fast if the provider is obviously down, before
  spending on the real batch.

## What was implemented

A shared `CircuitBreaker` (`app/lib/realitea/ops.ts`) tracks consecutive
generation failures across every date and every game within one invocation
of `scripts/realitea-generate.ts`:

- `createCircuitBreaker()` / `recordCircuitAttempt()` — a `{ consecutiveFailures, open }`
  counter; a success resets it to zero, a failure increments it, and it
  trips `open = true` once `CIRCUIT_BREAKER_THRESHOLD` (6) consecutive
  failures are hit.
- `runGenerateWindow(game, window, circuit)` now takes the breaker as a
  third parameter (defaulted for callers that don't care, e.g. tests) and
  checks `circuit.open` before each date's attempt in both the `force` and
  gap-fill loops — remaining dates are counted as `skippedCount`, not
  attempted or counted as failures.
- The moment the breaker trips, a `generation_circuit_open` admin-action
  audit row is recorded (new enum value on `realiteaAdminActionKindValues`
  — TS-level only, no DB migration needed since the column is plain `text`)
  with `{ consecutiveFailures, threshold }`, distinct from per-date
  `gap_fill`/`gap_fill_one` failure entries.
- `scripts/realitea-generate.ts` creates one `CircuitBreaker` before the
  outer game loop and passes it into every `runGenerateWindow` call, so the
  breaker's state is shared across games, not just within one game's dates.
  When a game's result reports `circuitOpened`, the outer loop `break`s
  instead of continuing to the next game. The run then throws a distinct
  error (`generation circuit breaker tripped after N consecutive
  failures...`) rather than the generic `"N puzzle(s) failed to generate"`,
  so the failure reason is unambiguous in the workflow logs.

Not implemented (left as the "lower-effort complementary options" in the
original writeup, not required to close this ticket): reducing
`timeout-minutes`, and a pre-flight canary call. Worth revisiting if the
threshold of 6 turns out to be miscalibrated in practice.

## Verification

- `pnpm exec tsc --noEmit` clean.
- `pnpm test:realitea` — 121 tests passing, including two new cases in
  `app/lib/realitea/__tests__/ops.test.ts`: one confirms the breaker trips
  at exactly `CIRCUIT_BREAKER_THRESHOLD` consecutive failures and skips the
  rest of the window; the other confirms a periodic success resets the
  counter so the breaker never trips.
- `pnpm exec vitest run app/lib/realitea app/routes/games/realitea` (default
  suite) — 39 tests passing, unaffected.
