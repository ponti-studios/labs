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
        newsMode: "current",
        puzzleKey: "rhobh-20599",
        role: "Infamous feud",
        source: "database",
      },
    });

    const { loader } = await import("../games/realitea");
    const response = await loader(createLoaderArgs("http://localhost/games/realitea"));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.puzzle.answer).toBe("PUPPYGATE");
  });
});
