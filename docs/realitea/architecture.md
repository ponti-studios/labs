---
title: RealiTea Architecture
project: realitea
type: spec
status: active
client: null
industry: null
owner: charlesponti
tags:
  - architecture
  - ai
  - backend
  - react-router
related:
  - ./index.md
  - ./reliability-and-testing.md
summary: The backend and domain architecture behind RealiTea, including daily puzzle loading, server-side validation, and AI-assisted publishing with deterministic fallback.
---

# RealiTea Architecture

RealiTea works because the architecture draws a clean line. The browser owns responsiveness. The server owns validation and publishing. Everything else exists to keep that arrangement intact.

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

The server layer owns publishing. It fetches RHOBH source material from a single RSS feed (realityblurb.com), generates candidates through TanStack AI with OpenRouter, and persists only approved puzzles. There is no curated-archive fallback at generation time: if every attempt fails, generation simply logs the failure and publishes nothing for that slot.

The same layer resolves the active daily puzzle for the route: it serves today's approved record if one exists, and otherwise falls back to the most recently published puzzle of any date. That is a serving-time continuity fallback, not a content fallback bank.

## Why fallback-first architecture mattered

The route can render a known-safe puzzle — the most recent approved one — even when today's puzzle has not published yet, source collection falls short, or model output is rejected across all attempts. Generation improves freshness. The "serve the last good puzzle" rule preserves continuity.

## API surface

The game relies on a small API surface rather than a large backend.

- `POST /api/words/validate` checks whether a guess is playable.
- `POST /api/games/realitea/guess` submits a guess for validation against the active puzzle.
- `GET /api/games/realitea/health` reports health/status for the daily puzzle pipeline.
- The `/games/realitea` route loader resolves and serves the active puzzle server-side; there is no public date-parameterized daily-puzzle endpoint.
- `pnpm --filter @pontistudios/labyrinth realitea:gen` runs `scripts/generate-realitea-scheduled-puzzle.ts`, which accepts `--date-key`, `--from`, `--to`, and `--days-ahead` flags (not `--date-utc`).
- `pnpm --filter @pontistudios/labyrinth realitea:reconcile` runs `scripts/realitea.reconcile.ts`, which fills gaps in a forward inventory window (default 7 days) rather than generating a single day.

The small API surface is deliberate. Each endpoint has one job and a clear owner.

## Scheduled publishing

Two GitHub Actions workflows drive publishing:

- `cron-realitea-generate.yml` runs on a `0 17 * * *` UTC cron (9am Pacific, chosen to be DST-safe) and calls `realitea:reconcile` to keep the forward inventory window filled.
- `realitea-regenerate.yml` is manual (`workflow_dispatch`) for on-demand regeneration.

Neither workflow runs at midnight UTC, and neither is exposed as an HTTP write surface — both run as direct script/build steps.

This is the operational half of the system. A daily game does not just need content rules. It needs a publishing path that runs on time and fails safely.

## Read next

- [Back to the overview](./index.md)
- [Reliability and testing lessons](./reliability-and-testing.md)
