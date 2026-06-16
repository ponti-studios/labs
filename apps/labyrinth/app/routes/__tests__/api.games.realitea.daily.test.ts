import type { LoaderFunctionArgs } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";

const loadPuzzleForDate = vi.fn();

vi.mock("../../lib/realitea-daily-puzzle.server", () => ({
  loadPuzzleForDate,
}));

describe("RealiTea daily puzzle loader", () => {
  beforeEach(() => {
    loadPuzzleForDate.mockReset();
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

    const { loader } = await import("../api.games.realitea.daily");
    const response = await loader(
      createLoaderArgs("http://localhost/api/games/realitea/daily?date=2026-05-27"),
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.puzzle.answer).toBe("DRAMA");
    expect(payload.puzzle.source).toBe("database");
  });

  it("returns 404 when no puzzle exists for the requested day", async () => {
    loadPuzzleForDate.mockResolvedValue(null);

    const { loader } = await import("../api.games.realitea.daily");
    const response = await loader(
      createLoaderArgs("http://localhost/api/games/realitea/daily?date=2026-05-27"),
    );
    const payload = await response.json();

    expect(response.status).toBe(404);
    expect(payload.error).toBe("No RealiTea puzzle found for today");
  });
});
