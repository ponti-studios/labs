import { db } from "~/lib/server/db";

export async function cleanAll() {
  await db.execute("DELETE FROM labs.realitea_attempts");
  await db.execute("DELETE FROM labs.daily_puzzles");
  await db.execute("DELETE FROM labs.feed_games");
  await db.execute("DELETE FROM labs.articles");
  await db.execute("DELETE FROM labs.feeds");
  await db.execute("DELETE FROM labs.games");
}
