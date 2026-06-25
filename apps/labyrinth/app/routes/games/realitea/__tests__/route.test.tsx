import { createMemoryStorage } from "@pontistudios/ui";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRoutesStub } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  evaluateGuess,
  MAX_GUESSES,
  REALITEA_ANSWER_LENGTH,
  type PublicDailyPuzzle,
  type RealiteaGuess,
} from "~/lib/realitea";

import { readGameState } from "../game-state";
import RealiTeaRoute from "../route";
import { createControlledRouteAction } from "../../../__tests__/controlled-route-action";
import {
  expectAccessibilityMessageContent,
  expectMessageClearsAfterAnimation,
} from "./accessibility.test-utils";

interface GuessRequest {
  dateKey: string;
  word: string;
  previousGuesses: Array<{ word: string }>;
}

interface GuessResultPayload {
  valid: boolean;
  word?: string;
  states?: Array<"absent" | "present" | "correct">;
  isSolved?: boolean;
  isGameOver?: boolean;
  status?: "playing" | "solved" | "failed";
  reason?: "not-in-word-list" | "wrong-length" | "already-guessed";
}

const guessControl = createControlledRouteAction<GuessRequest, GuessResultPayload>({
  async parseRequest(request) {
    return (await request.json()) as GuessRequest;
  },
});

function buildGuessResult(answer: string, word: string): GuessResultPayload {
  const states = evaluateGuess(answer, word);
  return {
    valid: true,
    word,
    states,
    isSolved: states.every((s) => s === "correct"),
    isGameOver: states.every((s) => s === "correct"),
    status: states.every((s) => s === "correct") ? "solved" : "playing",
  };
}

const DEFAULT_ANSWER = "ERIKA";

function buildPublicPuzzle(
  answer = DEFAULT_ANSWER,
  date: Date = new Date("2026-05-20T12:00:00.000Z"),
): PublicDailyPuzzle {
  return {
    answerType: "storyline",
    clue: "The Pretty Mess performer never misses a sharp confessional.",
    dateKey: toDateKey(date),
    detail:
      "Erika Jayne keeps the glam, the one-liners, and the pop-star energy turned all the way up.",
    sources: [],
  };
}

function toDateKey(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

let routePuzzle = buildPublicPuzzle();

async function renderRoute(initial: { puzzle?: PublicDailyPuzzle } = {}) {
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

  const RoutesStub = createRoutesStub([
    {
      id: "routes/games/realitea",
      path: "/",
      Component: RealiTeaRoute,
      HydrateFallback: () => null,
      loader: () => ({ puzzle: initial.puzzle ?? routePuzzle }),
    },
    {
      id: "routes/api.games.realitea.guess",
      path: "/api/games/realitea/guess",
      action: guessControl.action,
    },
  ]);

  cleanup();
  const rendered = render(<RoutesStub initialEntries={["/"]} />);
  await screen.findByRole("button", { name: /how to play/i });
  await waitFor(() => {
    expect(
      screen.queryByLabelText("Letter 1") ??
        screen.queryByText("The Story") ??
        screen.queryByText("The puzzle ended"),
    ).toBeTruthy();
  });

  return { user, ...rendered };
}

async function expectGuessCalls(words: string[]) {
  await waitFor(() => {
    expect(guessControl.getRequests().map((r) => r.word)).toEqual(words);
  });
}

function resolveGuess(result: GuessResultPayload) {
  return act(async () => {
    guessControl.resolveNext(result);
  });
}

async function finishTileReveal() {
  for (let step = 0; step < REALITEA_ANSWER_LENGTH + 3; step += 1) {
    await act(async () => {
      vi.advanceTimersByTime(250);
    });
  }
}

async function enterGuess(user: ReturnType<typeof userEvent.setup>, guess: string) {
  await user.keyboard(guess);
}

async function submitCurrentGuess(user: ReturnType<typeof userEvent.setup>) {
  await user.keyboard("{Enter}");
}

function getTextboxes() {
  return Array.from({ length: REALITEA_ANSWER_LENGTH }, (_, i) =>
    screen.queryByLabelText(`Letter ${i + 1}`),
  ).filter((el): el is HTMLElement => el !== null);
}

function getTextboxValues() {
  return getTextboxes().map((el) => el.textContent ?? "");
}

function seedSolvedGame(answer = DEFAULT_ANSWER) {
  const puzzleKey = routePuzzle.dateKey;
  const guess: RealiteaGuess = {
    word: answer,
    states: ["correct", "correct", "correct", "correct", "correct"],
  };
  window.localStorage.setItem(
    `labyrinth:realitea:${puzzleKey}`,
    JSON.stringify({ puzzleKey, guesses: [guess], status: "solved" }),
  );
}

/**
 * RealiTea Route Integration Tests
 *
 * ────── Error Message Lifecycle ──────
 * Tests verify that validation errors render and auto-clear correctly:
 *
 * 1. Validation Errors (trigger animateError in use-game.ts):
 *    - "Not enough letters"  (client: word < 5 letters)
 *    - "Already guessed"     (client: duplicate submission)
 *    - "Not in word list"    (server: word not in dictionary)
 *
 * 2. Error Message Rendering:
 *    - Rendered in <p role="status"> with aria-live="polite" aria-atomic="true"
 *    - CSS class "text-red-600" applies
 *    - CSS animation "realitea-row-shake" triggers on the rows
 *
 * 3. Error Lifecycle (use-animation.ts:27-35):
 *    - animateError(message, shake: true) called
 *    - State updates → component re-renders
 *    - setTimeout(400ms) clears error state
 *    - Component re-renders without error element
 *
 * ────── What We Test ──────
 * ✓ Error text appears in status region immediately
 * ✓ Error text is actual content (not empty element)
 * ✓ Error message clears exactly 400ms later
 * ✓ Structure/content snapshot matches expected DOM
 * ✓ aria-live region accessibility attributes present
 *
 * ────── Why These Tests Exist ──────
 * Previous bug: error <p> element existed but was empty {game.errorMessage missing}.
 * Tests using screen.getByText() correctly failed - they found no text!
 * This test structure prevents regressions.
 */
describe("RealiTeaRoute", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.setSystemTime(new Date("2026-05-20T12:00:00.000Z"));
    guessControl.reset();
    routePuzzle = buildPublicPuzzle();

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
    guessControl.reset();
  });

  it("restores saved progress for the same puzzle key after reload", async () => {
    const puzzleKey = routePuzzle.dateKey;
    const { user } = await renderRoute();

    await enterGuess(user, DEFAULT_ANSWER);
    await submitCurrentGuess(user);
    await expectGuessCalls([DEFAULT_ANSWER]);
    await resolveGuess(buildGuessResult(DEFAULT_ANSWER, DEFAULT_ANSWER));
    await finishTileReveal();

    await waitFor(() => {
      expect(screen.getByText("The Story")).toBeInTheDocument();
    });
    expect(screen.getByText(routePuzzle.detail.toLocaleLowerCase())).toBeInTheDocument();

    await renderRoute();

    await waitFor(() => {
      expect(screen.getByText("The Story")).toBeInTheDocument();
      expect(screen.getByText(routePuzzle.detail.toLocaleLowerCase())).toBeInTheDocument();
      const stored = readGameState(puzzleKey);
      expect(stored?.guesses.map((g) => g.word)).toEqual([DEFAULT_ANSWER]);
      expect(stored?.status).toBe("solved");
    });
  });

  it("discards stale saved progress for a different puzzle key", async () => {
    const staleKey = "2026-05-19";
    window.localStorage.setItem(
      `labyrinth:realitea:${staleKey}`,
      JSON.stringify({
        puzzleKey: staleKey,
        guesses: [{ word: "KYLE", states: ["correct", "correct", "correct", "correct", "absent"] }],
        status: "solved",
      }),
    );

    await renderRoute();

    expect(getTextboxes()).toHaveLength(DEFAULT_ANSWER.length);
    expect(screen.queryByText("KYLE")).not.toBeInTheDocument();
  });

  it("shows an error when the guess is too short", async () => {
    const { user } = await renderRoute();

    await enterGuess(user, DEFAULT_ANSWER.slice(0, 3));
    await submitCurrentGuess(user);

    expect(screen.getByText("Not enough letters")).toBeInTheDocument();
    expect(guessControl.getRequests()).toEqual([]);
  });

  it("shows an error when a duplicate guess is submitted", async () => {
    const wrongGuess = "DORIT";
    const { user } = await renderRoute();

    await enterGuess(user, wrongGuess);
    await submitCurrentGuess(user);
    await expectGuessCalls([wrongGuess]);
    await resolveGuess(buildGuessResult(DEFAULT_ANSWER, wrongGuess));
    await finishTileReveal();

    await enterGuess(user, wrongGuess);
    await submitCurrentGuess(user);

    expect(screen.getByText("Already guessed")).toBeInTheDocument();
    expect(guessControl.getRequests().map((r) => r.word)).toEqual([wrongGuess]);
  });

  it("shows an error when server validation rejects a guess", async () => {
    const invalidGuess = "ZZZZZ";
    const { user } = await renderRoute();

    await enterGuess(user, invalidGuess);
    await submitCurrentGuess(user);
    await expectGuessCalls([invalidGuess]);
    await resolveGuess({ valid: false, reason: "not-in-word-list" });

    await waitFor(() => {
      expect(screen.getByText("Not in word list")).toBeInTheDocument();
    });
    expect(getTextboxValues()).toEqual(Array.from({ length: invalidGuess.length }, () => "Z"));
  });

  it("renders error message text inside the aria-live region", async () => {
    const { user } = await renderRoute();

    await enterGuess(user, DEFAULT_ANSWER.slice(0, 3));
    await submitCurrentGuess(user);

    // Verify text content is actually in the DOM, not just the region
    const status = screen.getByRole("status");
    await waitFor(() => {
      expect(status).toHaveTextContent("Not enough letters");
    });

    // Verify it's not just whitespace
    expect(status.textContent?.trim()).toBeTruthy();
  });

  it("error message container structure is stable", async () => {
    const { user } = await renderRoute();

    await enterGuess(user, DEFAULT_ANSWER.slice(0, 3));
    await submitCurrentGuess(user);

    const status = screen.getByRole("status");
    expect(status).toMatchSnapshot();
  });

  it("error message clears after animation timeout", async () => {
    const { user } = await renderRoute();

    await enterGuess(user, DEFAULT_ANSWER.slice(0, 3));
    await submitCurrentGuess(user);

    expectAccessibilityMessageContent("status", "Not enough letters");

    await expectMessageClearsAfterAnimation("status", 400);
  });

  it("commits a guess only after validation succeeds", async () => {
    const wrongGuess = "DORIT";
    const { user } = await renderRoute();

    await enterGuess(user, wrongGuess);
    await submitCurrentGuess(user);

    expect(screen.queryByText("Already guessed")).not.toBeInTheDocument();
    expect(getTextboxValues()).toEqual(wrongGuess.split(""));

    await expectGuessCalls([wrongGuess]);
    await resolveGuess(buildGuessResult(DEFAULT_ANSWER, wrongGuess));

    expect(getTextboxes()).toHaveLength(0);

    await finishTileReveal();

    await waitFor(() => {
      expect(getTextboxes()).toHaveLength(DEFAULT_ANSWER.length);
      expect(getTextboxValues()).toEqual(Array.from({ length: DEFAULT_ANSWER.length }, () => ""));
    });
  });

  it("reveals the clue only when one guess remains", async () => {
    const puzzleKey = routePuzzle.dateKey;
    const seededWords = ["BEEEE", "CDDDD", "EDEEE", "FDFFF", "GDEEE"].slice(0, MAX_GUESSES - 1);
    const seededGuesses: RealiteaGuess[] = seededWords.map((word) => ({
      word,
      states: evaluateGuess(DEFAULT_ANSWER, word),
    }));

    window.localStorage.setItem(
      `labyrinth:realitea:${puzzleKey}`,
      JSON.stringify({
        puzzleKey,
        guesses: seededGuesses.slice(0, MAX_GUESSES - 2),
        status: "playing",
      }),
    );

    await renderRoute();
    expect(screen.queryByText("Final clue")).not.toBeInTheDocument();

    window.localStorage.clear();
    window.localStorage.setItem(
      `labyrinth:realitea:${puzzleKey}`,
      JSON.stringify({
        puzzleKey,
        guesses: seededGuesses,
        status: "playing",
      }),
    );

    await renderRoute();
    expect(screen.getByText("Final clue")).toBeInTheDocument();
    expect(screen.getByText(routePuzzle.clue)).toBeInTheDocument();
  });

  it("shows a share button after the game ends", async () => {
    seedSolvedGame();
    await renderRoute();

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Share result" })).toBeInTheDocument();
    });
  });

  it("locks the next row until the tile reveal animation finishes", async () => {
    const wrongGuess = "DORIT";
    const { user } = await renderRoute();

    await enterGuess(user, wrongGuess);
    await submitCurrentGuess(user);
    await expectGuessCalls([wrongGuess]);
    await resolveGuess(buildGuessResult(DEFAULT_ANSWER, wrongGuess));

    expect(getTextboxes()).toHaveLength(0);

    await finishTileReveal();

    await waitFor(() => {
      expect(getTextboxes()).toHaveLength(DEFAULT_ANSWER.length);
    });
  });

  it("ignores repeated submit attempts while validation is in flight", async () => {
    const { user } = await renderRoute();

    await enterGuess(user, DEFAULT_ANSWER);
    await submitCurrentGuess(user);

    const firstCell = screen.getByLabelText("Letter 1");
    fireEvent.keyDown(firstCell, { key: "Enter" });

    await expectGuessCalls([DEFAULT_ANSWER]);
  });

  it("prevents input changes while validation is in flight", async () => {
    const { user } = await renderRoute();

    await enterGuess(user, DEFAULT_ANSWER);
    await submitCurrentGuess(user);

    const firstCell = screen.getByLabelText("Letter 1");
    fireEvent.keyDown(firstCell, { key: "Backspace" });
    fireEvent.keyDown(firstCell, { key: "A" });

    expect(getTextboxValues()).toEqual(DEFAULT_ANSWER.split(""));
    await expectGuessCalls([DEFAULT_ANSWER]);
  });
});
