import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { articles, db, gamesPuzzles, gamesTopics, generationRuns } from "~/lib/server/db";
import { cleanAll } from "../../../data/test-db";
import { assertPreviewFeedUrl, expireGenerationRuns, reapStaleGenerationRuns } from "../admin/preview";
import { matchArticle } from "../generation/generate.server";

const PREVIEW_SOURCE = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "../admin/preview.ts"),
  "utf-8",
);

describe("preview isolation", () => {
  it("does not call inventory-mutating generate helpers", () => {
    expect(PREVIEW_SOURCE).not.toMatch(/\bdeletePuzzlesFromDate\b/);
    expect(PREVIEW_SOURCE).not.toMatch(/\bdeletePuzzlesInRange\b/);
    expect(PREVIEW_SOURCE).not.toMatch(/\bmarkArticleUsed\b/);
    expect(PREVIEW_SOURCE).not.toMatch(/\brecordArticleRejection\b/);
    expect(PREVIEW_SOURCE).not.toMatch(/\bgeneratePuzzleForGame\b/);
  });
});

describe("assertPreviewFeedUrl", () => {
  const originalEnv = process.env.NODE_ENV;
  const originalRailway = process.env.RAILWAY_ENVIRONMENT;

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
    if (originalRailway === undefined) delete process.env.RAILWAY_ENVIRONMENT;
    else process.env.RAILWAY_ENVIRONMENT = originalRailway;
  });

  it("rejects http, loopback, and link-local metadata hosts", async () => {
    await expect(assertPreviewFeedUrl("http://127.0.0.1/feed")).resolves.toMatchObject({
      ok: false,
      code: "HTTP_NOT_ALLOWED",
    });
    await expect(assertPreviewFeedUrl("https://127.0.0.1/feed")).resolves.toMatchObject({
      ok: false,
      code: "PRIVATE_HOST",
    });
    await expect(assertPreviewFeedUrl("https://169.254.169.254/latest/meta-data")).resolves.toMatchObject({
      ok: false,
      code: "PRIVATE_HOST",
    });
  });

  it("rejects an unknown https host in production", async () => {
    process.env.RAILWAY_ENVIRONMENT = "production";
    await expect(assertPreviewFeedUrl("https://evil.example/feed")).resolves.toMatchObject({
      ok: false,
      code: "HOST_NOT_ALLOWED",
    });
  });

  it("allows an arbitrary https host outside production", async () => {
    process.env.NODE_ENV = "test";
    delete process.env.RAILWAY_ENVIRONMENT;
    await expect(assertPreviewFeedUrl("https://example.com/feed")).resolves.toEqual({
      ok: true,
      href: "https://example.com/feed",
    });
  });
});

describe("matchArticle", () => {
  it("marks only source URLs from the offered batch", () => {
    const pending = [
      {
        id: 9,
        url: "https://realityblurb.com/story",
      },
    ] as Array<{ id: number; url: string }>;
    const matched = matchArticle(
      {
        answer: "Aspen",
        answerType: "place",
        clue: "A snowy destination tied to a chaotic cast trip.",
        detail: "The trip became shorthand for off-camera accusations and fallout.",
        sources: [{ url: "https://realityblurb.com/story", title: "Tea", publishedAt: "" }],
      },
      pending as never,
    );
    const unmatched = matchArticle(
      {
        answer: "Aspen",
        answerType: "place",
        clue: "A snowy destination tied to a chaotic cast trip.",
        detail: "The trip became shorthand for off-camera accusations and fallout.",
        sources: [{ url: "https://other.test/story", title: "Tea", publishedAt: "" }],
      },
      pending as never,
    );
    expect(matched?.id).toBe(9);
    expect(unmatched).toBeNull();
  });
});

describe("generation run retention", () => {
  beforeEach(async () => {
    await cleanAll();
  });

  afterEach(async () => {
    await cleanAll();
  });

  it("expires old runs without deleting published puzzles", async () => {
    const [game] = await db
      .insert(gamesTopics)
      .values({
        slug: "rhobh",
        name: "RHOBH",
        feedUrl: "https://example.com/feed",
        feedLabel: "Test Feed",
        systemPromptPath: "prompts/rhobh.txt",
      })
      .returning();
    const [article] = await db
      .insert(articles)
      .values({ gamesTopicId: game.id, url: "https://example.com/a", title: "A" })
      .returning();
    const [run] = await db
      .insert(generationRuns)
      .values({
        gamesTopicId: game.id,
        dateKey: "2026-06-25",
        status: "succeeded",
        sourceMode: "inventory",
        promptSource: "file",
        promptText: "prompt",
        model: "deepseek/deepseek-v4-flash",
        createdByHominemUserId: "user-1",
        createdAt: new Date("2026-01-01T00:00:00Z"),
      })
      .returning();
    const [puzzle] = await db
      .insert(gamesPuzzles)
      .values({
        gamesTopicId: game.id,
        articleId: article.id,
        dateUtc: "2026-06-25",
        answer: "BRAVO",
        answerType: "place",
        normalizedAnswer: "BRAVO",
        clue: "c",
        detail: "d",
        generationRunId: run.id,
      })
      .returning();

    expect(await expireGenerationRuns(30)).toBe(1);
    const remaining = await db.query.gamesPuzzles.findFirst({
      where: (table, { eq }) => eq(table.id, puzzle.id),
    });
    expect(remaining?.id).toBe(puzzle.id);
    expect(remaining?.generationRunId).toBeNull();
  });

  it("reaps running rows older than ten minutes", async () => {
    const [game] = await db
      .insert(gamesTopics)
      .values({
        slug: "rhobh",
        name: "RHOBH",
        feedUrl: "https://example.com/feed",
        feedLabel: "Test Feed",
        systemPromptPath: "prompts/rhobh.txt",
      })
      .returning();
    const [run] = await db
      .insert(generationRuns)
      .values({
        gamesTopicId: game.id,
        dateKey: "2026-06-25",
        status: "running",
        sourceMode: "rss",
        promptSource: "file",
        promptText: "prompt",
        model: "deepseek/deepseek-v4-flash",
        createdByHominemUserId: "user-1",
        createdAt: new Date(Date.now() - 11 * 60 * 1000),
      })
      .returning();

    expect(await reapStaleGenerationRuns()).toBe(1);
    const remaining = await db.query.generationRuns.findFirst({
      where: (table, { eq }) => eq(table.id, run.id),
    });
    expect(remaining?.status).toBe("failed");
    expect(remaining?.llmError).toBe("reaped");
  });
});

