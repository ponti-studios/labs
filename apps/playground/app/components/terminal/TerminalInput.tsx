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
				<span className="text-olive-300 font-medium mr-2">$ </span>
				<div className="flex-1 relative">
					<span className="text-olive-100">{currentCommand}</span>
					<span className="animate-pulse text-olive-300 ml-0.5">▊</span>
					<input
						ref={ref}
						type="text"
						value={currentCommand}
						onChange={(e) => onCommandChange(e.target.value)}
						onKeyDown={onKeyDown}
						className="absolute inset-0 w-full bg-transparent text-transparent border-none outline-none caret-transparent"
						autoComplete="off"
						spellCheck="false"
					/>
				</div>
			</div>
		),
	),
);

TerminalInput.displayName = "TerminalInput";
