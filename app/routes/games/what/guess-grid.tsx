import { memo, useEffect, useRef } from "react";

import { MAX_GUESSES, WHAT_ANSWER_LENGTH, type WhatGuess } from "~/lib/what";
import { cn } from "~/lib/utils";

import { WhatTile, type WhatTileState } from "./what-tile";
import type { WhatGameState } from "./use-game";

import styles from "./guess-grid.module.css";

const EmptyGuessRow = memo(function EmptyGuessRow() {
  return (
    <div className={styles.row}>
      {Array.from({ length: WHAT_ANSWER_LENGTH }).map((_, cellIndex) => (
        <WhatTile key={`empty-cell-${cellIndex}`} state="empty" />
      ))}
    </div>
  );
});

function describeTileState(state: WhatTileState): string {
  switch (state) {
    case "correct":
      return "correct, in the right position";
    case "present":
      return "present, in the wrong position";
    case "absent":
      return "not in the word";
    default:
      return "not revealed";
  }
}

const RevealedGuessRow = memo(function RevealedGuessRow({
  guess,
  isRevealingThisRow,
  revealedTileCount,
}: {
  guess: WhatGuess;
  isRevealingThisRow: boolean;
  revealedTileCount: number;
}) {
  return (
    <div className={styles.row}>
      {Array.from({ length: WHAT_ANSWER_LENGTH }).map((_, cellIndex) => {
        const isTileRevealed = !isRevealingThisRow || cellIndex < revealedTileCount;
        const isAnimatingTile =
          isRevealingThisRow && revealedTileCount > 0 && cellIndex === revealedTileCount - 1;
        const tileState: WhatTileState = isTileRevealed ? guess.states[cellIndex] : "empty";

        return (
          <WhatTile
            key={`revealed-cell-${cellIndex}`}
            state={tileState}
            letter={guess.word[cellIndex] ?? ""}
            ariaLabel={`${guess.word[cellIndex] ?? "Blank"}: ${describeTileState(tileState)}`}
            isRevealing={isAnimatingTile}
          />
        );
      })}
    </div>
  );
});

const SHAKE_KEYFRAMES: Keyframe[] = [
  { transform: "translateX(0)" },
  { transform: "translateX(-6px)", offset: 0.2 },
  { transform: "translateX(6px)", offset: 0.4 },
  { transform: "translateX(-6px)", offset: 0.6 },
  { transform: "translateX(6px)", offset: 0.8 },
  { transform: "translateX(0)" },
];
const WHAT_EASE_IN_OUT = "cubic-bezier(0.77, 0, 0.175, 1)";

const CurrentGuessRow = memo(function CurrentGuessRow({
  currentGuess,
  hasError,
  shakeToken,
  isValidationPending,
}: Pick<WhatGameState, "currentGuess" | "hasError" | "shakeToken" | "isValidationPending">) {
  const rowRef = useRef<HTMLDivElement>(null);
  const shakeAnimationRef = useRef<Animation | null>(null);

  useEffect(() => {
    if (shakeToken === 0) return;
    const row = rowRef.current;
    if (!row || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    shakeAnimationRef.current?.cancel();
    shakeAnimationRef.current = row.animate(SHAKE_KEYFRAMES, {
      duration: 400,
      easing: WHAT_EASE_IN_OUT,
    });
  }, [shakeToken]);

  return (
    <div
      ref={rowRef}
      className={cn(styles.row, styles.currentRow, isValidationPending && styles.pending)}
    >
      {Array.from({ length: WHAT_ANSWER_LENGTH }).map((_, cellIndex) => (
        <WhatTile
          key={`current-cell-${cellIndex}`}
          state={currentGuess[cellIndex] ? "typed" : "empty"}
          letter={currentGuess[cellIndex] ?? ""}
          ariaLabel={`Letter ${cellIndex + 1}`}
          hasError={hasError}
        />
      ))}
    </div>
  );
});

export function WhatGuessGrid({ game }: { game: WhatGameState }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2">
      <div className={styles.grid} data-testid="what-tile-grid">
        {Array.from({ length: game.isGameOver ? game.guesses.length : MAX_GUESSES }).map(
          (_, rowIndex) => {
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
                  shakeToken={game.shakeToken}
                  isValidationPending={game.isValidationPending}
                />
              );
            }
            return <EmptyGuessRow key={`empty-${rowIndex}`} />;
          },
        )}
      </div>
      <p
        className={cn(styles.errorMessage, game.errorMessage ? styles.visible : styles.hidden)}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        data-testid="what-status"
        data-error={game.errorCode ?? undefined}
      >
        {game.errorMessage}
      </p>
    </div>
  );
}
