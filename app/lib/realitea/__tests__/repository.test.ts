import { articles, dailyPuzzles, db, feeds, games } from "~/lib/server/db";
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
