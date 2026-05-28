# RHOBH Wordle — feature, architecture & issue tracker

Route: `/games/wordle/rhobh`

---

## Current feature set

### Puzzle rotation
- One puzzle per UTC day, determined by `Math.floor(Date.UTC(...) / 86_400_000)` as a day index.
- The puzzle cycles through `RHOBH_PUZZLES` via `index % puzzles.length` — currently 9 puzzles, looping every 9 days.
- The active puzzle key re-syncs every 60 seconds via `setInterval` and on every `visibilitychange` event so a tab left open overnight picks up the next puzzle automatically.

### Guess mechanics
- 6 guesses max (`MAX_GUESSES = 6`).
- Guesses are stripped of non-letter characters and uppercased before evaluation (`normalizeGuess`).
- **Length check** — submitting fewer letters than the answer shows a "Not enough letters" toast + row shake.
- **Duplicate check** — resubmitting an already-guessed word shows "Already guessed" toast + row shake.
- **Dictionary check** — each guess is validated server-side against the ENABLE1 word list (see Word validation below). Shows "Not in word list" on failure.
- Evaluation is a two-pass algorithm: first pass marks exact matches (`correct`), second pass marks misplaced letters (`present`) consuming remaining unmatched letters to handle duplicates correctly.

### Word validation (server-side)
- Word lists for lengths 4–10 are sourced from the ENABLE1 (Enhanced North American Benchmark LExicon) public-domain dictionary.
- Lists live in `app/data/words/{4..10}.txt` and are bundled into the server at build time via Vite `?raw` imports — **never served to the browser**.
- `app/lib/word-list.server.ts` holds the `isValidWord(word)` function; Sets are built lazily on first use and cached in module scope.
- All RHOBH puzzle answers are injected into their respective Sets regardless of dictionary membership (proper names are not in ENABLE1).
- The component calls `POST /api/words/validate` via React Router's `useFetcher` before committing a guess.
- While the request is in flight the active row dims to 60% opacity and guess input is hard-locked until the fetcher returns to `idle`.
- API route: `app/routes/api.words.validate.ts` → `/api/words/validate`.

### Tile colours
| State | Meaning | Colour |
|---|---|---|
| `correct` | Right letter, right position | Emerald |
| `present` | Right letter, wrong position | Amber |
| `absent` | Letter not in answer | Muted/panel |

### Keyboard
- Physical keyboard: `onKeyDown` on each active input cell handles letter keys, Backspace, and Enter.
- Mobile fallback: `onChange` on each input extracts the typed character when `onKeyDown` doesn't fire (common on soft keyboards).
- On-screen keyboard mirrors letter states so colours track the best known result per letter across all submitted guesses.
- While server validation is in flight both physical and on-screen keyboard input are disabled, preventing duplicate submits or in-flight edits.

### Input / focus management
- The active row renders `<input type="text">` elements (one per letter position); submitted rows render `<div>` elements.
- A `useEffect` watching `currentGuess.length` calls `.focus()` on the next empty cell after every letter added or removed.
- Clicking any cell in the active row redirects focus to the correct active cell via `onFocus → redirectToActiveCell`.

### Error feedback
- `showError(message)` sets a toast message and triggers a CSS shake animation on the active row simultaneously.
- Both clear after 700 ms via a single `setTimeout` held in `shakeTimerRef`.
- Toast renders as a dark pill centred above the board.
- Shake uses a named `@keyframes rhobh-shake` injected via a `<style>` tag inside the component return.

### Post-game reveal
- On game over a panel appears below the board showing the answer prominently and `puzzle.detail` — a one-sentence fun fact about the person.
- Label reads "Today's answer" on a win and "The answer was" on a loss.
- A `Share result` button appears in the post-game panel.

### Clue reveal
- `puzzle.clue` stays hidden during normal play.
- When the player reaches their final remaining guess (`guesses.length === MAX_GUESSES - 1`) a highlighted clue panel appears above the board.
- The clue does not appear after the game is already over; post-game reveal still uses `puzzle.detail`.

### Persistence
- Game state is written to `localStorage` under `labyrinth:rhobh-wordle:<puzzleKey>` after every state change, guarded by a `hydratedPuzzleKey` check to prevent writing stale state before hydration completes.
- On mount and on puzzle rotation the route reads the key for the current day; if the saved `puzzleKey` doesn't match the state is discarded.
- Persisted shape: `{ puzzleKey, guesses, status: "playing" | "solved" | "failed" }`.

### Instructions
- Collapsed by default. "How to play" in the header toggles a two-line rules panel.

---

## Architecture

### `app/lib/rhobh-wordle.ts` — pure logic, no React

| Export | Purpose |
|---|---|
| `RhobhPuzzle` | Interface: `answer`, `clue`, `detail`, `role` |
| `LetterState` | Union: `"absent" \| "correct" \| "present"` |
| `MAX_GUESSES` | Constant: `6` |
| `RHOBH_PUZZLES` | Array of 9 puzzle objects |
| `normalizeGuess(value)` | Strips non-letters, uppercases |
| `getPuzzleKeyForDate(date)` | Returns `"rhobh-<utcDayIndex>"` |
| `getPuzzleForKey(key)` | Decodes the day index, returns puzzle via modulo |
| `getPuzzleForDate(date)` | Convenience wrapper |
| `evaluateGuess(answer, guess)` | Two-pass algorithm, returns `LetterState[]` |
| `getKeyboardState(answer, guesses)` | Folds all guess evaluations into a per-letter best-state map |

### `app/lib/word-list.server.ts` — server-only word validation

| Export | Purpose |
|---|---|
| `isValidWord(word)` | Returns `true` if the uppercased word exists in the ENABLE1 set for its length or is a known RHOBH answer |

Internal: `getWordSet(length)` builds and caches a `Set<string>` from the `?raw`-imported `.txt` file on first call.

### `app/routes/api.words.validate.ts` — validation endpoint

`POST /api/words/validate` — body `{ word: string }` — response `{ valid: boolean }`.
Returns 405 for non-POST, 400 for missing/invalid body.

### `app/routes/games/rhobh-wordle.tsx` — React route

**State**

| Variable | Type | Purpose |
|---|---|---|
| `puzzleKey` | `string` | Current day's key; drives everything else |
| `puzzle` | `RhobhPuzzle` | Derived from `puzzleKey` via `useMemo` |
| `guesses` | `string[]` | Submitted, normalized guesses |
| `currentGuess` | `string` | In-progress guess being typed |
| `hydratedPuzzleKey` | `string \| null` | Guards localStorage writes until hydration completes |
| `showInstructions` | `boolean` | Toggles the rules panel |
| `errorMessage` | `string \| null` | Active toast text; auto-clears after 700 ms |
| `isShaking` | `boolean` | Drives `row-shake` CSS class on the active row |

**Refs**

| Ref | Purpose |
|---|---|
| `cellRefs` | `HTMLInputElement[]` for the active row's inputs — used for imperative focus management |
| `shakeTimerRef` | Holds the auto-clear `setTimeout` so rapid errors don't stack |
| `pendingGuessRef` | Stores the guess being validated server-side until the fetcher resolves |

**Key callbacks**

| Callback | Purpose |
|---|---|
| `addLetter(value)` | Appends one letter to `currentGuess`; no-op if full, game over, or validation is in flight |
| `removeLetter()` | Pops last letter from `currentGuess`; no-op while validation is in flight |
| `showError(message)` | Sets toast + shake; cancels any running timer first |
| `submitGuess()` | Runs length/duplicate checks synchronously, then fires server validation via `wordValidator.submit()`; no-op while validation is in flight |
| `handleCellKeyDown(e)` | Per-input handler: letter → `addLetter`, Backspace → `removeLetter`, Enter → `submitGuess` |
| `handleCellChange(e)` | Mobile fallback: extracts first letter from `onChange` |
| `redirectToActiveCell()` | Keeps focus on the next unfilled cell |

### Tests
- `app/routes/__tests__/rhobh-wordle.test.tsx` now exercises the current async validation flow with a controlled `useFetcher` mock instead of relying on stale synchronous assumptions.
- Covered route scenarios: persistence restore, stale-state discard, UTC-day rotation, short-guess rejection, duplicate-guess rejection, invalid-word rejection, commit-after-validation, final-guess clue reveal, post-game share-button visibility, submit locking, and input locking during validation.
- `app/lib/rhobh-wordle.test.ts` remains focused on pure helpers: normalization, UTC stability, duplicate-letter evaluation, keyboard-state priority, and `MAX_GUESSES`.
- `app/lib/rhobh-wordle-share.test.ts` covers share-text formatting plus clipboard-success and prompt-fallback behavior.

---

## Open issues

### 🔴 Bug — concurrent validation submissions

**Status:** Fixed on 2026-05-27  
**File:** `app/routes/games/rhobh-wordle.tsx` → `submitGuess`

`submitGuess` now guards `wordValidator.state !== "idle"` before firing a new request. A pending validation can no longer be overwritten by repeated Enter presses, so only the original submitted guess is eligible to commit when the server response arrives.

**Implementation:** Added `if (wordValidator.state !== "idle") return;` to `submitGuess`.

---

### 🟠 Puzzle cycling every 9 days

**Status:** Not fixed  
**File:** `app/lib/rhobh-wordle.ts` → `RHOBH_PUZZLES`, `getPuzzleForKey`

With only 9 puzzles the same answer repeats on a 9-day loop. A returning player will recognise the word immediately and win on guess 1. This breaks the "one fair puzzle per day" contract that Wordle's design depends on.

**Options:**
- Add more entries to `RHOBH_PUZZLES` — the only code change needed; `getPuzzleForKey` already handles any array length via modulo. Target at least 60–90 puzzles for two–three months of non-repeating play.
- Replace modulo rotation with a shuffled, non-repeating sequence keyed to the day index so the same order doesn't become predictable.
- Both changes are additive and backwards-compatible (old localStorage entries still match on the correct day).

---

### 🟠 `clue` field is dead data

**Status:** Fixed on 2026-05-27  
**File:** `app/lib/rhobh-wordle.ts` → `RhobhPuzzle.clue`, `app/routes/games/rhobh-wordle.tsx`

Every `RhobhPuzzle` now uses `clue` as a last-chance hint. The clue is rendered only when the player has exactly one guess remaining, preserving the current difficulty curve while giving the field a concrete gameplay purpose.

**Implementation:** Render a "Final guess clue" panel above the board when `guesses.length === MAX_GUESSES - 1` and the game is still in progress.

---

### 🟡 Keyboard not locked during server validation

**Status:** Fixed on 2026-05-27  
**File:** `app/routes/games/rhobh-wordle.tsx`

While `wordValidator.state !== "idle"` the route now blocks `addLetter`, `removeLetter`, and `submitGuess`, and passes `disabled={isGameOver || wordValidator.state !== "idle"}` to `<OnscreenKeyboard>`. A player can no longer mutate `currentGuess` or queue extra submits during the round-trip.

**Implementation:**
1. Passed `disabled={isGameOver || wordValidator.state !== "idle"}` to `<OnscreenKeyboard>`.
2. Added `if (wordValidator.state !== "idle") return;` guards to `addLetter`, `removeLetter`, and `submitGuess`.

---

### 🟡 Share results

**Status:** Fixed on 2026-05-27

Players can now share a spoiler-free emoji grid from the post-game panel. The route renders a `Share result` button only after win/loss, and the share payload is built from submitted guesses rather than the answer text.

**Implementation:**
- `app/lib/rhobh-wordle-share.ts` builds the shared text in the format:
```
RHOBH Wordle - 20 May 2026
1/6

🟩🟩🟩🟩🟩
```
- The route tries `navigator.clipboard.writeText()` first.
- If clipboard write fails or is unavailable, it falls back to `window.prompt()` with the generated share text.
- Success uses the existing toast area with `"Copied!"`; fallback uses `"Share text ready"`.

---

### 🟢 No tile-flip reveal animation

**Status:** Not fixed

In the original Wordle tiles flip one by one after a guess is submitted, delaying the colour reveal and building suspense. The current implementation uses `transition-colors` which means colours appear instantly.

**Implementation sketch:**
- Apply a CSS `rotateX(90deg)` mid-flip via `animation-delay: cellIndex * 300ms`.
- Change `backgroundColor`/`borderColor` at the halfway point (when the tile is edge-on) so the colour doesn't bleed through before the flip.
- Total reveal duration per row: ~6 × 300 ms = 1.8 s.
- Block further input until the flip animation completes (add a small delay before enabling the next row).

---

### 🟢 Tests are stale

**Status:** Fixed on 2026-05-27  
**File:** `app/routes/__tests__/rhobh-wordle.test.tsx`, `app/lib/rhobh-wordle.test.ts`

The route tests were rewritten around the current DOM and async validation model. They no longer expect the removed Reset button, obsolete copy, or the old synchronous guess-commit flow.

**Coverage now includes:**
- persistence restore for the same puzzle key
- stale-state discard for a different puzzle key
- UTC-day rotation to a fresh puzzle
- short-guess, duplicate-guess, and invalid-word errors
- commit only after successful validation
- locked submit/input behavior while validation is in flight

---

## Changelog

| Date | Change |
|---|---|
| 2026-05-27 | Added post-game share flow with emoji-grid output, clipboard copy, and prompt fallback |
| 2026-05-27 | Added a final-guess clue panel that reveals `puzzle.clue` only when one guess remains |
| 2026-05-27 | Locked RHOBH Wordle input during server-side validation: physical keyboard, mobile fallback edits, and on-screen keyboard are all disabled while a guess is in flight |
| 2026-05-27 | Fixed concurrent validation submissions by guarding `submitGuess()` when `useFetcher` is not `idle` |
| 2026-05-27 | Rewrote RHOBH Wordle route tests to cover the current `useFetcher` validation flow and in-flight locking behavior |
| 2026-05-27 | Removed Reset button — players could replay with the answer known |
| 2026-05-27 | Added "Not enough letters" toast + row shake for short guesses |
| 2026-05-27 | Added "Already guessed" toast + row shake for duplicate guesses |
| 2026-05-27 | Added server-side dictionary validation via ENABLE1 word lists (lengths 4–10); word files bundled server-only via Vite `?raw` imports |
| 2026-05-27 | Word lists moved from `public/words/` to `app/data/words/` — no longer accessible to the browser |
