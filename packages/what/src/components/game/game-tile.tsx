import type { CSSProperties } from "react";

import { cn } from "../../lib/cn";

export type GameTileState = "empty" | "typed" | "absent" | "present" | "correct";

type GameTileProps = {
  state: GameTileState;
  letter?: string;
  ariaLabel?: string;
  isRevealing?: boolean;
  hasError?: boolean;
  loading?: boolean;
  style?: CSSProperties;
};

export function GameTile({
  state,
  letter = "",
  ariaLabel,
  isRevealing = false,
  hasError = false,
  loading = false,
  style,
}: GameTileProps) {
  if (loading) {
    return <div className="game-tile game-tile-skeleton" aria-hidden style={style} />;
  }

  return (
    <div
      aria-label={ariaLabel}
      role={ariaLabel ? "img" : undefined}
      data-testid="game-tile"
      className={cn("game-tile", isRevealing && "game-tile-reveal", hasError && "game-tile-error")}
      data-state={state}
      style={style}
    >
      <span className="game-tile-letter">{letter}</span>
    </div>
  );
}
