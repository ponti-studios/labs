import { act, renderHook } from "@testing-library/react";
import { BrowserRouter } from "react-router";
import { beforeEach, describe, expect, test, vi } from "vitest";
import type { TerminalLine } from "../types";
import { useCommandExecution } from "../useCommandExecution";

// Mock react-router's useNavigate hook
const mockNavigate = vi.fn();
vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock DOM methods for cat animation
interface MockElement {
  className: string;
  innerHTML: string;
  style: { cssText: string };
  parentNode: {
    removeChild: (node: MockElement) => void;
  };
}

const mockElement: MockElement = {
  className: "",
  innerHTML: "",
  style: { cssText: "" },
  parentNode: {
    removeChild: vi.fn(),
  },
};

// Wrapper component for React Router context
function RouterWrapper({ children }: { children: React.ReactNode }) {
  return <BrowserRouter>{children}</BrowserRouter>;
}

const renderUseCommandExecution = () =>
  renderHook(() => useCommandExecution(), {
    wrapper: RouterWrapper,
  });

const applySetLinesUpdate = (
  setLinesMock: ReturnType<typeof vi.fn>,
  callIndex: number,
  previousLines: TerminalLine[] = [],
) => {
  const updater = setLinesMock.mock.calls[callIndex]?.[0];
  return typeof updater === "function" ? updater(previousLines) : updater;
};

describe("useCommandExecution Hook", () => {
  let setLines: ReturnType<typeof vi.fn>;
  let setCommandHistory: ReturnType<typeof vi.fn>;
  let commandHistory: string[];
  const originalCreateElement = document.createElement.bind(document);

  beforeEach(() => {
    setLines = vi.fn();
    setCommandHistory = vi.fn();
    commandHistory = [];
    mockNavigate.mockClear();
    vi.clearAllTimers();
    vi.useFakeTimers();
    vi.spyOn(document, "querySelector").mockReturnValue({
      className: "terminal",
    } as Element);
    vi.spyOn(document, "createElement").mockImplementation((tagName: string) => {
      if (tagName === "div" || tagName === "style") {
        return originalCreateElement(tagName);
      }

      return mockElement as unknown as HTMLElement;
    });
    vi.spyOn(document.head, "appendChild").mockImplementation((node) => node);
    vi.spyOn(document.body, "appendChild").mockImplementation((node) => node);
  });

  test("should return executeCommand function", () => {
    const { result } = renderUseCommandExecution();
    expect(typeof result.current.executeCommand).toBe("function");
  });

  test("executeCommand should add command to history", () => {
    const { result } = renderUseCommandExecution();

    act(() => {
      result.current.executeCommand("help", commandHistory, setLines, setCommandHistory);
    });

    expect(setCommandHistory).toHaveBeenCalledWith(expect.any(Function));
  });

  test("executeCommand should handle help command", () => {
    const { result } = renderUseCommandExecution();

    act(() => {
      result.current.executeCommand("help", commandHistory, setLines, setCommandHistory);
    });

    expect(setLines).toHaveBeenCalledWith(expect.any(Function));

    // Get the function passed to setLines and call it with empty array
    const commandLines = applySetLinesUpdate(setLines, 0, []);
    const newLines = applySetLinesUpdate(setLines, 1, commandLines);

    // Should contain command line and help content
    expect(commandLines[0]).toEqual({
      type: "command",
      content: "C:\\CHUCK> help",
    });

    expect(newLines.some((line: TerminalLine) => line.content.includes("AVAILABLE COMMANDS"))).toBe(
      true,
    );
  });

  test("executeCommand should handle cls command", () => {
    const { result } = renderUseCommandExecution();

    act(() => {
      result.current.executeCommand("cls", commandHistory, setLines, setCommandHistory);
    });

    // Should call setLines twice - once to add command, once to clear
    expect(setLines).toHaveBeenCalledTimes(2);

    // Second call should be with empty array (clear)
    const secondCall = setLines.mock.calls[1];
    expect(secondCall[0]).toEqual([]);
  });

  test("executeCommand should handle gradient command and navigate", () => {
    const { result } = renderUseCommandExecution();

    act(() => {
      result.current.executeCommand("gradient", commandHistory, setLines, setCommandHistory);
    });

    const commandLines = applySetLinesUpdate(setLines, 0, []);
    const newLines = applySetLinesUpdate(setLines, 1, commandLines);

    expect(
      newLines.some((line: TerminalLine) =>
        line.content.includes("Launching Gradient Border Laboratory"),
      ),
    ).toBe(true);

    // Fast-forward timers to trigger navigation
    act(() => {
      vi.advanceTimersByTime(1500);
    });

    expect(mockNavigate).toHaveBeenCalledWith("/border-linear-gradient");
  });

  test("executeCommand should handle meow command", () => {
    const { result } = renderUseCommandExecution();

    act(() => {
      result.current.executeCommand("meow", commandHistory, setLines, setCommandHistory);
    });

    const commandLines = applySetLinesUpdate(setLines, 0, []);
    const newLines = applySetLinesUpdate(setLines, 1, commandLines);

    expect(
      newLines.some((line: TerminalLine) => line.content.includes("Summoning cyber cats")),
    ).toBe(true);

    expect(
      newLines.some((line: TerminalLine) => line.content.includes("MEOW! Cats are bouncing")),
    ).toBe(true);

    // Should contain cat ASCII art
    expect(newLines.some((line: TerminalLine) => line.content.includes("/\\_/\\"))).toBe(true);
  });

  test("executeCommand should handle unknown command", () => {
    const { result } = renderUseCommandExecution();

    act(() => {
      result.current.executeCommand("unknown", commandHistory, setLines, setCommandHistory);
    });

    const commandLines = applySetLinesUpdate(setLines, 0, []);
    const newLines = applySetLinesUpdate(setLines, 1, commandLines);

    expect(
      newLines.some((line: TerminalLine) => line.content.includes("Bad command or file name")),
    ).toBe(true);
  });

  test("should not add duplicate commands to history", () => {
    const { result } = renderUseCommandExecution();
    const existingHistory = ["help"];

    act(() => {
      result.current.executeCommand("help", existingHistory, setLines, setCommandHistory);
    });

    // Should not call setCommandHistory since "help" is already in history
    expect(setCommandHistory).not.toHaveBeenCalled();
  });
});
