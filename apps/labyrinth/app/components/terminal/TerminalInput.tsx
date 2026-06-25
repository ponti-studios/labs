import type React from "react";
import { forwardRef, memo } from "react";

interface TerminalInputProps {
  currentCommand: string;
  onCommandChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}

export const TerminalInput = memo(
  forwardRef<HTMLInputElement, TerminalInputProps>(
    ({ currentCommand, onCommandChange, onKeyDown }, ref) => (
      <div className="flex items-center font-mono text-sm text-olive-200">
        <span className="mr-2 font-medium text-olive-300">$ </span>
        <div className="relative flex-1">
          <span className="text-olive-100">{currentCommand}</span>
          <span className="ml-0.5 animate-pulse text-olive-300">▊</span>
          <input
            ref={ref}
            type="text"
            value={currentCommand}
            onChange={(e) => onCommandChange(e.target.value)}
            onKeyDown={onKeyDown}
            className="absolute inset-0 w-full border-none bg-transparent text-transparent caret-transparent outline-none"
            autoComplete="off"
            spellCheck="false"
          />
        </div>
      </div>
    ),
  ),
);

TerminalInput.displayName = "TerminalInput";
