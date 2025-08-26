export interface TerminalLine {
	type: "command" | "output" | "error" | "system";
	content: string;
	timestamp?: string;
	id?: string;
}

export interface TerminalState {
	lines: TerminalLine[];
	currentCommand: string;
	commandHistory: string[];
	historyIndex: number;
	isBooting: boolean;
	bootIndex: number;
}
