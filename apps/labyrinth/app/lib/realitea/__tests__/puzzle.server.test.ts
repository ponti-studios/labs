import { beforeEach, describe, expect, it, vi } from "vitest";

function chain(rows: unknown[]) {
  const handler: ProxyHandler<object> = {
    get(_target, prop) {
      if (prop === "then") {
        return (
          onFulfilled: (value: unknown[]) => unknown,
          onRejected?: (reason: unknown) => unknown,
        ) => Promise.resolve(rows).then(onFulfilled, onRejected);
      }
      return () => proxy;
    },
  };
  const proxy: object = new Proxy({}, handler);
  return proxy;
}

function createSelectResponder(queue: unknown[][]) {
  return vi.fn(() => chain(queue.shift() ?? []));
}

const { dbMock, gamesFindFirstMock, safeParseMock } = vi.hoisted(() => {
  const gamesFindFirstMock = vi.fn();

  const dbMock = {
    delete: vi.fn(),
    insert: vi.fn(),
    query: {
      games: {
        findFirst: gamesFindFirstMock,
      },
    },
    select: vi.fn(),
    transaction: vi.fn(),
    update: vi.fn(),
  };

  const safeParseMock = vi.fn();

  return { dbMock, gamesFindFirstMock, safeParseMock };
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
  games: { id: "games.id", slug: "games.slug" },
  articles: { id: "articles.id" },
  dailyPuzzles: { id: "dailyPuzzles.id", gameId: "dailyPuzzles.gameId" },
}));

vi.mock("../../server/env", () => ({
  LabyrinthServerEnv: {
    safeParse: safeParseMock,
  },
}));

vi.mock("../../word-list.server", () => ({
  isValidWord: isValidWordMock,
}));

const GAME = { id: 1, slug: "rhobh" };

const TODAY_PUZZLE_ROW = {
  answer: "ERIKA",
  answerType: "storyline",
  clue: "The Pretty Mess performer never misses a sharp confessional.",
  createdAt: new Date("2026-05-20T12:00:00.000Z"),
  dateUtc: "2026-05-20",
  detail:
    "Erika Jayne keeps the glam, the one-liners, and the pop-star energy turned all the way up.",
  id: 1,
  gameId: 1,
  articleId: 100,
  normalizedAnswer: "ERIKA",
  updatedAt: new Date("2026-05-20T12:00:00.000Z"),
};

const TODAY_ARTICLE_ROW = {
  id: 100,
  url: "https://realityblurb.com/erika",
  title: "Erika story",
  publishedAt: new Date("2026-05-19T12:00:00.000Z"),
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
    gamesFindFirstMock.mockReset();
    gamesFindFirstMock.mockResolvedValue(GAME);
    vi.unstubAllGlobals();
  });

  it("loads today's puzzle when one exists", async () => {
    dbMock.select.mockImplementation(
      createSelectResponder([[{ puzzle: TODAY_PUZZLE_ROW, article: TODAY_ARTICLE_ROW }]]),
    );

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
      gameId: 1,
      articleId: 101,
      normalizedAnswer: "DRAMA",
      updatedAt: new Date("2026-05-19T12:00:00.000Z"),
    };
    const recentArticle = {
      id: 101,
      url: "https://realityblurb.com/drama",
      title: "Drama story",
      publishedAt: new Date("2026-05-18T12:00:00.000Z"),
    };

    // Call sequence: (1) loadPuzzleForDate for today (empty), (2) loadMostRecentPuzzle
    dbMock.select.mockImplementation(
      createSelectResponder([[], [{ puzzle: recentPuzzle, article: recentArticle }]]),
    );

    const { loadActivePublicPuzzle } = await import("../puzzle.server");
    const envelope = await loadActivePublicPuzzle(new Date("2026-05-20T12:00:00.000Z"));

    expect(envelope?.puzzle.dateKey).toBe("2026-05-19");
    expect(envelope?.puzzle.answerType).toBe("moment");
  });

  it("returns null when no puzzle exists at all", async () => {
    dbMock.select.mockImplementation(createSelectResponder([[], []]));

    const { loadActivePublicPuzzle } = await import("../puzzle.server");
    const envelope = await loadActivePublicPuzzle(new Date("2026-05-20T12:00:00.000Z"));

    expect(envelope).toBeNull();
  });
});

describe("evaluateGuessServer", () => {
  beforeEach(() => {
    isValidWordMock.mockReset();
    dbMock.select.mockReset();
    gamesFindFirstMock.mockReset();
    gamesFindFirstMock.mockResolvedValue(GAME);
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
    const { evaluateGuessServer } = await import("../puzzle.server");
    const result = await evaluateGuessServer("2026-05-20", "ERIKA", [{ word: "ERIKA" }]);
    expect(result.valid).toBe(false);
    expect(result.reason).toBe("already-guessed");
    expect(isValidWordMock).not.toHaveBeenCalled();
  });

  it("returns not-in-word-list when the word is missing", async () => {
    isValidWordMock.mockResolvedValue(false);
    dbMock.select.mockImplementation(
      createSelectResponder([[{ puzzle: TODAY_PUZZLE_ROW, article: TODAY_ARTICLE_ROW }]]),
    );
    const { evaluateGuessServer } = await import("../puzzle.server");
    const result = await evaluateGuessServer("2026-05-20", "ZZZZZ", []);
    expect(result.valid).toBe(false);
    expect(result.reason).toBe("not-in-word-list");
  });

  it("returns not-in-word-list when no puzzle exists for the date", async () => {
    isValidWordMock.mockResolvedValue(true);
    dbMock.select.mockImplementation(createSelectResponder([[], []]));
    const { evaluateGuessServer } = await import("../puzzle.server");
    const result = await evaluateGuessServer("2026-05-20", "ERIKA", []);
    expect(result.valid).toBe(false);
    expect(result.reason).toBe("not-in-word-list");
    expect(isValidWordMock).not.toHaveBeenCalled();
  });

  it("evaluates a valid guess and returns per-letter states without the answer", async () => {
    isValidWordMock.mockResolvedValue(true);
    dbMock.select.mockImplementation(
      createSelectResponder([[{ puzzle: TODAY_PUZZLE_ROW, article: TODAY_ARTICLE_ROW }]]),
    );
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
    dbMock.select.mockImplementation(
      createSelectResponder([[{ puzzle: TODAY_PUZZLE_ROW, article: TODAY_ARTICLE_ROW }]]),
    );
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
    dbMock.select.mockImplementation(
      createSelectResponder([[{ puzzle: TODAY_PUZZLE_ROW, article: TODAY_ARTICLE_ROW }]]),
    );
    const { evaluateGuessServer } = await import("../puzzle.server");
    const result = await evaluateGuessServer("2026-05-20", "DORIT", []);
    expect(result.valid).toBe(true);
    expect(result.isSolved).toBe(false);
    expect(result.isGameOver).toBe(false);
    expect(result.status).toBe("playing");
  });
});
