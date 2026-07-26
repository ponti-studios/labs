import { type CSSProperties } from "react";

import { cn } from "~/lib/utils";

export type RealiTeaTileState = "empty" | "typed" | "absent" | "present" | "correct";

type RealiTeaTileProps = {
  state: RealiTeaTileState;
  letter?: string;
  ariaLabel?: string;
  isRevealing?: boolean;
  hasError?: boolean;
  loading?: boolean;
  style?: CSSProperties;
};

export function RealiTeaTile({
  state,
  letter = "",
  ariaLabel,
  isRevealing = false,
  hasError = false,
  loading = false,
  style,
}: RealiTeaTileProps) {
  if (loading) {
    return <div className="realitea-tile realitea-tile-skeleton" aria-hidden style={style} />;
  }

  return (
    <div
      aria-label={ariaLabel}
      className={cn(
        "realitea-tile",
        isRevealing && "realitea-tile-reveal",
        hasError && "realitea-tile-error",
      )}
      data-state={state}
      style={style}
    >
      <span className="realitea-tile-letter">{letter}</span>
    </div>
  );
}
