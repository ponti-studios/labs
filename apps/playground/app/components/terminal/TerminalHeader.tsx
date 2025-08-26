import { memo } from "react";
// import { ASCII_LOGO } from "./constants";

export const TerminalHeader = memo(() => (
	<div className="p-4 border-b border-stone-700/30 bg-stone-800/50">
		<div className="flex items-center justify-between mb-3">
			<div className="flex items-center space-x-2">
				<div className="flex space-x-1.5">
					<div className="w-3 h-3 rounded-full bg-red-400/70" />
					<div className="w-3 h-3 rounded-full bg-yellow-400/70" />
					<div className="w-3 h-3 rounded-full bg-green-400/70" />
				</div>
				<span className="text-stone-400 text-sm font-medium ml-3">
					Terminal
				</span>
			</div>
			<div className="text-xs text-stone-500 font-mono">
				{new Date().toLocaleTimeString()}
			</div>
		</div>
		{/* <pre className="text-olive-300 text-xs font-mono leading-tight whitespace-pre-wrap overflow-hidden">
			{ASCII_LOGO}
		</pre> */}
	</div>
));

TerminalHeader.displayName = "TerminalHeader";
