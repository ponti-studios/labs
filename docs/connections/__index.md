---
title: Connections Case Study
project: connections
type: case-study
status: active
client: null
industry: null
owner: charlesponti
tags:
  - case-study
  - game-design
  - ai
  - product-engineering
related:
  - ./api-design.md
  - ./word-sourcing.md
  - ./game-generation.md
summary: A Connections-style daily game for the software industry — same server-authoritative, generate-then-validate discipline RealiTea proved out, applied to a much harder content-validation problem.
---

# Connections

RealiTea proved that a small daily word game can hold up in production if the architecture draws a clean line: the server owns validation and publishing, the browser owns responsiveness, and nothing gets published without being checked against ground truth first. Connections is the same discipline applied to a harder problem — instead of validating one guessed word against a dictionary, it has to validate an entire self-consistent 16-word puzzle with no accidental overlaps, before a single tile is shown to a player.

## The core reframe

A game of Connections has 4 groups, but they aren't related to each other — the unit of content is a single 4-word **category group**, not a puzzle. Puzzles are assembled at serve time from a bank of independently-generated groups, subject to a reuse cooldown. That decoupling is what makes the rest of the design tractable: content generation and daily publishing become separate problems with separate failure modes, same as RealiTea's generation-vs-serving split.

## Status

- **Daily assembly** (picking 4 collision-free, off-cooldown groups and shuffling them into a grid) is prototyped, tested, and merged — see [game-generation.md](./game-generation.md#problem-1-daily-assembly--solved).
- **Content generation** (producing the groups themselves) has a settled design, not yet built — see [game-generation.md](./game-generation.md#problem-2-content-generation--design-settled-build-pending).
- **API shape** is settled — see [api-design.md](./api-design.md).
- **Word/content sourcing** strategy is settled — see [word-sourcing.md](./word-sourcing.md).

## Read next

- [API design](./api-design.md)
- [Word sourcing](./word-sourcing.md)
- [Game generation](./game-generation.md)
