import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRoutesStub } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  evaluateGuess,
  MAX_GUESSES,
  REALITEA_ANSWER_LENGTH,
  type GameStatus,
  type PublicDailyPuzzle,
  type RealiteaGuess,
} from "~/lib/realitea";

import { createControlledRouteAction } from "../../../controlled-route-action";
import RealiTeaRoute from "../route";
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
  reason?:
    | "not-in-word-list"
    | "wrong-length"
    | "already-guessed"
    | "auth-required"
    | "rate-limited"
    | "game-over";
  authRequired?: boolean;
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
const STUB_LOGIN_URL = new URL("https://api.ponti.io");
STUB_LOGIN_URL.searchParams.set("next", "https://labs.ponti.io/games/realitea");
const STUB_LOGIN_URL_STRING = STUB_LOGIN_URL.toString();

// The route seeds guesses from the server-authoritative attempt (React
// Query, GET /api/games/realitea/attempt) instead of localStorage — see
// docs/incidents/011-cross-device-progress-not-synced.md. Tests configure
// what that endpoint returns via `mockAttempt` instead of seeding
// localStorage directly.
type MockAttempt = { guesses: RealiteaGuess[]; status: GameStatus } | null;
let mockAttempt: MockAttempt = null;

function stubAttemptFetch() {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL) => {
      const url = typeof input === "string" ? input : input.toString();
      if (url.includes("/api/games/realitea/attempt")) {
        return new Response(JSON.stringify({ attempt: mockAttempt }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      }
      throw new Error(`Unexpected fetch in test: ${url}`);
    }),
  );
}

async function renderRoute(initial: { puzzle?: PublicDailyPuzzle } = {}) {
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  const RoutesStub = createRoutesStub([
    {
      id: "routes/games/realitea",
      path: "/",
      Component: RealiTeaRoute,
      HydrateFallback: () => null,
      loader: () => ({ puzzle: initial.puzzle ?? routePuzzle, loginUrl: STUB_LOGIN_URL_STRING }),
    },
    {
      id: "routes/api.games.realitea.guess",
      path: "/api/games/realitea/guess",
      action: guessControl.action,
    },
  ]);

  cleanup();
  const rendered = render(
    <QueryClientProvider client={queryClient}>
      <RoutesStub initialEntries={["/"]} />
    </QueryClientProvider>,
  );
  await waitFor(() => {
    expect(
      screen.queryByLabelText("Letter 1") ??
        screen.queryByText("The Receipt"),
    ).toBeTruthy();
  });

  // Wait for the initial render to complete and any animations to settle.
  await act(async () => await Promise.resolve());

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
      vi.advanceTimersByTime(420);
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
  const guess: RealiteaGuess = {
    word: answer,
    states: ["correct", "correct", "correct", "correct", "correct"],
  };
  mockAttempt = { guesses: [guess], status: "solved" };
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
    mockAttempt = null;
    stubAttemptFetch();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.unstubAllGlobals();
    guessControl.reset();
  });

  it("renders Black Lacquer tile and keyboard presentation states", async () => {
    const { user } = await renderRoute();

    expect(screen.getByLabelText("Letter 1")).toHaveAttribute("data-state", "empty");
    expect(screen.getByRole("button", { name: "Q" })).toHaveClass("realitea-key");

    await user.keyboard("E");

    expect(screen.getByLabelText("Letter 1")).toHaveAttribute("data-state", "typed");
  });

  it("shows a solved puzzle on a fresh mount once the server has recorded it", async () => {
    const { user } = await renderRoute();

    await enterGuess(user, DEFAULT_ANSWER);
    await submitCurrentGuess(user);
    await expectGuessCalls([DEFAULT_ANSWER]);
    await resolveGuess(buildGuessResult(DEFAULT_ANSWER, DEFAULT_ANSWER));
    await finishTileReveal();

    await waitFor(() => {
      expect(screen.getByText("The Receipt")).toBeInTheDocument();
    });
    expect(screen.getByText(routePuzzle.detail)).toBeInTheDocument();

    // Simulate the server having recorded the solve, the way
    // evaluateGuessServer would for a signed-in player — a fresh mount
    // (equivalent to a reload, or a different device) reflects the
    // server-authoritative attempt instead of anything device-local.
    mockAttempt = {
      guesses: [
        { word: DEFAULT_ANSWER, states: ["correct", "correct", "correct", "correct", "correct"] },
      ],
      status: "solved",
    };

    await renderRoute();

    await waitFor(() => {
      expect(screen.getByText("The Receipt")).toBeInTheDocument();
      expect(screen.getByText(routePuzzle.detail)).toBeInTheDocument();
    });
  });

  it("starts empty for a new puzzle date even if the previous date had guesses", async () => {
    const wrongGuess = "DORIT";
    mockAttempt = {
      guesses: [{ word: wrongGuess, states: evaluateGuess(DEFAULT_ANSWER, wrongGuess) }],
      status: "playing",
    };
    const { user: sameDateUser } = await renderRoute();

    // Re-submitting the seeded guess is rejected as a duplicate — proof the
    // guess was actually restored from the mocked server attempt, not just
    // that the puzzle rendered.
    await enterGuess(sameDateUser, wrongGuess);
    await submitCurrentGuess(sameDateUser);
    await waitFor(() => {
      expect(screen.getByText("Already guessed")).toBeInTheDocument();
    });
    expect(guessControl.getRequests()).toEqual([]);

    // The puzzle rolled over to a new date, and the (mocked) server has no
    // attempt yet for that new date — the query key is scoped per date, so
    // the previous date's guess must not leak into the new one: the same
    // word should now submit as a fresh guess instead of a duplicate.
    mockAttempt = null;
    const { user: newDateUser } = await renderRoute({
      puzzle: buildPublicPuzzle(DEFAULT_ANSWER, new Date("2026-05-21T12:00:00.000Z")),
    });

    await enterGuess(newDateUser, wrongGuess);
    await submitCurrentGuess(newDateUser);
    await expectGuessCalls([wrongGuess]);
    expect(screen.queryByText("Already guessed")).not.toBeInTheDocument();
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

  it("shows a sign-in prompt when the free anonymous guess is used up", async () => {
    const guess = "DORIT";
    const { user } = await renderRoute();

    await enterGuess(user, guess);
    await submitCurrentGuess(user);
    await expectGuessCalls([guess]);
    await resolveGuess({
      ...buildGuessResult(DEFAULT_ANSWER, guess),
      authRequired: true,
    });
    await finishTileReveal();

    const link = await screen.findByRole("button", { name: /sign in to keep playing/i });
    expect(link).toHaveAttribute("href", STUB_LOGIN_URL_STRING);
    // The keyboard is replaced by the sign-in prompt, not shown alongside it.
    expect(screen.queryByRole("button", { name: "Q" })).not.toBeInTheDocument();
  });

  it("locks input entirely once the free anonymous guess requires auth", async () => {
    const first = "DORIT";
    const { user } = await renderRoute();

    await enterGuess(user, first);
    await submitCurrentGuess(user);
    await expectGuessCalls([first]);
    await resolveGuess({
      ...buildGuessResult(DEFAULT_ANSWER, first),
      authRequired: true,
    });
    await finishTileReveal();
    await screen.findByRole("button", { name: /sign in to keep playing/i });

    // Typing is disabled once authRequired flips isGameOver — no second
    // request should ever reach the server for an anonymous player.
    await user.keyboard("SUTTON{Enter}");
    expect(guessControl.getRequests().map((r) => r.word)).toEqual([first]);
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
    const seededWords = ["BEEEE", "CDDDD", "EDEEE", "FDFFF", "GDEEE"].slice(0, MAX_GUESSES - 1);
    const seededGuesses: RealiteaGuess[] = seededWords.map((word) => ({
      word,
      states: evaluateGuess(DEFAULT_ANSWER, word),
    }));

    mockAttempt = { guesses: seededGuesses.slice(0, MAX_GUESSES - 2), status: "playing" };
    await renderRoute();
    expect(screen.queryByText("Final clue")).not.toBeInTheDocument();

    mockAttempt = { guesses: seededGuesses, status: "playing" };
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
