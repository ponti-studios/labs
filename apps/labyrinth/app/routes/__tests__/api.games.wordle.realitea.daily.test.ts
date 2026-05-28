import { beforeEach, describe, expect, it, vi } from "vitest";
import type { LoaderFunctionArgs } from "react-router";

const loadRhobhPuzzleForDate = vi.fn();

vi.mock("../../lib/server/rhobh-daily-puzzle", () => ({
  loadRhobhPuzzleForDate,
}));

describe("RealiTea daily puzzle loader", () => {
  beforeEach(() => {
    loadRhobhPuzzleForDate.mockReset();
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
    loadRhobhPuzzleForDate.mockResolvedValue({
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

    const { loader } = await import("../api.games.wordle.realitea.daily");
    const response = await loader(
      createLoaderArgs("http://localhost/api/games/wordle/realitea/daily?date=2026-05-27"),
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.puzzle.answer).toBe("PUPPYGATE");
    expect(payload.puzzle.source).toBe("database");
  });

  it("falls back to the static puzzle envelope when the loader throws", async () => {
    loadRhobhPuzzleForDate.mockRejectedValue(new Error("db unavailable"));

    const { loader } = await import("../api.games.wordle.realitea.daily");
    const response = await loader(
      createLoaderArgs("http://localhost/api/games/wordle/realitea/daily?date=2026-05-27"),
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.puzzle.source).toBe("static");
    expect(typeof payload.puzzle.answer).toBe("string");
  });
});