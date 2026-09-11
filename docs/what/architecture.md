---
title: What Architecture
summary: How What splits gameplay, validation, generation, and publishing across the browser, server, and scheduled workflows.
type: architecture
status: active
owner: charlesponti
tags: [architecture, backend, react-router, generation]
related: [./generation-current-architecture.md, ./reliability-and-testing.md, ./candidate-generation.md]
updated: 2026-09-10
---

# What Architecture

What works because the architecture draws a clean line: the browser owns responsiveness, the server owns validation and publishing, and a scheduled GitHub Actions workflow owns generation. Everything else exists to keep that arrangement intact.

## Package layout

What lives in `packages/what` (`what`) on the [labs monorepo](../../README.md) alongside Labs (`packages/labs`). Shared code is in workspace packages: `@pontistudios/db` (Drizzle schema + migrations in `packages/db/src/schema/`), `@pontistudios/ai` (OpenRouter client), `@pontistudios/env` (shared env schemas). The database schema is a fixed Postgres schema named `labs`; generation tables are defined in `packages/db/src/schema/game.ts`.

The puzzle pipeline lives in `packages/what/src/lib/`:

| Concern | Files |
| --- | --- |
| Feed catalog | `lib/generation/catalog.ts` |
| Ingest (RSS + Readability) | `lib/generation/ingest.server.ts` |
| Generation core | `lib/generation/puzzle-generator.server.ts`, `generate.server.ts` (public boundary) |
| Candidate LLM + validation | `lib/generation/candidate-generator.server.ts`, `candidate-validation.ts` |
| Circuit breaker | `lib/generation/circuit-breaker.ts` |
| Window / gap-fill / force orchestration | `lib/generation/generate-range.ts`, `generation-runner.ts` |
| Data access | `lib/data/*.server.ts` |
| Serving + fallback | `lib/data/puzzle.server.ts`, routes under `src/routes/` |
| Admin console | `src/routes/admin.*`, `lib/admin/*` |
| Env schema | `lib/infrastructure/env.ts` (`WhatServerEnv`, re-export of `LabyrinthServerEnv` from `@pontistudios/env`) |

Entry-point scripts live in `packages/what/scripts/` (`game-ingest.ts`, `game-generate.ts`, `game-health-check.ts`) and run as `pnpm game:ingest`, `pnpm game:generate`, `pnpm game:health-check` from the repo root.

## Core layers

### Pure gameplay logic

The lowest layer (`lib/puzzle/`) holds rules that stay deterministic and testable: date-key handling, guess normalization, answer-length rules, and timezone resolution. Player timezone travels in the `what_timezone` cookie (`lib/puzzle/timezone.ts`); missing, malformed, or invalid values fall back to `UTC`. `tz` query parameters are ignored.

### Server-only word validation

Dictionary validation lives on the server (`lib/data/word-list.server.ts`). Answers are exactly 5 letters (`GAME_ANSWER_LENGTH`); the word list is never sent to the browser. Every normalized answer ever published is also accepted, so franchise recognition works through previously published puzzles, not a separate fallback list.

### Server-only generation and publishing

Each game (`games_topics`) has its own RSS feed and system prompt, so generation is per-game. The pipeline draws from that game's pending `articles` inventory, generates candidates through OpenRouter, validates each against the game's rules, and persists only approved puzzles to `games_puzzles`. There is no curated-archive fallback at generation time: failed dates stay empty until the next run, and a shared circuit breaker (`lib/generation/circuit-breaker.ts`, threshold 6) stops a run early when the provider is degraded instead of burning the attempt budget.

Serving resolves the active puzzle by the player's local date; if nothing exists for that date it falls back to the most recently created puzzle with `dateUtc <= that date` (`FALLBACK_ACTIVATED_ANY_PUZZLE`, flagged as `isFallback`). There is also a public date-parameterized endpoint (`/api/:topic/puzzle/:date`) that returns just a specific day's puzzle for signed-in history views.

## The five games

`lib/generation/catalog.ts` defines the catalog; `ensureGameCatalog` (ingest) upserts it into `games_topics` on every run. Default game slug is `reality`:

| slug | feed | label |
| --- | --- | --- |
| `reality` | `https://realityblurred.com/realitytv/feed` | Reality Blurred |
| `technology` | `https://techcrunch.com/feed/` | TechCrunch |
| `page-six` | `https://pagesix.com/feed/` | Page Six |
| `tmz` | `https://www.tmz.com/rss.xml` | TMZ |
| `sports` | `https://www.cbssports.com/rss/headlines/` | CBS Sports |

Per-game tunables live on `games_topics`: `answerLength` (5), `repeatWindowDays` (90), `articleExpiryDays` (45), `systemPromptPath` (all currently `src/prompts/game-generation.md`).

## Admin console

`/admin` (`src/routes/admin.*`) is an authenticated operator surface, `noindex`, no public nav. Access requires a signed-in Hominem user whose email is on the `GAME_ADMIN_EMAILS` allowlist, enforced when `NODE_ENV === "production"` or on Railway (`lib/admin/auth.ts`). Every operator write goes through `recordAdminAction` into `admin_actions` — an audit trail.

Generation is a persisted run before it is a puzzle. An operator triggers a run (`generation_runs`) against a source mode (inventory, feeds, explicit articles, rss, fixtures), prompt, and model; candidates stream to the UI over SSE (`lib/admin/generation-events.server.ts`). Publishing from the admin console goes through `lib/admin/publish.ts`; the cron path publishes through `generatePuzzleForGame` instead. Each `games_puzzles` row carries `generationRunId` back to the run that produced it (`set null` on run deletion so retention can never delete a live puzzle). Puzzle attempts live in `games_attempts`; replacing a date that already has attempts snapshots the pre-image `game_puzzle_revisions`.

## API surface

- `GET /api/games` — active game list.
- `GET /api/:topic/puzzle` — today's puzzle for the player's timezone.
- `GET /api/:topic/puzzle/:date` — a specific date's puzzle (history/dated views).
- `POST /api/:topic/guess` — submit a guess.
- `POST /api/:topic/attempt` — record an attempt lifecycle.
- `POST /api/words/validate` — check whether a word is a playable answer.
- `GET /api/history` — player history.
- `GET /healthz` — service health.

## Scheduled publishing

One workflow drives generation: `.github/workflows/game-generate.yml`.

- **Schedule:** two cron entries, `0 22 * * *` and `0 23 * * *` UTC daily. The
  22:00 UTC run is the primary generation — it generates exactly *tomorrow*
  from that same UTC day's articles (~14:00/15:00 PST cutoff), before UTC
  midnight so tomorrow is live under no guard anchor for any market. The
  23:00 UTC run is the retry pass: gap-fill skips what already exists (a
  ~free no-op when healthy), self-healing the window when the primary failed.
  Both run `pnpm game:generate` with no flags (bare gap-fill mode).
- **Manual:** `workflow_dispatch` with inputs `mode` (`force` default / `gap_fill`), `days-ahead`, and optional `from`/`to` — delete-then-regenerate or gap-fill a window.
- **Steps:** ingest (`pnpm game:ingest`) → generate (`pnpm game:generate`) → health check (`pnpm game:health-check`), all `if: github.ref == 'refs/heads/main'`, `concurrency: { group: game-generate, cancel-in-progress: false }`, `timeout-minutes: 30`.

Neither the scheduled nor manual path is exposed as an HTTP write surface. The health-check step exits 1 on `DEGRADED` (no puzzle for today, or no puzzle scheduled for tomorrow), failing the run visibly in GitHub; run failures surface via GitHub's native workflow-notification email. See [generation current architecture](./generation-current-architecture.md) for the full pipeline walkthrough.

## Read next

- [Generation pipeline (current state)](./generation-current-architecture.md)
- [Candidate generation](./candidate-generation.md)
- [Reliability and testing](./reliability-and-testing.md)