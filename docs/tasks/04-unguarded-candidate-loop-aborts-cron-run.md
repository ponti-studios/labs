# 04 — Unguarded candidate-matching loop can abort an entire cron invocation

**Status:** Fixed
**Category:** Correctness / error handling
**Severity:** Medium

## Summary

Before `57ed331d`, `callGenerationApi` wrapped its entire body — the LLM call
*and* the candidate-validation/matching loop that follows it — in one
try/catch, reporting any failure via `recordGenerateFailure` and returning
`null` so the caller could retry the next attempt. The rewritten version only
catches exceptions from the LLM call itself
(`callGenerationApiForCandidates`, which has its own internal try/catch); the
candidate-matching loop that runs afterward — `matchArticle` plus
`await recordArticleRejection(...)` per rejected candidate — is completely
unguarded. If either of those throws, the exception now propagates all the
way out of `callGenerationApi`, through `generatePuzzleForGame` (no
try/catch), through the cron/gap-fill date-key loop (no try/catch), aborting
the rest of that cron invocation instead of just failing the current
attempt.

## Evidence

- `app/lib/realitea/generation/generate.server.ts:309-331` — the current
  loop:
  ```ts
  for (const { candidate, validation } of candidates) {
    const article = matchArticle(candidate, pendingArticles);
    // ...
    await recordArticleRejection(article.id, validation.reasons.join("; "), MAX_ARTICLE_REJECTIONS);
  }
  ```
  has no surrounding try/catch. Compare to the pre-rewrite version (see
  `git show 57ed331d^:app/lib/realitea/generation/generate.server.ts`),
  which wrapped this same logic in the outer try/catch that also covered the
  LLM call.
- `generatePuzzleForGame` (same file, ~lines 459-493) calls `callGenerationApi`
  inside its attempt-retry loop with no try/catch of its own — a throw here
  aborts the whole function, not just the current attempt.
- The cron entry points (`app/lib/realitea/ops.ts`, the `for (const dateKey
  of ...)` loops around lines 132-136 and 149-153) also have no try/catch
  around `generatePuzzleForGame` — a throw aborts the remaining
  dateKeys/games in that invocation.
- The actual top-level script (`scripts/realitea-generate.ts:144-154`) does
  have a top-level `try { await main(); } catch { ...; process.exit(1); }
  finally { closeDb(); }`, so the process itself won't crash unhandled — it
  logs an error and exits cleanly. This limits the blast radius to "the rest
  of this run is wasted," not "the process crashes uncleanly."

## Why it matters

`recordArticleRejection` does a DB write. If that write throws — a
transient connection blip, a timeout, a constraint violation — the entire
cron invocation's remaining work (every other dateKey and game scheduled for
that run) is abandoned instead of just the current attempt being retried or
skipped. The old code's per-call catch meant a single flaky DB write cost
one attempt; the new code lets it cost the whole run.

## Suggested fix

Wrap the candidate-matching loop (`generate.server.ts:309-331`) in its own
try/catch, converting a thrown error into the same kind of `llmError`/failed-
attempt result the LLM-call path already produces, so a DB blip during
scoring is treated as "this attempt failed, try the next one" rather than
"abort everything downstream." Alternatively (or additionally), add a
try/catch around each `generatePuzzleForGame` call in the cron date-key loop
so one game's failure doesn't take out the rest of the batch.

## Verification

CONFIRMED by an independent verifier comparing the pre-rewrite version (via
`git show 57ed331d^:...`) against the current file, and tracing every caller
up to the top-level script's catch block. The verifier noted the practical
severity is "a wasted cron run, not a crashed process" since
`scripts/realitea-generate.ts` does catch at the top level — but the
per-attempt retry behavior the old code had is still lost.
