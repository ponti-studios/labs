import { memo } from "react";
// import { ASCII_LOGO } from "./constants";

export const TerminalHeader = memo(() => (
  <div className="border-b border-stone-700/30 bg-stone-800/50 p-4">
    <div className="mb-3 flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <div className="flex space-x-1.5">
          <div className="h-3 w-3 rounded-full bg-red-400/70" />
          <div className="h-3 w-3 rounded-full bg-yellow-400/70" />
          <div className="h-3 w-3 rounded-full bg-green-400/70" />
        </div>
        <span className="ml-3 text-sm font-medium text-stone-400">Terminal</span>
      </div>
      <div className="font-mono text-xs text-stone-500">{new Date().toLocaleTimeString()}</div>
    </div>
    {/* <pre className="text-olive-300 text-xs font-mono leading-tight whitespace-pre-wrap overflow-hidden">
			{ASCII_LOGO}
		</pre> */}
  </div>
));

TerminalHeader.displayName = "TerminalHeader";
