---
title: RealiTea Case Study
slug: realitea
summary: How a franchise-specific RHOBH Wordle experiment turned into RealiTea, a broader daily reality TV game with server-side validation, resilient publishing, and cleaner product boundaries.
date: 2026-05-28
tags:
  - case-study
  - game-design
  - react-router
  - ai
  - product-engineering
related:
  - ./architecture.md
  - ./gameplay-and-ux.md
  - ./reliability-and-testing.md
source:
  - ../../../apps/labyrinth/RHOBH_WORDLE.md
---

# RealiTea

RealiTea started as RHOBH Wordle, which is to say it started as a joke with good bones. The assignment was not to make it bigger. It was to make it hold.

That meant giving a small, highly legible game the kind of systems polish players mostly notice when it is missing: the right puzzle on the right day, validation that feels fair, input that never gets strange, and a publishing pipeline that can miss a step without taking the product down with it.

## The problem

The concept already worked. The problem was durability. A themed word game can get away with a lot in prototype form. A daily one cannot.

The main constraints were straightforward:

- The puzzle had to rotate on UTC day boundaries.
- A browser tab left open overnight had to recover cleanly.
- Guess validation had to be authoritative, not only client-side.
- Proper nouns and franchise-specific answers had to remain playable even when they were not in a standard dictionary.
- Interaction quality had to feel deliberate on both desktop and mobile.
- The daily content pipeline needed a safe fallback whenever AI generation or current-news sourcing came up short.

## What changed

The final version improved the game in three ways.

First, it became properly daily. Puzzle loading respects UTC rollover, open tabs recover cleanly, and stored puzzles can take over without breaking continuity.

Second, validation moved behind the server. The browser still handles immediate feedback, but the source of truth is no longer up for debate.

Third, the interaction model got stricter. Reveal pacing, locked input, and post-game behavior became parts of the product rather than flourishes around it.

## Product decisions that mattered

Several decisions had outsized impact on quality.

### Daily puzzle loading was designed to fail soft

The route tries the database-backed daily puzzle first, but it never depends on that path alone. If there is no approved record for the date, the experience falls back immediately. Generation can be fancy. Gameplay has to be dependable.

### Validation moved to the server, not the browser

Shipping the word list to the client would have made the game easier to reverse-engineer and harder to trust. Keeping validation on the server solved both while still making room for franchise-specific answers.

### Feature polish followed gameplay, not the other way around

Several smaller features only worked once they were tied to actual game rules. Clues, sharing, and post-game context got better as soon as they stopped behaving like extras.

## What made it hold together

The project became manageable once responsibilities were split cleanly. Game rules stayed pure, validation stayed server-side, daily puzzle rules lived in a shared domain layer, and the route focused on orchestration. That separation kept the project from turning into one very stressed file.

## The hardest fixes

The important fixes were not visual. They were the bugs that quietly make a game feel off.

- Validation and input handling still had race conditions to close.
- Some data fields existed before they had a real gameplay role.
- The fallback strategy was reliable, but not yet ideal for long stretches without newly published content.

None of those fixes were glamorous. All of them mattered.

## Outcome

The final game behaves like a daily product:

- it loads the right puzzle for the UTC day,
- keeps tabs in sync across rollover,
- validates guesses on the server,
- handles franchise-specific answers safely,
- reveals results with controlled pacing,
- offers a last-chance clue,
- supports spoiler-free sharing,
- and continues working even when the AI generation path cannot publish a puzzle.

That is the whole story, really. The board is the visible part. The work was making it trustworthy.

## Read next

- [Architecture and daily puzzle pipeline](./architecture.md)
- [Gameplay and UX decisions](./gameplay-and-ux.md)
- [Reliability and testing lessons](./reliability-and-testing.md)