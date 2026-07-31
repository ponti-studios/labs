---
id: 11
title: "Cross-device progress not synced: today's puzzle was seeded from localStorage, not the server"
date: 2026-07-31
status: resolved
severity: high
category: state-management
services: [labs]
tags: [react-query, localstorage, realitea, cross-device, ux]
related_incidents: [10]
doc: docs/hominem-auth-integration.md
---

# Cross-device progress not synced: today's puzzle was seeded from localStorage, not the server

## Symptom

Reported by a real user: solved today's puzzle on their phone, then reloaded
`labs.ponti.io/games/realitea` in a different browser — it showed the
puzzle as unsolved, as if no guesses had been made at all, despite being
signed in on both.

## Root cause

Every guess a signed-in player submits *is* written to `realitea_attempts`
correctly (`evaluateGuessServer` → `appendGuess`, from the auth work in
[docs/hominem-auth-integration.md](../hominem-auth-integration.md)) — but
`route.tsx` (the "today" route, the one everyone plays by default) never
read that table back. Its loader called `loadActivePublicPuzzle(now,
timeZone)` with no `user` argument at all, and the client seeded its
initial guesses purely from `localStorage`
(`app/routes/games/realitea/game-state.ts`, `readGameState`/
`saveGameState`) — device-local by definition.

This was an asymmetry against the *other* RealiTea route:
`date.$date.tsx` (past-date puzzles) already called `getHominemUser(request)`
and `loadPuzzleForSpecificDate(dateKey, user)`, which explicitly loads
`attempt` via `loadAttempt(user.id, gameId, dateKey)`. The "today" route was
never updated to match when server-side attempt tracking was added —
localStorage-only seeding was the original, pre-auth design, and it just
never got revisited for the primary route once every guess started being
persisted server-side anyway.

## Fix

Removed device-local storage from RealiTea entirely and replaced it with a
server-authoritative React Query hook, deliberately (see discussion in
[docs/hominem-auth-integration.md](../hominem-auth-integration.md)) rather
than just extending the loader the way `date.$date.tsx` already does:

- **`app/lib/realitea/puzzle.server.ts`**: added `loadActivePuzzleAttempt(now,
  timeZone, user)`, which resolves "today"'s puzzle the same way
  `loadActivePublicPuzzle` does (both now share a private `resolveActivePuzzle`
  helper, so they always agree on exactly which puzzle "today" refers to,
  including the grace-period fallback) and loads the attempt keyed by the
  *served* puzzle's date, not the nominal one.
- **`app/routes/api.games.realitea.attempt.ts`** (new resource route,
  registered in `app/routes.ts`): a small GET endpoint the client polls —
  `getHominemUser(request)` + `loadActivePuzzleAttempt(...)`, returning
  `{ attempt }` (`null` for anonymous callers or a signed-in player who
  hasn't attempted today's puzzle yet).
- **`app/routes/games/realitea/route.tsx`**: replaced the
  `readGameState`/`saveGameState` seed with `useQuery({ queryKey:
  ["realitea-attempt", puzzle.dateKey], queryFn: () => fetch(...) })`.
  React Query's default `refetchOnWindowFocus` is what makes "solve on one
  device, switch back to this tab" self-correct without a manual reload —
  the property the localStorage design could never have, even if it *had*
  been reading the server on load, since a loader-based fix only refreshes
  on navigation. `RealiTeaGameBoard` is keyed on the fetched attempt's
  `status:guesses.length` so a background refetch that changes the data
  forces a fresh reseed (the board's own guesses state is seeded once at
  mount, not reactive to prop changes, by design — see `use-game.ts`).
- Deleted `app/routes/games/realitea/game-state.ts` and the `onGameChange`
  prop on `RealiTeaGameBoard` entirely — nothing in the app uses
  device-local storage for RealiTea anymore.

**Trade-off accepted:** the "today" page now shows a brief skeleton on
every fresh load (client fetch to `/api/games/realitea/attempt`) instead of
painting instantly from a synchronous `localStorage` read. There's no
SSR-side React Query dehydration wired up in this app, so this is a real,
small regression in perceived load speed, traded for correctness across
devices. For anonymous players, this also means the one-free-guess state no
longer survives a same-browser reload (previously incidental — the
existing design already treated this as "a deliberate, accepted gap, not
[a security boundary]"; it just happened to be slightly stickier before).

Verified locally (`pnpm dev`) end-to-end: submitted a guess, confirmed
`GET /api/games/realitea/attempt` returned it, reloaded the page, confirmed
it restored from that endpoint rather than `localStorage`. Verified again
in production after deploy (`railway up --service labyrinth`): the signed-in
session's actual solved puzzle ("TEARS") rendered correctly on a fresh page
load.

**Lesson for next time:** when adding server-side persistence to a feature
that previously stored state on the client, audit *every* route that seeds
that state, not just the one being actively worked on — `date.$date.tsx`
and `route.tsx` share the same `RealiTeaGameBoard` component and the same
underlying `realitea_attempts` table, but only one of them was ever wired
to actually read it.
