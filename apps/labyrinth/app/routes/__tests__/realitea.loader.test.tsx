import type { LoaderFunctionArgs } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";

const loadPuzzleForDate = vi.fn();

vi.mock("../../lib/realitea-daily-puzzle.server", () => ({
  loadPuzzleForDate,
}));

describe("RealiTea route loader", () => {
  beforeEach(() => {
    loadPuzzleForDate.mockReset();
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

  it("returns the stored puzzle when one is available", async () => {
    loadPuzzleForDate.mockResolvedValue({
      puzzle: {
        answer: "DRAMA",
        answerType: "moment",
        clue: "A clash that keeps the whole cast spinning.",
        detail: "A single RHOBH conflict can dominate the full episode and aftermath.",
        newsMode: "current",
        puzzleKey: "rhobh-20599",
        role: "Escalating conflict",
        source: "database",
      },
    });

    const { loader } = await import("../games/realitea");
    const response = await loader(createLoaderArgs("http://localhost/games/realitea"));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.puzzle.answer).toBe("DRAMA");
  });
});
