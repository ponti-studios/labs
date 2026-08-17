# 05 — Per-attempt LLM failures no longer recorded in the admin-action audit trail

**Status:** Fixed
**Category:** Observability
**Severity:** Low

## Summary

Before `57ed331d`, every failed generation attempt inside the retry loop
called `recordGenerateFailure(..., "GENERATION_API_ERROR", {error})` — an
entry in the admin-action audit trail — even if a later attempt in the same
call ultimately succeeded. The rewritten `callGenerationApi` only logs the
failure via `childLogger.error(...)`; `recordGenerateFailure` is now called
exactly once, only if *all* attempts in `generatePuzzleForGame`'s retry loop
are exhausted (`GENERATION_EXHAUSTED`). A transient failure on attempt 1
followed by a success on attempt 2 now leaves zero trace in the audit log.

## Evidence

- `app/lib/realitea/generation/generate.server.ts:305` — current failure
  handling inside `callGenerationApi`:
  ```ts
  if (llmError) {
    childLogger.error({ event: "[GENERATION_API_ERROR]", error: llmError }, "generation API call failed");
    return { candidate: null, article: null, llmError, usage };
  }
  ```
  No `recordGenerateFailure` call here.
- `app/lib/realitea/generation/generate.server.ts:528` —
  `recordGenerateFailure(game.id, dateKey, actor, "GENERATION_EXHAUSTED", {...})`
  is the only remaining call site tied to attempt failures, reached only
  after every attempt in the retry loop has failed.
- Pre-rewrite version (`git show 57ed331d^:app/lib/realitea/generation/generate.server.ts`)
  called `recordGenerateFailure(game.id, dateKey, "system:generate",
  "GENERATION_API_ERROR", {error})` inside the same catch block, on every
  failed attempt, regardless of whether a later attempt succeeded.

## Partial mitigation already in place

Each attempt now writes its own row to the new `generationRuns` table
(status `"failed"`, `llmError`, token usage) — see
`generate.server.ts:495-509`. So per-attempt failure data isn't entirely
lost; it moved to a different table (`generationRuns`) than the admin-action
audit log (`recordAdminAction`/`recordGenerateFailure`) this ticket is
about. Anyone querying `generationRuns` directly can still reconstruct
attempt-level failures. The gap is specifically in the human-facing
admin-action audit trail that ops/on-call would check first.

## Why it matters

Lower severity than the other tickets in this set because the data isn't
gone, just relocated to a table that isn't the first place someone
debugging "why did generation seem flaky yesterday" would look. Worth fixing
for consistency, not urgent.

## Suggested fix

Either restore a `recordGenerateFailure` (or a lighter-weight equivalent)
call inside `callGenerationApi`'s `if (llmError)` branch at
`generate.server.ts:305`, scoped per-attempt as before, or — if the
`generationRuns` table is intended to fully supersede the admin-action audit
trail for this specific event type — update whatever admin UI/runbook still
points at `recordAdminAction`/`recordGenerateFailure` entries to also
surface per-attempt rows from `generationRuns`, so the information is
discoverable from one place either way.

## Verification

CONFIRMED by an independent verifier comparing the pre-rewrite version (via
`git show 57ed331d^:...`) against the current file and confirming
`recordGenerateFailure`'s only remaining attempt-related call site is the
exhausted-retries path.

## Addendum

The initial fix (PR #240) restored `recordGenerateFailure` for the
`GENERATION_API_ERROR` branch (LLM call itself failing) but missed the
sibling `GENERATION_MATCH_ERROR` branch added for ticket 04 (the
candidate-matching loop's new catch block) — that branch logged the error
but still didn't write an audit-trail entry, reopening the same gap for a
different failure mode. Caught and fixed in a follow-up commit (`11e29839`,
same commit as the ticket 02 addendum) directly on `main`.
