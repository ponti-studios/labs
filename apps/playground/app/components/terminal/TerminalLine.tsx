import { memo } from "react";
import type { TerminalLine as TerminalLineType } from "./types";

interface TerminalLineProps {
	line: TerminalLineType;
	index: number;
}

const getLineStyles = (type: TerminalLineType["type"]) => {
	switch (type) {
		case "command":
			return "text-olive-200 font-medium";
		case "error":
			return "text-red-300";
		case "system":
			return "text-amber-300/90 font-light";
		default:
			return "text-stone-300";
	}
};

export const TerminalLine = memo(({ line }: TerminalLineProps) => (
	<div
		className={`font-mono text-sm leading-relaxed ${getLineStyles(line.type)}`}
	>
		<pre className="whitespace-pre-wrap font-inherit">{line.content}</pre>
	</div>
));

TerminalLine.displayName = "TerminalLine";
