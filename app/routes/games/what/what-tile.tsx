import { type CSSProperties } from "react";

import { cn } from "~/lib/utils";

export type WhatTileState = "empty" | "typed" | "absent" | "present" | "correct";

type WhatTileProps = {
  state: WhatTileState;
  letter?: string;
  ariaLabel?: string;
  isRevealing?: boolean;
  hasError?: boolean;
  loading?: boolean;
  style?: CSSProperties;
};

export function WhatTile({
  state,
  letter = "",
  ariaLabel,
  isRevealing = false,
  hasError = false,
  loading = false,
  style,
}: WhatTileProps) {
  if (loading) {
    return <div className="what-tile what-tile-skeleton" aria-hidden style={style} />;
  }

  return (
    <div
      aria-label={ariaLabel}
      role={ariaLabel ? "img" : undefined}
      data-testid="what-tile"
      className={cn("what-tile", isRevealing && "what-tile-reveal", hasError && "what-tile-error")}
      data-state={state}
      style={style}
    >
      <span className="what-tile-letter">{letter}</span>
    </div>
  );
}
