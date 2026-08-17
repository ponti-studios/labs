---
title: API Design
summary: The wire protocol for the software-industry Connections game — server-authoritative validation, a compact public puzzle payload, and index-based guesses.
type: proposal
status: proposed
owner: charlesponti
tags: [api, game-design, react-router]
related: [./__index.md, ./word-sourcing.md, ./game-generation.md]
updated: 2026-08-17
---

# Connections API Design

The API exists to keep one rule airtight: the client never receives the solution before the game is over. Everything else in this doc follows from that.

## Why server-authoritative

RealiTea already settled this question for daily word games in this repo — dictionary/answer data lives on the server, never in a payload the browser can inspect. Connections needs it even more than RealiTea does: RealiTea's answer is one word behind a dictionary check, but a Connections puzzle's entire content is 16 words and 4 labels sitting in one response. Shipping the grouping up front would make the game trivially solvable from the network tab.

So the server is the only place that knows which word belongs to which group until the game ends (win or loss).

## Endpoints

Three endpoints, and the third may not even be necessary:

```
GET  /games/connections/:id
POST /games/connections/:id/guess
POST /games/connections/:id/complete   (possibly unnecessary — the server already
                                         knows when the last group is solved)
```

This is a smaller surface than RealiTea's, which is expected: RealiTea also needs a standalone `/words/validate` endpoint because it accepts free-text dictionary guesses. Connections is a closed 16-word puzzle — there's no open-vocabulary validation to support.

## Payload shapes

### Initial load — `GET /games/connections/:id`

Boring on purpose. No group labels, no grouping, no difficulty-to-word mapping — just the shuffled word list and the rules needed to render the board.

```json
{
  "id": "2026-08-13",
  "words": [
    "CRYSTAL", "LOCK", "SPLIT", "THRONE",
    "BASKET", "MAP", "CROWN", "BAIL",
    "KEYBOARD", "FIRE", "DEPART", "CASTLE",
    "EXIT", "PIANO", "SNOW", "CHECKMATE"
  ],
  "maxMistakes": 4
}
```

This is exactly the shape `toGrid()` in `scripts/connections/picker.ts` already produces (4 groups flattened and shuffled into 16 words) — the picker's output maps directly onto this payload with no translation layer needed beyond assigning stable indexes.

### Guess — `POST /games/connections/:id/guess`

Indexes into `words`, not repeated strings. Smaller payload, and it sidesteps any guess-normalization ambiguity (case, punctuation) that string comparison would introduce.

```json
{ "guess": [1, 6, 11, 15] }
```

### Guess response

Correct:

```json
{
  "correct": true,
  "group": {
    "id": 3,
    "label": "THINGS ASSOCIATED WITH A KING",
    "items": [3, 6, 11, 15],
    "difficulty": 2
  }
}
```

Incorrect, with the standard Connections "one away" hint (tells the player 3 of 4 were right, without saying which 3):

```json
{
  "correct": false,
  "mistakesRemaining": 2,
  "oneAway": true
}
```

### Game over — win or loss

Full solution reveal, only now:

```json
{
  "status": "won",
  "mistakes": 2,
  "groups": [
    { "label": "THINGS WITH KEYS", "items": [1, 5, 8, 13], "difficulty": 0 },
    { "label": "___ BALL", "items": [0, 4, 9, 14], "difficulty": 1 },
    { "label": "WORDS MEANING LEAVE", "items": [2, 7, 10, 12], "difficulty": 2 },
    { "label": "THINGS ASSOCIATED WITH A KING", "items": [3, 6, 11, 15], "difficulty": 3 }
  ]
}
```

## Deliberately deferred

Two ideas came up while designing this that are worth recording as *not now*, not as rejected:

- **Polymorphic game envelope** (`type: "connections" | "wordle" | "trivia"`). This generalizes the wire format before there's a second game that would benefit from it. RealiTea doesn't live behind a shared game abstraction today — it's its own route, its own table, its own API surface — and Connections should follow the same precedent until a real second case justifies the abstraction. Introducing it now is designing for a hypothetical.
- **CDN-cacheable payloads, signed anonymous game tokens, zero-DB-read serving.** All legitimate scaling techniques, none of them relevant to a game that doesn't have a puzzle-generation pipeline yet. RealiTea itself doesn't do any of this — it serves a single daily record from the DB with a continuity fallback. Revisit if and when Connections has real traffic to justify it.

## Read next

- [Back to the overview](./__index.md)
- [Word sourcing](./word-sourcing.md)
- [Game generation](./game-generation.md)
