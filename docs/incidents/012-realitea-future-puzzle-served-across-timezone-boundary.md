---
id: 12
title: "RealiTea served the next day's puzzle before the player's local midnight"
date: 2026-08-03
status: resolved
severity: high
category: timezone
services: [labs]
tags: [realitea, timezone, date-boundary, puzzle-selection, regression-test]
related_incidents: [11]
doc: app/lib/realitea/puzzle.server.ts
---

# RealiTea served the next day's puzzle before the player's local midnight

## Symptom

Players in Los Angeles received the next day's RealiTea puzzle after midnight
in London, even though their local calendar date had not changed yet.

At `00:30 UTC` on May 21, for example, London is already on May 21 while Los
Angeles is still on May 20. The active puzzle should therefore remain the May
20 puzzle for Los Angeles players.

## Root cause

The active-puzzle resolver correctly derived a local `dateKey` from the
player's timezone cookie. However, when no puzzle existed for that exact date,
the fallback called `loadMostRecentPuzzle(gameId)`, which searched all puzzle
rows ordered by creation time.

Because RealiTea intentionally pre-generates future inventory, that query
could return a future puzzle. The fallback therefore turned a missing
current-date puzzle into an accidental timezone rollover: any request whose
server-resolved date had crossed midnight could receive tomorrow's inventory,
even when the player's local date was still yesterday.

The relevant flow was:

1. `app/routes/games/realitea/route.tsx` reads the `tz` cookie.
2. `app/lib/realitea/date.ts` converts the current instant into that timezone's
   calendar date.
3. `app/lib/realitea/puzzle.server.ts` loads the exact date, then falls back.
4. `app/lib/realitea/repository.ts` previously allowed the fallback to select
   any date, including future inventory.

## Fix

`loadMostRecentPuzzle` now accepts an optional upper-bound date. The active
resolver supplies the computed local `dateKey`, and the repository constrains
the fallback to:

```text
dateUtc <= localDateKey
```

The unbounded form remains available for tooling such as the gallery script,
while player-facing active-puzzle resolution cannot serve future inventory.

## Regression coverage

Added a server-level regression test in
`app/lib/realitea/__tests__/puzzle.server.test.ts` that fixes the instant at
`2026-05-21T00:30:00.000Z`, requests `America/Los_Angeles`, and verifies that
the resolver asks for and serves `2026-05-20` rather than `2026-05-21`.

The test also verifies the fallback receives the local date bound, so a future
inventory row cannot silently become the active puzzle again.

## Lesson

Any fallback for a scheduled daily resource must preserve the resource's time
ordering. “Most recent” is not equivalent to “most recent valid for this
calendar date” when future inventory is pre-created.

