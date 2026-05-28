---
title: RHOBH Wordle Architecture
slug: rhobh-wordle-architecture
summary: The backend and domain architecture behind RHOBH Wordle, including daily puzzle loading, server-side validation, and AI-assisted publishing with deterministic fallback.
date: 2026-05-28
tags:
  - architecture
  - ai
  - backend
  - react-router
related:
  - ./index.md
  - ./reliability-and-testing.md
source:
  - ../../../apps/labyrinth/RHOBH_WORDLE.md
---

# RHOBH Wordle Architecture

RHOBH Wordle works because the architecture draws a clean line. The browser owns responsiveness. The server owns validation and publishing. Everything else is there to keep that arrangement intact.

## Core layers

### Pure gameplay logic

The lowest layer handles the game rules that should remain deterministic and easy to test:

- guess normalization,
- puzzle key generation,
- puzzle lookup,
- duplicate-letter evaluation,
- keyboard-state reduction.

Keeping this logic pure means the route does not become the only place where the game makes sense.

### Server-only word validation

Dictionary validation lives on the server. ENABLE1 word lists for lengths four through ten are imported as raw assets at build time and cached in memory on first use. Those sets are never sent to the browser.

This layer also injects RHOBH-specific answers into the accepted set in two ways:

- static fallback answers are always accepted,
- approved stored daily answers are accepted dynamically.

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

This keeps generation policy out of both the route and the scheduler.

### Server-only generation and loading

The server layer owns publishing. It fetches allowlisted RHOBH source material, generates candidates through TanStack AI with OpenRouter, falls back to a curated archive when current coverage is thin, and persists only approved puzzles.

The same layer also resolves the active daily puzzle and returns either the approved stored record or the legacy fallback for that date.

## Why fallback-first architecture mattered

The game now has two content sources:

- a generated and approved daily puzzle record,
- a legacy static fallback bank.

That is not redundancy. It is the product staying up when generation does not cooperate.

The route can render a known-safe puzzle even when the daily job has not published yet, source collection falls short, or model output is rejected. Generation improves freshness. Fallback protects continuity.

## API surface

The game relies on a small API surface rather than a large backend.

- `POST /api/words/validate` checks whether a guess is playable.
- `GET /api/games/wordle/rhobh/daily?date=YYYY-MM-DD` returns the approved puzzle for a UTC date or the static fallback.
- `POST /api/games/wordle/rhobh/generate` runs the daily publishing job for a specific UTC date.

The small API surface is deliberate. Each endpoint has one job and a clear owner.

## Scheduled publishing

The daily generation endpoint is triggered by GitHub Actions shortly after midnight UTC. The job uses bearer-token protection so puzzle publishing is not an open public write surface.

This is the operational half of the system. A daily game does not just need content rules. It needs a publishing path that runs on time and fails safely.

## Read next

- [Back to the overview](./index.md)
- [Reliability and testing lessons](./reliability-and-testing.md)