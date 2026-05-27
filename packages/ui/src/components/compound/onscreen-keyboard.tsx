"use client";

import { cva } from "class-variance-authority";

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

const keyboardKeyVariants = cva(
  cn(
    "flex items-center justify-center rounded border font-medium transition-colors",
    "disabled:cursor-not-allowed disabled:opacity-50 min-w-10",
  ),
  {
    variants: {
      kind: {
        letter: "h-10 text-sm",
        action: "h-10 px-2 text-xs",
      },
      state: {
        inactive: "border-border bg-background text-foreground hover:bg-muted",
        absent: "border-border bg-muted text-muted-foreground",
        present: "border-amber-300 bg-amber-100 text-amber-950",
        correct: "border-emerald-300 bg-emerald-100 text-emerald-950",
        action: "border-border bg-muted text-foreground hover:bg-secondary",
      },
    },
    defaultVariants: {
      kind: "letter",
      state: "inactive",
    },
  },
);

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
            <button
              className={cn(keyboardKeyVariants({ kind: "action", state: "action" }))}
              disabled={disabled}
              onClick={onEnter}
              type="button"
            >
              Enter
            </button>
          )}
          {row.split("").map((letter) => (
            <button
              key={letter}
              className={cn(
                keyboardKeyVariants({ kind: "letter", state: letterStates[letter] ?? "inactive" }),
              )}
              disabled={disabled}
              onClick={() => onLetter(letter)}
              type="button"
            >
              {letter}
            </button>
          ))}
          {i === 2 && (
            <button
              className={cn(keyboardKeyVariants({ kind: "action", state: "action" }))}
              disabled={disabled}
              onClick={onBackspace}
              type="button"
            >
              ⌫
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
