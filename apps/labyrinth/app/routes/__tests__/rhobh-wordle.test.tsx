import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRoutesStub } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  getPuzzleForDate,
  getPuzzleKeyForDate,
  MAX_GUESSES,
  normalizeGuess,
  RHOBH_PUZZLES,
} from "../../lib/rhobh-wordle";
import RhobhWordleRoute from "../games/rhobh-wordle";
import { createControlledRouteAction } from "./controlled-route-action";

const validationControl = createControlledRouteAction<string, { valid: boolean }>({
  async parseRequest(request) {
    const { word } = (await request.json()) as { word: string };
    return word;
  },
});

const RoutesStub = createRoutesStub([
  {
    id: "routes/games/rhobh-wordle",
    path: "/",
    Component: RhobhWordleRoute,
  },
  {
    id: "routes/api.words.validate",
    path: "/api/words/validate",
    action: validationControl.action,
  },
]);

function renderRoute() {
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

  return {
    user,
    ...render(<RoutesStub initialEntries={["/"]} />),
  };
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

async function clickLetter(user: ReturnType<typeof userEvent.setup>, letter: string) {
  await user.click(screen.getByRole("button", { name: letter }));
}

async function enterGuess(user: ReturnType<typeof userEvent.setup>, guess: string) {
  for (const letter of normalizeGuess(guess)) {
    await clickLetter(user, letter);
  }
}

async function submitCurrentGuess(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: "Enter" }));
}

async function resolveValidation(valid: boolean) {
  await act(async () => {
    validationControl.resolveNext({ valid });
  });
}

async function expectSubmitCalls(words: string[]) {
  await waitFor(() => {
    expect(validationControl.getRequests()).toEqual(words);
  });
}

function getTextboxes() {
  return screen.queryAllByRole("textbox") as HTMLInputElement[];
}

function getTextboxValues() {
  return getTextboxes().map((input) => input.value);
}

function getCurrentPuzzle() {
  return getPuzzleForDate(new Date("2026-05-20T12:00:00.000Z"));
}

function getAlternateValidGuess(answer: string) {
  const match = RHOBH_PUZZLES.find(
    (puzzle) => puzzle.answer.length === answer.length && puzzle.answer !== answer,
  );

  if (!match) {
    throw new Error(`No alternate RHOBH answer found for ${answer.length}-letter puzzle`);
  }

  return match.answer;
}

function seedSolvedGame(puzzle = getCurrentPuzzle()) {
  const puzzleKey = getPuzzleKeyForDate(new Date("2026-05-20T12:00:00.000Z"));
  window.localStorage.setItem(
    `labyrinth:rhobh-wordle:${puzzleKey}`,
    JSON.stringify({
      puzzleKey,
      guesses: [puzzle.answer],
      status: "solved",
    }),
  );
}

describe("RhobhWordleRoute", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.setSystemTime(new Date("2026-05-20T12:00:00.000Z"));
    validationControl.reset();

    const localStorage = createMemoryStorage();
    vi.stubGlobal("localStorage", localStorage);
    Object.defineProperty(window, "localStorage", {
      value: localStorage,
      configurable: true,
    });
    window.localStorage.clear();

  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    window.localStorage.clear();
    vi.unstubAllGlobals();
    validationControl.reset();
  });

  it("restores saved progress for the same puzzle key after reload", async () => {
    const date = new Date("2026-05-20T12:00:00.000Z");
    const puzzle = getPuzzleForDate(date);
    const puzzleKey = getPuzzleKeyForDate(date);
    const storageKey = `labyrinth:rhobh-wordle:${puzzleKey}`;
    const { unmount, user } = renderRoute();

    await enterGuess(user, puzzle.answer);
    await submitCurrentGuess(user);
    await expectSubmitCalls([puzzle.answer]);

    await resolveValidation(true);

    await waitFor(() => {
      expect(screen.getByText("Today's answer")).toBeInTheDocument();
    });
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

  it("discards stale saved progress for a different puzzle key", () => {
    const staleDate = new Date("2026-05-19T12:00:00.000Z");
    const stalePuzzle = getPuzzleForDate(staleDate);
    const stalePuzzleKey = getPuzzleKeyForDate(staleDate);

    window.localStorage.setItem(
      `labyrinth:rhobh-wordle:${stalePuzzleKey}`,
      JSON.stringify({
        puzzleKey: stalePuzzleKey,
        guesses: [stalePuzzle.answer],
        status: "solved",
      }),
    );

    renderRoute();

    expect(getTextboxes()).toHaveLength(getPuzzleForDate(new Date()).answer.length);
    expect(screen.queryByText(stalePuzzle.answer)).not.toBeInTheDocument();
  });

  it("rotates to a new puzzle when the utc day changes", async () => {
    const firstDate = new Date("2026-05-20T12:00:00.000Z");
    const secondDate = new Date("2026-05-21T12:00:00.000Z");
    const firstPuzzle = getPuzzleForDate(firstDate);
    const secondPuzzle = getPuzzleForDate(secondDate);

    const { user } = renderRoute();

    await enterGuess(user, firstPuzzle.answer);
    await submitCurrentGuess(user);
    await expectSubmitCalls([firstPuzzle.answer]);
    await resolveValidation(true);
    await waitFor(() => {
      expect(screen.getByText(firstPuzzle.answer)).toBeInTheDocument();
    });

    act(() => {
      vi.setSystemTime(secondDate);
      vi.advanceTimersByTime(60_000);
    });

    expect(screen.queryByText(firstPuzzle.answer)).not.toBeInTheDocument();
    expect(getTextboxes()).toHaveLength(secondPuzzle.answer.length);
  });

  it("shows an error when the guess is too short", async () => {
    const puzzle = getCurrentPuzzle();

    const { user } = renderRoute();

    await enterGuess(user, puzzle.answer.slice(0, Math.max(1, puzzle.answer.length - 1)));
    await submitCurrentGuess(user);

    expect(screen.getByText("Not enough letters")).toBeInTheDocument();
    expect(validationControl.getRequests()).toEqual([]);
  });

  it("shows an error when a duplicate guess is submitted", async () => {
    const puzzle = getCurrentPuzzle();
    const wrongGuess = getAlternateValidGuess(puzzle.answer);

    const { user } = renderRoute();

    await enterGuess(user, wrongGuess);
    await submitCurrentGuess(user);
    await expectSubmitCalls([wrongGuess]);
    await resolveValidation(true);

    await enterGuess(user, wrongGuess);
    await submitCurrentGuess(user);

    expect(screen.getByText("Already guessed")).toBeInTheDocument();
    expect(validationControl.getRequests()).toEqual([wrongGuess]);
  });

  it("shows an error when server validation rejects a guess", async () => {
    const puzzle = getCurrentPuzzle();

    const { user } = renderRoute();

    await enterGuess(user, "Z".repeat(puzzle.answer.length));
    await submitCurrentGuess(user);
    await expectSubmitCalls(["Z".repeat(puzzle.answer.length)]);

    await resolveValidation(false);

    await waitFor(() => {
      expect(screen.getByText("Not in word list")).toBeInTheDocument();
    });
    expect(getTextboxValues()).toEqual(Array.from({ length: puzzle.answer.length }, () => "Z"));
  });

  it("commits a guess only after validation succeeds", async () => {
    const puzzle = getCurrentPuzzle();
    const wrongGuess = getAlternateValidGuess(puzzle.answer);

    const { user } = renderRoute();

    await enterGuess(user, wrongGuess);
    await submitCurrentGuess(user);

    expect(screen.queryByText("Already guessed")).not.toBeInTheDocument();
    expect(getTextboxValues()).toEqual(wrongGuess.split(""));

    await expectSubmitCalls([wrongGuess]);
    await resolveValidation(true);

    await waitFor(() => {
      expect(getTextboxes()).toHaveLength(puzzle.answer.length);
      expect(getTextboxValues()).toEqual(Array.from({ length: puzzle.answer.length }, () => ""));
    });
    expect(screen.getAllByText(wrongGuess[0]).length).toBeGreaterThan(0);
  });

  it("reveals the clue only when one guess remains", async () => {
    const puzzle = getCurrentPuzzle();
    const puzzleKey = getPuzzleKeyForDate(new Date("2026-05-20T12:00:00.000Z"));
    const seededGuesses = Array.from({ length: MAX_GUESSES - 1 }, (_, index) =>
      String.fromCharCode(66 + index).repeat(puzzle.answer.length),
    );

    window.localStorage.setItem(
      `labyrinth:rhobh-wordle:${puzzleKey}`,
      JSON.stringify({
        puzzleKey,
        guesses: seededGuesses.slice(0, MAX_GUESSES - 2),
        status: "playing",
      }),
    );

    const { unmount } = renderRoute();

    expect(screen.queryByText("Final guess clue")).not.toBeInTheDocument();
    expect(screen.queryByText(puzzle.clue)).not.toBeInTheDocument();

    unmount();

    window.localStorage.setItem(
      `labyrinth:rhobh-wordle:${puzzleKey}`,
      JSON.stringify({
        puzzleKey,
        guesses: seededGuesses,
        status: "playing",
      }),
    );

    renderRoute();

    expect(screen.getByText("Final guess clue")).toBeInTheDocument();
    expect(screen.getByText(puzzle.clue)).toBeInTheDocument();
  });

  it("shows a share button after the game ends", async () => {
    const puzzle = getCurrentPuzzle();
    seedSolvedGame(puzzle);
    renderRoute();

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Share result" })).toBeInTheDocument();
    });
  });

  it("ignores repeated submit attempts while validation is in flight", async () => {
    const puzzle = getCurrentPuzzle();

    const { user } = renderRoute();

    await enterGuess(user, puzzle.answer);
    await submitCurrentGuess(user);

    const firstCell = screen.getByLabelText("Letter 1");
    fireEvent.keyDown(firstCell, { key: "Enter" });

    await expectSubmitCalls([puzzle.answer]);
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Enter" })).toBeDisabled();
    });
  });

  it("prevents input changes while validation is in flight", async () => {
    const puzzle = getCurrentPuzzle();

    const { user } = renderRoute();

    await enterGuess(user, puzzle.answer);
    await submitCurrentGuess(user);

    const firstCell = screen.getByLabelText("Letter 1");

    fireEvent.keyDown(firstCell, { key: "Backspace" });
    fireEvent.keyDown(firstCell, { key: "A" });
    fireEvent.change(firstCell, { target: { value: "Q" } });

    expect(getTextboxValues()).toEqual(puzzle.answer.split(""));
    await expectSubmitCalls([puzzle.answer]);
  });
});
