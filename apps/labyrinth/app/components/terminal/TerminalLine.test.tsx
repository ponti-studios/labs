import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { TerminalLine } from "./TerminalLine";
import type { TerminalLine as TerminalLineType } from "./types";

describe("TerminalLine Component", () => {
  test("renders command line correctly", () => {
    const line: TerminalLineType = {
      type: "command",
      content: "C:\\CHUCK> help",
    };

    render(<TerminalLine line={line} index={0} />);

    expect(screen.getByText("C:\\CHUCK> help")).toBeInTheDocument();
  });

  test("renders output line correctly", () => {
    const line: TerminalLineType = {
      type: "output",
      content: "Welcome to Chuck's terminal!",
    };

    render(<TerminalLine line={line} index={1} />);

    expect(screen.getByText("Welcome to Chuck's terminal!")).toBeInTheDocument();
  });

  test("renders error line correctly", () => {
    const line: TerminalLineType = {
      type: "error",
      content: "Bad command or file name",
    };

    render(<TerminalLine line={line} index={2} />);

    expect(screen.getByText("Bad command or file name")).toBeInTheDocument();
  });

  test("renders system line correctly", () => {
    const line: TerminalLineType = {
      type: "system",
      content: "System booting...",
    };

    render(<TerminalLine line={line} index={3} />);

    expect(screen.getByText("System booting...")).toBeInTheDocument();
  });

  test("applies correct CSS class for command type", () => {
    const line: TerminalLineType = {
      type: "command",
      content: "test command",
    };

    const { container } = render(<TerminalLine line={line} index={0} />);
    const element = container.firstChild as HTMLElement;

    expect(element).toHaveClass(
      "font-mono",
      "text-sm",
      "leading-relaxed",
      "text-olive-200",
      "font-medium",
    );
  });

  test("applies correct CSS class for error type", () => {
    const line: TerminalLineType = {
      type: "error",
      content: "test error",
    };

    const { container } = render(<TerminalLine line={line} index={0} />);
    const element = container.firstChild as HTMLElement;

    expect(element).toHaveClass("font-mono", "text-sm", "leading-relaxed", "text-red-300");
  });

  test("applies correct CSS class for system type", () => {
    const line: TerminalLineType = {
      type: "system",
      content: "test system",
    };

    const { container } = render(<TerminalLine line={line} index={0} />);
    const element = container.firstChild as HTMLElement;

    expect(element).toHaveClass(
      "font-mono",
      "text-sm",
      "leading-relaxed",
      "text-amber-300/90",
      "font-light",
    );
  });

  test("applies correct CSS class for output type", () => {
    const line: TerminalLineType = {
      type: "output",
      content: "test output",
    };

    const { container } = render(<TerminalLine line={line} index={0} />);
    const element = container.firstChild as HTMLElement;

    expect(element).toHaveClass("font-mono", "text-sm", "leading-relaxed", "text-stone-300");
  });

  test("handles empty content", () => {
    const line: TerminalLineType = {
      type: "output",
      content: "",
    };

    const { container } = render(<TerminalLine line={line} index={0} />);

    expect(container.firstChild).toBeInTheDocument();
    expect(container.firstChild).toHaveTextContent("");
  });

  test("preserves whitespace in content", () => {
    const line: TerminalLineType = {
      type: "output",
      content: "  spaced   content  ",
    };

    const { container } = render(<TerminalLine line={line} index={0} />);
    const pre = container.querySelector("pre");

    expect(pre).toBeInTheDocument();
    expect(pre?.textContent).toBe("  spaced   content  ");
  });

  test("handles multiline content", () => {
    const line: TerminalLineType = {
      type: "output",
      content: "Line 1\nLine 2\nLine 3",
    };

    render(<TerminalLine line={line} index={0} />);

    // Should render the multiline content
    expect(screen.getByText(/Line 1.*Line 2.*Line 3/s)).toBeInTheDocument();
  });

  test("handles ASCII art content", () => {
    const line: TerminalLineType = {
      type: "system",
      content: "     /\\_/\\  ",
    };

    render(<TerminalLine line={line} index={0} />);

    expect(screen.getByText(/\/\\_\/\\/)).toBeInTheDocument();
  });

  test("handles Unicode characters", () => {
    const line: TerminalLineType = {
      type: "output",
      content: "🐱 MEOW! Cats are bouncing ║═╣╠╚╝",
    };

    render(<TerminalLine line={line} index={0} />);

    expect(screen.getByText(/🐱 MEOW! Cats are bouncing ║═╣╠╚╝/)).toBeInTheDocument();
  });

  test("component is memoized properly", () => {
    const line: TerminalLineType = {
      type: "output",
      content: "test content",
    };

    const { rerender } = render(<TerminalLine line={line} index={0} />);

    // Re-render with same props should not cause issues
    rerender(<TerminalLine line={line} index={0} />);

    expect(screen.getByText("test content")).toBeInTheDocument();
  });
});
