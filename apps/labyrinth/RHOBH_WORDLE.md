# RHOBH Wordle — feature & architecture reference

Route: `/games/rhobh-wordle`

---

## Features

### Puzzle rotation
- One puzzle per UTC day, determined by `Math.floor(Date.UTC(...) / 86_400_000)` as a day index.
- The puzzle cycles through `RHOBH_PUZZLES` via `index % puzzles.length`, so it loops after 9 puzzles.
- The active puzzle key re-syncs every 60 seconds via `setInterval` and on every `visibilitychange` event, so a tab left open overnight picks up the next day's puzzle automatically.

### Guess mechanics
- 6 guesses max (`MAX_GUESSES = 6`).
- Guesses are stripped of non-letter characters and uppercased before evaluation (`normalizeGuess`).
- Only length is validated — any string of the right letter count is accepted.
- Evaluation is a two-pass algorithm: first pass marks exact matches (`correct`), second pass marks misplaced letters (`present`) consuming remaining unmatched letters to handle duplicates correctly.

### Tile colors
| State | Meaning | Color |
|---|---|---|
| `correct` | Right letter, right position | Emerald |
| `present` | Right letter, wrong position | Amber |
| `absent` | Letter not in answer | Muted/panel |

### Keyboard
- Physical keyboard: `onKeyDown` on each active input cell handles letter keys, Backspace, and Enter.
- Mobile fallback: `onChange` on each input extracts the typed character when `onKeyDown` doesn't fire (common on soft keyboards).
- On-screen keyboard mirrors letter states so colors track the best known hit per letter across all submitted guesses.

### Input / focus management
- The active row renders `<input type="text">` elements (one per letter position); submitted rows render `<div>` elements.
- A `useEffect` watching `currentGuess.length` calls `.focus()` on the next empty cell after every letter added or removed.
- Clicking any cell in the active row redirects focus to the correct active cell via `onFocus → redirectToActiveCell`.
- Backspace on the physical keyboard removes the last letter and focus moves back one cell automatically.

### Clues
- **Main clue**: hidden by default; revealed by "Show clue" button. Once revealed it stays visible for the session.
- **Bonus clue**: hidden and the button is not shown until 3 guesses have been submitted. Reveals the character's role and first letter of the answer.
- Both clues reset to hidden when the puzzle rotates or Reset is pressed.

### Instructions
- Collapsed by default. "How to play" in the header toggles a three-line rules panel.

### Persistence
- Game state is written to `localStorage` under `labyrinth:rhobh-wordle:<puzzleKey>` after every state change, guarded by a `hydratedPuzzleKey` check to prevent writing stale state before hydration completes.
- On mount (and on puzzle rotation), the route reads the key for the current day. If the saved `puzzleKey` doesn't match, the state is discarded — stale progress from yesterday never bleeds into today.
- Persisted shape: `{ puzzleKey, guesses, message, status: "playing" | "solved" | "failed" }`.
- Reset wipes the localStorage entry for the current key and clears all React state.

### Game over
- Solved: last guess equals the answer.
- Failed: 6 guesses submitted without a correct match.
- On game over the answer, role, and detail text are revealed below the board. Input cells are deactivated (all rows become divs).

---

## Architecture

### `app/lib/rhobh-wordle.ts` — pure logic, no React

| Export | Purpose |
|---|---|
| `RhobhPuzzle` | Interface: `answer`, `clue`, `detail`, `role` |
| `LetterState` | Union: `"absent" \| "correct" \| "present"` |
| `MAX_GUESSES` | Constant: `6` |
| `RHOBH_PUZZLES` | Array of 9 puzzle objects |
| `RHOBH_PUZZLE_SET_LABEL` | Display string for the theme |
| `normalizeGuess(value)` | Strips non-letters, uppercases |
| `getPuzzleKeyForDate(date)` | Returns `"rhobh-<utcDayIndex>"` |
| `getPuzzleForKey(key)` | Decodes the day index, returns puzzle via modulo |
| `getPuzzleForDate(date)` | Convenience: `getPuzzleForKey(getPuzzleKeyForDate(date))` |
| `evaluateGuess(answer, guess)` | Two-pass algorithm, returns `LetterState[]` |
| `getKeyboardState(answer, guesses)` | Folds all guess evaluations into a per-letter best-state map |

### `app/routes/games/rhobh-wordle.tsx` — React route

**State**

| State var | Type | Purpose |
|---|---|---|
| `puzzleKey` | `string` | Current day's key; drives everything else |
| `puzzle` | `RhobhPuzzle` | Derived from `puzzleKey` via `useMemo` |
| `guesses` | `string[]` | Submitted, normalized guesses |
| `currentGuess` | `string` | In-progress guess being typed |
| `message` | `string` | Status line shown below the clues |
| `hydratedPuzzleKey` | `string \| null` | Guards against writing to localStorage before hydration |
| `showInstructions` | `boolean` | Toggles the rules panel |
| `showClue` | `boolean` | Toggles the main clue |
| `showBonusClue` | `boolean` | Toggles the bonus clue (only after 3 guesses) |

**Refs**

| Ref | Purpose |
|---|---|
| `cellRefs` | `HTMLInputElement[]` pointing to the active row's input cells for imperative focus management |

**Callbacks**

| Callback | Purpose |
|---|---|
| `addLetter(value)` | Appends one letter to `currentGuess`; no-op if full or game over |
| `removeLetter()` | Pops last letter from `currentGuess` |
| `submitGuess()` | Validates length, appends to `guesses`, updates message, detects win/loss |
| `resetBoard()` | Clears localStorage + all state for the current puzzle key |
| `handleCellKeyDown(e)` | Per-input handler: letter → `addLetter`, Backspace → `removeLetter`, Enter → `submitGuess` |
| `handleCellChange(e)` | Mobile fallback: extracts first letter from `onChange` and calls `addLetter` |
| `redirectToActiveCell()` | Used by `onFocus` to prevent clicking on a filled cell |

---

## Known issues / drift

- **Tests are stale.** `rhobh-wordle.test.tsx` was written against an earlier version and will fail:
  - Expects old message strings (`"Correct. ${answer} was today's Beverly Hills answer."`, `"Daily challenge: guess the Beverly Hills name in N letters."`)
  - Expects a button named `"Reset board"` (now `"Reset"`)
  - Has a test asserting that out-of-set guesses are rejected — that validation was removed; any correct-length string is now accepted
  - References `"1 / 6"` / `"0 / 6"` counter text which no longer exists in the UI

- **Instructions panel** still says "Only names from this Beverly Hills puzzle set are valid guesses" — this is no longer true and should be updated or removed.

- **Puzzle pool is small.** 9 puzzles loop every 9 days. Adding more puzzles to `RHOBH_PUZZLES` in `rhobh-wordle.ts` is the only change needed to extend it.
