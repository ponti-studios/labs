import { render, screen } from "@testing-library/react";
import type { LoaderFunctionArgs } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { Route } from "../+types/route";

const loadActivePublicPuzzleWithAttempt = vi.fn();
const getActiveGames = vi.fn();

vi.mock("../../../../lib/what/server/puzzle.server", () => ({
  loadActivePublicPuzzleWithAttempt,
}));

vi.mock("../../../../lib/what/server/games.server", () => ({
  getActiveGames,
}));

vi.mock("../../../../lib/server/hominem-auth", async () => {
  const actual = await vi.importActual<typeof import("../../../../lib/server/hominem-auth")>(
    "../../../../lib/server/hominem-auth",
  );

  return {
    ...actual,
    getHominemUser: vi.fn().mockResolvedValue(null),
  };
});

describe("What route loader", () => {
  beforeEach(() => {
    loadActivePublicPuzzleWithAttempt.mockReset();
    getActiveGames.mockReset();
    getActiveGames.mockResolvedValue([]);
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.setSystemTime(new Date("2026-05-20T12:00:00.000Z"));
  });

  afterEach(() => vi.useRealTimers());

  function createLoaderArgs(url: string): LoaderFunctionArgs {
    const request = new Request(url);

    return {
      context: {},
      params: {},
      pattern: "",
      request,
      url: new URL(request.url),
    } as LoaderFunctionArgs;
  }

  it("returns the public puzzle (no answer) when one is available", async () => {
    loadActivePublicPuzzleWithAttempt.mockResolvedValue({
      puzzle: {
        answerType: "moment",
        clue: "A clash that keeps the whole cast spinning.",
        dateKey: "2026-05-20",
        detail: "A single RHOBH conflict can dominate the full episode and aftermath.",
        sources: [],
      },
      attempt: null,
    });

    const { loader } = await import("../route");
    const response = await loader(createLoaderArgs("http://localhost/games/what"));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.puzzle.answer).toBeUndefined();
    expect(payload.puzzle.dateKey).toBe("2026-05-20");
  }, 15_000);

  it("builds a login return URL pointing back at the page, stripping any .data suffix", async () => {
    loadActivePublicPuzzleWithAttempt.mockResolvedValue({
      puzzle: {
        answerType: "moment",
        clue: "A clash that keeps the whole cast spinning.",
        dateKey: "2026-05-20",
        detail: "A single RHOBH conflict can dominate the full episode and aftermath.",
        sources: [],
      },
      attempt: null,
    });

    const { loader } = await import("../route");
    // React Router's client-side revalidation fetches the loader via a
    // "<path>.data" endpoint — the login redirect must not leak that suffix.
    const response = await loader(createLoaderArgs("https://labs.ponti.io/games/what.data?index"));
    const payload = await response.json();

    const loginUrl = new URL(payload.loginUrl);
    const next = loginUrl.searchParams.get("next");
    expect(next).toBe("https://labs.ponti.io/games/what");
  });

  it("throws a What-specific 404 error when no puzzle exists for today", async () => {
    loadActivePublicPuzzleWithAttempt.mockResolvedValue(null);

    const { loader } = await import("../route");

    await expect(loader(createLoaderArgs("http://localhost/games/what"))).rejects.toMatchObject({
      status: 404,
      statusText: "No WH?T puzzle found for today",
    });

    await expect(
      loader(createLoaderArgs("http://localhost/games/what")).catch(async (response) => ({
        payload: await response.json(),
        status: response.status,
      })),
    ).resolves.toEqual({
      payload: {
        code: "WHAT_PUZZLE_NOT_FOUND",
        error: "No WH?T puzzle found for today",
      },
      status: 404,
    });
  });

  it("shows the loader's specific error in the route error boundary", async () => {
    const { ErrorBoundary } = await import("../route");

    render(
      <ErrorBoundary
        params={{}}
        error={
          {
            status: 404,
            statusText: "No WH?T puzzle found for today",
            data: {
              code: "WHAT_PUZZLE_NOT_FOUND",
              error: "No WH?T puzzle found for today",
            },
            internal: false,
          } as Route.ErrorBoundaryProps["error"]
        }
      />,
    );

    expect(screen.getByText("No WH?T puzzle found for today")).toBeInTheDocument();
  });
});
