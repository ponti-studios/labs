import { Button, OnscreenKeyboard } from "@pontistudios/ui";
import { cva } from "class-variance-authority";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { useLoaderData, type LoaderFunctionArgs } from "react-router";

import {
  getKeyboardState,
  MAX_GUESSES,
  type GameStatus,
  type LetterState,
  type RealiteaGuess,
} from "~/lib/realitea";
import { loadActivePublicPuzzle } from "~/lib/realitea-daily-puzzle.server";
import { cn } from "~/lib/utils";

import { readGameState, saveGameState } from "./game-state";
import { useDailyPuzzle } from "./use-daily-puzzle";
import { useRealiTeaGame } from "./use-reali-tea-game";
import { useRealiTeaShare } from "./use-reali-tea-share";

import "~/styles/realitea.css";
import { LucideShare, LucideShare2 } from "lucide-react";

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
    defaultVariants: { state: "empty" },
  },
);

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

function getTileRevealStyle(state: LetterState): React.CSSProperties {
  const finalStyle = TILE_REVEAL_STYLES[state];

  return {
    "--tile-final-background": finalStyle.backgroundColor,
    "--tile-final-border": finalStyle.borderColor,
    "--tile-final-color": finalStyle.color,
  } as React.CSSProperties;
}

export async function loader(_args: LoaderFunctionArgs) {
  const envelope = await loadActivePublicPuzzle(new Date());

  if (!envelope) {
    throw Response.json(
      {
        code: "REALITEA_PUZZLE_NOT_FOUND",
        error: "No RealiTea puzzle found for today",
      },
      { status: 404, statusText: "No RealiTea puzzle found for today" },
    );
  }

  return Response.json(envelope);
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

type EmptyGuessRowProps = {
  answerLength: number;
};

const EmptyGuessRow = memo(function EmptyGuessRow({ answerLength }: EmptyGuessRowProps) {
  return (
    <div className="flex gap-1.5 sm:gap-1">
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
  answerLength: number;
  guess: RealiteaGuess;
  isRevealingThisRow: boolean;
  revealedTileCount: number;
};

const RevealedGuessRow = memo(function RevealedGuessRow({
  answerLength,
  guess,
  isRevealingThisRow,
  revealedTileCount,
}: RevealedGuessRowProps) {
  return (
    <div className="flex gap-1.5 sm:gap-1">
      {Array.from({ length: answerLength }).map((_, cellIndex) => {
        const isTileRevealed = !isRevealingThisRow || cellIndex < revealedTileCount;
        const isAnimatingTile =
          isRevealingThisRow && revealedTileCount > 0 && cellIndex === revealedTileCount - 1;
        const tileState = isTileRevealed ? guess.states[cellIndex] : undefined;

        return (
          <div
            key={`revealed-cell-${cellIndex}`}
            className={cn(
              TILE_BASE({ state: tileState ?? "empty" }),
              "flex items-center justify-center",
              isAnimatingTile && "realitea-tile-reveal",
            )}
            style={isAnimatingTile ? getTileRevealStyle(guess.states[cellIndex]) : undefined}
          >
            {guess.word[cellIndex] ?? ""}
          </div>
        );
      })}
    </div>
  );
});

type CurrentGuessRowProps = {
  answerLength: number;
  cellRefs: React.MutableRefObject<Array<HTMLInputElement | null>>;
  currentGuess: string;
  hasError: boolean;
  isShaking: boolean;
  isValidationPending: boolean;
  onCellChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCellFocus: () => void;
  onCellKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
};

const CurrentGuessRow = memo(function CurrentGuessRow({
  answerLength,
  cellRefs,
  currentGuess,
  hasError,
  isShaking,
  isValidationPending,
  onCellChange,
  onCellFocus,
  onCellKeyDown,
}: CurrentGuessRowProps) {
  return (
    <div
      className={cn(
        "flex gap-1.5 sm:gap-1 transition-opacity",
        hasError && "realitea-tile-error",
        isShaking && "realitea-row-shake",
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
            "bg-background text-center outline-none caret-transparent focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-ring",
            hasError && "realitea-tile-error",
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

/**
 * Skeleton that React Router renders during SSR / before hydration. The route
 * reads `localStorage` for restored progress on the client, which would
 * otherwise mismatch the server-rendered output.
 */
export function HydrateFallback() {
  return (
    <div className="-mx-4 min-h-[100dvh] bg-background md:mx-0 md:min-h-0">
      <div className="mx-auto flex min-h-[100dvh] w-full max-w-md flex-col px-3 pb-2 pt-2 md:block md:min-h-0 md:max-w-2xl md:px-4 md:pt-4" />
    </div>
  );
}

export default function RealiTeaRoute() {
  const initial = useLoaderData() as { puzzle: import("~/lib/realitea").PublicDailyPuzzle };
  const [showInstructions, setShowInstructions] = useState(false);

  const { currentPuzzle } = useDailyPuzzle(initial.puzzle);

  // Read once at mount. We deliberately do not subscribe to localStorage.
  // useState lazy initializer runs exactly once per mount — one-shot seed,
  // not reactive state. If the puzzle rolls over at midnight, the reset
  // effect in useRealiTeaGame handles the transition.
  const [seed] = useState(() => {
    if (typeof window === "undefined") {
      return { guesses: [] as RealiteaGuess[], status: "playing" as GameStatus };
    }
    const stored = readGameState(currentPuzzle.dateKey);
    return {
      guesses: stored?.guesses ?? [],
      status: stored?.status ?? ("playing" as GameStatus),
    };
  });

  const game = useRealiTeaGame({
    puzzle: currentPuzzle,
    initialGuesses: seed.guesses,
  });

  // Persist after every status/guess change. One-way write — no read.
  useEffect(() => {
    saveGameState({
      puzzleKey: currentPuzzle.dateKey,
      guesses: [...game.guesses],
      status: game.status,
    });
  }, [currentPuzzle.dateKey, game.guesses, game.status]);

  const keyboardState = useMemo(() => getKeyboardState(game.guesses), [game.guesses]);
  const shouldShowClue = !game.isGameOver && game.guesses.length === MAX_GUESSES - 1;

  const { share } = useRealiTeaShare({
    puzzle: currentPuzzle,
    guesses: game.guesses,
    isSolved: game.isSolved,
    onResult: game.clearError,
  });

  // Auto-focus the active cell whenever the game transitions to an
  // input-ready state (fresh mount, after a guess is submitted and the
  // tile reveal finishes, after midnight rollover). This ensures
  // physical/device keyboard input always has a target to receive events.
  useEffect(() => {
    if (game.isGameOver || game.isRevealingRow || game.isValidationPending) return;
    game.redirectToActiveCell();
  }, [game.guesses.length, game.isGameOver, game.isRevealingRow, game.isValidationPending]);

  const handleCellKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        game.submitGuess();
      } else if (e.key === "Backspace") {
        e.preventDefault();
        game.removeLetter();
      } else if (/^[a-z]$/i.test(e.key)) {
        e.preventDefault();
        game.addLetter(e.key.toUpperCase());
      }
    },
    [game.addLetter, game.removeLetter, game.submitGuess],
  );

  const handleCellChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const char = e.target.value
        .replace(/[^a-zA-Z]/g, "")
        .toUpperCase()
        .charAt(0);
      if (char) game.addLetter(char);
    },
    [game.addLetter],
  );

  return (
    <div className="-mx-4 min-h-[100dvh] bg-background md:mx-0 md:min-h-0">
      <div className="mx-auto flex min-h-[100dvh] w-full max-w-md flex-col px-3 pb-[calc(env(safe-area-inset-bottom)+8px)] pt-2 md:block md:min-h-0 md:max-w-2xl md:px-4 md:pb-4 md:pt-4">
        <header className="sticky top-0 z-10 -mx-3 border-b border-border bg-background/95 px-3 pb-1 pt-1 backdrop-blur md:static md:mx-0 md:border-b-0 md:bg-transparent md:px-0 md:pb-2 md:pt-0">
          <div className="flex items-center justify-between gap-2">
            <img src="/logo.realitea.png" alt="RealiTea" className="h-8 object-contain" />
            <button
              aria-label="How to play"
              className="flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-muted"
              onClick={() => setShowInstructions((v) => !v)}
              type="button"
            >
              <span className="text-sm font-medium">?</span>
            </button>
          </div>
        </header>

        {showInstructions && (
          <div className="mt-2 rounded-xl border border-border bg-muted/30 p-3 text-sm leading-5 text-muted-foreground">
            <p>Guess today&apos;s reality TV answer in 6 tries.</p>
            <p className="mt-2">
              <span className="font-medium text-emerald-700">Green</span> means the right letter is
              in the right place. <span className="font-medium text-amber-700">Gold</span> means the
              letter belongs in the answer but is in the wrong place.
            </p>
          </div>
        )}

        <div className="flex flex-1 flex-col md:block md:flex-none">
          <div className="flex-1 pt-3 md:flex-none">
            {shouldShowClue && (
              <div className="mb-3 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm leading-5 text-amber-950 md:mb-2">
                <p className="text-xs font-medium uppercase tracking-[0.15em] text-amber-800">
                  Final clue
                </p>
                <p className="mt-1">{currentPuzzle.clue}</p>
              </div>
            )}

            <div className="mt-2 flex flex-col items-center gap-2">
              <div className="w-fit space-y-1 sm:space-y-0.5">
                {Array.from({
                  length: game.isGameOver ? game.guesses.length : MAX_GUESSES,
                }).map((_, rowIndex) => {
                  const isCurrentRow =
                    rowIndex === game.guesses.length && !game.isGameOver && !game.isRevealingRow;
                  const guess = game.guesses[rowIndex];
                  const isRevealingThisRow = rowIndex === game.revealingGuessIndex;

                  if (guess) {
                    return (
                      <RevealedGuessRow
                        key={`row-${rowIndex}`}
                        answerLength={currentPuzzle.answerLength}
                        guess={guess}
                        isRevealingThisRow={isRevealingThisRow}
                        revealedTileCount={game.revealedTileCount}
                      />
                    );
                  }

                  if (isCurrentRow) {
                    return (
                      <CurrentGuessRow
                        key={`row-${rowIndex}`}
                        answerLength={currentPuzzle.answerLength}
                        cellRefs={game.cellRefs}
                        currentGuess={game.currentGuess}
                        hasError={game.hasError}
                        isShaking={game.isShaking}
                        isValidationPending={game.isValidationPending}
                        onCellChange={handleCellChange}
                        onCellFocus={game.redirectToActiveCell}
                        onCellKeyDown={handleCellKeyDown}
                      />
                    );
                  }

                  return (
                    <EmptyGuessRow
                      key={`row-${rowIndex}`}
                      answerLength={currentPuzzle.answerLength}
                    />
                  );
                })}
              </div>

              {game.errorMessage && (
                <p className="text-center text-xs font-medium text-red-600">{game.errorMessage}</p>
              )}
            </div>

            {game.isGameOver && (
              <div className="mt-6 rounded max-w-md mx-auto border border-border bg-muted/25 p-3 md:p-4">
                <p className="text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">
                  {game.isSolved ? "The Story" : "The puzzle ended"}
                </p>
                <p className="mt-2 text-sm leading-5">{currentPuzzle.detail}</p>
                <div className="flex justify-end gap-2 pt-3 md:pt-4">
                  <Button
                    className="w-full md:w-auto"
                    onClick={share}
                    type="button"
                    variant="secondary"
                  >
                    <LucideShare />
                  </Button>
                  {currentPuzzle.sourceUrls.length > 0 && (
                    <a
                      href={currentPuzzle.sourceUrls.at(0)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 text-sm font-medium bg-primary text-secondary rounded transition-colors hover:text-emerald-200"
                    >
                      Read more →
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {!game.isGameOver && (
            <div className="sticky bottom-0 z-10 -mx-3 mt-3 border-t border-border bg-background/95 px-2 pb-[calc(env(safe-area-inset-bottom)+6px)] pt-2 backdrop-blur md:static md:mx-0 md:mt-4 md:border-t-0 md:bg-transparent md:px-0 md:pb-0 md:pt-0">
              <OnscreenKeyboard letterStates={keyboardState} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
