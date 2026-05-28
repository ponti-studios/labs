---
title: RHOBH Wordle Gameplay and UX
slug: rhobh-wordle-gameplay-and-ux
summary: The interaction design decisions that made RHOBH Wordle feel fair, legible, and polished across desktop and mobile.
date: 2026-05-28
tags:
  - ux
  - interaction-design
  - game-design
  - frontend
related:
  - ./index.md
  - ./reliability-and-testing.md
source:
  - ../../../apps/labyrinth/RHOBH_WORDLE.md
---

# RHOBH Wordle Gameplay and UX

Word games are judged on feel. RHOBH Wordle had to stay readable under fast input, hold together on mobile, and make each resolved guess feel earned.

## Feedback rules were made explicit

The route handles three classes of submission failure before a guess is accepted:

- not enough letters,
- already guessed,
- not in the word list.

Each failure uses the same feedback pattern: a toast plus a shake on the active row. That consistency teaches the rules quickly and keeps error handling from becoming its own separate interface.

## The board had to behave well on real keyboards and soft keyboards

Desktop input is handled through per-cell keydown events, but that is not enough on its own. Mobile keyboards often behave differently, so the route also extracts input from `onChange` as a fallback when key events do not fire reliably.

The board also keeps focus pinned to the correct active cell. As letters are added or removed, focus moves to the next empty input. If the player clicks elsewhere in the active row, focus is redirected back to the current insertion point.

That detail is easy to miss on paper and obvious to feel in a broken build.

## Reveal pacing was treated as part of the game loop

Submitted guesses do not instantly resolve into colored tiles. Each tile flips on a short cadence, and the next row remains unavailable until the reveal completes.

That does two things:

- it makes the result legible one tile at a time,
- it prevents the player from getting ahead of the feedback loop.

The reveal is not decoration. It is part of the game loop.

## Clues were hidden until they became useful

The game includes `clue` data for each puzzle, but surfacing it too early would flatten the challenge. The final design reveals the clue only when the player has one guess remaining and the game is still active.

That makes the clue feel earned and gives the final turn a sharper shape.

## Sharing stayed faithful to the genre

The share flow copies a spoiler-free emoji grid rather than exposing the answer. That keeps the social ritual of Wordle intact while fitting the RHOBH theme.

It also takes a pragmatic fallback path: clipboard first, prompt second, the existing toast system for both outcomes.

## Read next

- [Back to the overview](./index.md)
- [Reliability and testing lessons](./reliability-and-testing.md)