import { act, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { BOOT_SEQUENCE, NAVIGATION_DELAY } from "../constants";
import { Terminal } from "../Terminal";

const mockNavigate = vi.fn();
vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

function renderTerminal() {
  return render(
    <MemoryRouter>
      <Terminal />
    </MemoryRouter>,
  );
}

async function bootTerminal() {
  for (let i = 0; i <= BOOT_SEQUENCE.length; i += 1) {
    act(() => {
      vi.runOnlyPendingTimers();
    });
  }

  return screen.getByRole("textbox");
}

function submitCommand(input: HTMLInputElement, command: string) {
  fireEvent.change(input, { target: { value: command } });
  fireEvent.keyDown(input, { key: "Enter", code: "Enter", charCode: 13 });
}

describe("Terminal", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockNavigate.mockClear();
    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
      cb(0);
      return 0;
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  test("runs a help command through the real terminal input", async () => {
    renderTerminal();

    const input = (await bootTerminal()) as HTMLInputElement;
    submitCommand(input, "help");

    expect(screen.getByText("C:\\CHUCK> help")).toBeInTheDocument();
    expect(screen.getByText("║ AVAILABLE COMMANDS ║")).toBeInTheDocument();
  });

  test("navigates after the gradient command", async () => {
    renderTerminal();

    const input = (await bootTerminal()) as HTMLInputElement;
    submitCommand(input, "gradient");

    expect(screen.getByText("Launching Gradient Border Laboratory...")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(NAVIGATION_DELAY);
    });

    expect(mockNavigate).toHaveBeenCalledWith("/border-linear-gradient");
  });

  test("renders the error output for an unknown command", async () => {
    renderTerminal();

    const input = (await bootTerminal()) as HTMLInputElement;
    submitCommand(input, "bogus");

    expect(screen.getByText("Bad command or file name: bogus")).toBeInTheDocument();
    expect(screen.getByText("Access denied. Unauthorized command.")).toBeInTheDocument();
  });

  test("recalls command history with arrow up", async () => {
    renderTerminal();

    const input = (await bootTerminal()) as HTMLInputElement;
    submitCommand(input, "help");
    fireEvent.keyDown(input, { key: "ArrowUp", code: "ArrowUp" });

    expect(input.value).toBe("help");
  });
});
