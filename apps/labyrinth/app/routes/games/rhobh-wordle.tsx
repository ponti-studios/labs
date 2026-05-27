import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Button, OnscreenKeyboard, type LetterState } from "@pontistudios/ui";
import {
  evaluateGuess,
  getKeyboardState,
  getPuzzleForKey,
  getPuzzleKeyForDate,
  MAX_GUESSES,
  normalizeGuess,
} from "~/lib/rhobh-wordle";

const STORAGE_PREFIX = "labyrinth:rhobh-wordle:";

const TILE_STATE_CLASSES: Record<LetterState, string> = {
  absent: "border-border bg-muted text-muted-foreground",
  present: "border-amber-300 bg-amber-100 text-amber-950",
  correct: "border-emerald-300 bg-emerald-100 text-emerald-950",
};

const EMPTY_TILE = "border-border bg-background text-foreground";
const TILE_BASE = "h-12 w-12 rounded border text-lg font-bold uppercase transition-colors";

interface PersistedGameState {
  puzzleKey: string;
  guesses: string[];
  status: "playing" | "solved" | "failed";
}

export function meta() {
  return [
    { title: "RHOBH Wordle — Labyrinth" },
    {
      name: "description",
      content: "Guess a Beverly Hills name from a rotating Wordle-style daily challenge.",
    },
  ];
}

function getTileClasses(state?: LetterState) {
  return state ? TILE_STATE_CLASSES[state] : EMPTY_TILE;
}

function getStorageKey(puzzleKey: string) {
  return `${STORAGE_PREFIX}${puzzleKey}`;
}

function readPersistedGameState(puzzleKey: string): PersistedGameState | null {
  if (typeof window === "undefined") return null;

  try {
    const saved = window.localStorage.getItem(getStorageKey(puzzleKey));
    if (!saved) return null;

    const parsed = JSON.parse(saved) as Partial<PersistedGameState>;
    if (
      parsed.puzzleKey !== puzzleKey ||
      !Array.isArray(parsed.guesses) ||
      (parsed.status !== "playing" && parsed.status !== "solved" && parsed.status !== "failed")
    ) {
      return null;
    }

    return {
      puzzleKey,
      guesses: parsed.guesses.map((g) => normalizeGuess(String(g))).filter(Boolean),
      status: parsed.status,
    };
  } catch {
    return null;
  }
}

export default function RhobhWordleRoute() {
  const [puzzleKey, setPuzzleKey] = useState(() => getPuzzleKeyForDate(new Date()));
  const puzzle = useMemo(() => getPuzzleForKey(puzzleKey), [puzzleKey]);
  const answerLength = puzzle.answer.length;

  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState("");
  const [hydratedPuzzleKey, setHydratedPuzzleKey] = useState<string | null>(null);
  const [showInstructions, setShowInstructions] = useState(false);

  const cellRefs = useRef<Array<HTMLInputElement | null>>([]);

  const keyboardState = useMemo(
    () => getKeyboardState(puzzle.answer, guesses),
    [guesses, puzzle.answer],
  );
  const isSolved = guesses.at(-1) === puzzle.answer;
  const isGameOver = isSolved || guesses.length >= MAX_GUESSES;

  // Keep focus on the next empty cell while the game is active
  useEffect(() => {
    if (isGameOver) return;
    const idx = Math.min(currentGuess.length, answerLength - 1);
    cellRefs.current[idx]?.focus();
  }, [currentGuess.length, answerLength, isGameOver]);

  // Rotate puzzle every minute and on tab-focus
  useEffect(() => {
    function sync() {
      const next = getPuzzleKeyForDate(new Date());
      setPuzzleKey((cur) => (cur === next ? cur : next));
    }
    const id = window.setInterval(sync, 60_000);
    document.addEventListener("visibilitychange", sync);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);

  // Hydrate from localStorage on puzzle change
  useEffect(() => {
    const saved = readPersistedGameState(puzzleKey);
    setCurrentGuess("");
    setGuesses(saved?.guesses ?? []);
    setHydratedPuzzleKey(puzzleKey);
  }, [answerLength, puzzleKey]);

  // Persist on every state change after hydration
  useEffect(() => {
    if (hydratedPuzzleKey !== puzzleKey) return;
    window.localStorage.setItem(
      getStorageKey(puzzleKey),
      JSON.stringify({
        puzzleKey,
        guesses,
        status: isSolved ? "solved" : guesses.length >= MAX_GUESSES ? "failed" : "playing",
      } satisfies PersistedGameState),
    );
  }, [guesses, hydratedPuzzleKey, isSolved, puzzleKey]);

  const addLetter = useCallback(
    (value: string) => {
      if (isGameOver) return;
      setCurrentGuess((prev) => (prev.length >= answerLength ? prev : prev + value));
    },
    [answerLength, isGameOver],
  );

  const removeLetter = useCallback(() => {
    if (isGameOver) return;
    setCurrentGuess((prev) => prev.slice(0, -1));
  }, [isGameOver]);

  const resetBoard = useCallback(() => {
    setGuesses([]);
    setCurrentGuess("");
  }, []);

  const submitGuess = useCallback(() => {
    if (isGameOver) return;

    const guess = normalizeGuess(currentGuess);

    if (guess.length !== answerLength) return;

    setGuesses([...guesses, guess]);
    setCurrentGuess("");
  }, [answerLength, currentGuess, guesses, isGameOver]);

  const handleCellKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        submitGuess();
      } else if (e.key === "Backspace") {
        e.preventDefault();
        removeLetter();
      } else if (/^[a-z]$/i.test(e.key)) {
        e.preventDefault();
        addLetter(e.key.toUpperCase());
      }
    },
    [addLetter, removeLetter, submitGuess],
  );

  // Handles mobile soft-keyboard input (onChange fires; onKeyDown may not)
  const handleCellChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const char = e.target.value
        .replace(/[^a-zA-Z]/g, "")
        .toUpperCase()
        .charAt(0);
      if (char) addLetter(char);
    },
    [addLetter],
  );

  const redirectToActiveCell = useCallback(() => {
    if (isGameOver) return;
    const idx = Math.min(currentGuess.length, answerLength - 1);
    cellRefs.current[idx]?.focus();
  }, [currentGuess.length, answerLength, isGameOver]);

  return (
    <div className="py-8">
      <div className="space-y-5 px-4">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-border pb-4">
          <h1 className="text-2xl">Wordzi - RHOBH</h1>
          <div className="flex items-center gap-2">
            <Button
              className="px-3 py-1.5"
              onClick={() => setShowInstructions((v) => !v)}
              size="sm"
              type="button"
              variant="secondary"
            >
              {showInstructions ? "Hide rules" : "How to play"}
            </Button>
            <Button
              className="px-3 py-1.5"
              onClick={resetBoard}
              size="sm"
              type="button"
              variant="secondary"
            >
              Reset
            </Button>
          </div>
        </header>

        {/* Instructions (collapsed by default) */}
        {showInstructions && (
          <div className="space-y-2 border border-border bg-background/40 p-4 text-sm leading-6 text-muted-foreground">
            <p>Guess a Beverly Hills cast or friend name in 6 tries.</p>
            <p>
              <span className="font-medium text-emerald-700">Green</span> = right letter, right
              place. <span className="font-medium text-amber-700">Gold</span> = right letter, wrong
              place.
            </p>
          </div>
        )}

        {/* Board */}
        <div className="mx-auto w-fit space-y-1">
          {Array.from({ length: MAX_GUESSES }).map((_, rowIndex) => {
            const isCurrentRow = rowIndex === guesses.length && !isGameOver;
            const guess = guesses[rowIndex] ?? "";
            const states = guess ? evaluateGuess(puzzle.answer, guess) : [];

            return (
              <div key={`row-${rowIndex}`} className="flex gap-1">
                {Array.from({ length: answerLength }).map((_, cellIndex) => {
                  if (isCurrentRow) {
                    return (
                      <input
                        key={`cell-${rowIndex}-${cellIndex}`}
                        ref={(el) => {
                          cellRefs.current[cellIndex] = el;
                        }}
                        aria-label={`Letter ${cellIndex + 1}`}
                        autoCapitalize="characters"
                        autoComplete="off"
                        className={[
                          TILE_BASE,
                          "text-center outline-none caret-transparent",
                          EMPTY_TILE,
                        ].join(" ")}
                        inputMode="text"
                        maxLength={1}
                        type="text"
                        value={currentGuess[cellIndex] ?? ""}
                        onChange={handleCellChange}
                        onFocus={redirectToActiveCell}
                        onKeyDown={handleCellKeyDown}
                      />
                    );
                  }

                  return (
                    <div
                      key={`cell-${rowIndex}-${cellIndex}`}
                      className={[
                        TILE_BASE,
                        "flex items-center justify-center",
                        getTileClasses(states[cellIndex]),
                      ].join(" ")}
                    >
                      {guess[cellIndex]?.trim() ?? ""}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* On-screen keyboard */}
        <OnscreenKeyboard
          disabled={isGameOver}
          letterStates={keyboardState}
          onBackspace={removeLetter}
          onEnter={submitGuess}
          onLetter={addLetter}
        />

        {/* Post-game fun fact */}
        {isGameOver && (
          <div className="space-y-2 border-t border-border pt-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                {isSolved ? "Today's answer" : "The answer was"}
              </p>
              <p className="mt-1 text-2xl font-bold tracking-tight text-foreground">
                {puzzle.answer}
              </p>
            </div>
            <p className="text-sm leading-6 text-muted-foreground">{puzzle.detail}</p>
          </div>
        )}
      </div>
    </div>
  );
}
