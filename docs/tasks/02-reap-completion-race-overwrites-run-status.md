# 02 — Reap job and background completion handler race, can overwrite a succeeded run's status

**Status:** Fixed
**Category:** Correctness / concurrency
**Severity:** Medium — requires an unusually slow LLM call to trigger, but corrupts persisted state and misleads the admin UI when it does

## Summary

`reapStaleGenerations()` marks any `generationRuns` row still `status:
"running"` after `REAP_AFTER_MS` (10 minutes) as `failed`. It's called on
every admin overview/date page load (`inventory.ts:249,304`), not just at
generation-start time. Meanwhile, `runGenerationInBackground`'s completion
handler updates the row by `runId` alone, with no `WHERE status = 'running'`
guard. If a run is genuinely still in flight past 10 minutes (slow model,
not actually stuck) and an admin has the page open or reloads it, the reap
job marks it `failed`; when the real LLM call finishes afterward, the
completion handler unconditionally overwrites that back to
`succeeded`/`failed` based on the real outcome — but the SSE stream already
emitted a terminal "failed" event and closed, so the client never learns the
row's true final state without a manual refresh.

## Evidence

- `app/lib/realitea/admin/generate.server.ts:42` — `REAP_AFTER_MS = 10 * 60 * 1000`.
- `app/lib/realitea/admin/generate.server.ts:103-115` (`reapStaleGenerations`) —
  updates any row where `status = 'running' AND createdAt < cutoff` to
  `failed`, unconditionally.
- `app/lib/realitea/admin/inventory.ts:249` and `:304` — `reapStaleGenerations()`
  is called on both `loadAdminOverview` and `loadAdminDate`, i.e. on ordinary
  page loads/reloads, not only when a new generation starts.
- `app/lib/realitea/admin/generate.server.ts:313` and `:334` — both the
  success and catch paths of `runGenerationInBackground`'s completion
  handler do `.where(eq(generationRuns.id, runId))` with no additional
  status predicate, so a row already marked `failed` by the reap job gets
  silently overwritten.
- `app/routes/games/realitea/admin/generate.stream.ts` — the SSE route's
  `finish()` closes the stream and clears both the pub/sub subscription and
  the poll timer on the first terminal event. There's no logic to reopen or
  re-subscribe to `runId` after that, so a reap-triggered "failed" event
  that arrives before the real completion is the client's last word on the
  run, even though the row is later corrected in the database.

## Why it matters

Two admin-visible failure modes:

1. **The persisted row is wrong for a window of time.** A run that
   genuinely succeeded had its `status` briefly (or, if nobody reloads the
   page again, indefinitely from the SSE client's perspective) shown as
   `failed`, with `llmError: "reaped"` — a misleading, fabricated error on a
   run that produced a real result.
2. **The live view lies to the operator.** An admin watching a slow-but-fine
   generation sees it flip to "failed" and stop updating, when it actually
   succeeded moments later. They have no way to find out without manually
   reloading the generations list.

## Suggested fix

Two independent, complementary changes:

- Add `and(eq(generationRuns.status, "running"))` (or equivalent) to the
  completion handler's `WHERE` clause at `generate.server.ts:313` and `:334`
  so it never overwrites a row that's already left the `running` state —
  this alone prevents the DB corruption, though the client may still have
  seen a spurious terminal SSE event.
- Consider whether `REAP_AFTER_MS` is actually long enough for the slowest
  legitimate model/reasoning-effort combination in use, and/or whether
  `reapStaleGenerations()` should run on a schedule instead of on every page
  load, to reduce how often this race window opens at all.

## Verification

CONFIRMED by an independent verifier reading the exact lines in
`generate.server.ts`, `inventory.ts`, and `generate.stream.ts` above and
tracing the full causal chain — not inferred from the diff alone. The
verifier found the completion handler's missing status guard to be worse
than the original candidate finding assumed (no guard exists at all, so the
DB row itself is corrupted, not just the SSE view).

## Addendum

The initial fix (PR #240) only added the `status = 'running'` guard to the
**admin** background-completion handler
(`app/lib/realitea/admin/generate.server.ts`). The same race exists on the
**cron/gap-fill** path — `generatePuzzleForGame`'s own `generationRuns`
update in `app/lib/realitea/generation/generate.server.ts` had the identical
unguarded `.where(eq(generationRuns.id, run.id))`. Caught and fixed in a
follow-up commit (`11e29839`, `fix(realitea): close remaining reap-race and
audit-trail gaps on cron path`) directly on `main`. Both paths now carry the
guard.
