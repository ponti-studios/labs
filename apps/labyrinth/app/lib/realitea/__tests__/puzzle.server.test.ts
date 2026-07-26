import { describe, expect, it, vi } from "vitest";

const {
  getGameBySlugMock,
  loadPuzzleForDateMock,
  loadMostRecentPuzzleMock,
  isValidWordMock,
} = vi.hoisted(() => ({
  getGameBySlugMock: vi.fn(),
  loadPuzzleForDateMock: vi.fn(),
  loadMostRecentPuzzleMock: vi.fn(),
  isValidWordMock: vi.fn(),
}));

vi.mock("../repository", () => ({
  getGameBySlug: getGameBySlugMock,
  loadPuzzleForDate: loadPuzzleForDateMock,
  loadMostRecentPuzzle: loadMostRecentPuzzleMock,
}));

vi.mock("../word-list.server", () => ({
  isValidWord: isValidWordMock,
}));

const GAME = { id: 1, slug: "rhobh" };

function makePuzzle(overrides: Partial<{
  dateUtc: string;
  answer: string;
  normalizedAnswer: string;
  answerType: string;
  clue: string;
  detail: string;
  articleUrl: string;
  articleTitle: string;
}> = {}) {
  return {
    id: 1,
    gameId: 1,
    articleId: 100,
    dateUtc: overrides.dateUtc ?? "2026-05-20",
    answer: overrides.answer ?? "ERIKA",
    answerType: overrides.answerType ?? "storyline",
    normalizedAnswer: overrides.normalizedAnswer ?? "ERIKA",
    clue: overrides.clue ?? "The Pretty Mess performer never misses a sharp confessional.",
    detail: overrides.detail ?? "Erika Jayne keeps the glam and pop-star energy turned all the way up.",
    createdAt: new Date("2026-05-20T12:00:00.000Z"),
    updatedAt: new Date("2026-05-20T12:00:00.000Z"),
    article: {
      url: overrides.articleUrl ?? "https://example.com/erika",
      title: overrides.articleTitle ?? "Erika story",
      publishedAt: new Date("2026-05-19T12:00:00.000Z"),
    },
  };
}

describe("loadActivePublicPuzzle", () => {
  it("loads today's puzzle when one exists", async () => {
    getGameBySlugMock.mockResolvedValue(GAME);
    loadPuzzleForDateMock.mockResolvedValue(makePuzzle());

    const { loadActivePublicPuzzle } = await import("../puzzle.server");
    const envelope = await loadActivePublicPuzzle(new Date("2026-05-20T12:00:00.000Z"));

    expect(envelope).not.toBeNull();
    expect(envelope!.puzzle.dateKey).toBe("2026-05-20");
    expect(envelope!.puzzle.answerType).toBe("storyline");
    expect(envelope!.puzzle.clue).toBe(
      "The Pretty Mess performer never misses a sharp confessional.",
    );
    expect(loadPuzzleForDateMock).toHaveBeenCalledWith(1, "2026-05-20");
    expect(loadMostRecentPuzzleMock).not.toHaveBeenCalled();
  });

  it("falls back to the most recent puzzle when today's puzzle doesn't exist", async () => {
    getGameBySlugMock.mockResolvedValue(GAME);
    loadPuzzleForDateMock.mockResolvedValue(null);
    loadMostRecentPuzzleMock.mockResolvedValue(
      makePuzzle({ dateUtc: "2026-05-19", answer: "DRAMA", answerType: "moment" }),
    );

    const { loadActivePublicPuzzle } = await import("../puzzle.server");
    const envelope = await loadActivePublicPuzzle(new Date("2026-05-20T12:00:00.000Z"));

    expect(envelope?.puzzle.dateKey).toBe("2026-05-19");
    expect(envelope?.puzzle.answerType).toBe("moment");
    expect(loadMostRecentPuzzleMock).toHaveBeenCalledWith(1);
  });

  it("returns null when no puzzle exists at all", async () => {
    getGameBySlugMock.mockResolvedValue(GAME);
    loadPuzzleForDateMock.mockResolvedValue(null);
    loadMostRecentPuzzleMock.mockResolvedValue(null);

    const { loadActivePublicPuzzle } = await import("../puzzle.server");
    const envelope = await loadActivePublicPuzzle(new Date("2026-05-20T12:00:00.000Z"));

    expect(envelope).toBeNull();
  });

  it("resolves the game ID by slug", async () => {
    getGameBySlugMock.mockResolvedValue(GAME);
    loadPuzzleForDateMock.mockResolvedValue(null);
    loadMostRecentPuzzleMock.mockResolvedValue(null);

    const { loadActivePublicPuzzle } = await import("../puzzle.server");
    await loadActivePublicPuzzle(new Date("2026-05-20T12:00:00.000Z"));

    expect(getGameBySlugMock).toHaveBeenCalledWith("rhobh");
  });
});

describe("evaluateGuessServer", () => {
  it("rejects a word that is not the answer length", async () => {
    const { evaluateGuessServer } = await import("../puzzle.server");
    const result = await evaluateGuessServer("2026-05-20", "ABC", []);

    expect(result.valid).toBe(false);
    expect(result.reason).toBe("wrong-length");
    expect(result.word).toBe("ABC");
    expect(getGameBySlugMock).not.toHaveBeenCalled();
  });

  it("rejects an already-guessed word before touching the repository", async () => {
    const { evaluateGuessServer } = await import("../puzzle.server");
    const result = await evaluateGuessServer("2026-05-20", "ERIKA", [{ word: "ERIKA" }]);

    expect(result.valid).toBe(false);
    expect(result.reason).toBe("already-guessed");
    expect(getGameBySlugMock).not.toHaveBeenCalled();
  });

  it("returns not-in-word-list when the word is missing from the word list", async () => {
    getGameBySlugMock.mockResolvedValue(GAME);
    loadPuzzleForDateMock.mockResolvedValue(makePuzzle());
    isValidWordMock.mockResolvedValue(false);

    const { evaluateGuessServer } = await import("../puzzle.server");
    const result = await evaluateGuessServer("2026-05-20", "ZZZZZ", []);

    expect(result.valid).toBe(false);
    expect(result.reason).toBe("not-in-word-list");
  });

  it("returns not-in-word-list when no puzzle exists for the date", async () => {
    getGameBySlugMock.mockResolvedValue(GAME);
    loadPuzzleForDateMock.mockResolvedValue(null);

    const { evaluateGuessServer } = await import("../puzzle.server");
    const result = await evaluateGuessServer("2026-05-20", "ERIKA", []);

    expect(result.valid).toBe(false);
    expect(result.reason).toBe("not-in-word-list");
    expect(isValidWordMock).not.toHaveBeenCalled();
  });

  it("evaluates a valid guess and returns per-letter states without the answer", async () => {
    getGameBySlugMock.mockResolvedValue(GAME);
    loadPuzzleForDateMock.mockResolvedValue(makePuzzle({ answer: "ERIKA" }));
    isValidWordMock.mockResolvedValue(true);

    const { evaluateGuessServer } = await import("../puzzle.server");
    const result = await evaluateGuessServer("2026-05-20", "ERIKA", []);

    expect(result.valid).toBe(true);
    expect(result.word).toBe("ERIKA");
    expect(result.states).toEqual(["correct", "correct", "correct", "correct", "correct"]);
    expect(result.isSolved).toBe(true);
    expect(result.isGameOver).toBe(true);
    expect(result.status).toBe("solved");
    expect((result as { answer?: string }).answer).toBeUndefined();
  });

  it("marks the game failed on the sixth valid guess that is not the answer", async () => {
    getGameBySlugMock.mockResolvedValue(GAME);
    loadPuzzleForDateMock.mockResolvedValue(makePuzzle({ answer: "ERIKA" }));
    isValidWordMock.mockResolvedValue(true);

    const { evaluateGuessServer } = await import("../puzzle.server");
    const previous = ["DORIT", "SUTTON", "KATHY", "ERIKA", "TILLY"].map((word) => ({ word }));
    const result = await evaluateGuessServer("2026-05-20", "KYLEE", previous);

    expect(result.valid).toBe(true);
    expect(result.isSolved).toBe(false);
    expect(result.isGameOver).toBe(true);
    expect(result.status).toBe("failed");
  });

  it("keeps the game playing while guesses remain", async () => {
    getGameBySlugMock.mockResolvedValue(GAME);
    loadPuzzleForDateMock.mockResolvedValue(makePuzzle({ answer: "ERIKA" }));
    isValidWordMock.mockResolvedValue(true);

    const { evaluateGuessServer } = await import("../puzzle.server");
    const result = await evaluateGuessServer("2026-05-20", "DORIT", []);

    expect(result.valid).toBe(true);
    expect(result.isSolved).toBe(false);
    expect(result.isGameOver).toBe(false);
    expect(result.status).toBe("playing");
  });
});
