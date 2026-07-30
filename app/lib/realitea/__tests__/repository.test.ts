import { articles, dailyPuzzles, db, feeds, games, realiteaAttempts } from "~/lib/server/db";
import { beforeEach, describe, expect, it } from "vitest";
import { cleanAll } from "../../../data/test-db";

beforeEach(async () => {
  await cleanAll();
});

describe("getGameBySlug", () => {
  it("returns the game row when one exists", async () => {
    const [game] = await db
      .insert(games)
      .values({ slug: "rhobh", name: "RHOBH", systemPromptPath: "prompts/rhobh.txt" })
      .returning();
    const { getGameBySlug } = await import("../repository");
    const result = await getGameBySlug("rhobh");
    expect(result).toEqual(game);
  });

  it("returns null when no game exists", async () => {
    const { getGameBySlug } = await import("../repository");
    const result = await getGameBySlug("missing");
    expect(result).toBeNull();
  });
});

describe("loadPuzzleForDate", () => {
  it("joins the puzzle with its source article", async () => {
    const [game] = await db
      .insert(games)
      .values({ slug: "rhobh", name: "RHOBH", systemPromptPath: "prompts/rhobh.txt" })
      .returning();
    const [feed] = await db
      .insert(feeds)
      .values({ url: "https://example.com/feed", label: "Test Feed" })
      .returning();
    const [article] = await db
      .insert(articles)
      .values({ feedId: feed.id, url: "https://example.com/a", title: "Article A" })
      .returning();
    const [puzzle] = await db
      .insert(dailyPuzzles)
      .values({
        gameId: game.id,
        articleId: article.id,
        dateUtc: "2026-06-25",
        answer: "BRAVO",
        answerType: "storyline",
        normalizedAnswer: "BRAVO",
        clue: "Clue text",
        detail: "Detail text",
      })
      .returning();

    const { loadPuzzleForDate } = await import("../repository");
    const result = await loadPuzzleForDate(game.id, "2026-06-25");

    expect(result).toBeDefined();
    expect(result!.id).toBe(puzzle.id);
    expect(result!.answer).toBe("BRAVO");
    expect(result!.article).toBeDefined();
    expect(result!.article.url).toBe("https://example.com/a");
  });

  it("returns null when no puzzle exists for the date", async () => {
    const { loadPuzzleForDate } = await import("../repository");
    const result = await loadPuzzleForDate(999, "2026-06-25");
    expect(result).toBeNull();
  });
});

describe("getStoredAnswers", () => {
  it("returns a Set of normalizedAnswer values scoped to the game", async () => {
    const [game] = await db
      .insert(games)
      .values({ slug: "rhobh", name: "RHOBH", systemPromptPath: "prompts/rhobh.txt" })
      .returning();
    const [feed] = await db
      .insert(feeds)
      .values({ url: "https://example.com/feed", label: "Test Feed" })
      .returning();
    const [a1] = await db
      .insert(articles)
      .values({ feedId: feed.id, url: "https://example.com/1", title: "One" })
      .returning();
    const [a2] = await db
      .insert(articles)
      .values({ feedId: feed.id, url: "https://example.com/2", title: "Two" })
      .returning();
    await db.insert(dailyPuzzles).values({
      gameId: game.id,
      articleId: a1.id,
      dateUtc: "2026-06-25",
      answer: "BRAVO",
      answerType: "storyline",
      normalizedAnswer: "BRAVO",
      clue: "c1",
      detail: "d1",
    });
    await db.insert(dailyPuzzles).values({
      gameId: game.id,
      articleId: a2.id,
      dateUtc: "2026-06-26",
      answer: "DISCO",
      answerType: "place",
      normalizedAnswer: "DISCO",
      clue: "c2",
      detail: "d2",
    });

    const { getStoredAnswers } = await import("../repository");
    const result = await getStoredAnswers(game.id);

    expect(result).toBeInstanceOf(Set);
    expect(result.has("BRAVO")).toBe(true);
    expect(result.has("DISCO")).toBe(true);
  });
});

describe("upsertArticles", () => {
  it("dedupes on url via onConflictDoNothing and returns the inserted count", async () => {
    const [feed] = await db
      .insert(feeds)
      .values({ url: "https://example.com/feed", label: "Test Feed" })
      .returning();

    const { upsertArticles } = await import("../repository");
    const result = await upsertArticles(feed.id, [
      { url: "https://example.com/a", title: "A" },
      { url: "https://example.com/a", title: "A duplicate" },
    ]);

    expect(result).toBe(1);
  });

  it("returns 0 without querying when given no items", async () => {
    const { upsertArticles } = await import("../repository");
    const result = await upsertArticles(1, []);
    expect(result).toBe(0);
  });
});

describe("getExistingDateKeys", () => {
  it("returns date strings from rows scoped to the game", async () => {
    const [game] = await db
      .insert(games)
      .values({ slug: "rhobh", name: "RHOBH", systemPromptPath: "prompts/rhobh.txt" })
      .returning();
    const [feed] = await db
      .insert(feeds)
      .values({ url: "https://example.com/feed", label: "Test Feed" })
      .returning();
    const [a1] = await db
      .insert(articles)
      .values({ feedId: feed.id, url: "https://example.com/1", title: "One" })
      .returning();
    const [a2] = await db
      .insert(articles)
      .values({ feedId: feed.id, url: "https://example.com/2", title: "Two" })
      .returning();
    await db.insert(dailyPuzzles).values({
      gameId: game.id,
      articleId: a1.id,
      dateUtc: "2026-06-26",
      answer: "BRAVO",
      answerType: "storyline",
      normalizedAnswer: "BRAVO",
      clue: "c1",
      detail: "d1",
    });
    await db.insert(dailyPuzzles).values({
      gameId: game.id,
      articleId: a2.id,
      dateUtc: "2026-06-27",
      answer: "DISCO",
      answerType: "place",
      normalizedAnswer: "DISCO",
      clue: "c2",
      detail: "d2",
    });

    const { getExistingDateKeys } = await import("../repository");
    const result = await getExistingDateKeys(game.id, "2026-06-26", "2026-06-27");

    expect(result).toEqual(["2026-06-26", "2026-06-27"]);
  });
});

async function seedGameWithPuzzles(dateKeys: string[]) {
  const [game] = await db
    .insert(games)
    .values({ slug: "rhobh", name: "RHOBH", systemPromptPath: "prompts/rhobh.txt" })
    .returning();
  const [feed] = await db
    .insert(feeds)
    .values({ url: "https://example.com/feed", label: "Test Feed" })
    .returning();

  for (const dateKey of dateKeys) {
    const [article] = await db
      .insert(articles)
      .values({ feedId: feed.id, url: `https://example.com/${dateKey}`, title: dateKey })
      .returning();
    await db.insert(dailyPuzzles).values({
      gameId: game.id,
      articleId: article.id,
      dateUtc: dateKey,
      answer: "BRAVO",
      answerType: "storyline",
      normalizedAnswer: "BRAVO",
      clue: `clue for ${dateKey}`,
      detail: `detail for ${dateKey}`,
    });
  }

  return game;
}

describe("listAttemptsForUser", () => {
  it("returns a page of attempts newest date first, joined with their puzzle", async () => {
    const game = await seedGameWithPuzzles(["2026-06-25", "2026-06-26", "2026-06-27"]);
    await db.insert(realiteaAttempts).values([
      { hominemUserId: "user-1", gameId: game.id, dateUtc: "2026-06-25", status: "solved" },
      { hominemUserId: "user-1", gameId: game.id, dateUtc: "2026-06-26", status: "failed" },
      { hominemUserId: "user-1", gameId: game.id, dateUtc: "2026-06-27", status: "playing" },
    ]);

    const { listAttemptsForUser } = await import("../repository");
    const result = await listAttemptsForUser("user-1", game.id, { page: 1, pageSize: 20 });

    expect(result.total).toBe(3);
    expect(result.rows.map((r) => r.attempt.dateUtc)).toEqual([
      "2026-06-27",
      "2026-06-26",
      "2026-06-25",
    ]);
    expect(result.rows[0].puzzle.clue).toBe("clue for 2026-06-27");
  });

  it("paginates via LIMIT/OFFSET", async () => {
    const game = await seedGameWithPuzzles(["2026-06-25", "2026-06-26", "2026-06-27"]);
    await db.insert(realiteaAttempts).values([
      { hominemUserId: "user-1", gameId: game.id, dateUtc: "2026-06-25", status: "solved" },
      { hominemUserId: "user-1", gameId: game.id, dateUtc: "2026-06-26", status: "solved" },
      { hominemUserId: "user-1", gameId: game.id, dateUtc: "2026-06-27", status: "solved" },
    ]);

    const { listAttemptsForUser } = await import("../repository");
    const page1 = await listAttemptsForUser("user-1", game.id, { page: 1, pageSize: 2 });
    const page2 = await listAttemptsForUser("user-1", game.id, { page: 2, pageSize: 2 });

    expect(page1.rows.map((r) => r.attempt.dateUtc)).toEqual(["2026-06-27", "2026-06-26"]);
    expect(page2.rows.map((r) => r.attempt.dateUtc)).toEqual(["2026-06-25"]);
    expect(page1.total).toBe(3);
    expect(page2.total).toBe(3);
  });

  it("never leaks another user's attempts", async () => {
    const game = await seedGameWithPuzzles(["2026-06-25"]);
    await db.insert(realiteaAttempts).values([
      { hominemUserId: "user-1", gameId: game.id, dateUtc: "2026-06-25", status: "solved" },
      { hominemUserId: "user-2", gameId: game.id, dateUtc: "2026-06-25", status: "solved" },
    ]);

    const { listAttemptsForUser } = await import("../repository");
    const result = await listAttemptsForUser("user-1", game.id, { page: 1, pageSize: 20 });

    expect(result.total).toBe(1);
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].attempt.hominemUserId).toBe("user-1");
  });
});

describe("loadAllAttemptsForUser", () => {
  it("returns every attempt for the user, unpaginated, newest date first", async () => {
    const game = await seedGameWithPuzzles(["2026-06-25", "2026-06-26", "2026-06-27"]);
    await db.insert(realiteaAttempts).values([
      { hominemUserId: "user-1", gameId: game.id, dateUtc: "2026-06-25", status: "solved" },
      { hominemUserId: "user-1", gameId: game.id, dateUtc: "2026-06-26", status: "failed" },
      { hominemUserId: "user-1", gameId: game.id, dateUtc: "2026-06-27", status: "playing" },
    ]);

    const { loadAllAttemptsForUser } = await import("../repository");
    const result = await loadAllAttemptsForUser("user-1", game.id);

    expect(result.map((r) => r.dateUtc)).toEqual(["2026-06-27", "2026-06-26", "2026-06-25"]);
  });

  it("returns an empty array when the user has no attempts", async () => {
    const game = await seedGameWithPuzzles([]);

    const { loadAllAttemptsForUser } = await import("../repository");
    const result = await loadAllAttemptsForUser("user-1", game.id);

    expect(result).toEqual([]);
  });
});
