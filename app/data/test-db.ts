import { db } from "~/lib/server/db";

export async function cleanAll() {
  await db.execute("DELETE FROM labs.what_admin_actions");
  await db.execute("DELETE FROM labs.what_generation_candidates");
  await db.execute("DELETE FROM labs.what_puzzle_revisions");
  await db.execute("DELETE FROM labs.games_attempts");
  await db.execute("DELETE FROM labs.games_puzzles");
  await db.execute("DELETE FROM labs.what_generation_runs");
  await db.execute("DELETE FROM labs.articles");
  await db.execute("DELETE FROM labs.games_topics");
}
