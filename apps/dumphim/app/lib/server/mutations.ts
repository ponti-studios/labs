/**
 * Server-side mutations for dumphim
 * Migrated from Drizzle/Postgres to Kysely/MySQL
 *
 * OPTIMIZATIONS:
 * - Automatic cache invalidation after mutations
 * - Type-safe operations
 * - Consistent updatedAt timestamps
 */

import { getDb } from "~/lib/db";
import type { NewDumphimTracker, NewDumphimVote, DumphimTracker, DumphimVote } from "~/lib/db";
import { queryCache, invalidateTrackerCache } from "./cache";

// Tracker mutations
export async function createTracker(data: NewDumphimTracker): Promise<DumphimTracker> {
  const db = await getDb();

  const row = await db
    .insertInto("dumphim_trackers")
    .values({
      ...data,
      attacks: data.attacks != null ? JSON.stringify(data.attacks) : null,
      strengths: data.strengths != null ? JSON.stringify(data.strengths) : null,
      flaws: data.flaws != null ? JSON.stringify(data.flaws) : null,
      imagePosition: data.imagePosition != null ? JSON.stringify(data.imagePosition) : null,
    })
    .returningAll()
    .executeTakeFirstOrThrow();

  // Invalidate tracker list cache
  queryCache.invalidatePattern(/^trackers:/);

  return row as DumphimTracker;
}

export async function updateTracker(
  id: string,
  data: Partial<NewDumphimTracker>,
): Promise<DumphimTracker | null> {
  const db = await getDb();

  const updateValues: Record<string, unknown> = {};
  if (data.name !== undefined) updateValues.name = data.name;
  if (data.hp !== undefined) updateValues.hp = data.hp;
  if (data.cardType !== undefined) updateValues.cardType = data.cardType;
  if (data.description !== undefined) updateValues.description = data.description;
  if (data.attacks !== undefined) {
    updateValues.attacks = data.attacks != null ? JSON.stringify(data.attacks) : null;
  }
  if (data.strengths !== undefined) {
    updateValues.strengths = data.strengths != null ? JSON.stringify(data.strengths) : null;
  }
  if (data.flaws !== undefined) {
    updateValues.flaws = data.flaws != null ? JSON.stringify(data.flaws) : null;
  }
  if (data.commitmentLevel !== undefined) updateValues.commitmentLevel = data.commitmentLevel;
  if (data.colorTheme !== undefined) updateValues.colorTheme = data.colorTheme;
  if (data.photoUrl !== undefined) updateValues.photoUrl = data.photoUrl;
  if (data.imageScale !== undefined) updateValues.imageScale = data.imageScale;
  if (data.imagePosition !== undefined) {
    updateValues.imagePosition =
      data.imagePosition != null ? JSON.stringify(data.imagePosition) : null;
  }
  if (data.userId !== undefined) updateValues.userId = data.userId;
  // Always update updatedAt
  updateValues.updatedAt = new Date().toISOString();

  const row = await db
    .updateTable("dumphim_trackers")
    .set(updateValues)
    .where("id", "=", id)
    .returningAll()
    .executeTakeFirst();

  // Invalidate specific tracker cache
  invalidateTrackerCache(id);

  return row as DumphimTracker | null;
}

export async function deleteTracker(id: string): Promise<void> {
  const db = await getDb();
  await db.deleteFrom("dumphim_trackers").where("id", "=", id).executeTakeFirst();

  // Invalidate all related caches
  invalidateTrackerCache(id);
  queryCache.invalidatePattern(/^trackers:/);
}

// Vote mutations
export async function createVote(data: NewDumphimVote): Promise<DumphimVote> {
  const db = await getDb();

  const row = await db
    .insertInto("dumphim_votes")
    .values(data)
    .returningAll()
    .executeTakeFirstOrThrow();

  // Invalidate vote stats and tracker caches
  queryCache.invalidate(`tracker:${data.trackerId}:stats`);
  queryCache.invalidate(`tracker:${data.trackerId}`);

  return row as DumphimVote;
}

export async function deleteVote(id: string, trackerId: string): Promise<void> {
  const db = await getDb();
  await db.deleteFrom("dumphim_votes").where("id", "=", id).executeTakeFirst();

  // Invalidate vote stats and tracker caches
  queryCache.invalidate(`tracker:${trackerId}:stats`);
  queryCache.invalidate(`tracker:${trackerId}`);
}

export async function deleteVotesByTracker(trackerId: string): Promise<void> {
  const db = await getDb();
  await db.deleteFrom("dumphim_votes").where("trackerId", "=", trackerId).executeTakeFirst();

  // Invalidate vote stats
  queryCache.invalidate(`tracker:${trackerId}:stats`);
}
