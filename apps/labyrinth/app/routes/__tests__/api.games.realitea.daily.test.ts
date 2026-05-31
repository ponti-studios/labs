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
      request,
      unstable_pattern: "",
      unstable_url: new URL(request.url),
    } as LoaderFunctionArgs;
  }

  it("returns the stored puzzle when one is available", async () => {
    loadPuzzleForDate.mockResolvedValue({
      puzzle: {
        answer: "PUPPYGATE",
        answerType: "storyline",
        clue: "A rescue-dog scandal with long-lasting fallout.",
        detail: "The fallout became one of RHOBH's defining storylines.",
        newsMode: "archive",
        puzzleKey: "rhobh-20599",
        role: "Infamous feud",
        source: "database",
      },
    });

    const { loader } = await import("../api.games.realitea.daily");
    const response = await loader(
      createLoaderArgs("http://localhost/api/games/realitea/daily?date=2026-05-27"),
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.puzzle.answer).toBe("PUPPYGATE");
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
