import type { CSSProperties } from "react";

import { cn } from "../../lib/cn";

export type GameTileState = "empty" | "typed" | "absent" | "present" | "correct";

type GameTileProps = {
  state: GameTileState;
  letter?: string;
  ariaLabel?: string;
  isRevealing?: boolean;
  isIncorrectGuess?: boolean;
  hasError?: boolean;
  loading?: boolean;
  isPending?: boolean;
  isSolved?: boolean;
  tileIndex?: number;
  style?: CSSProperties;
};

export function GameTile({
  state,
  letter = "",
  ariaLabel,
  isRevealing = false,
  isIncorrectGuess = false,
  hasError = false,
  loading = false,
  isPending = false,
  isSolved = false,
  tileIndex = 0,
  style,
}: GameTileProps) {
  if (loading) {
    return <div className="game-tile game-tile-skeleton" aria-hidden style={style} />;
  }

  const hasStagger = isPending || isSolved;

  return (
    <div
      aria-label={ariaLabel}
      role={ariaLabel ? "img" : undefined}
      data-testid="game-tile"
      className={cn(
        "game-tile",
        isRevealing && (isIncorrectGuess ? "game-tile-reveal-incorrect" : "game-tile-reveal"),
        hasError && "game-tile-error",
        isPending && "game-tile-pending",
        isSolved && "game-tile-solved",
      )}
      data-state={state}
      style={hasStagger ? ({ ...style, "--game-tile-i": tileIndex } as CSSProperties) : style}
    >
      <span className="game-tile-letter">{letter}</span>
    </div>
  );
}
