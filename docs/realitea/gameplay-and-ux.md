---
title: RealiTea Gameplay and UX
project: realitea
type: reference
status: active
client: null
industry: null
owner: charlesponti
tags:
  - ux
  - interaction-design
  - game-design
  - frontend
related:
  - ./index.md
  - ./reliability-and-testing.md
summary: The interaction design decisions that made RealiTea feel fair, legible, and polished across desktop and mobile.
---

# RealiTea Gameplay and UX

Word games are judged on feel. RealiTea had to stay readable under fast input, hold together on mobile, and make each guess feel earned.

## Feedback rules were made explicit

The route handles four classes of submission failure:

- not enough letters (client-side pre-check),
- already guessed (client-side pre-check),
- not in the word list (server round trip),
- a network/server failure on the validation round trip.

The first three all pair an inline error message (rendered in an `aria-live` region, not a toast component) with a shake on the active row. The network-failure case shows the same inline error message but does not shake. That consistency across the common cases teaches the rules quickly and keeps error handling from becoming its own interface.

## The board had to behave well on real keyboards and soft keyboards

Input is unified rather than split by device: a single document-level `keydown` listener and the on-screen keyboard's `onLetter`/`onEnter`/`onBackspace` callbacks both drive the same shared `addLetter`/`removeLetter`/`submitGuess` handlers. The board cells themselves are styled `div`s that render the current guess, not individual text inputs, so there is no per-cell keydown or `onChange` fallback to reconcile — one input path serves both physical and on-screen keyboards.

That detail is easy to miss on paper and obvious in a broken build.

## Reveal pacing was treated as part of the game loop

Submitted guesses do not instantly resolve into colored tiles. Each tile flips on a short cadence, and the next row remains unavailable until the reveal completes.

That does two things:

- it makes the result legible one tile at a time,
- it prevents the player from getting ahead of the feedback loop.

The reveal is not decoration. It is part of the game loop.

## Clues were hidden until they became useful

The game includes `clue` data for each puzzle, but surfacing it too early would flatten the challenge. The final design reveals the clue only when the player has one guess left and the game is still active.

That makes the clue feel earned and gives the final turn a sharper shape.

## Sharing stayed faithful to the genre

The share flow copies a spoiler-free emoji grid rather than exposing the answer. That keeps the social ritual intact while fitting the RealiTea setting.

It also takes a pragmatic fallback path: clipboard first, `window.prompt` second, with the same result-handling callback wired up for both outcomes (and for errors).

## Read next

- [Back to the overview](./index.md)
- [Reliability and testing lessons](./reliability-and-testing.md)
