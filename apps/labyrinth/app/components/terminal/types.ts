export interface TerminalLine {
  type: "command" | "output" | "error" | "system";
  content: string;
  timestamp?: string;
  id?: string;
}
