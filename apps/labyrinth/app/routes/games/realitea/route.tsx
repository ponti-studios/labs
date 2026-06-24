import { Button, OnscreenKeyboard } from "@pontistudios/ui";
import { cva } from "class-variance-authority";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLoaderData, type LoaderFunctionArgs } from "react-router";

import {
  getKeyboardState,
  MAX_GUESSES,
  REALITEA_ANSWER_LENGTH,
  type GameStatus,
  type LetterState,
  type PublicDailyPuzzle,
  type RealiteaGuess,
} from "~/lib/realitea";
import { loadActivePublicPuzzle } from "~/lib/realitea-puzzle.server";
import { cn } from "~/lib/utils";

import { readGameState, saveGameState } from "./game-state";
import { useRealiTeaGame } from "./use-game";
import { useRealiTeaShare } from "./use-share";

import "./realitea.css";
import { LucideShare } from "lucide-react";

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

export type LoaderData = {
  puzzle: PublicDailyPuzzle;
};

export function meta() {
  return [
    { title: "RealiTea — Labyrinth" },
    {
      name: "description",
      content: "Guess today's reality TV answer from a rotating daily word game.",
    },
  ];
}

const EmptyGuessRow = memo(function EmptyGuessRow() {
  return (
    <div className="flex gap-1.5 sm:gap-1">
      {Array.from({ length: REALITEA_ANSWER_LENGTH }).map((_, cellIndex) => (
        <div
          key={`empty-cell-${cellIndex}`}
          className={cn(TILE_BASE({ state: "empty" }), "flex items-center justify-center")}
        />
      ))}
    </div>
  );
});

type RevealedGuessRowProps = {
  guess: RealiteaGuess;
  isRevealingThisRow: boolean;
  revealedTileCount: number;
};

const RevealedGuessRow = memo(function RevealedGuessRow({
  guess,
  isRevealingThisRow,
  revealedTileCount,
}: RevealedGuessRowProps) {
  return (
    <div className="flex gap-1.5 sm:gap-1">
      {Array.from({ length: REALITEA_ANSWER_LENGTH }).map((_, cellIndex) => {
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
  cellRefs: React.RefObject<Array<HTMLInputElement | null>>;
  currentGuess: string;
  hasError: boolean;
  isShaking: boolean;
  isValidationPending: boolean;
  onCellChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCellKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
};

const CurrentGuessRow = memo(function CurrentGuessRow({
  cellRefs,
  currentGuess,
  hasError,
  isShaking,
  isValidationPending,
  onCellChange,
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
      {Array.from({ length: REALITEA_ANSWER_LENGTH }).map((_, cellIndex) => (
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

type ErrorBoundaryProps = { error: Error };

export function ErrorBoundary({ error }: ErrorBoundaryProps) {
  return (
    <div className="-mx-4 min-h-[100dvh] bg-background md:mx-0 md:min-h-0">
      <div className="mx-auto flex min-h-[100dvh] w-full max-w-md flex-col items-center justify-center gap-3 px-3 text-center md:block md:min-h-0 md:max-w-2xl md:px-4">
        <p className="text-sm font-medium uppercase tracking-[0.15em] text-muted-foreground">
          Something went wrong
        </p>
        <p className="text-sm text-muted-foreground">
          {error.message || "The RealiTea puzzle couldn't load. Try refreshing the page."}
        </p>
        <a
          href="/games/realitea"
          className="mt-2 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Reload
        </a>
      </div>
    </div>
  );
}

export default function RealiTeaRoute() {
  const initial = useLoaderData<LoaderData>();
  const [showInstructions, setShowInstructions] = useState(false);

  const currentPuzzle = initial.puzzle;

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

  // After a guess is submitted and the tile reveal finishes, refocus the
  // active cell so physical/device keyboard input has a target. We skip
  // the first mount so that seed-restored games on mount don't get
  // disrupted by an unnecessary focus call (which can confuse tests and
  // steal focus from screen readers).
  const isFirstMountRef = useRef(true);
  useEffect(() => {
    if (isFirstMountRef.current) {
      isFirstMountRef.current = false;
      return;
    }
    if (game.isGameOver || game.isRevealingRow || game.isValidationPending) return;
    game.redirectToActiveCell();
  }, [game.guesses.length, game.isGameOver, game.isRevealingRow, game.isValidationPending]);

  const KEY_RE = /^[a-z]$/i;

  const handleCellKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        game.submitGuess();
      } else if (e.key === "Backspace") {
        e.preventDefault();
        game.removeLetter();
      } else if (KEY_RE.test(e.key)) {
        e.preventDefault();
        game.addLetter(e.key.toUpperCase());
      }
    },
    [game.addLetter, game.removeLetter, game.submitGuess],
  );

  const handleCellChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      // maxLength={1} ensures a single character, but we still sanitize
      // for IME / paste edge-cases
      const char = e.target.value.toUpperCase().charAt(0);
      if (char && /^[A-Z]$/.test(char)) game.addLetter(char);
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
                        key={`revealed-${rowIndex}`}
                        guess={guess}
                        isRevealingThisRow={isRevealingThisRow}
                        revealedTileCount={game.revealedTileCount}
                      />
                    );
                  }

                  if (isCurrentRow) {
                    return (
                      <CurrentGuessRow
                        key={`current-${rowIndex}`}
                        cellRefs={game.cellRefs}
                        currentGuess={game.currentGuess}
                        hasError={game.hasError}
                        isShaking={game.isShaking}
                        isValidationPending={game.isValidationPending}
                        onCellChange={handleCellChange}
                        onCellKeyDown={handleCellKeyDown}
                      />
                    );
                  }

                  return <EmptyGuessRow key={`empty-${rowIndex}`} />;
                })}
              </div>

              {game.errorMessage && (
                <p className="text-center text-xs font-medium text-red-600" aria-live="polite">
                  {game.errorMessage}
                </p>
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
                    aria-label="Share result"
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
              <OnscreenKeyboard letterStates={keyboardState} readOnly />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
