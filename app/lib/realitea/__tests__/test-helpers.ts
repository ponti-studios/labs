import { articles, gamesPuzzles, db, gamesTopics } from "~/lib/server/db";

export async function seedGame(overrides: Partial<typeof gamesTopics.$inferInsert> = {}) {
  const [game] = await db
    .insert(gamesTopics)
    .values({
      slug: "rhobh",
      name: "RHOBH",
      feedUrl: "https://example.com/feed",
      feedLabel: "Test Feed",
      systemPromptPath: "prompts/rhobh.txt",
      ...overrides,
    })
    .returning();
  return game;
}

export async function seedGameWithPuzzles(
  dateKeys: string[],
  overrides: Partial<typeof gamesTopics.$inferInsert> = {},
) {
  const game = await seedGame(overrides);
  for (const dateKey of dateKeys) {
    const [article] = await db
      .insert(articles)
      .values({ gamesTopicId: game.id, url: `https://example.com/${dateKey}`, title: dateKey })
      .returning();
    await db.insert(gamesPuzzles).values({
      gamesTopicId: game.id,
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
