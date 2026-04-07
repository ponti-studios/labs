import { act, renderHook } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import type { TerminalLine } from '../types';
import { useCommandExecution } from '../useCommandExecution';

// Mock react-router's useNavigate hook
const mockNavigate = vi.fn();
vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
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
  className: '',
  innerHTML: '',
  style: { cssText: '' },
  parentNode: {
    removeChild: vi.fn(),
  },
};

Object.defineProperty(global, 'document', {
  value: {
    querySelector: vi.fn(() => ({
      className: 'terminal',
    })),
    createElement: vi.fn(() => mockElement),
    head: {
      appendChild: vi.fn(),
    },
    body: {
      appendChild: vi.fn(),
    },
  },
  writable: true,
});

// Wrapper component for React Router context
function RouterWrapper({ children }: { children: React.ReactNode }) {
  return <BrowserRouter>{children}</BrowserRouter>;
}

describe('useCommandExecution Hook', () => {
  let setLines: ReturnType<typeof vi.fn>;
  let setCommandHistory: ReturnType<typeof vi.fn>;
  let commandHistory: string[];

  beforeEach(() => {
    setLines = vi.fn();
    setCommandHistory = vi.fn();
    commandHistory = [];
    mockNavigate.mockClear();
    vi.clearAllTimers();
    vi.useFakeTimers();
  });

  test('should return executeCommand function', () => {
    const { result } = renderHook(() => useCommandExecution());
    expect(typeof result.current.executeCommand).toBe('function');
  });

  test('executeCommand should add command to history', () => {
    const { result } = renderHook(() => useCommandExecution());

    act(() => {
      result.current.executeCommand('help', commandHistory, setLines, setCommandHistory);
    });

    expect(setCommandHistory).toHaveBeenCalledWith(expect.any(Function));
  });

  test('executeCommand should handle help command', () => {
    const { result } = renderHook(() => useCommandExecution());

    act(() => {
      result.current.executeCommand('help', commandHistory, setLines, setCommandHistory);
    });

    expect(setLines).toHaveBeenCalledWith(expect.any(Function));

    // Get the function passed to setLines and call it with empty array
    const setLinesCall = setLines.mock.calls[0][0];
    const newLines = setLinesCall([]);

    // Should contain command line and help content
    expect(newLines[0]).toEqual({
      type: 'command',
      content: 'C:\\CHUCK> help',
    });

    expect(newLines.some((line: TerminalLine) => line.content.includes('AVAILABLE COMMANDS'))).toBe(
      true
    );
  });

  test('executeCommand should handle cls command', () => {
    const { result } = renderHook(() => useCommandExecution());

    act(() => {
      result.current.executeCommand('cls', commandHistory, setLines, setCommandHistory);
    });

    // Should call setLines twice - once to add command, once to clear
    expect(setLines).toHaveBeenCalledTimes(2);

    // Second call should be with empty array (clear)
    const secondCall = setLines.mock.calls[1];
    expect(secondCall[0]).toEqual([]);
  });

  test('executeCommand should handle gradient command and navigate', () => {
    const { result } = renderHook(() => useCommandExecution());

    act(() => {
      result.current.executeCommand('gradient', commandHistory, setLines, setCommandHistory);
    });

    const setLinesCall = setLines.mock.calls[0][0];
    const newLines = setLinesCall([]);

    expect(
      newLines.some((line: TerminalLine) =>
        line.content.includes('Launching Gradient Border Laboratory')
      )
    ).toBe(true);

    // Fast-forward timers to trigger navigation
    act(() => {
      vi.advanceTimersByTime(1500);
    });

    expect(mockNavigate).toHaveBeenCalledWith('/border-linear-gradient');
  });

  test('executeCommand should handle meow command', () => {
    const { result } = renderHook(() => useCommandExecution());

    act(() => {
      result.current.executeCommand('meow', commandHistory, setLines, setCommandHistory);
    });

    const setLinesCall = setLines.mock.calls[0][0];
    const newLines = setLinesCall([]);

    expect(
      newLines.some((line: TerminalLine) => line.content.includes('Summoning cyber cats'))
    ).toBe(true);

    expect(
      newLines.some((line: TerminalLine) => line.content.includes('MEOW! Cats are bouncing'))
    ).toBe(true);

    // Should contain cat ASCII art
    expect(newLines.some((line: TerminalLine) => line.content.includes('/\\_/\\'))).toBe(true);
  });

  test('executeCommand should handle unknown command', () => {
    const { result } = renderHook(() => useCommandExecution());

    act(() => {
      result.current.executeCommand('unknown', commandHistory, setLines, setCommandHistory);
    });

    const setLinesCall = setLines.mock.calls[0][0];
    const newLines = setLinesCall([]);

    expect(
      newLines.some((line: TerminalLine) => line.content.includes('Bad command or file name'))
    ).toBe(true);
  });

  test('should not add duplicate commands to history', () => {
    const { result } = renderHook(() => useCommandExecution());
    const existingHistory = ['help'];

    act(() => {
      result.current.executeCommand('help', existingHistory, setLines, setCommandHistory);
    });

    // Should not call setCommandHistory since "help" is already in history
    expect(setCommandHistory).not.toHaveBeenCalled();
  });
});
