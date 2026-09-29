---
title: "Task: article reveal after solve"
summary: Show the sourced news article after a puzzle ends, turning the answer's provenance into a news-discovery payoff.
type: task
status: proposed
owner: charlesponti
tags: [gameplay, product, frontend]
related: [../architecture.md, ../candidate-generation.md]
updated: 2026-09-29
---

# Task: article reveal after solve

## Why

Every Newsboy answer is sourced from a real article
(`games_puzzles.articleId` → `articles`, per
[architecture.md](../architecture.md#storage-and-serving)). That provenance
is currently invisible to the player. Surfacing it after the game ends is
the most Newsboy-specific differentiator available (vs. a generic Wordle
clone) and needs no new data — it's already on the puzzle record.

## Scope

- After a game ends (win or loss), show a card with the source article: at
  minimum title, publication/source name, and an outbound link. Consider the
  existing `imageUrl` on `articles` for a richer card.
- Only reveal after the game is over — never before, and never in a way that
  spoils the answer for an in-progress guesser (e.g. no reveal in page
  metadata/OG tags, which the launch plan already treats as spoiler-free).

## Implementation notes

- The puzzle-serving path already resolves through
  `resolveActivePuzzle` (`lib/data/puzzle.server.ts`); the article join is
  a straightforward extension there, or a light join added to whatever
  already returns the puzzle payload to the client.
- Decide whether the article's full text/description is sent to the client
  post-solve, or just title + link + source. Sending the article text at all
  only after solve keeps risk low and avoids growing the pre-solve payload
  (which must stay spoiler-free, per gameplay-and-ux.md's clue-timing
  design).
- Respect `articles.status` — a puzzle's source article is always the one
  marked `used` for that puzzle, so there's no ambiguity about which article
  to show.
- If the source publication's terms require attribution wording (e.g. "via
  TechCrunch"), match the existing per-topic `feedLabel` field on
  `games_topics` for consistent naming.

## Acceptance criteria

- After finishing a puzzle, the player sees the source article's title and a
  working outbound link.
- The article is never present in any pre-solve API response or page
  metadata for that puzzle/date.
- Works across all five topics without topic-specific frontend branching
  beyond what `feedLabel`/branding already provides.

## Out of scope

- In-app article reader (link out to the original source instead).
- Historical "browse past puzzles' articles" archive — that's a separate,
  larger feature.
