# 01 — Cost tracking may be recording `null` on every run (root cause unconfirmed)

**Status:** Open — instrumented, not fixed. Original diagnosis was wrong; see below.
**Category:** Correctness (suspected)
**Severity:** High if real — defeats the stated purpose of the feature it ships with

## Summary

The `feat(realitea): cost-tracked, resumable puzzle generation` change
(`57ed331d`) added per-run cost tracking (`costUsd` on `generationRuns`) and
a whole admin dashboard to surface it (`/admin/costs`, per-run cost columns
on the generations list and detail view).

This ticket originally claimed the root cause was: "OpenRouter only returns
`usage.cost` when the request opts in with `usage: {include: true}`, and the
outgoing request never sets that flag." **That diagnosis does not hold up.**

## Correction

Inspecting the installed `@openrouter/sdk@1.2.6` directly (not just the
diff):

- `ChatRequest` (`chatrequest.d.ts`) has **no `usage`/`usage.include` field
  at all** — not merely unset, it isn't part of the type, and the outbound
  Zod schema used to serialize the request (`ChatRequest$outboundSchema`)
  would silently strip any such key even if force-added via a type cast.
  There is no code path — fixed or otherwise — that can set this flag on
  this SDK version.
- `ChatStreamOptions.includeUsage` (`chatstreamoptions.d.ts`), a related but
  distinct field, carries this doc comment: *"Deprecated: This field has no
  effect. Full usage details are always included."* That's the SDK stating
  OpenRouter no longer requires a request-side opt-in for usage — it's
  unconditional now, on this API version.

So either `costUsd` isn't actually broken (usage really is always included,
and the earlier review's finding was based on stale OpenRouter docs), or it
is broken for some other reason entirely — a specific model/provider not
reporting cost, a BYOK-key exemption, an account-level setting, or something
not visible from static analysis. **This can only be settled by inspecting a
real response from a live generation run**, which isn't possible from this
environment (no API key, and it would cost real money to test speculatively).

## What's been done

Added a runtime signal instead of guessing: `usageFromResponse` in
`app/lib/realitea/generation/generate.server.ts` now logs a
`[GENERATION_USAGE_MISSING_COST]` warning whenever a response includes token
counts but `usage.cost` is still `null`/`undefined`. The next real generation
run (admin UI or cron) will make this observable either way:

- If the warning **never fires** and `costUsd` starts showing real values on
  `/admin/costs`, the feature was already working and this ticket is
  invalid — close it.
- If the warning **fires** on every run, the feature is genuinely broken for
  a reason still to be identified — capture one full raw `response.usage`
  payload from the log and continue investigating from there (check
  OpenRouter's current dashboard/account settings for a cost-reporting
  toggle, and confirm the specific model being used actually reports cost).

## Evidence

- `app/lib/server/ai/index.ts:93-100` — the `chatRequest` object passed to
  `client.chat.send(...)`.
- `node_modules/@openrouter/sdk/esm/models/chatrequest.d.ts` — `ChatRequest`
  type, no `usage` field.
- `node_modules/@openrouter/sdk/esm/models/chatstreamoptions.d.ts` —
  `includeUsage` deprecation note.
- `app/lib/realitea/generation/generate.server.ts` (`usageFromResponse`) —
  now instrumented with the warning described above.
- Downstream consumers that render `costUsd` and would be affected if this
  turns out to be real: `app/routes/games/realitea/admin/costs.tsx`,
  `generations.$id.tsx`, `inventory-list.tsx`, `route.tsx` (overview metric
  card).

## Why it matters

If real, this is the headline feature of the commit ("cost-tracked... puzzle
generation") silently doing nothing, with no error to surface it —
`/admin/costs` would just render `$0.00`/`—` forever. That's still worth
tracking even though the originally proposed fix was wrong.

## Next step

Watch the logs for `[GENERATION_USAGE_MISSING_COST]` after the next real
generation run, or manually trigger one generation in a non-production
environment and inspect the logged `usage` payload directly. Do not
reintroduce the `usage: {include: true}` request field — it doesn't exist on
this SDK version and won't compile/serialize.
