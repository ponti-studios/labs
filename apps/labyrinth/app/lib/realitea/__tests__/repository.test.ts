import { beforeEach, describe, expect, it, vi } from "vitest";

function chain(rows: unknown[]) {
  const thenable: PromiseLike<unknown[]> = {
    then: (onFulfilled) => Promise.resolve(rows).then(onFulfilled),
  };
  const handler: ProxyHandler<object> = {
    get(_target, prop) {
      if (prop === "then") return thenable.then.bind(thenable);
      return () => proxy;
    },
  };
  const proxy: object = new Proxy({}, handler);
  return proxy;
}

const { dbMock, gamesFindFirstMock, tableMocks } = vi.hoisted(() => {
  const gamesFindFirstMock = vi.fn();
  const dbMock = {
    query: { games: { findFirst: gamesFindFirstMock } },
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };
  const tableMocks = {
    games: { id: "games.id", slug: "games.slug" },
    feeds: { id: "feeds.id", url: "feeds.url", active: "feeds.active" },
    feedGames: { feedId: "feedGames.feedId", gameId: "feedGames.gameId" },
    articles: {
      id: "articles.id",
      feedId: "articles.feedId",
      url: "articles.url",
      status: "articles.status",
      publishedAt: "articles.publishedAt",
    },
    dailyPuzzles: {
      id: "dailyPuzzles.id",
      gameId: "dailyPuzzles.gameId",
      articleId: "dailyPuzzles.articleId",
      dateUtc: "dailyPuzzles.dateUtc",
      normalizedAnswer: "dailyPuzzles.normalizedAnswer",
      createdAt: "dailyPuzzles.createdAt",
    },
  };
  return { dbMock, gamesFindFirstMock, tableMocks };
});

vi.mock("@pontistudios/db", () => ({
  and: vi.fn((...args) => ({ type: "and", args })),
  count: vi.fn(() => "count()"),
  db: dbMock,
  desc: vi.fn((col) => ({ type: "desc", col })),
  eq: vi.fn((col, val) => ({ type: "eq", col, val })),
  gte: vi.fn((col, val) => ({ type: "gte", col, val })),
  lt: vi.fn((col, val) => ({ type: "lt", col, val })),
  lte: vi.fn((col, val) => ({ type: "lte", col, val })),
  inArray: vi.fn((col, vals) => ({ type: "inArray", col, vals })),
  games: tableMocks.games,
  feeds: tableMocks.feeds,
  feedGames: tableMocks.feedGames,
  articles: tableMocks.articles,
  dailyPuzzles: tableMocks.dailyPuzzles,
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getGameBySlug", () => {
  it("returns the game row when one exists", async () => {
    const row = { id: 1, slug: "rhobh" };
    gamesFindFirstMock.mockResolvedValue(row);
    const { getGameBySlug } = await import("../repository");
    const result = await getGameBySlug("rhobh");
    expect(result).toEqual(row);
  });

  it("returns null when no game exists", async () => {
    gamesFindFirstMock.mockResolvedValue(undefined);
    const { getGameBySlug } = await import("../repository");
    const result = await getGameBySlug("missing");
    expect(result).toBeNull();
  });
});

describe("loadPuzzleForDate", () => {
  it("joins the puzzle with its source article", async () => {
    const puzzleRow = { id: 1, dateUtc: "2026-06-25", answer: "BRAVO" };
    const articleRow = { id: 9, url: "https://realityblurb.com/a", title: "A" };
    dbMock.select.mockReturnValue(chain([{ puzzle: puzzleRow, article: articleRow }]));
    const { loadPuzzleForDate } = await import("../repository");
    const result = await loadPuzzleForDate(1, "2026-06-25");
    expect(result).toEqual({ ...puzzleRow, article: articleRow });
  });

  it("returns null when no row exists", async () => {
    dbMock.select.mockReturnValue(chain([]));
    const { loadPuzzleForDate } = await import("../repository");
    const result = await loadPuzzleForDate(1, "2026-06-25");
    expect(result).toBeNull();
  });
});

describe("getStoredAnswers", () => {
  it("returns a Set of normalizedAnswer values scoped to the game", async () => {
    const rows = [{ normalizedAnswer: "BRAVO" }, { normalizedAnswer: "DISCO" }];
    dbMock.select.mockReturnValue(chain(rows));
    const { getStoredAnswers } = await import("../repository");
    const result = await getStoredAnswers(1);
    expect(result).toBeInstanceOf(Set);
    expect(result.has("BRAVO")).toBe(true);
    expect(result.has("DISCO")).toBe(true);
  });
});

describe("upsertArticles", () => {
  it("dedupes on url via onConflictDoNothing and returns the inserted count", async () => {
    const insertedRows = [{ id: 1 }];
    const onConflictDoNothing = vi.fn().mockReturnValue({
      returning: vi.fn().mockResolvedValue(insertedRows),
    });
    const values = vi.fn().mockReturnValue({ onConflictDoNothing });
    dbMock.insert.mockReturnValue({ values });

    const { upsertArticles } = await import("../repository");
    const result = await upsertArticles(1, [
      { url: "https://realityblurb.com/a", title: "A" },
      { url: "https://realityblurb.com/a", title: "A duplicate within the same batch" },
    ]);

    expect(onConflictDoNothing).toHaveBeenCalledWith({ target: tableMocks.articles.url });
    expect(result).toBe(1);
  });

  it("returns 0 without querying when given no items", async () => {
    const { upsertArticles } = await import("../repository");
    const result = await upsertArticles(1, []);
    expect(result).toBe(0);
    expect(dbMock.insert).not.toHaveBeenCalled();
  });
});

describe("getExistingDateKeys", () => {
  it("returns date strings from rows scoped to the game", async () => {
    const rows = [{ dateUtc: "2026-06-26" }, { dateUtc: "2026-06-27" }];
    dbMock.select.mockReturnValue(chain(rows));
    const { getExistingDateKeys } = await import("../repository");
    const result = await getExistingDateKeys(1, "2026-06-26", "2026-06-27");
    expect(result).toEqual(["2026-06-26", "2026-06-27"]);
  });
});
