import { cva } from "class-variance-authority";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFetcher, useLoaderData, type LoaderFunctionArgs } from "react-router";

import { Button, OnscreenKeyboard, type LetterState } from "@pontistudios/ui";
import {
  evaluateGuess,
  getKeyboardState,
  MAX_GUESSES,
  normalizeGuess,
} from "~/lib/realitea";
import { getDateKey, type DailyPuzzle } from "~/lib/realitea-daily-puzzle";
import { loadActivePuzzle } from "~/lib/realitea-daily-puzzle.server";
import { shareRealiTeaResult } from "~/lib/realitea-share";
import { cn } from "~/lib/utils";
import { useGameState } from "./game-state";

const TILE_STATE_CLASSES: Record<LetterState, string> = {
  absent: "border-border bg-muted text-muted-foreground",
  present: "border-amber-300 bg-amber-100 text-amber-950",
  correct: "border-emerald-300 bg-emerald-100 text-emerald-950",
};

const TILE_BASE = cva(
  "flex h-[3.6rem] w-[3.6rem] items-center justify-center rounded-2xl border text-[1.35rem] font-bold uppercase transition-colors sm:h-12 sm:w-12 sm:rounded-xl sm:text-lg md:h-14 md:w-14",
  {
    variants: {
      state: {
        absent: TILE_STATE_CLASSES.absent,
        correct: TILE_STATE_CLASSES.correct,
        empty: "border-border bg-background text-foreground",
        present: TILE_STATE_CLASSES.present,
      },
    },
    defaultVariants: {
      state: "empty",
    },
  },
);
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

export async function loader(_args: LoaderFunctionArgs) {
  const date = new Date();
  const puzzle = await loadActivePuzzle(date);

  if (!puzzle) {
    throw Response.json(
      {
        code: "REALITEA_PUZZLE_NOT_FOUND",
        error: "No RealiTea puzzle found for today",
      },
      {
        status: 404,
        statusText: "No RealiTea puzzle found for today",
      },
    );
  }

  return Response.json(puzzle);
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

function getTileRevealStyle(state: LetterState): React.CSSProperties {
  const finalStyle = TILE_REVEAL_STYLES[state];

  return {
    "--tile-final-background": finalStyle.backgroundColor,
    "--tile-final-border": finalStyle.borderColor,
    "--tile-final-color": finalStyle.color,
  } as React.CSSProperties;
}

type EmptyGuessRowProps = {
  answerLength: number;
  className?: string;
};

const EmptyGuessRow = memo(function EmptyGuessRow({ answerLength, className }: EmptyGuessRowProps) {
  return (
    <div className={cn("flex gap-1.5 sm:gap-1", className)}>
      {Array.from({ length: answerLength }).map((_, cellIndex) => (
        <div
          key={`empty-cell-${cellIndex}`}
          className={cn(TILE_BASE({ state: "empty" }), "flex items-center justify-center")}
        />
      ))}
    </div>
  );
});

type RevealedGuessRowProps = {
  answer: string;
  answerLength: number;
  className?: string;
  guess: string;
  isRevealingThisRow: boolean;
  revealedTileCount: number;
};

const RevealedGuessRow = memo(function RevealedGuessRow({
  answer,
  answerLength,
  className,
  guess,
  isRevealingThisRow,
  revealedTileCount,
}: RevealedGuessRowProps) {
  const states = evaluateGuess(answer, guess);

  return (
    <div className={cn("flex gap-1.5 sm:gap-1", className)}>
      {Array.from({ length: answerLength }).map((_, cellIndex) => {
        const isTileRevealed = !isRevealingThisRow || cellIndex < revealedTileCount;
        const isAnimatingTile =
          isRevealingThisRow && revealedTileCount > 0 && cellIndex === revealedTileCount - 1;
        const tileState = isTileRevealed ? states[cellIndex] : undefined;

        return (
          <div
            key={`revealed-cell-${cellIndex}`}
            className={cn(
              TILE_BASE({ state: tileState ?? "empty" }),
              "flex items-center justify-center",
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
});

type CurrentGuessRowProps = {
  answerLength: number;
  currentGuess: string;
  className?: string;
  isShaking: boolean;
  isValidationPending: boolean;
  onCellChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCellFocus: () => void;
  onCellKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  cellRefs: React.MutableRefObject<Array<HTMLInputElement | null>>;
};

const CurrentGuessRow = memo(function CurrentGuessRow({
  answerLength,
  currentGuess,
  className,
  isShaking,
  isValidationPending,
  onCellChange,
  onCellFocus,
  onCellKeyDown,
  cellRefs,
}: CurrentGuessRowProps) {
  return (
    <div
      className={cn(
        "flex gap-1.5 transition-opacity sm:gap-1",
        className,
        isShaking && "row-shake",
        isValidationPending && "opacity-60",
      )}
    >
      {Array.from({ length: answerLength }).map((_, cellIndex) => (
        <input
          key={`current-cell-${cellIndex}`}
          ref={(el) => {
            cellRefs.current[cellIndex] = el;
          }}
          aria-label={`Letter ${cellIndex + 1}`}
          autoCapitalize="characters"
          autoComplete="off"
          autoCorrect="off"
          className={cn(
            TILE_BASE({ state: "empty" }),
            "bg-background text-center outline-none caret-transparent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
          )}
          inputMode="none"
          maxLength={1}
          readOnly
          type="text"
          value={currentGuess[cellIndex] ?? ""}
          onChange={onCellChange}
          onFocus={onCellFocus}
          onKeyDown={onCellKeyDown}
        />
      ))}
    </div>
  );
});

export default function RealiTeaRoute() {
  const initialData = useLoaderData<typeof loader>() as { puzzle: DailyPuzzle };
  const [puzzleKey, setPuzzleKey] = useState(() => initialData.puzzle.dateKey);
  const [puzzle, setPuzzle] = useState<DailyPuzzle>(() => initialData.puzzle);
  const answerLength = puzzle.answer.length;
  const dailyPuzzleFetcher = useFetcher<{ puzzle: DailyPuzzle }>();
  const { gameState: GameState, saveGameState } = useGameState(puzzleKey);

  const guesses = GameState?.guesses ?? [];
  const [currentGuess, setCurrentGuess] = useState("");
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

  const keyboardState = useMemo(
    () => getKeyboardState(puzzle.answer, guesses),
    [guesses, puzzle.answer],
  );
  const hasSolvedGuess = guesses.at(-1) === puzzle.answer;
  const isSolved = !isRevealingRow && hasSolvedGuess;
  const isGameOver = !isRevealingRow && (hasSolvedGuess || guesses.length >= MAX_GUESSES);
  const shouldShowClue = !isGameOver && guesses.length === MAX_GUESSES - 1;

  useEffect(() => {
    setPuzzle(initialData.puzzle);
    setPuzzleKey(initialData.puzzle.dateKey);
  }, [initialData]);

  useEffect(() => {
    if (!dailyPuzzleFetcher.data?.puzzle) return;
    setPuzzle(dailyPuzzleFetcher.data.puzzle);
    setPuzzleKey(dailyPuzzleFetcher.data.puzzle.dateKey);
  }, [dailyPuzzleFetcher.data]);

  useEffect(() => {
    setCurrentGuess("");
    setRevealingGuessIndex(null);
    setRevealedTileCount(0);
  }, [puzzleKey]);

  useEffect(() => {
    if (isGameOver || isRevealingRow) return;
    const idx = Math.min(currentGuess.length, answerLength - 1);
    cellRefs.current[idx]?.focus();
  }, [currentGuess.length, answerLength, isGameOver, isRevealingRow]);

  useEffect(() => {
    function sync() {
      const now = new Date();
      const nextKey = getDateKey(now);

      if (puzzleKey === nextKey) {
        return;
      }

      dailyPuzzleFetcher.load(`/api/games/realitea/daily?date=${getDateKey(now)}`);
    }

    const id = window.setInterval(sync, 60_000);
    document.addEventListener("visibilitychange", sync);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", sync);
    };
  }, [dailyPuzzleFetcher, puzzleKey]);

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
      const nextGuesses = [...guesses, guess];
      setRevealingGuessIndex(guesses.length);
      setRevealedTileCount(0);
      saveGameState({
        puzzleKey,
        guesses: nextGuesses,
        status:
          guess === puzzle.answer
            ? "solved"
            : nextGuesses.length >= MAX_GUESSES
              ? "failed"
              : "playing",
      });
      setCurrentGuess("");
    } else {
      showError("Not in word list");
    }
  }, [
    guesses,
    puzzle.answer,
    puzzleKey,
    saveGameState,
    showError,
    wordValidator.data,
    wordValidator.state,
  ]);

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
      <div className="-mx-4 min-h-[100dvh] bg-background md:mx-0 md:min-h-0">
        <div className="mx-auto flex min-h-[100dvh] w-full max-w-md flex-col px-3 pb-[calc(env(safe-area-inset-bottom)+8px)] pt-2 md:block md:min-h-0 md:max-w-2xl md:px-4 md:pb-4 md:pt-4">
          <header className="sticky top-0 z-10 -mx-3 border-b border-border bg-background/95 px-3 pb-2 pt-1 backdrop-blur md:static md:mx-0 md:border-b-0 md:bg-transparent md:px-0 md:pb-3 md:pt-0">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  Daily puzzle
                </p>
                <h1 className="text-3xl font-semibold tracking-tight">RealiTea</h1>
                <p className="text-sm text-muted-foreground">
                  Guess {guesses.length + 1} of {MAX_GUESSES}. Five letters only.
                </p>
              </div>
              <Button
                className="min-h-11 shrink-0 px-4"
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
            <div className="mt-2 rounded-xl border border-border bg-muted/30 p-3 text-sm leading-5 text-muted-foreground">
              <p>Guess today&apos;s reality TV answer in 6 tries.</p>
              <p className="mt-2">
                <span className="font-medium text-emerald-700">Green</span> means the right letter
                is in the right place. <span className="font-medium text-amber-700">Gold</span>{" "}
                means the letter belongs in the answer but is in the wrong place.
              </p>
            </div>
          )}

          <div className="flex flex-1 flex-col md:block md:flex-none">
            <div className="flex-1 pt-3 md:flex-none">
              <div className="rounded-2xl border border-border bg-background px-2 py-3 md:px-4 md:py-4">
                <div aria-live="polite" className="min-h-10">
                  {errorMessage && (
                    <p className="rounded-xl border border-border bg-foreground px-3 py-2 text-center text-sm font-medium text-background">
                      {errorMessage}
                    </p>
                  )}
                  {shouldShowClue && (
                    <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
                      <p className="text-xs font-medium uppercase tracking-[0.2em] text-amber-800">
                        Final guess clue
                      </p>
                      <p className="mt-2">{puzzle.clue}</p>
                    </div>
                  )}
                </div>

                <div className="mt-2 flex justify-center">
                  <div className="w-fit space-y-1.5 sm:space-y-1">
                    {Array.from({ length: MAX_GUESSES }).map((_, rowIndex) => {
                      const isCurrentRow =
                        rowIndex === guesses.length && !isGameOver && !isRevealingRow;
                      const guess = guesses[rowIndex] ?? "";
                      const isRevealingThisRow = rowIndex === revealingGuessIndex;
                      const mobileRowClass = rowIndex < guesses.length ? "" : "opacity-70";

                      if (rowIndex < guesses.length) {
                        return (
                          <RevealedGuessRow
                            key={`row-${rowIndex}`}
                            answer={puzzle.answer}
                            answerLength={answerLength}
                            className=""
                            guess={guess}
                            isRevealingThisRow={isRevealingThisRow}
                            revealedTileCount={revealedTileCount}
                          />
                        );
                      }

                      if (isCurrentRow) {
                        return (
                          <CurrentGuessRow
                            key={`row-${rowIndex}`}
                            answerLength={answerLength}
                            cellRefs={cellRefs}
                            className=""
                            currentGuess={currentGuess}
                            isShaking={isShaking}
                            isValidationPending={isValidationPending}
                            onCellChange={handleCellChange}
                            onCellFocus={redirectToActiveCell}
                            onCellKeyDown={handleCellKeyDown}
                          />
                        );
                      }

                      return (
                        <EmptyGuessRow
                          key={`row-${rowIndex}`}
                          answerLength={answerLength}
                          className={mobileRowClass}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>

              {isGameOver && (
                <div className="mt-3 rounded-2xl border border-border bg-muted/25 p-3 md:p-4">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">
                      {isSolved ? "Today's answer" : "The answer was"}
                    </p>
                    <p className="mt-1 text-2xl font-bold tracking-tight text-foreground">
                      {puzzle.answer}
                    </p>
                  </div>
                  <p className="mt-2 text-sm leading-5 text-muted-foreground">{puzzle.detail}</p>
                  <div className="pt-3">
                    <Button
                      className="min-h-11 w-full md:w-auto"
                      onClick={handleShare}
                      type="button"
                      variant="secondary"
                    >
                      Share result
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {!isGameOver && (
              <div className="sticky bottom-0 z-10 -mx-3 mt-2 border-t border-border bg-background/95 px-2 pb-[calc(env(safe-area-inset-bottom)+6px)] pt-2 backdrop-blur md:static md:mx-0 md:mt-4 md:border-t-0 md:bg-transparent md:px-0 md:pb-0 md:pt-0">
                <OnscreenKeyboard
                  disabled={isGameOver || isValidationPending || isRevealingRow}
                  letterStates={keyboardState}
                  onBackspace={removeLetter}
                  onEnter={submitGuess}
                  onLetter={addLetter}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
