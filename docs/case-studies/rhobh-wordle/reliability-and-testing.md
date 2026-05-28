---
title: RHOBH Wordle Reliability and Testing
slug: rhobh-wordle-reliability-and-testing
summary: The failure modes that mattered most in RHOBH Wordle and the testing strategy used to keep a simple game trustworthy.
date: 2026-05-28
tags:
  - testing
  - reliability
  - qa
  - frontend
related:
  - ./index.md
  - ./architecture.md
  - ./gameplay-and-ux.md
source:
  - ../../../apps/labyrinth/RHOBH_WORDLE.md
---

# RHOBH Wordle Reliability and Testing

The hardest bugs in RHOBH Wordle were not crashes. They were the quiet state mismatches that make a game feel unfair. Reliability work focused on removing those trust breaks before players saw them.

## The critical bug: concurrent validation submissions

One of the sharpest defects came from repeated Enter presses during server validation. Without a guard, a pending validation request could be overwritten by another submit, leaving the route in a confused state where the wrong guess could be committed.

The fix was small but decisive: a new submission can only begin when the fetcher is idle. That turned validation from a loose async action into a controlled transition.

## Input locking had to be complete, not partial

Once validation moved to the server, the UI had to treat an in-flight guess as immutable. Partial locking was not enough.

The final behavior blocks all mutation paths while validation is active:

- physical keyboard input,
- mobile fallback edits,
- on-screen keyboard interaction.

The same rule applies during staged reveal. If the game is still resolving the previous guess, it should not accept the next one yet.

## Persistence only works if stale state is rejected

Local persistence improves continuity, but it can also leak yesterday’s state into today’s puzzle if the restore logic is naive. RHOBH Wordle avoids that by storing a puzzle key with the saved game state and rejecting restored state that does not match the current key.

That check matters most around day rollover, where an open tab can otherwise carry the wrong state forward.

## Test coverage followed the actual failure modes

The test suite was refreshed around the current architecture rather than older assumptions. That includes coverage for:

- database-backed daily puzzle loading,
- static fallback behavior,
- date-boundary puzzle changes,
- async validation,
- reveal sequencing and locking,
- clue reveal,
- share visibility,
- locked input while a guess is in flight.

Pure helper tests continue to cover normalization, date stability, duplicate-letter evaluation, keyboard-state priority, and guess limits. Share formatting and daily puzzle validation are tested separately so the route does not have to carry every guarantee by itself.

## The remaining tradeoff

The main unresolved tradeoff is the size of the emergency fallback pool. It remains intentionally limited, which is acceptable for continuity but still repetitive if the generation path were unavailable for too long.

It is not a launch blocker, but it is the clearest remaining quality lever if the product keeps growing.

## Read next

- [Back to the overview](./index.md)
- [Architecture and daily pipeline details](./architecture.md)
- [Gameplay and UX decisions](./gameplay-and-ux.md)