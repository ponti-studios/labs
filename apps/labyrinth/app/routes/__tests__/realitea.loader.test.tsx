import type { LoaderFunctionArgs } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";

const loadActivePublicPuzzle = vi.fn();

vi.mock("../../lib/realitea-daily-puzzle.server", () => ({
  loadActivePublicPuzzle,
}));

describe("RealiTea route loader", () => {
  beforeEach(() => {
    loadActivePublicPuzzle.mockReset();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-20T12:00:00.000Z"));
  });

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
    loadActivePublicPuzzle.mockResolvedValue({
      puzzle: {
        answerLength: 5,
        answerType: "moment",
        clue: "A clash that keeps the whole cast spinning.",
        dateKey: "2026-05-20",
        detail: "A single RHOBH conflict can dominate the full episode and aftermath.",
        role: "Escalating conflict",
        sourceUrls: [],
      },
    });

    const { loader } = await import("../games/realitea");
    const response = await loader(createLoaderArgs("http://localhost/games/realitea"));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.puzzle.answer).toBeUndefined();
    expect(payload.puzzle.dateKey).toBe("2026-05-20");
    expect(payload.puzzle.answerLength).toBe(5);
  });

  it("throws a RealiTea-specific 404 error when no puzzle exists for today", async () => {
    loadActivePublicPuzzle.mockResolvedValue(null);

    const { loader } = await import("../games/realitea");

    await expect(loader(createLoaderArgs("http://localhost/games/realitea"))).rejects.toMatchObject(
      {
        status: 404,
        statusText: "No RealiTea puzzle found for today",
      },
    );

    await expect(
      loader(createLoaderArgs("http://localhost/games/realitea")).catch(async (response) => ({
        payload: await response.json(),
        status: response.status,
      })),
    ).resolves.toEqual({
      payload: {
        code: "REALITEA_PUZZLE_NOT_FOUND",
        error: "No RealiTea puzzle found for today",
      },
      status: 404,
    });
  });
});
