import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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
    await act(async () => {
      vi.runOnlyPendingTimers();
    });
  }

  return screen.getByRole("textbox");
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
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderTerminal();

    const input = await bootTerminal();
    await user.type(input, "help{enter}");

    expect(screen.getByText("C:\\CHUCK> help")).toBeInTheDocument();
    expect(screen.getByText("║ AVAILABLE COMMANDS ║")).toBeInTheDocument();
  });

  test("navigates after the gradient command", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderTerminal();

    const input = await bootTerminal();
    await user.type(input, "gradient{enter}");

    expect(screen.getByText("Launching Gradient Border Laboratory...")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(NAVIGATION_DELAY);
    });

    expect(mockNavigate).toHaveBeenCalledWith("/border-linear-gradient");
  });

  test("renders the error output for an unknown command", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderTerminal();

    const input = await bootTerminal();
    await user.type(input, "bogus{enter}");

    expect(screen.getByText("Bad command or file name: bogus")).toBeInTheDocument();
    expect(screen.getByText("Access denied. Unauthorized command.")).toBeInTheDocument();
  });

  test("recalls command history with arrow up", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderTerminal();

    const input = (await bootTerminal()) as HTMLInputElement;
    await user.type(input, "help{enter}");
    await user.type(input, "{arrowup}");

    expect(input.value).toBe("help");
  });
});
