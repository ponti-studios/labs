import { Button, OnscreenKeyboard } from "@pontistudios/ui";
import { cva } from "class-variance-authority";
import { memo, useEffect, useMemo, useState } from "react";
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
import { LucideHelpCircle, LucideNewspaper, LucideShare } from "lucide-react";

const TILE_BASE = cva(
  "flex h-[3.6rem] w-[3.6rem] items-center justify-center rounded-2xl border text-[1.35rem] font-bold uppercase transition-colors sm:h-12 sm:w-12 sm:rounded-xl sm:text-lg md:h-14 md:w-14",
  {
    variants: {
      state: {
        absent: "border-border bg-muted text-muted-foreground",
        correct: "border-emerald-300 bg-emerald-100 text-emerald-950",
        empty: "border-border bg-background text-foreground",
        present: "border-amber-300 bg-amber-100 text-amber-950",
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
        <div key={`empty-cell-${cellIndex}`} className={TILE_BASE({ state: "empty" })} />
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
  currentGuess: string;
  hasError: boolean;
  isShaking: boolean;
  isValidationPending: boolean;
};

const CurrentGuessRow = memo(function CurrentGuessRow({
  currentGuess,
  hasError,
  isShaking,
  isValidationPending,
}: CurrentGuessRowProps) {
  return (
    <div
      className={cn(
        "flex gap-1.5 transition-opacity sm:gap-1",
        hasError && "realitea-tile-error",
        isShaking && "realitea-row-shake",
        isValidationPending && "opacity-60",
      )}
    >
      {Array.from({ length: REALITEA_ANSWER_LENGTH }).map((_, cellIndex) => (
        <div
          key={`current-cell-${cellIndex}`}
          aria-label={`Letter ${cellIndex + 1}`}
          className={cn(
            TILE_BASE({ state: "empty" }),
            "flex items-center justify-center",
            hasError && "realitea-tile-error",
          )}
        >
          {currentGuess[cellIndex] ?? ""}
        </div>
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
  return <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-3" />;
}

type ErrorBoundaryProps = { error: Error };

export function ErrorBoundary({ error }: ErrorBoundaryProps) {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center gap-3 px-4 text-center">
      <p className="text-muted-foreground text-sm font-medium tracking-[0.15em] uppercase">
        Something went wrong
      </p>
      <p className="text-muted-foreground text-sm">
        {error.message || "The RealiTea puzzle couldn't load. Try refreshing the page."}
      </p>
      <a
        href="/games/realitea"
        className="bg-primary text-primary-foreground hover:bg-primary/90 mt-2 inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors"
      >
        Reload
      </a>
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

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 px-4 pb-[calc(env(safe-area-inset-bottom)+8px)]">
      <header className="bg-background/95 sticky top-0 z-10 backdrop-blur md:static">
        <div className="flex items-center justify-between gap-2 rounded border p-2 px-1">
          <img src="/logo.realitea.png" alt="RealiTea" className="h-6 object-contain" />
          <Button
            aria-label="How to play"
            variant="ghost"
            className="px-1"
            onClick={() => setShowInstructions((v) => !v)}
            type="button"
          >
            <LucideHelpCircle />
          </Button>
        </div>
      </header>

      {showInstructions && (
        <div className="border-border bg-muted/30 text-muted-foreground rounded-xl border p-3 text-sm leading-5">
          <p>Guess today&apos;s reality TV answer in 6 tries.</p>
          <p className="mt-2">
            <span className="font-medium text-emerald-700">Green</span> means the right letter is in
            the right place. <span className="font-medium text-amber-700">Gold</span> means the
            letter belongs in the answer but is in the wrong place.
          </p>
        </div>
      )}

      {shouldShowClue && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm leading-5 text-amber-950">
          <p className="text-xs font-medium tracking-[0.15em] text-amber-800 uppercase">
            Final clue
          </p>
          <p className="mt-1">{currentPuzzle.clue}</p>
        </div>
      )}

      <div className="flex flex-1 flex-col items-center justify-center gap-2">
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
                  currentGuess={game.currentGuess}
                  hasError={game.hasError}
                  isShaking={game.isShaking}
                  isValidationPending={game.isValidationPending}
                />
              );
            }

            return <EmptyGuessRow key={`empty-${rowIndex}`} />;
          })}
        </div>

        {game.errorMessage ? (
          <p
            className="min-h-[1em] text-center text-xs font-medium text-red-600"
            aria-live="polite"
            aria-atomic="true"
          ></p>
        ) : null}
      </div>

      {game.isGameOver ? (
        <div className="space-y-4 rounded border p-3 md:p-4">
          <div>
            <p className="text-muted-foreground ui-eyebrow">
              {game.isSolved ? "The Story" : "The puzzle ended"}
            </p>
            <p className="text-sm leading-5">{currentPuzzle.detail.toLocaleLowerCase()}</p>
          </div>
          <div className="flex justify-end gap-2">
            <Button aria-label="Share result" onClick={share} type="button" variant="secondary">
              <LucideShare size={18} />
            </Button>
            {currentPuzzle.sourceUrls.length > 0 && (
              <a
                href={currentPuzzle.sourceUrls.at(0)}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-primary text-secondary rounded px-4 py-2 text-sm font-medium transition-colors hover:text-emerald-200"
              >
                <LucideNewspaper size={18} />
              </a>
            )}
          </div>
        </div>
      ) : (
        <OnscreenKeyboard
          letterStates={keyboardState}
          onLetter={game.addLetter}
          onEnter={game.submitGuess}
          onBackspace={game.removeLetter}
        />
      )}
    </div>
  );
}
