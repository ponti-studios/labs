---
title: Architecture
summary: How What splits gameplay, validation, and publishing across the browser and server.
type: architecture
status: active
owner: charlesponti
tags: [architecture, backend, react-router]
related: [./reliability-and-testing.md, ./candidate-generation.md]
updated: 2026-08-16
---

# What Architecture

What works because the architecture draws a clean line. The browser owns responsiveness. The server owns validation and publishing. Everything else exists to keep that arrangement intact.

## Core layers

### Pure gameplay logic

The lowest layer handles the rules that should remain deterministic and easy to test:

- guess normalization,
- puzzle key generation,
- puzzle lookup,
- duplicate-letter evaluation,
- keyboard-state reduction.

Keeping this logic pure means the route does not become the only place where the game makes sense.

### Server-only word validation

Dictionary validation lives on the server. A single 5-letter word list (`app/data/words/5.txt`) is imported as a raw asset and loaded eagerly into a `Set` when the module loads. Only 5-letter answers are supported today; there is no multi-length (four-through-ten) word list. That set is never sent to the browser.

This layer also injects franchise-specific answers into the accepted set dynamically: every normalized answer that has ever been stored in the daily puzzle table is accepted, in addition to whatever is in the base word list. There is no separate static/curated fallback answer list — franchise recognition works entirely through previously published puzzles.

That keeps the rules specific to the game without loosening the contract.

### Shared daily puzzle domain rules

The daily puzzle domain layer does the cleanup work that keeps generation and loading sane:

- parsing date inputs safely,
- validating candidate shape,
- enforcing answer normalization,
- preventing spoiler leakage,
- applying source policy,
- enforcing repeat-window rules,
- mapping stored records into route-facing puzzle objects.

This keeps generation policy out of the route and out of the scheduler.

### Server-only generation and loading

The server layer owns publishing. Each game (`games_topics`) has its own RSS feed and system prompt, so generation is per-game rather than tied to a single show. The pipeline fetches that game's source material, generates candidates through OpenRouter, and persists only approved puzzles. There is no curated-archive fallback at generation time: if every attempt fails, generation simply logs the failure and publishes nothing for that slot. A shared circuit breaker (`app/lib/what/circuit-breaker.ts`) across dates and games stops a run early if the provider is degraded, instead of burning the full attempt budget — see `runGenerateWindow` in `app/lib/what/generation-runner.ts`.

The same layer resolves the active daily puzzle for the route: it serves today's approved record if one exists, and otherwise falls back to the most recently published puzzle of any date. That is a serving-time continuity fallback, not a content fallback bank.

## Admin console

`/admin` (`packages/what/src/routes/admin/`) is an authenticated operator surface, `noindex`, no public nav. Access requires a signed-in Hominem user whose email is on the `GAME_ADMIN_EMAILS` allowlist (required in production/Railway). Every operator write goes through `recordAdminAction` into `game_admin_actions`, an audit trail of who did what to which date.

Generation is a persisted, non-publishing run before it's a puzzle. An operator triggers a run (`what_generation_runs`) against a chosen article source, prompt, and model; the model returns 3–5 scored candidates (`what_generation_candidates`), streamed to the UI over SSE (`app/lib/what/admin/generation-events.server.ts`). Nothing lands in `games_puzzles` until `publishCandidate` (`app/lib/what/admin/publish.ts`) is called explicitly on one candidate — it re-validates against the current excluded-answer set, then creates or replaces the row for that date. Replacing a date that already has player attempts snapshots the pre-image to `what_puzzle_revisions` (including the attempts) before overwriting, rather than allowing a silent rescore.

Every published puzzle carries provenance — `games_puzzles.generation_run_id` links back to the run that produced it (`set null` on run deletion, so run retention can never delete or block a live puzzle). Article ownership is per-game (`articles.games_topic_id`), not global, so multiple games (e.g. `rhobh`, `page-six`, `sports`) draw from independent article pools rather than competing for one shared inventory.

Player-facing date access is bounded the same way as generation: a date is "live" if it's today in UTC or `America/Los_Angeles`, and nothing before or after that window is playable or replaceable without going through the admin flow.

## Why fallback-first architecture mattered

The route can render a known-safe puzzle — the most recent approved one — even when today's puzzle has not published yet, source collection falls short, or model output is rejected across all attempts. Generation improves freshness. The "serve the last good puzzle" rule preserves continuity.

## API surface

The game relies on a small API surface rather than a large backend.

- `POST /api/words/validate` checks whether a guess is playable.
- `POST /api/games/what/guess` submits a guess for validation against the active puzzle.
- The admin interface reports health/status for the daily puzzle pipeline.
- The `/games/what` route loader resolves and serves the active puzzle server-side; there is no public date-parameterized daily-puzzle endpoint.
- `pnpm what:generate` runs `scripts/what-generate.ts`, which accepts `--force`, `--days-ahead`, `--from`, and `--to` flags. It fills gaps in a forward inventory window (default 7 days) across every active game rather than generating a single day for a single game.

The small API surface is deliberate. Each endpoint has one job and a clear owner.

## Scheduled publishing

One GitHub Actions workflow drives publishing: `.github/workflows/what-generate.yml`. It runs on a `0 17 * * *` UTC cron (9am Pacific, chosen to be DST-safe) and calls `what:generate` in `gap_fill` mode to keep the forward inventory window filled across all active games; `workflow_dispatch` supports an on-demand `force` mode (delete-then-regenerate a window) for manual regeneration. `timeout-minutes: 30` and `concurrency.cancel-in-progress: false` bound one run; the circuit breaker (see above) is what actually stops a bad run early rather than letting it exhaust that budget.

Neither the scheduled nor manual path is exposed as an HTTP write surface — both run as direct script/build steps.

This is the operational half of the system. A daily game does not just need content rules. It needs a publishing path that runs on time and fails safely.

## Read next

- [Candidate generation pipeline](./candidate-generation.md)
- [Reliability and testing](./reliability-and-testing.md)
