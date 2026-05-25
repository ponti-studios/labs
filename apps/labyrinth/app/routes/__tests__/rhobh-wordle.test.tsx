import { act, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getPuzzleForDate, getPuzzleKeyForDate, normalizeGuess } from "../../lib/rhobh-wordle";
import RhobhWordleRoute from "../games/rhobh-wordle";

function renderRoute() {
  return render(
    <MemoryRouter>
      <RhobhWordleRoute />
    </MemoryRouter>,
  );
}

function submitGuess(guess: string) {
  for (const letter of normalizeGuess(guess)) {
    fireEvent.click(screen.getByRole("button", { name: letter }));
  }

  fireEvent.click(screen.getByRole("button", { name: "Enter" }));
}

function createMemoryStorage(): Storage {
  const store = new Map<string, string>();

  return {
    get length() {
      return store.size;
    },
    clear() {
      store.clear();
    },
    getItem(key) {
      return store.get(key) ?? null;
    },
    key(index) {
      return Array.from(store.keys())[index] ?? null;
    },
    removeItem(key) {
      store.delete(key);
    },
    setItem(key, value) {
      store.set(key, value);
    },
  };
}

describe("RhobhWordleRoute", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-20T12:00:00.000Z"));
    const localStorage = createMemoryStorage();
    vi.stubGlobal("localStorage", localStorage);
    Object.defineProperty(window, "localStorage", {
      value: localStorage,
      configurable: true,
    });
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
    window.localStorage.clear();
    vi.unstubAllGlobals();
  });

  it("restores saved progress for the same puzzle key after reload", () => {
    const date = new Date("2026-05-20T12:00:00.000Z");
    const puzzle = getPuzzleForDate(date);
    const puzzleKey = getPuzzleKeyForDate(date);
    const storageKey = `labyrinth:rhobh-wordle:${puzzleKey}`;
    const { unmount } = renderRoute();

    submitGuess(puzzle.answer);

    expect(screen.getByText("Today's answer")).toBeInTheDocument();
    expect(screen.getByText(puzzle.answer)).toBeInTheDocument();
    expect(screen.getByText(puzzle.detail)).toBeInTheDocument();

    unmount();
    renderRoute();

    expect(screen.getByText("Today's answer")).toBeInTheDocument();
    expect(screen.getByText(puzzle.answer)).toBeInTheDocument();
    expect(screen.getByText(puzzle.detail)).toBeInTheDocument();
    expect(JSON.parse(window.localStorage.getItem(storageKey) ?? "{}")).toMatchObject({
      puzzleKey,
      guesses: [puzzle.answer],
      status: "solved",
    });
  });

  it("clears current puzzle progress when reset is pressed", () => {
    const date = new Date("2026-05-20T12:00:00.000Z");
    const puzzleKey = getPuzzleKeyForDate(date);
    const storageKey = `labyrinth:rhobh-wordle:${puzzleKey}`;

    renderRoute();

    submitGuess("Kathy");
    expect(JSON.parse(window.localStorage.getItem(storageKey) ?? "{}")).toMatchObject({
      guesses: ["KATHY"],
      status: "playing",
    });

    fireEvent.click(screen.getByRole("button", { name: "Reset" }));

    expect(JSON.parse(window.localStorage.getItem(storageKey) ?? "{}")).toMatchObject({
      guesses: [],
      status: "playing",
    });
    expect(screen.queryByText("Today's answer")).not.toBeInTheDocument();
    expect(screen.queryByDisplayValue("E")).not.toBeInTheDocument();
  });

  it("rotates to a fresh puzzle when the utc day changes", () => {
    const firstDate = new Date("2026-05-20T12:00:00.000Z");
    const secondDate = new Date("2026-05-21T12:00:00.000Z");
    const firstPuzzle = getPuzzleForDate(firstDate);
    const secondPuzzle = getPuzzleForDate(secondDate);

    renderRoute();
    submitGuess(firstPuzzle.answer);
    expect(screen.getByText(firstPuzzle.answer)).toBeInTheDocument();

    act(() => {
      vi.setSystemTime(secondDate);
      vi.advanceTimersByTime(60_000);
    });

    expect(screen.queryByText(firstPuzzle.answer)).not.toBeInTheDocument();
    expect(screen.getAllByRole("textbox")).toHaveLength(secondPuzzle.answer.length);
  });

  it("ignores stale saved state for a different puzzle key", () => {
    const staleDate = new Date("2026-05-19T12:00:00.000Z");
    const stalePuzzle = getPuzzleForDate(staleDate);
    const stalePuzzleKey = getPuzzleKeyForDate(staleDate);

    window.localStorage.setItem(
      `labyrinth:rhobh-wordle:${stalePuzzleKey}`,
      JSON.stringify({
        puzzleKey: stalePuzzleKey,
        guesses: [stalePuzzle.answer],
        message: `Correct. ${stalePuzzle.answer} was today's Beverly Hills answer.`,
        status: "solved",
      }),
    );

    renderRoute();

    expect(screen.getAllByRole("textbox")).toHaveLength(getPuzzleForDate(new Date()).answer.length);
    expect(screen.queryByText(stalePuzzle.answer)).not.toBeInTheDocument();
  });

  it("accepts any correctly sized guess and records it on the board", () => {
    renderRoute();

    submitGuess("zzzzz");

    expect(screen.getAllByText("Z").length).toBeGreaterThanOrEqual(5);
  });
});
