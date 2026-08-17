---
title: Candidate Generation
summary: How one date's puzzle gets from an RSS feed to an approved, published record.
type: reference
status: active
owner: charlesponti
tags: [generation, llm, pipeline]
related: [./architecture.md, ./prompt-evaluation.md, ./source-fixtures.md]
updated: 2026-08-16
---

# Candidate Generation

This is the per-date, per-game loop `generatePuzzleForGame` (`app/lib/what/generation/generate.server.ts`) runs. `runGenerateWindow` (`app/lib/what/ops.ts`) calls it once per missing date, per active game, inside a window — see [Architecture](./architecture.md) for how those calls are scheduled and circuit-broken.

## 1. Ingestion

The game's own RSS feed (`games_topics.feed_url`) is fetched and prepared as the context payload for the LLM prompt.

## 2. Generation and validation loop — 3 attempts max

- **Request:** the worker sends the feed data to OpenRouter. The LLM returns a batch of 3–5 candidates (schema-enforced `min(3).max(5)`), not a fixed count.
- **Sequential validation:** candidates are checked in order. The first valid one wins — it's written to `games_puzzles` (Drizzle export `gamesPuzzles`), the rest of the batch is discarded, and generation exits successfully for that date.
- **All invalid:** if attempt count is under 3, the worker backs off exponentially (`2^attempt` seconds) and requests a fresh batch. Each failed attempt logs `[GENERATION_RETRY]` ("generation attempt yielded no valid candidate").

## 3. Exhaustion

If attempt 3/3 also fails validation entirely, generation logs `[GENERATION_EXHAUSTED]` ("puzzle generation failed after all attempts") and returns without publishing for that slot. There is no curated-archive fallback at generation time — the route-level serving fallback (most recent approved puzzle) is what covers this, not a second content source.

## Above this loop

A single degraded-provider day (every attempt failing the same way) doesn't get retried indefinitely — the circuit breaker in `runGenerateWindow` stops the run after `CIRCUIT_BREAKER_THRESHOLD` consecutive failures across dates and games. See [Architecture § Server-only generation and loading](./architecture.md).
