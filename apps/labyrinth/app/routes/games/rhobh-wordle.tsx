import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  evaluateGuess,
  getKeyboardState,
  getPuzzleForKey,
  getPuzzleKeyForDate,
  MAX_GUESSES,
  normalizeGuess,
  type LetterState,
} from "~/lib/rhobh-wordle";

const KEYBOARD_ROWS = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"];
const STORAGE_PREFIX = "labyrinth:rhobh-wordle:";

const STATE_CLASSES: Record<LetterState, string> = {
  absent: "border-border-default bg-bg-panel-2 text-text-secondary",
  present: "border-amber-300 bg-amber-100 text-amber-950",
  correct: "border-emerald-300 bg-emerald-100 text-emerald-950",
};

const INACTIVE_TILE = "border-border-default bg-bg-elevated text-text-primary";

interface PersistedGameState {
  puzzleKey: string;
  guesses: string[];
  message: string;
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
  return state ? STATE_CLASSES[state] : INACTIVE_TILE;
}

function getStorageKey(puzzleKey: string) {
  return `${STORAGE_PREFIX}${puzzleKey}`;
}

function getInitialMessage(answerLength: number) {
  return `Guess the ${answerLength}-letter Beverly Hills name.`;
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
      typeof parsed.message !== "string" ||
      (parsed.status !== "playing" && parsed.status !== "solved" && parsed.status !== "failed")
    ) {
      return null;
    }

    return {
      puzzleKey,
      guesses: parsed.guesses.map((g) => normalizeGuess(String(g))).filter(Boolean),
      message: parsed.message,
      status: parsed.status,
    };
  } catch {
    return null;
  }
}

const TILE_BASE = "h-12 w-12 rounded border text-lg font-bold uppercase transition-colors";

export default function RhobhWordleRoute() {
  const [puzzleKey, setPuzzleKey] = useState(() => getPuzzleKeyForDate(new Date()));
  const puzzle = useMemo(() => getPuzzleForKey(puzzleKey), [puzzleKey]);
  const answerLength = puzzle.answer.length;

  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState("");
  const [message, setMessage] = useState(() => getInitialMessage(answerLength));
  const [hydratedPuzzleKey, setHydratedPuzzleKey] = useState<string | null>(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showClue, setShowClue] = useState(false);
  const [showBonusClue, setShowBonusClue] = useState(false);

  const cellRefs = useRef<Array<HTMLInputElement | null>>([]);

  const keyboardState = useMemo(
    () => getKeyboardState(puzzle.answer, guesses),
    [guesses, puzzle.answer],
  );
  const isSolved = guesses.at(-1) === puzzle.answer;
  const isGameOver = isSolved || guesses.length >= MAX_GUESSES;
  const bonusClueUnlocked = guesses.length >= 3;

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
    setMessage(saved?.message ?? getInitialMessage(answerLength));
    setShowClue(false);
    setShowBonusClue(false);
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
        message,
        status: isSolved ? "solved" : guesses.length >= MAX_GUESSES ? "failed" : "playing",
      } satisfies PersistedGameState),
    );
  }, [guesses, hydratedPuzzleKey, isSolved, message, puzzleKey]);

  const resetBoard = useCallback(() => {
    window.localStorage.removeItem(getStorageKey(puzzleKey));
    setGuesses([]);
    setCurrentGuess("");
    setMessage(getInitialMessage(answerLength));
    setShowClue(false);
    setShowBonusClue(false);
  }, [answerLength, puzzleKey]);

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

  const submitGuess = useCallback(() => {
    if (isGameOver) return;

    const guess = normalizeGuess(currentGuess);

    if (guess.length !== answerLength) {
      setMessage(`Need exactly ${answerLength} letters.`);
      return;
    }

    const next = [...guesses, guess];
    setGuesses(next);
    setCurrentGuess("");

    if (guess === puzzle.answer) {
      setMessage(`Correct! ${puzzle.answer} was today's answer.`);
      return;
    }

    if (next.length >= MAX_GUESSES) {
      setMessage(`The answer was ${puzzle.answer}.`);
      return;
    }

    setMessage("Not quite — keep going.");
  }, [answerLength, currentGuess, guesses, isGameOver, puzzle.answer]);

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
      <div className="mx-auto max-w-sm space-y-5 px-4">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-border-default pb-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-text-muted">
              Daily game
            </p>
            <h1 className="text-xl font-semibold tracking-tight text-text-primary">RHOBH Wordle</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="btn-secondary px-3 py-1.5 text-xs"
              onClick={() => setShowInstructions((v) => !v)}
              type="button"
            >
              {showInstructions ? "Hide rules" : "How to play"}
            </button>
            <button
              className="btn-secondary px-3 py-1.5 text-xs"
              onClick={resetBoard}
              type="button"
            >
              Reset
            </button>
          </div>
        </header>

        {/* Instructions (collapsed by default) */}
        {showInstructions && (
          <div className="space-y-2 border border-border-default bg-bg-panel-0/40 p-4 text-sm leading-6 text-text-secondary">
            <p>Guess a Beverly Hills cast or friend name.</p>
            <p>
              <span className="font-medium text-emerald-700">Green</span> = right letter, right
              place. <span className="font-medium text-amber-700">Gold</span> = right letter, wrong
              place.
            </p>
            <p>Only names from this Beverly Hills puzzle set are valid guesses.</p>
          </div>
        )}

        {/* Clues (hidden until requested) */}
        <div className="flex flex-wrap gap-2">
          {showClue ? (
            <div className="w-full border-l-2 border-border-accent bg-bg-panel-0/40 px-3 py-2">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-text-muted">Clue</p>
              <p className="mt-1 text-sm leading-6 text-text-primary">{puzzle.clue}</p>
            </div>
          ) : (
            <button
              className="btn-secondary px-3 py-1.5 text-xs"
              onClick={() => setShowClue(true)}
              type="button"
            >
              Show clue
            </button>
          )}

          {bonusClueUnlocked &&
            (showBonusClue ? (
              <div className="w-full border-l-2 border-border-default bg-bg-panel-0/40 px-3 py-2">
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-text-muted">
                  Bonus clue
                </p>
                <p className="mt-1 text-sm leading-6 text-text-primary">
                  {puzzle.role}. Starts with {puzzle.answer[0]}.
                </p>
              </div>
            ) : (
              <button
                className="btn-secondary px-3 py-1.5 text-xs"
                onClick={() => setShowBonusClue(true)}
                type="button"
              >
                Show bonus clue
              </button>
            ))}
        </div>

        {/* Status message */}
        <p className="text-sm text-text-secondary">{message}</p>

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
                        autoComplete="off"
                        autoCapitalize="characters"
                        className={[
                          TILE_BASE,
                          "text-center outline-none caret-transparent",
                          INACTIVE_TILE,
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
        <div className="space-y-1.5">
          {KEYBOARD_ROWS.map((row, rowIndex) => (
            <div key={row} className="flex justify-center gap-1">
              {rowIndex === 2 && (
                <button
                  className="btn-secondary h-10 px-2 text-xs"
                  onClick={submitGuess}
                  type="button"
                >
                  Enter
                </button>
              )}
              {row.split("").map((letter) => (
                <button
                  key={letter}
                  className={[
                    "flex h-10 w-8 items-center justify-center rounded border text-sm font-medium transition-colors",
                    getTileClasses(keyboardState[letter]),
                  ].join(" ")}
                  onClick={() => {
                    addLetter(letter);
                  }}
                  type="button"
                >
                  {letter}
                </button>
              ))}
              {rowIndex === 2 && (
                <button
                  className="btn-secondary h-10 px-2 text-xs"
                  onClick={removeLetter}
                  type="button"
                >
                  ⌫
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Game over reveal */}
        {isGameOver && (
          <div className="border-t border-border-default pt-4">
            <h2 className="text-lg font-semibold text-text-primary">{puzzle.answer}</h2>
            <p className="text-xs text-text-muted">{puzzle.role}</p>
            <p className="mt-2 text-sm leading-6 text-text-secondary">{puzzle.detail}</p>
          </div>
        )}
      </div>
    </div>
  );
}
