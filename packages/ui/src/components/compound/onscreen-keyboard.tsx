"use client";

import { cn } from "../../lib/utils";

export type LetterState = "absent" | "correct" | "present";

export interface OnscreenKeyboardProps {
  /** Maps each uppercase letter to its current state. */
  letterStates?: Record<string, LetterState>;
  /** Called when a letter key is pressed. Receives the uppercase letter. */
  onLetter: (letter: string) => void;
  /** Called when the Enter key is pressed. */
  onEnter: () => void;
  /** Called when the Backspace key is pressed. */
  onBackspace: () => void;
  /** Disables all keys. */
  disabled?: boolean;
  className?: string;
}

const ROWS = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"] as const;

const STATE_KEY_CLASSES: Record<LetterState, string> = {
  absent: "border-border bg-muted text-muted-foreground",
  present: "border-amber-300 bg-amber-100 text-amber-950",
  correct: "border-emerald-300 bg-emerald-100 text-emerald-950",
};

const INACTIVE_KEY =
  "border-border bg-background text-foreground hover:bg-muted";

const KEY_BASE =
  "flex h-10 w-8 items-center justify-center rounded border text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50";

const ACTION_KEY =
  "flex h-10 items-center justify-center rounded border border-border bg-muted px-2 text-xs font-medium text-foreground transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50";

export function OnscreenKeyboard({
  letterStates = {},
  onLetter,
  onEnter,
  onBackspace,
  disabled = false,
  className,
}: OnscreenKeyboardProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      {ROWS.map((row, i) => (
        <div key={row} className="flex justify-center gap-1">
          {i === 2 && (
            <button className={ACTION_KEY} disabled={disabled} onClick={onEnter} type="button">
              Enter
            </button>
          )}
          {row.split("").map((letter) => (
            <button
              key={letter}
              className={cn(
                KEY_BASE,
                letterStates[letter] ? STATE_KEY_CLASSES[letterStates[letter]] : INACTIVE_KEY,
              )}
              disabled={disabled}
              onClick={() => onLetter(letter)}
              type="button"
            >
              {letter}
            </button>
          ))}
          {i === 2 && (
            <button className={ACTION_KEY} disabled={disabled} onClick={onBackspace} type="button">
              ⌫
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
