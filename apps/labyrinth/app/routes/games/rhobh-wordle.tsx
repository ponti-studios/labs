import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router";

import {
  MAX_GUESSES,
  RHOBH_PUZZLE_SET_LABEL,
  VALID_GUESSES,
  type LetterState,
  evaluateGuess,
  getKeyboardState,
  getPuzzleForKey,
  getPuzzleKeyForDate,
  normalizeGuess,
} from "~/lib/rhobh-wordle";

const KEYBOARD_ROWS = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"];
const STORAGE_PREFIX = "labyrinth:rhobh-wordle:";

const STATE_CLASSES: Record<LetterState, string> = {
  absent: "border-border-default bg-bg-panel-2 text-text-secondary",
  present: "border-amber-300 bg-amber-100 text-amber-950",
  correct: "border-emerald-300 bg-emerald-100 text-emerald-950",
};

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
  return state
    ? STATE_CLASSES[state]
    : "border-border-default bg-bg-elevated text-text-primary";
}

function getStorageKey(puzzleKey: string) {
  return `${STORAGE_PREFIX}${puzzleKey}`;
}

function getInitialMessage(answerLength: number) {
  return `Daily challenge: guess the Beverly Hills name in ${answerLength} letters.`;
}

function readPersistedGameState(puzzleKey: string): PersistedGameState | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const saved = window.localStorage.getItem(getStorageKey(puzzleKey));

    if (!saved) {
      return null;
    }

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
      guesses: parsed.guesses.map((guess) => normalizeGuess(String(guess))).filter(Boolean),
      message: parsed.message,
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
  const [message, setMessage] = useState(() => getInitialMessage(answerLength));
  const [hydratedPuzzleKey, setHydratedPuzzleKey] = useState<string | null>(null);
  const boardColumns = useMemo(
    () => ({ gridTemplateColumns: `repeat(${answerLength}, minmax(0, 1fr))` }),
    [answerLength],
  );

  const keyboardState = useMemo(
    () => getKeyboardState(puzzle.answer, guesses),
    [guesses, puzzle.answer],
  );
  const latestGuess = guesses.at(-1);
  const isSolved = latestGuess === puzzle.answer;
  const isGameOver = isSolved || guesses.length >= MAX_GUESSES;
  const bonusHint =
    guesses.length >= 3
      ? `Bonus hint: ${puzzle.role}. Starts with ${puzzle.answer[0]}.`
      : "Bonus hint unlocks after three guesses.";

  useEffect(() => {
    function syncPuzzleKey() {
      const nextPuzzleKey = getPuzzleKeyForDate(new Date());
      setPuzzleKey((currentPuzzleKey) =>
        currentPuzzleKey === nextPuzzleKey ? currentPuzzleKey : nextPuzzleKey,
      );
    }

    const intervalId = window.setInterval(syncPuzzleKey, 60_000);
    document.addEventListener("visibilitychange", syncPuzzleKey);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", syncPuzzleKey);
    };
  }, []);

  useEffect(() => {
    const savedState = readPersistedGameState(puzzleKey);

    setCurrentGuess("");
    setGuesses(savedState?.guesses ?? []);
    setMessage(savedState?.message ?? getInitialMessage(answerLength));
    setHydratedPuzzleKey(puzzleKey);
  }, [answerLength, puzzleKey]);

  useEffect(() => {
    if (hydratedPuzzleKey !== puzzleKey) {
      return;
    }

    const persistedState: PersistedGameState = {
      puzzleKey,
      guesses,
      message,
      status: isSolved ? "solved" : guesses.length >= MAX_GUESSES ? "failed" : "playing",
    };

    window.localStorage.setItem(getStorageKey(puzzleKey), JSON.stringify(persistedState));
  }, [guesses, hydratedPuzzleKey, isSolved, message, puzzleKey]);

  const resetBoard = useCallback(() => {
    window.localStorage.removeItem(getStorageKey(puzzleKey));
    setGuesses([]);
    setCurrentGuess("");
    setMessage(getInitialMessage(answerLength));
  }, [answerLength, puzzleKey]);

  const addLetter = useCallback(
    (value: string) => {
      if (isGameOver) {
        return;
      }

      setCurrentGuess((existing) => {
        if (existing.length >= answerLength) {
          return existing;
        }

        return existing + value;
      });
    },
    [answerLength, isGameOver],
  );

  const removeLetter = useCallback(() => {
    if (isGameOver) {
      return;
    }

    setCurrentGuess((existing) => existing.slice(0, -1));
  }, [isGameOver]);

  const submitGuess = useCallback(() => {
    if (isGameOver) {
      return;
    }

    const guess = normalizeGuess(currentGuess);

    if (guess.length !== answerLength) {
      setMessage(`This puzzle needs exactly ${answerLength} letters.`);
      return;
    }

    if (!VALID_GUESSES.has(guess)) {
      setMessage("Try a name from this Beverly Hills puzzle set.");
      return;
    }

    const nextGuesses = [...guesses, guess];
    setGuesses(nextGuesses);
    setCurrentGuess("");

    if (guess === puzzle.answer) {
      setMessage(`Correct. ${puzzle.answer} was today's Beverly Hills answer.`);
      return;
    }

    if (nextGuesses.length >= MAX_GUESSES) {
      setMessage(`Out of guesses. The answer was ${puzzle.answer}.`);
      return;
    }

    setMessage("Not quite. Check the clue, then use the board colors for your next guess.");
  }, [answerLength, currentGuess, guesses, isGameOver, puzzle.answer]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }

      if (event.key === "Enter") {
        event.preventDefault();
        submitGuess();
        return;
      }

      if (event.key === "Backspace") {
        event.preventDefault();
        removeLetter();
        return;
      }

      if (/^[a-z]$/i.test(event.key)) {
        event.preventDefault();
        addLetter(event.key.toUpperCase());
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [addLetter, removeLetter, submitGuess]);

  return (
    <div className="py-8">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[minmax(0,1.35fr)_320px]">
        <section className="rounded-3xl border border-border-default bg-bg-panel-0 p-6 shadow-sm sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-2xl space-y-3">
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-text-muted">
                Labyrinth · Daily game
              </p>
              <h1 className="text-4xl font-semibold tracking-tight text-text-primary sm:text-5xl">
                RHOBH Wordle
              </h1>
              <p className="text-base leading-7 text-text-secondary sm:text-lg">
                Guess a Beverly Hills cast or friend name from this curated puzzle set. Green
                means the right letter in the right place, gold means the letter belongs somewhere
                else.
              </p>
            </div>
            <button className="btn-secondary" onClick={resetBoard} type="button">
              Reset board
            </button>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-border-default bg-bg-panel-1 p-4">
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-text-muted">
                Main clue
              </p>
              <p className="mt-2 text-base leading-7 text-text-primary">{puzzle.clue}</p>
            </div>
            <div className="rounded-2xl border border-border-default bg-bg-panel-1 p-4">
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-text-muted">
                Bonus clue
              </p>
              <p className="mt-2 text-base leading-7 text-text-primary">{bonusHint}</p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-border-default bg-bg-elevated p-4">
            <p className="text-sm leading-6 text-text-secondary">{message}</p>
          </div>

          <div className="mt-8 space-y-2">
            {Array.from({ length: MAX_GUESSES }).map((_, rowIndex) => {
              const guess = guesses[rowIndex] ?? "";
              const states = guess ? evaluateGuess(puzzle.answer, guess) : [];
              const isCurrentRow = rowIndex === guesses.length && !isGameOver;
              const letters = (isCurrentRow ? currentGuess : guess).padEnd(answerLength, " ");

              return (
                <div key={`row-${rowIndex}`} className="grid gap-2" style={boardColumns}>
                  {letters.split("").map((letter, cellIndex) => (
                    <div
                      key={`cell-${rowIndex}-${cellIndex}`}
                      className={[
                        "flex aspect-square items-center justify-center rounded-2xl border text-xl font-semibold uppercase transition-colors sm:text-2xl",
                        getTileClasses(states[cellIndex]),
                      ].join(" ")}
                    >
                      {letter.trim()}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>

          <div className="mt-8 space-y-3">
            {KEYBOARD_ROWS.map((row, rowIndex) => (
              <div key={row} className="flex justify-center gap-2">
                {rowIndex === 2 && (
                  <button className="btn-secondary px-3 py-3 text-xs" onClick={submitGuess} type="button">
                    Enter
                  </button>
                )}
                {row.split("").map((letter) => (
                  <button
                    key={letter}
                    className={[
                      "flex h-12 min-w-10 items-center justify-center rounded-xl border px-3 font-medium transition-colors",
                      getTileClasses(keyboardState[letter]),
                    ].join(" ")}
                    onClick={() => addLetter(letter)}
                    type="button"
                  >
                    {letter}
                  </button>
                ))}
                {rowIndex === 2 && (
                  <button className="btn-secondary px-3 py-3 text-xs" onClick={removeLetter} type="button">
                    Delete
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>

        <aside className="space-y-6">
          <section className="rounded-3xl border border-border-default bg-bg-panel-0 p-6 shadow-sm">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-text-muted">
              Puzzle notes
            </p>
            <dl className="mt-4 space-y-4">
              <div className="flex items-center justify-between gap-4">
                <dt className="text-sm text-text-secondary">Letters</dt>
                <dd className="font-mono text-sm text-text-primary">{answerLength}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-sm text-text-secondary">Guesses used</dt>
                <dd className="font-mono text-sm text-text-primary">
                  {guesses.length} / {MAX_GUESSES}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-sm text-text-secondary">Theme</dt>
                <dd className="font-mono text-sm text-text-primary">{RHOBH_PUZZLE_SET_LABEL}</dd>
              </div>
            </dl>
          </section>

          <section className="rounded-3xl border border-border-default bg-bg-panel-0 p-6 shadow-sm">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-text-muted">
              If you need a nudge
            </p>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-text-secondary">
              <li>Use only names from this Beverly Hills puzzle set.</li>
              <li>The keyboard colors keep the strongest hit for every letter.</li>
              <li>After three tries, the bonus clue adds the role and first letter.</li>
            </ul>
          </section>

          {isGameOver && (
            <section className="rounded-3xl border border-border-default bg-bg-panel-0 p-6 shadow-sm">
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-text-muted">
                Reveal
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-text-primary">{puzzle.answer}</h2>
              <p className="mt-2 text-sm text-text-muted">{puzzle.role}</p>
              <p className="mt-4 text-sm leading-6 text-text-secondary">{puzzle.detail}</p>
            </section>
          )}

          <Link
            className="inline-flex items-center rounded-full border border-border-default px-4 py-2 text-sm text-text-secondary transition-colors hover:bg-bg-panel-1 hover:text-text-primary"
            rel="prefetch"
            to="/"
          >
            Back to all routes
          </Link>
        </aside>
      </div>
    </div>
  );
}
