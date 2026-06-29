import { beforeEach, describe, expect, it, vi } from "vitest";

const { dbMock, findFirstMock, safeParseMock, rhobhDailyPuzzlesMock } = vi.hoisted(() => {
  const findFirstMock = vi.fn();

  const dbMock = {
    delete: vi.fn(),
    insert: vi.fn(),
    query: {
      rhobhDailyPuzzles: {
        findFirst: findFirstMock,
      },
    },
    select: vi.fn(),
    transaction: vi.fn(),
    update: vi.fn(),
  };

  const rhobhDailyPuzzlesMock = {
    createdAt: "createdAt",
    dateUtc: "dateUtc",
    id: "id",
    normalizedAnswer: "normalizedAnswer",
  };

  const safeParseMock = vi.fn();

  return { dbMock, findFirstMock, rhobhDailyPuzzlesMock, safeParseMock };
});

const isValidWordMock = vi.fn();

vi.mock("@pontistudios/db", () => ({
  and: vi.fn(),
  db: dbMock,
  desc: vi.fn(),
  eq: vi.fn(),
  gt: vi.fn(),
  gte: vi.fn(),
  inArray: vi.fn(),
  lte: vi.fn(),
  rhobhDailyPuzzles: rhobhDailyPuzzlesMock,
}));

vi.mock("../../server/env", () => ({
  LabyrinthServerEnv: {
    safeParse: safeParseMock,
  },
}));

vi.mock("../../word-list.server", () => ({
  isValidWord: isValidWordMock,
}));

function createSelectResponder(queue: unknown[][]) {
  return vi.fn(() => ({
    from: () => ({
      where: () => {
        const result = queue.shift() ?? [];
        return {
          orderBy: () => ({
            limit: async () => result,
          }),
          // oxlint-disable-next-line unicorn/no-thenable
          then: (resolve: (value: unknown[]) => unknown, reject?: (reason: unknown) => unknown) =>
            Promise.resolve(result).then(resolve, reject),
        };
      },
    }),
  }));
}

const TODAY_PUZZLE_ROW = {
  answer: "ERIKA",
  answerType: "storyline",
  clue: "The Pretty Mess performer never misses a sharp confessional.",
  createdAt: new Date("2026-05-20T12:00:00.000Z"),
  dateUtc: "2026-05-20",
  detail:
    "Erika Jayne keeps the glam, the one-liners, and the pop-star energy turned all the way up.",
  id: 1,
  normalizedAnswer: "ERIKA",
  sources: [],
  updatedAt: new Date("2026-05-20T12:00:00.000Z"),
};

describe("realitea daily puzzle server helpers", () => {
  beforeEach(() => {
    safeParseMock.mockReset();
    safeParseMock.mockReturnValue({ success: false });
    dbMock.delete.mockReset();
    dbMock.insert.mockReset();
    dbMock.select.mockReset();
    dbMock.transaction.mockReset();
    dbMock.update.mockReset();
    vi.unstubAllGlobals();
  });

  it("loads today's puzzle when one exists", async () => {
    findFirstMock.mockResolvedValue(TODAY_PUZZLE_ROW);

    const { loadActivePublicPuzzle } = await import("../puzzle.server");
    const envelope = await loadActivePublicPuzzle(new Date("2026-05-20T12:00:00.000Z"));

    expect(envelope?.puzzle.dateKey).toBe("2026-05-20");
    expect(envelope?.puzzle.answerType).toBe("storyline");
    expect(envelope?.puzzle.clue).toBe(
      "The Pretty Mess performer never misses a sharp confessional.",
    );
  });

  it("falls back to the most recent puzzle when today's puzzle doesn't exist", async () => {
    const recentPuzzle = {
      answer: "DRAMA",
      answerType: "moment",
      clue: "A clash that keeps the whole cast spinning.",
      createdAt: new Date("2026-05-19T12:00:00.000Z"),
      dateUtc: "2026-05-19",
      detail: "A single conflict can dominate the full episode and aftermath.",
      id: 7,
      normalizedAnswer: "DRAMA",
      sources: [],
      updatedAt: new Date("2026-05-19T12:00:00.000Z"),
    };

    // Call sequence: (1) getPuzzleForDate for today (null), (2) findFirst for most recent
    findFirstMock.mockResolvedValueOnce(null).mockResolvedValueOnce(recentPuzzle);

    const { loadActivePublicPuzzle } = await import("../puzzle.server");
    const envelope = await loadActivePublicPuzzle(new Date("2026-05-20T12:00:00.000Z"));

    expect(envelope?.puzzle.dateKey).toBe("2026-05-19");
    expect(envelope?.puzzle.answerType).toBe("moment");
  });

  it("returns null when no puzzle exists at all", async () => {
    findFirstMock.mockResolvedValue(null);

    const { loadActivePublicPuzzle } = await import("../puzzle.server");
    const envelope = await loadActivePublicPuzzle(new Date("2026-05-20T12:00:00.000Z"));

    expect(envelope).toBeNull();
  });
});

describe("evaluateGuessServer", () => {
  beforeEach(() => {
    isValidWordMock.mockReset();
    findFirstMock.mockReset();
    dbMock.select.mockReset();
  });

  it("rejects a word that is not the answer length", async () => {
    const { evaluateGuessServer } = await import("../puzzle.server");
    const result = await evaluateGuessServer("2026-05-20", "ABC", []);
    expect(result.valid).toBe(false);
    expect(result.reason).toBe("wrong-length");
    expect(result.word).toBe("ABC");
  });

  it("rejects an already-guessed word before touching the database", async () => {
    isValidWordMock.mockResolvedValue(true);
    dbMock.select.mockImplementation(createSelectResponder([[TODAY_PUZZLE_ROW]]));
    const { evaluateGuessServer } = await import("../puzzle.server");
    const result = await evaluateGuessServer("2026-05-20", "ERIKA", [{ word: "ERIKA" }]);
    expect(result.valid).toBe(false);
    expect(result.reason).toBe("already-guessed");
    expect(isValidWordMock).not.toHaveBeenCalled();
  });

  it("returns not-in-word-list when the word is missing", async () => {
    isValidWordMock.mockResolvedValue(false);
    findFirstMock.mockResolvedValue(TODAY_PUZZLE_ROW);
    const { evaluateGuessServer } = await import("../puzzle.server");
    const result = await evaluateGuessServer("2026-05-20", "ZZZZZ", []);
    expect(result.valid).toBe(false);
    expect(result.reason).toBe("not-in-word-list");
  });

  it("returns not-in-word-list when no puzzle exists for the date", async () => {
    isValidWordMock.mockResolvedValue(true);
    findFirstMock.mockResolvedValue(null);
    const { evaluateGuessServer } = await import("../puzzle.server");
    const result = await evaluateGuessServer("2026-05-20", "ERIKA", []);
    expect(result.valid).toBe(false);
    expect(result.reason).toBe("not-in-word-list");
    expect(isValidWordMock).not.toHaveBeenCalled();
  });

  it("evaluates a valid guess and returns per-letter states without the answer", async () => {
    isValidWordMock.mockResolvedValue(true);
    findFirstMock.mockResolvedValue(TODAY_PUZZLE_ROW);
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
    isValidWordMock.mockResolvedValue(true);
    findFirstMock.mockResolvedValue(TODAY_PUZZLE_ROW);
    const { evaluateGuessServer } = await import("../puzzle.server");
    const previous = ["DORIT", "SUTTON", "KATHY", "ERIKA", "TILLY"].map((word) => ({
      word,
    }));
    const result = await evaluateGuessServer("2026-05-20", "KYLEE", previous);
    expect(result.valid).toBe(true);
    expect(result.isSolved).toBe(false);
    expect(result.isGameOver).toBe(true);
    expect(result.status).toBe("failed");
  });

  it("keeps the game playing while guesses remain", async () => {
    isValidWordMock.mockResolvedValue(true);
    findFirstMock.mockResolvedValue(TODAY_PUZZLE_ROW);
    const { evaluateGuessServer } = await import("../puzzle.server");
    const result = await evaluateGuessServer("2026-05-20", "DORIT", []);
    expect(result.valid).toBe(true);
    expect(result.isSolved).toBe(false);
    expect(result.isGameOver).toBe(false);
    expect(result.status).toBe("playing");
  });
});
