import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { type LoaderFunctionArgs, useFetcher, useLoaderData } from "react-router";

import { Button, OnscreenKeyboard, type LetterState } from "@pontistudios/ui";
import {
  getRhobhDateKey,
  type RhobhPuzzleEnvelope,
  type RhobhStoredPuzzle,
} from "~/lib/rhobh-daily-puzzle";
import {
  evaluateGuess,
  getKeyboardState,
  getPuzzleForDate,
  getPuzzleKeyForDate,
  MAX_GUESSES,
  normalizeGuess,
} from "~/lib/realitea";
import { shareRealiTeaResult } from "~/lib/realitea-share";
import { loadRhobhPuzzleForDate } from "~/lib/server/rhobh-daily-puzzle";
import { cn } from "~/lib/utils";

const STORAGE_PREFIX = "labyrinth:realitea:";

const TILE_STATE_CLASSES: Record<LetterState, string> = {
  absent: "border-border bg-muted text-muted-foreground",
  present: "border-amber-300 bg-amber-100 text-amber-950",
  correct: "border-emerald-300 bg-emerald-100 text-emerald-950",
};

const EMPTY_TILE = "border-border bg-background text-foreground";
const TILE_BASE = "h-12 w-12 rounded border text-lg font-bold uppercase transition-colors";
const TILE_REVEAL_STEP_MS = 250;
const TILE_REVEAL_STYLES: Record<
  LetterState,
  { backgroundColor: string; borderColor: string; color: string }
> = {
  absent: {
    backgroundColor: "var(--muted)",
    borderColor: "var(--border)",
    color: "var(--muted-foreground)",
  },
  present: {
    backgroundColor: "#fef3c7",
    borderColor: "#fcd34d",
    color: "#451a03",
  },
  correct: {
    backgroundColor: "#d1fae5",
    borderColor: "#6ee7b7",
    color: "#022c22",
  },
};

interface PersistedGameState {
  puzzleKey: string;
  guesses: string[];
  status: "playing" | "solved" | "failed";
}

function buildStaticPuzzleEnvelope(date: Date): RhobhPuzzleEnvelope {
  const puzzle = getPuzzleForDate(date);

  return {
    puzzle: {
      ...puzzle,
      puzzleKey: getPuzzleKeyForDate(date),
      source: "static",
    },
  };
}

export async function loader(_args: LoaderFunctionArgs) {
  const date = new Date();

  try {
    return Response.json(await loadRhobhPuzzleForDate(date, getPuzzleForDate(date)));
  } catch {
    return Response.json(buildStaticPuzzleEnvelope(date));
  }
}

export function meta() {
  return [
    { title: "RealiTea — Labyrinth" },
    {
      name: "description",
      content: "Guess today's reality TV answer from a rotating daily word game.",
    },
  ];
}

function getTileClasses(state?: LetterState) {
  return state ? TILE_STATE_CLASSES[state] : EMPTY_TILE;
}

function buildStorageKey(prefix: string, puzzleKey: string) {
  return `${prefix}${puzzleKey}`;
}

function getStorageKey(puzzleKey: string) {
  return buildStorageKey(STORAGE_PREFIX, puzzleKey);
}

function parsePersistedGameState(saved: string | null, puzzleKey: string): PersistedGameState | null {
  if (!saved) return null;

  try {
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
      guesses: parsed.guesses.map((guess) => normalizeGuess(String(guess))).filter(Boolean),
      status: parsed.status,
    };
  } catch {
    return null;
  }
}

function readPersistedGameState(puzzleKey: string): PersistedGameState | null {
  if (typeof window === "undefined") return null;

  return parsePersistedGameState(window.localStorage.getItem(getStorageKey(puzzleKey)), puzzleKey);
}

function getTileRevealStyle(state: LetterState): React.CSSProperties {
  const finalStyle = TILE_REVEAL_STYLES[state];

  return {
    "--tile-final-background": finalStyle.backgroundColor,
    "--tile-final-border": finalStyle.borderColor,
    "--tile-final-color": finalStyle.color,
  } as React.CSSProperties;
}

export default function RealiTeaRoute() {
  const initialData = useLoaderData<typeof loader>() as RhobhPuzzleEnvelope;
  const [puzzleKey, setPuzzleKey] = useState(() => initialData.puzzle.puzzleKey);
  const [puzzle, setPuzzle] = useState<RhobhStoredPuzzle>(() => initialData.puzzle);
  const answerLength = puzzle.answer.length;
  const dailyPuzzleFetcher = useFetcher<RhobhPuzzleEnvelope>();

  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState("");
  const [hydratedPuzzleKey, setHydratedPuzzleKey] = useState<string | null>(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [revealingGuessIndex, setRevealingGuessIndex] = useState<number | null>(null);
  const [revealedTileCount, setRevealedTileCount] = useState(0);
  const shakeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const revealTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const wordValidator = useFetcher<{ valid: boolean }>();
  const pendingGuessRef = useRef<string | null>(null);
  const isValidationPending = wordValidator.state !== "idle";
  const isRevealingRow = revealingGuessIndex !== null;

  const cellRefs = useRef<Array<HTMLInputElement | null>>([]);

  const keyboardState = useMemo(() => getKeyboardState(puzzle.answer, guesses), [guesses, puzzle.answer]);
  const hasSolvedGuess = guesses.at(-1) === puzzle.answer;
  const isSolved = !isRevealingRow && hasSolvedGuess;
  const isGameOver = !isRevealingRow && (hasSolvedGuess || guesses.length >= MAX_GUESSES);
  const shouldShowClue = !isGameOver && guesses.length === MAX_GUESSES - 1;

  useEffect(() => {
    setPuzzle(initialData.puzzle);
    setPuzzleKey(initialData.puzzle.puzzleKey);
  }, [initialData]);

  useEffect(() => {
    if (!dailyPuzzleFetcher.data?.puzzle) return;
    setPuzzle(dailyPuzzleFetcher.data.puzzle);
    setPuzzleKey(dailyPuzzleFetcher.data.puzzle.puzzleKey);
  }, [dailyPuzzleFetcher.data]);

  useEffect(() => {
    if (isGameOver || isRevealingRow) return;
    const idx = Math.min(currentGuess.length, answerLength - 1);
    cellRefs.current[idx]?.focus();
  }, [currentGuess.length, answerLength, isGameOver, isRevealingRow]);

  useEffect(() => {
    function sync() {
      const now = new Date();
      const nextKey = getPuzzleKeyForDate(now);

      if (puzzleKey === nextKey) {
        return;
      }

      setPuzzleKey(nextKey);
      setPuzzle(buildStaticPuzzleEnvelope(now).puzzle);
      dailyPuzzleFetcher.load(`/api/games/realitea/daily?date=${getRhobhDateKey(now)}`);
    }

    const id = window.setInterval(sync, 60_000);
    document.addEventListener("visibilitychange", sync);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", sync);
    };
  }, [dailyPuzzleFetcher, puzzleKey]);

  useEffect(() => {
    const saved = readPersistedGameState(puzzleKey);
    setCurrentGuess("");
    setGuesses(saved?.guesses ?? []);
    setHydratedPuzzleKey(puzzleKey);
    setRevealingGuessIndex(null);
    setRevealedTileCount(0);
  }, [answerLength, puzzleKey]);

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
      if (isGameOver || isValidationPending || isRevealingRow) return;
      setCurrentGuess((prev) => (prev.length >= answerLength ? prev : prev + value));
    },
    [answerLength, isGameOver, isRevealingRow, isValidationPending],
  );

  const removeLetter = useCallback(() => {
    if (isGameOver || isValidationPending || isRevealingRow) return;
    setCurrentGuess((prev) => prev.slice(0, -1));
  }, [isGameOver, isRevealingRow, isValidationPending]);

  const showToast = useCallback((message: string, shake = false) => {
    if (shakeTimerRef.current) clearTimeout(shakeTimerRef.current);
    setErrorMessage(message);
    setIsShaking(shake);
    shakeTimerRef.current = setTimeout(() => {
      setIsShaking(false);
      setErrorMessage(null);
    }, 700);
  }, []);

  const showError = useCallback(
    (message: string) => {
      showToast(message, true);
    },
    [showToast],
  );

  useEffect(() => {
    return () => {
      if (shakeTimerRef.current) clearTimeout(shakeTimerRef.current);
      if (revealTimerRef.current) clearTimeout(revealTimerRef.current);
    };
  }, []);

  const submitGuess = useCallback(() => {
    if (isGameOver || isValidationPending || isRevealingRow) return;

    const guess = normalizeGuess(currentGuess);

    if (guess.length !== answerLength) {
      showError("Not enough letters");
      return;
    }

    if (guesses.includes(guess)) {
      showError("Already guessed");
      return;
    }

    pendingGuessRef.current = guess;
    wordValidator.submit(
      { word: guess },
      { method: "POST", action: "/api/words/validate", encType: "application/json" },
    );
  }, [
    answerLength,
    currentGuess,
    guesses,
    isGameOver,
    isRevealingRow,
    isValidationPending,
    showError,
    wordValidator,
  ]);

  useEffect(() => {
    if (wordValidator.state !== "idle" || !wordValidator.data || !pendingGuessRef.current) return;
    const guess = pendingGuessRef.current;
    pendingGuessRef.current = null;
    if (wordValidator.data.valid) {
      setGuesses((prev) => {
        setRevealingGuessIndex(prev.length);
        setRevealedTileCount(0);
        return [...prev, guess];
      });
      setCurrentGuess("");
    } else {
      showError("Not in word list");
    }
  }, [wordValidator.state, wordValidator.data, showError]);

  useEffect(() => {
    if (revealingGuessIndex === null) return;

    if (revealedTileCount >= answerLength) {
      revealTimerRef.current = setTimeout(() => {
        setRevealingGuessIndex(null);
        setRevealedTileCount(0);
      }, TILE_REVEAL_STEP_MS);
      return () => {
        if (revealTimerRef.current) clearTimeout(revealTimerRef.current);
      };
    }

    revealTimerRef.current = setTimeout(() => {
      setRevealedTileCount((count) => count + 1);
    }, TILE_REVEAL_STEP_MS);

    return () => {
      if (revealTimerRef.current) clearTimeout(revealTimerRef.current);
    };
  }, [answerLength, revealedTileCount, revealingGuessIndex]);

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
    if (isGameOver || isRevealingRow) return;
    const idx = Math.min(currentGuess.length, answerLength - 1);
    cellRefs.current[idx]?.focus();
  }, [currentGuess.length, answerLength, isGameOver, isRevealingRow]);

  const handleShare = useCallback(async () => {
    const result = await shareRealiTeaResult({
      answer: puzzle.answer,
      guesses,
      isSolved,
      copyToClipboard: async (text) => {
        if (!navigator.clipboard?.writeText) {
          throw new Error("Clipboard unavailable");
        }

        await navigator.clipboard.writeText(text);
      },
      promptCopy: (message, text) => {
        window.prompt(message, text);
      },
    });

    if (result.method === "clipboard") {
      showToast("Copied!");
    } else {
      showToast("Share text ready");
    }
  }, [guesses, isSolved, puzzle.answer, showToast]);

  return (
    <>
      <style>{`
      @keyframes realitea-shake {
        0%, 100% { transform: translateX(0); }
        20%, 60% { transform: translateX(-6px); }
        40%, 80% { transform: translateX(6px); }
      }
      .row-shake { animation: realitea-shake 0.4s ease; }
      @keyframes realitea-tile-reveal {
        0% {
          transform: rotateX(0deg);
          background-color: var(--background);
          border-color: var(--border);
          color: var(--foreground);
        }
        49% {
          transform: rotateX(90deg);
          background-color: var(--background);
          border-color: var(--border);
          color: var(--foreground);
        }
        50% {
          transform: rotateX(90deg);
          background-color: var(--tile-final-background);
          border-color: var(--tile-final-border);
          color: var(--tile-final-color);
        }
        100% {
          transform: rotateX(0deg);
          background-color: var(--tile-final-background);
          border-color: var(--tile-final-border);
          color: var(--tile-final-color);
        }
      }
      .tile-reveal {
        animation: realitea-tile-reveal ${TILE_REVEAL_STEP_MS}ms ease forwards;
        transform-style: preserve-3d;
      }
    `}</style>
      <div className="py-8">
        <div className="space-y-5 px-4">
          <header className="flex items-center justify-between border-b border-border pb-4">
            <h1 className="text-2xl">RealiTea</h1>
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
            </div>
          </header>

          {showInstructions && (
            <div className="space-y-2 border border-border bg-background/40 p-4 text-sm leading-6 text-muted-foreground">
              <p>Guess today's reality TV answer in 6 tries.</p>
              <p>
                <span className="font-medium text-emerald-700">Green</span> = right letter, right
                place. <span className="font-medium text-amber-700">Gold</span> = right letter,
                wrong place.
              </p>
            </div>
          )}

          {errorMessage && (
            <div className="flex justify-center">
              <p className="rounded bg-foreground px-3 py-1.5 text-sm font-medium text-background">
                {errorMessage}
              </p>
            </div>
          )}

          {shouldShowClue && (
            <div className="rounded border border-amber-300 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-amber-800">
                Final guess clue
              </p>
              <p className="mt-2">{puzzle.clue}</p>
            </div>
          )}

          <div className="mx-auto w-fit space-y-1">
            {Array.from({ length: MAX_GUESSES }).map((_, rowIndex) => {
              const isCurrentRow = rowIndex === guesses.length && !isGameOver && !isRevealingRow;
              const guess = guesses[rowIndex] ?? "";
              const states = guess ? evaluateGuess(puzzle.answer, guess) : [];
              const isRevealingThisRow = rowIndex === revealingGuessIndex;

              return (
                <div
                  key={`row-${rowIndex}`}
                  className={cn(
                    "flex gap-1 transition-opacity",
                    isCurrentRow && isShaking && "row-shake",
                    isCurrentRow && isValidationPending && "opacity-60",
                  )}
                >
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
                          className={cn(
                            TILE_BASE,
                            "text-center outline-none caret-transparent",
                            EMPTY_TILE,
                          )}
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

                    const isTileRevealed = !isRevealingThisRow || cellIndex < revealedTileCount;
                    const isAnimatingTile =
                      isRevealingThisRow &&
                      revealedTileCount > 0 &&
                      cellIndex === revealedTileCount - 1;
                    const tileState = isTileRevealed ? states[cellIndex] : undefined;

                    return (
                      <div
                        key={`cell-${rowIndex}-${cellIndex}`}
                        className={cn(
                          TILE_BASE,
                          "flex items-center justify-center",
                          getTileClasses(tileState),
                          isAnimatingTile && "tile-reveal",
                        )}
                        style={isAnimatingTile ? getTileRevealStyle(states[cellIndex]) : undefined}
                      >
                        {guess[cellIndex]?.trim() ?? ""}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>

          <OnscreenKeyboard
            disabled={isGameOver || isValidationPending || isRevealingRow}
            letterStates={keyboardState}
            onBackspace={removeLetter}
            onEnter={submitGuess}
            onLetter={addLetter}
          />

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
              <div className="pt-2">
                <Button onClick={handleShare} type="button" variant="secondary">
                  Share result
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}