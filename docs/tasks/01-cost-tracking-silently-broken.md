# 01 — Cost tracking (resolved: was never actually broken)

**Status:** Resolved — confirmed working, not a bug.
**Category:** Correctness (false alarm)
**Severity:** N/A

## Summary

The `feat(realitea): cost-tracked, resumable puzzle generation` change
(`57ed331d`) added per-run cost tracking (`costUsd` on `generationRuns`) and
a whole admin dashboard to surface it (`/admin/costs`, per-run cost columns
on the generations list and detail view).

This ticket went through two rounds of revision:

1. **Original claim:** OpenRouter only returns `usage.cost` when the request
   opts in with `usage: {include: true}`, and the outgoing request never
   sets that flag, so `costUsd` is `null` on every run. **This was wrong.**
2. **First correction:** inspecting the installed `@openrouter/sdk@1.2.6`
   directly showed `ChatRequest` has no `usage` field to set at all, and a
   sibling field's deprecation note says usage is unconditionally included
   now — contradicting the original claim's mechanism, but leaving open
   whether `costUsd` was *actually* coming back populated in practice.
   Added a `[GENERATION_USAGE_MISSING_COST]` warning log to observe a real
   response instead of guessing further.
3. **Confirmed via live test:** ran `generateCandidates` directly against
   real production-shaped content (the `page-six` source fixture, 8 full
   articles, ~55K chars of article text — comparable to what the cron path
   sends) using the exact same model and `maxTokens` config as production.
   Result: `usage.costUsd: 0.0011939921` — a real, non-null value. The
   `[GENERATION_USAGE_MISSING_COST]` warning did not fire.

**Cost tracking works correctly.** The dashboard, per-run cost columns, and
`/admin/costs` report are all reading real data.

## Evidence

- Live diagnostic run (2026-08-16, local): `generateCandidates` called with
  `app/lib/realitea/fixtures/sources/page-six.json` (8 items,
  `totalArticleTextChars: 55514`), model `deepseek/deepseek-v4-flash`,
  `maxTokens: 4000` (production default) — returned:
  ```json
  {
    "requestedMaxTokens": 4000,
    "reasoningEffort": null,
    "promptTokens": 15719,
    "completionTokens": 754,
    "reasoningTokens": 0,
    "totalTokens": 16473,
    "costUsd": 0.0011939921
  }
  ```
- `app/lib/realitea/generation/generate.server.ts` (`usageFromResponse`) —
  still carries the `[GENERATION_USAGE_MISSING_COST]` warning added during
  investigation; left in place as a cheap ongoing sanity check, not removed.

## What changed

Nothing in application code needed to change — the feature was correct as
shipped. The only lasting change from this investigation is the
`[GENERATION_USAGE_MISSING_COST]` warning log, kept as a low-cost guard in
case this ever regresses (e.g. an SDK upgrade reintroducing a request-side
opt-in requirement).

## Lesson

The original review finding was plausible-sounding (matches older OpenRouter
API documentation patterns) but wrong for the SDK version actually in use.
Worth remembering: a "missing request flag" diagnosis for a third-party API
should be checked against the actual installed SDK/response shape before
being treated as confirmed, especially when a live call is cheap enough to
just run.
