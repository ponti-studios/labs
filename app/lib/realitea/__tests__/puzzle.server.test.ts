import { describe, expect, it, vi } from "vitest";

const {
  getGameBySlugMock,
  loadPuzzleForDateMock,
  loadMostRecentPuzzleMock,
  isValidWordMock,
  loadAttemptMock,
  createAttemptMock,
  appendGuessMock,
  countRecentGuessesMock,
} = vi.hoisted(() => ({
  getGameBySlugMock: vi.fn(),
  loadPuzzleForDateMock: vi.fn(),
  loadMostRecentPuzzleMock: vi.fn(),
  isValidWordMock: vi.fn(),
  loadAttemptMock: vi.fn(),
  createAttemptMock: vi.fn(),
  appendGuessMock: vi.fn(),
  countRecentGuessesMock: vi.fn(),
}));

vi.mock("../repository", () => ({
  getGameBySlug: getGameBySlugMock,
  loadPuzzleForDate: loadPuzzleForDateMock,
  loadMostRecentPuzzle: loadMostRecentPuzzleMock,
  loadAttempt: loadAttemptMock,
  createAttempt: createAttemptMock,
  appendGuess: appendGuessMock,
  countRecentGuesses: countRecentGuessesMock,
}));

vi.mock("../word-list.server", () => ({
  isValidWord: isValidWordMock,
}));

const GAME = { id: 1, slug: "rhobh" };
const USER = { id: "user-1", email: "user@example.com" };

function makePuzzle(
  overrides: Partial<{
    dateUtc: string;
    answer: string;
    normalizedAnswer: string;
    answerType: string;
    clue: string;
    detail: string;
    articleUrl: string;
    articleTitle: string;
  }> = {},
) {
  return {
    id: 1,
    gameId: 1,
    articleId: 100,
    dateUtc: overrides.dateUtc ?? "2026-05-20",
    answer: overrides.answer ?? "ERIKA",
    answerType: overrides.answerType ?? "storyline",
    normalizedAnswer: overrides.normalizedAnswer ?? "ERIKA",
    clue: overrides.clue ?? "The Pretty Mess performer never misses a sharp confessional.",
    detail:
      overrides.detail ?? "Erika Jayne keeps the glam and pop-star energy turned all the way up.",
    createdAt: new Date("2026-05-20T12:00:00.000Z"),
    updatedAt: new Date("2026-05-20T12:00:00.000Z"),
    article: {
      url: overrides.articleUrl ?? "https://example.com/erika",
      title: overrides.articleTitle ?? "Erika story",
      publishedAt: new Date("2026-05-19T12:00:00.000Z"),
    },
  };
}

function makeAttempt(
  overrides: Partial<{
    id: number;
    guesses: { word: string; states: ("absent" | "correct" | "present")[] }[];
    status: "playing" | "solved" | "failed";
  }> = {},
) {
  return {
    id: overrides.id ?? 10,
    hominemUserId: USER.id,
    gameId: GAME.id,
    dateUtc: "2026-05-20",
    guesses: overrides.guesses ?? [],
    guessedAt: (overrides.guesses ?? []).map(() => new Date().toISOString()),
    status: overrides.status ?? "playing",
    createdAt: new Date(),
    updatedAt: new Date(),
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
    const result = await evaluateGuessServer("2026-05-20", "ABC", null, 0);

    expect(result.valid).toBe(false);
    expect(result.reason).toBe("wrong-length");
    expect(result.word).toBe("ABC");
    expect(getGameBySlugMock).not.toHaveBeenCalled();
  });

  it("returns not-in-word-list when the word is missing from the word list", async () => {
    getGameBySlugMock.mockResolvedValue(GAME);
    loadPuzzleForDateMock.mockResolvedValue(makePuzzle());
    isValidWordMock.mockResolvedValue(false);

    const { evaluateGuessServer } = await import("../puzzle.server");
    const result = await evaluateGuessServer("2026-05-20", "ZZZZZ", null, 0);

    expect(result.valid).toBe(false);
    expect(result.reason).toBe("not-in-word-list");
  });

  it("returns not-in-word-list when no puzzle exists for the date", async () => {
    getGameBySlugMock.mockResolvedValue(GAME);
    loadPuzzleForDateMock.mockResolvedValue(null);

    const { evaluateGuessServer } = await import("../puzzle.server");
    const result = await evaluateGuessServer("2026-05-20", "ERIKA", null, 0);

    expect(result.valid).toBe(false);
    expect(result.reason).toBe("not-in-word-list");
    expect(isValidWordMock).not.toHaveBeenCalled();
  });

  describe("anonymous players", () => {
    it("evaluates a first guess without persisting anything", async () => {
      getGameBySlugMock.mockResolvedValue(GAME);
      loadPuzzleForDateMock.mockResolvedValue(makePuzzle({ answer: "ERIKA" }));
      isValidWordMock.mockResolvedValue(true);

      const { evaluateGuessServer } = await import("../puzzle.server");
      const result = await evaluateGuessServer("2026-05-20", "DORIT", null, 0);

      expect(result.valid).toBe(true);
      expect(result.isGameOver).toBe(true);
      expect(result.authRequired).toBe(true);
      expect(createAttemptMock).not.toHaveBeenCalled();
      expect(appendGuessMock).not.toHaveBeenCalled();
    });

    it("does not require auth when the free guess solves the puzzle", async () => {
      getGameBySlugMock.mockResolvedValue(GAME);
      loadPuzzleForDateMock.mockResolvedValue(makePuzzle({ answer: "ERIKA" }));
      isValidWordMock.mockResolvedValue(true);

      const { evaluateGuessServer } = await import("../puzzle.server");
      const result = await evaluateGuessServer("2026-05-20", "ERIKA", null, 0);

      expect(result.valid).toBe(true);
      expect(result.isSolved).toBe(true);
      expect(result.authRequired).toBe(false);
    });

    it("rejects a second guess with auth-required, without scoring it", async () => {
      getGameBySlugMock.mockResolvedValue(GAME);
      loadPuzzleForDateMock.mockResolvedValue(makePuzzle({ answer: "ERIKA" }));

      const { evaluateGuessServer } = await import("../puzzle.server");
      const result = await evaluateGuessServer("2026-05-20", "DORIT", null, 1);

      expect(result.valid).toBe(false);
      expect(result.reason).toBe("auth-required");
      expect(result.authRequired).toBe(true);
      expect(isValidWordMock).not.toHaveBeenCalled();
    });
  });

  describe("authenticated players", () => {
    it("creates an attempt and persists the first guess", async () => {
      getGameBySlugMock.mockResolvedValue(GAME);
      loadPuzzleForDateMock.mockResolvedValue(makePuzzle({ answer: "ERIKA" }));
      isValidWordMock.mockResolvedValue(true);
      loadAttemptMock.mockResolvedValue(null);
      countRecentGuessesMock.mockResolvedValue(0);
      createAttemptMock.mockResolvedValue(makeAttempt({ guesses: [] }));

      const { evaluateGuessServer } = await import("../puzzle.server");
      const result = await evaluateGuessServer("2026-05-20", "DORIT", USER, 0);

      expect(result.valid).toBe(true);
      expect(result.status).toBe("playing");
      expect(result.remainingGuesses).toBe(5);
      expect(createAttemptMock).toHaveBeenCalledWith(USER.id, GAME.id, "2026-05-20");
      expect(appendGuessMock).toHaveBeenCalledWith(
        10,
        { word: "DORIT", states: expect.any(Array) },
        "playing",
      );
    });

    it("solves the puzzle and marks the attempt solved", async () => {
      getGameBySlugMock.mockResolvedValue(GAME);
      loadPuzzleForDateMock.mockResolvedValue(makePuzzle({ answer: "ERIKA" }));
      isValidWordMock.mockResolvedValue(true);
      loadAttemptMock.mockResolvedValue(makeAttempt({ guesses: [] }));
      countRecentGuessesMock.mockResolvedValue(0);

      const { evaluateGuessServer } = await import("../puzzle.server");
      const result = await evaluateGuessServer("2026-05-20", "ERIKA", USER, 0);

      expect(result.valid).toBe(true);
      expect(result.isSolved).toBe(true);
      expect(result.isGameOver).toBe(true);
      expect(result.status).toBe("solved");
      expect(createAttemptMock).not.toHaveBeenCalled();
    });

    it("marks the attempt failed on the sixth non-answer guess", async () => {
      getGameBySlugMock.mockResolvedValue(GAME);
      loadPuzzleForDateMock.mockResolvedValue(makePuzzle({ answer: "ERIKA" }));
      isValidWordMock.mockResolvedValue(true);
      const priorGuesses = ["DORIT", "SUTTON", "KATHY", "SHEREE", "TILLY"].map((word) => ({
        word,
        states: ["absent", "absent", "absent", "absent", "absent"] as (
          | "absent"
          | "present"
          | "correct"
        )[],
      }));
      loadAttemptMock.mockResolvedValue(makeAttempt({ guesses: priorGuesses }));
      countRecentGuessesMock.mockResolvedValue(0);

      const { evaluateGuessServer } = await import("../puzzle.server");
      const result = await evaluateGuessServer("2026-05-20", "KYLEE", USER, 0);

      expect(result.valid).toBe(true);
      expect(result.isSolved).toBe(false);
      expect(result.isGameOver).toBe(true);
      expect(result.status).toBe("failed");
      expect(result.remainingGuesses).toBe(0);
    });

    it("rejects a duplicate guess against the persisted attempt, not the client", async () => {
      getGameBySlugMock.mockResolvedValue(GAME);
      loadPuzzleForDateMock.mockResolvedValue(makePuzzle({ answer: "ERIKA" }));
      loadAttemptMock.mockResolvedValue(
        makeAttempt({ guesses: [{ word: "DORIT", states: ["absent"] as never }] }),
      );
      countRecentGuessesMock.mockResolvedValue(0);

      const { evaluateGuessServer } = await import("../puzzle.server");
      const result = await evaluateGuessServer("2026-05-20", "DORIT", USER, 0);

      expect(result.valid).toBe(false);
      expect(result.reason).toBe("already-guessed");
      expect(isValidWordMock).not.toHaveBeenCalled();
    });

    it("rejects further guesses once the attempt is no longer playing", async () => {
      getGameBySlugMock.mockResolvedValue(GAME);
      loadPuzzleForDateMock.mockResolvedValue(makePuzzle({ answer: "ERIKA" }));
      loadAttemptMock.mockResolvedValue(makeAttempt({ status: "solved" }));

      const { evaluateGuessServer } = await import("../puzzle.server");
      const result = await evaluateGuessServer("2026-05-20", "DORIT", USER, 0);

      expect(result.valid).toBe(false);
      expect(result.reason).toBe("game-over");
      expect(result.isGameOver).toBe(true);
      expect(countRecentGuessesMock).not.toHaveBeenCalled();
    });

    it("rejects guesses once the per-minute rate limit is hit", async () => {
      getGameBySlugMock.mockResolvedValue(GAME);
      loadPuzzleForDateMock.mockResolvedValue(makePuzzle({ answer: "ERIKA" }));
      loadAttemptMock.mockResolvedValue(null);
      countRecentGuessesMock.mockResolvedValue(10);

      const { evaluateGuessServer } = await import("../puzzle.server");
      const result = await evaluateGuessServer("2026-05-20", "DORIT", USER, 0);

      expect(result.valid).toBe(false);
      expect(result.reason).toBe("rate-limited");
      expect(isValidWordMock).not.toHaveBeenCalled();
      expect(createAttemptMock).not.toHaveBeenCalled();
    });
  });
});
