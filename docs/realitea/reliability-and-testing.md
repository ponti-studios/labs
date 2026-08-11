---
title: RealiTea Reliability and Testing
project: realitea
type: reference
status: active
client: null
industry: null
owner: charlesponti
tags:
  - testing
  - reliability
  - qa
  - frontend
related:
  - ./index.md
  - ./architecture.md
  - ./gameplay-and-ux.md
summary: The failure modes that mattered most in RealiTea and the testing strategy used to keep a simple game trustworthy.
---

# RealiTea Reliability and Testing

The hardest bugs in RealiTea were not crashes. They were the quiet state mismatches that make a game feel unfair. Reliability work focused on removing those trust breaks before anyone saw them.

## The critical bug: concurrent validation submissions

One of the sharpest defects came from repeated Enter presses during server validation. Without a guard, a pending validation request could be overwritten by another submit, leaving the route in a confused state where the wrong guess could be committed.

The fix was small but decisive: a new submission can only begin when the fetcher is idle. That turned validation from a loose async action into a controlled handoff.

## Input locking had to be complete, not partial

Once validation moved to the server, the UI had to treat an in-flight guess as immutable. Partial locking was never going to be enough.

Physical keyboard input and on-screen keyboard interaction both route through the same shared `addLetter`/`removeLetter`/`submitGuess` handlers, so a single `canMutateGuess` flag locks both at once while validation is active — there is no separate "mobile fallback" input path to lock independently.

The same rule applies during staged reveal. If the game is still resolving the previous guess, it should not accept the next one yet.

## Persistence only works if stale state is rejected

Local persistence improves continuity, but it can also leak yesterday’s state into today’s puzzle if the restore logic is naive. RealiTea avoids that by storing a puzzle key with the saved game state and rejecting restored state that does not match the current key.

That check matters most around day rollover, where an open tab can otherwise carry the wrong state forward.

## Test coverage followed the actual failure modes

The test suite was refreshed around the current architecture rather than older assumptions. That includes coverage for:

- database-backed daily puzzle loading,
- serving-time fallback to the most recent puzzle when today's has not published,
- date-boundary puzzle changes,
- async validation,
- reveal sequencing and locking,
- clue reveal,
- share visibility,
- locked input while a guess is in flight.

Pure helper tests continue to cover normalization, date stability, duplicate-letter evaluation, keyboard-state priority, and guess limits. Share formatting and daily puzzle validation are tested separately so the route does not have to carry every guarantee on its own.

## The remaining tradeoff

The main unresolved tradeoff is that there is no curated-archive fallback at generation time — only a serving-time rule that repeats the most recent approved puzzle. That is acceptable for continuity but would get repetitive if the generation path were unavailable for too long.

It is not a launch blocker, but it is the clearest remaining quality lever if the product keeps growing.

## Read next

- [Back to the overview](./index.md)
- [Architecture and daily pipeline details](./architecture.md)
- [Gameplay and UX decisions](./gameplay-and-ux.md)
