import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRoutesStub } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createMemoryStorage } from "@pontistudios/ui";
import { MAX_GUESSES, normalizeGuess, type Puzzle } from "../../lib/realitea";
import { getDateKey, type DailyPuzzle } from "../../lib/realitea-daily-puzzle";
import { readGameState } from "../games/game-state";
import RealiTeaRoute from "../games/realitea";
import { createControlledRouteAction } from "./controlled-route-action";

const validationControl = createControlledRouteAction<string, { valid: boolean }>({
  async parseRequest(request) {
    const { word } = (await request.json()) as { word: string };
    return word;
  },
});

const DEFAULT_ROUTE_PUZZLE: Puzzle = {
  answer: "ERIKA",
  answerType: "person",
  clue: "The Pretty Mess performer never misses a sharp confessional.",
  detail:
    "Erika Jayne keeps the glam, the one-liners, and the pop-star energy turned all the way up.",
  newsMode: "current",
  role: "Pop diva energy",
};

const STALE_ROUTE_PUZZLE: Puzzle = {
  answer: "KYLE",
  answerType: "person",
  clue: "OG diamond holder navigating a high-profile separation storyline.",
  detail:
    "Kyle Richards remains the show's center of gravity and one of the most recognizable names in Beverly Hills.",
  newsMode: "current",
  role: "Original cast anchor",
};

const ALTERNATE_VALID_GUESSES = ["DORIT", "SUTTON", "KATHY"];

function buildPuzzleEnvelope(
  puzzle = DEFAULT_ROUTE_PUZZLE,
  date = new Date("2026-05-20T12:00:00.000Z"),
): { puzzle: DailyPuzzle } {
  return {
    puzzle: {
      answer: puzzle.answer,
      answerType: puzzle.answerType ?? "moment",
      clue: puzzle.clue,
      dateKey: getDateKey(date),
      detail: puzzle.detail,
      role: puzzle.role ?? "",
    },
  };
}

let routePuzzle = buildPuzzleEnvelope();
let dailyPuzzle = buildPuzzleEnvelope();

async function renderRoute() {
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: false,
      },
    },
  });
  const RoutesStub = createRoutesStub([
    {
      id: "routes/games/realitea",
      path: "/",
      Component: function QueryWrappedRealiTeaRoute() {
        return (
          <QueryClientProvider client={queryClient}>
            <RealiTeaRoute />
          </QueryClientProvider>
        );
      },
      loader: () => routePuzzle,
    },
    {
      id: "routes/api.games.realitea.daily",
      path: "/api/games/realitea/daily",
      loader: () => dailyPuzzle,
    },
    {
      id: "routes/api.words.validate",
      path: "/api/words/validate",
      action: validationControl.action,
    },
  ]);
  const rendered = render(<RoutesStub initialEntries={["/"]} />);

  await screen.findByRole("button", { name: /how to play/i });
  await waitFor(() => {
    expect(
      screen.queryByLabelText("Letter 1") ??
        screen.queryByText("Today's answer") ??
        screen.queryByText("The answer was"),
    ).toBeTruthy();
  });

  return {
    user,
    ...rendered,
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
  return DEFAULT_ROUTE_PUZZLE;
}

function setRoutePuzzle(
  puzzle = getCurrentPuzzle(),
  date = new Date("2026-05-20T12:00:00.000Z"),
) {
  routePuzzle = buildPuzzleEnvelope(puzzle, date);
}

function setDailyPuzzle(
  puzzle = getCurrentPuzzle(),
  date = new Date("2026-05-20T12:00:00.000Z"),
) {
  dailyPuzzle = buildPuzzleEnvelope(puzzle, date);
}

function getAlternateValidGuess(answer: string) {
  const match = ALTERNATE_VALID_GUESSES.find(
    (guess) => guess.length === answer.length && guess !== answer,
  );

  if (!match) {
    throw new Error(`No alternate test guess found for ${answer.length}-letter puzzle`);
  }

  return match;
}

function seedSolvedGame(puzzle = getCurrentPuzzle()) {
  const puzzleKey = getDateKey(new Date("2026-05-20T12:00:00.000Z"));
  window.localStorage.setItem(
    `labyrinth:realitea:${puzzleKey}`,
    JSON.stringify({
      puzzleKey,
      guesses: [puzzle.answer],
      status: "solved",
    }),
  );
}

async function finishTileReveal(answerLength: number) {
  for (let step = 0; step < answerLength + 3; step += 1) {
    await act(async () => {
      vi.advanceTimersByTime(250);
    });
  }
}

describe("RealiTeaRoute", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.setSystemTime(new Date("2026-05-20T12:00:00.000Z"));
    validationControl.reset();
    setRoutePuzzle();
    setDailyPuzzle();

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
    const puzzle = getCurrentPuzzle();
    const puzzleKey = getDateKey(date);
    const { unmount, user } = await renderRoute();

    await enterGuess(user, puzzle.answer);
    await submitCurrentGuess(user);
    await expectSubmitCalls([puzzle.answer]);

    await resolveValidation(true);
    await finishTileReveal(puzzle.answer.length);

    await waitFor(() => {
      expect(screen.getByText("Today's answer")).toBeInTheDocument();
    });
    expect(screen.getByText(puzzle.answer)).toBeInTheDocument();
    expect(screen.getByText(puzzle.detail)).toBeInTheDocument();

    unmount();
    await renderRoute();

    await waitFor(() => {
      expect(screen.getByText("Today's answer")).toBeInTheDocument();
      expect(screen.getByText(puzzle.answer)).toBeInTheDocument();
      expect(screen.getByText(puzzle.detail)).toBeInTheDocument();
      expect(readGameState(puzzleKey)).toMatchObject({
        puzzleKey,
        guesses: [puzzle.answer],
        status: "solved",
      });
    });
  });

  it("uses a stored daily puzzle from the loader when one exists", async () => {
    setRoutePuzzle(
      {
        answer: "SWANS",
        answerType: "object",
        clue: "These elegant birds are inseparable from one iconic Beverly Hills estate.",
        detail: "The estate's swans became one of the most recognizable bits of RHOBH visual lore.",
        newsMode: "current",
        role: "Estate mascots",
      },
      new Date("2026-05-20T12:00:00.000Z"),
    );

    await renderRoute();

    expect(getTextboxes()).toHaveLength("SWANS".length);
  });

  it("discards stale saved progress for a different puzzle key", async () => {
    const staleDate = new Date("2026-05-19T12:00:00.000Z");
    const stalePuzzle = STALE_ROUTE_PUZZLE;
    const stalePuzzleKey = getDateKey(staleDate);

    window.localStorage.setItem(
      `labyrinth:realitea:${stalePuzzleKey}`,
      JSON.stringify({
        puzzleKey: stalePuzzleKey,
        guesses: [stalePuzzle.answer],
        status: "solved",
      }),
    );

    await renderRoute();

    expect(getTextboxes()).toHaveLength(getCurrentPuzzle().answer.length);
    expect(screen.queryByText(stalePuzzle.answer)).not.toBeInTheDocument();
  });

  it("rotates to a new puzzle when the local day changes", async () => {
    const secondDate = new Date("2026-05-21T12:00:00.000Z");
    const firstPuzzle = getCurrentPuzzle();
    const secondPuzzle: Puzzle = {
      answer: "DRAMA",
      answerType: "moment",
      clue: "A clash that keeps the whole cast spinning.",
      detail: "A single RHOBH conflict can dominate the full episode and aftermath.",
      newsMode: "current",
      role: "Escalating conflict",
    };
    setDailyPuzzle(secondPuzzle, secondDate);

    const { user } = await renderRoute();

    await enterGuess(user, firstPuzzle.answer);
    await submitCurrentGuess(user);
    await expectSubmitCalls([firstPuzzle.answer]);
    await resolveValidation(true);
    await finishTileReveal(firstPuzzle.answer.length);
    await waitFor(() => {
      expect(screen.getByText(firstPuzzle.answer)).toBeInTheDocument();
    });

    act(() => {
      vi.setSystemTime(secondDate);
      vi.advanceTimersByTime(60_000);
    });

    await waitFor(() => {
      expect(screen.queryByText(firstPuzzle.answer)).not.toBeInTheDocument();
      expect(getTextboxes()).toHaveLength(secondPuzzle.answer.length);
    });
  });

  it("keeps the current puzzle visible if the next day is missing from the database", async () => {
    const firstDate = new Date("2026-05-20T12:00:00.000Z");
    const secondDate = new Date("2026-05-21T12:00:00.000Z");
    const firstPuzzle: Puzzle = {
      answer: "DRAMA",
      answerType: "moment",
      clue: "A clash that keeps the whole cast spinning.",
      detail: "A single RHOBH conflict can dominate the full episode and aftermath.",
      newsMode: "current",
      role: "Escalating conflict",
    };
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          refetchOnWindowFocus: false,
          retry: false,
        },
      },
    });

    const RoutesWithoutNextDay = createRoutesStub([
      {
        id: "routes/games/realitea",
        path: "/",
        Component: function QueryWrappedRealiTeaRoute() {
          return (
            <QueryClientProvider client={queryClient}>
              <RealiTeaRoute />
            </QueryClientProvider>
          );
        },
        loader: () => buildPuzzleEnvelope(firstPuzzle, firstDate),
      },
      {
        id: "routes/api.games.realitea.daily",
        path: "/api/games/realitea/daily",
        loader: () => new Response(JSON.stringify({ error: "missing" }), { status: 404 }),
      },
      {
        id: "routes/api.words.validate",
        path: "/api/words/validate",
        action: validationControl.action,
      },
    ]);

    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<RoutesWithoutNextDay initialEntries={["/"]} />);
    await screen.findByRole("button", { name: /how to play/i });
    await waitFor(() => {
      expect(getTextboxes()).toHaveLength(firstPuzzle.answer.length);
    });

    await enterGuess(user, "PUP");
    expect(getTextboxValues().slice(0, 3)).toEqual(["P", "U", "P"]);

    act(() => {
      vi.setSystemTime(secondDate);
      vi.advanceTimersByTime(60_000);
    });

    await waitFor(() => {
      expect(getTextboxes()).toHaveLength(firstPuzzle.answer.length);
      expect(getTextboxValues().slice(0, 3)).toEqual(["P", "U", "P"]);
    });
  });

  it("shows an error when the guess is too short", async () => {
    const puzzle = getCurrentPuzzle();

    const { user } = await renderRoute();

    await enterGuess(user, puzzle.answer.slice(0, Math.max(1, puzzle.answer.length - 1)));
    await submitCurrentGuess(user);

    expect(screen.getByText("Not enough letters")).toBeInTheDocument();
    expect(validationControl.getRequests()).toEqual([]);
  });

  it("shows an error when a duplicate guess is submitted", async () => {
    const puzzle = getCurrentPuzzle();
    const wrongGuess = getAlternateValidGuess(puzzle.answer);

    const { user } = await renderRoute();

    await enterGuess(user, wrongGuess);
    await submitCurrentGuess(user);
    await expectSubmitCalls([wrongGuess]);
    await resolveValidation(true);
    await finishTileReveal(puzzle.answer.length);

    await enterGuess(user, wrongGuess);
    await submitCurrentGuess(user);

    expect(screen.getByText("Already guessed")).toBeInTheDocument();
    expect(validationControl.getRequests()).toEqual([wrongGuess]);
  });

  it("shows an error when server validation rejects a guess", async () => {
    const puzzle = getCurrentPuzzle();

    const { user } = await renderRoute();

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

    const { user } = await renderRoute();

    await enterGuess(user, wrongGuess);
    await submitCurrentGuess(user);

    expect(screen.queryByText("Already guessed")).not.toBeInTheDocument();
    expect(getTextboxValues()).toEqual(wrongGuess.split(""));

    await expectSubmitCalls([wrongGuess]);
    await resolveValidation(true);

    expect(getTextboxes()).toHaveLength(0);

    await finishTileReveal(puzzle.answer.length);

    await waitFor(() => {
      expect(getTextboxes()).toHaveLength(puzzle.answer.length);
      expect(getTextboxValues()).toEqual(Array.from({ length: puzzle.answer.length }, () => ""));
    });
    expect(screen.getAllByText(wrongGuess[0]).length).toBeGreaterThan(0);
  });

  it("reveals the clue only when one guess remains", async () => {
    const puzzle = getCurrentPuzzle();
    const puzzleKey = getDateKey(new Date("2026-05-20T12:00:00.000Z"));
    const seededGuesses = Array.from({ length: MAX_GUESSES - 1 }, (_, index) =>
      String.fromCharCode(66 + index).repeat(puzzle.answer.length),
    );

    window.localStorage.setItem(
      `labyrinth:realitea:${puzzleKey}`,
      JSON.stringify({
        puzzleKey,
        guesses: seededGuesses.slice(0, MAX_GUESSES - 2),
        status: "playing",
      }),
    );

    const { unmount } = await renderRoute();

    expect(screen.queryByText("Final guess clue")).not.toBeInTheDocument();
    expect(screen.queryByText(puzzle.clue)).not.toBeInTheDocument();

    unmount();

    window.localStorage.setItem(
      `labyrinth:realitea:${puzzleKey}`,
      JSON.stringify({
        puzzleKey,
        guesses: seededGuesses,
        status: "playing",
      }),
    );

    await renderRoute();

    expect(screen.getByText("Final guess clue")).toBeInTheDocument();
    expect(screen.getByText(puzzle.clue)).toBeInTheDocument();
  });

  it("shows a share button after the game ends", async () => {
    const puzzle = getCurrentPuzzle();
    seedSolvedGame(puzzle);
    await renderRoute();

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Share result" })).toBeInTheDocument();
    });
  });

  it("locks the next row until the tile reveal animation finishes", async () => {
    const puzzle = getCurrentPuzzle();
    const wrongGuess = getAlternateValidGuess(puzzle.answer);
    const { user } = await renderRoute();

    await enterGuess(user, wrongGuess);
    await submitCurrentGuess(user);
    await expectSubmitCalls([wrongGuess]);
    await resolveValidation(true);

    expect(getTextboxes()).toHaveLength(0);
    expect(screen.getByRole("button", { name: "Enter" })).toBeDisabled();

    await finishTileReveal(puzzle.answer.length);

    await waitFor(() => {
      expect(getTextboxes()).toHaveLength(puzzle.answer.length);
    });
  });

  it("ignores repeated submit attempts while validation is in flight", async () => {
    const puzzle = getCurrentPuzzle();

    const { user } = await renderRoute();

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

    const { user } = await renderRoute();

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
