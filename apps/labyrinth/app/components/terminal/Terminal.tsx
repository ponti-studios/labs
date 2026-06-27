import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { TerminalHeader } from "./TerminalHeader";
import { TerminalInput } from "./TerminalInput";
import { TerminalLine as TerminalLineComponent } from "./TerminalLine";
import { BOOT_SEQUENCE } from "./constants";
import type { TerminalLine } from "./types";
import { useCommandExecution } from "./useCommandExecution";

export function Terminal() {
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [currentCommand, setCurrentCommand] = useState("");
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isBooting, setIsBooting] = useState(true);
  const [bootIndex, setBootIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const { executeCommand } = useCommandExecution();

  // Boot sequence effect
  useEffect(() => {
    if (isBooting && bootIndex < BOOT_SEQUENCE.length) {
      const timer = setTimeout(
        () => {
          setLines((prev) => [
            ...prev,
            {
              type: "system",
              content: BOOT_SEQUENCE[bootIndex],
              id: `boot-${bootIndex}`,
            },
          ]);
          setBootIndex(bootIndex + 1);
        },
        bootIndex === 0 ? 1000 : 200,
      ); // Slower start, then faster

      return () => clearTimeout(timer);
    }

    if (bootIndex >= BOOT_SEQUENCE.length) {
      setIsBooting(false);
    }
  }, [isBooting, bootIndex]);

  // Auto-scroll to bottom
  const linesLengthRef = useRef(lines.length);
  useEffect(() => {
    if (linesLengthRef.current !== lines.length) {
      linesLengthRef.current = lines.length;
      // Use requestAnimationFrame to ensure DOM has updated
      requestAnimationFrame(() => {
        if (terminalRef.current) {
          terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
      });
    }
  }, [lines.length]);

  // Focus input on mount and click
  useEffect(() => {
    if (!isBooting && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isBooting]);

  const handleCommandExecution = useCallback(
    (cmd: string) => {
      executeCommand(cmd, commandHistory, setLines, setCommandHistory);
    },
    [executeCommand, commandHistory],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        handleCommandExecution(currentCommand);
        setCurrentCommand("");
        setHistoryIndex(-1);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (commandHistory.length > 0) {
          const newIndex =
            historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
          setHistoryIndex(newIndex);
          setCurrentCommand(commandHistory[newIndex]);
        }
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        if (historyIndex !== -1) {
          const newIndex = historyIndex + 1;
          if (newIndex >= commandHistory.length) {
            setHistoryIndex(-1);
            setCurrentCommand("");
          } else {
            setHistoryIndex(newIndex);
            setCurrentCommand(commandHistory[newIndex]);
          }
        }
      }
    },
    [handleCommandExecution, currentCommand, commandHistory, historyIndex],
  );

  const handleTerminalClick = useCallback(() => {
    if (inputRef.current && !isBooting) {
      inputRef.current.focus();
    }
  }, [isBooting]);

  const handleCommandChange = useCallback((value: string) => {
    setCurrentCommand(value);
  }, []);

  return (
    <div
      className="relative flex h-full w-full cursor-text flex-col overflow-hidden rounded-2xl bg-stone-900/95 font-mono text-sm backdrop-blur-sm"
      onClick={handleTerminalClick}
      onKeyDown={handleTerminalClick}
    >
      {/* Terminal glow effect */}
      <TerminalHeader />

      <div
        className="flex-1 scrollbar-thin scrollbar-thumb-stone-600 scrollbar-track-transparent space-y-1 overflow-y-auto p-4 pt-0 text-olive-100"
        ref={terminalRef}
      >
        {lines.map((line, index) => (
          <TerminalLineComponent key={line.id || `line-${index}`} line={line} index={index} />
        ))}

        {!isBooting && (
          <TerminalInput
            ref={inputRef}
            currentCommand={currentCommand}
            onCommandChange={handleCommandChange}
            onKeyDown={handleKeyDown}
          />
        )}
      </div>
    </div>
  );
}
