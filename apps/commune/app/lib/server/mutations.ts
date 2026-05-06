/**
 * Server-side mutations for social
 * Uses Drizzle ORM with Postgres (migrated from Kysely/MySQL)
 *
 * OPTIMIZATIONS:
 * - Automatic cache invalidation after mutations
 * - Type-safe operations
 * - Consistent updatedAt timestamps
 */

import { eq } from "drizzle-orm";
import { db, trackers, votes } from "~/lib/db";
import type { NewSocialTracker, NewSocialVote, SocialTracker, SocialVote } from "~/lib/db";
import { queryCache, invalidateTrackerCache } from "./cache";

// Tracker mutations
export async function createTracker(data: NewSocialTracker): Promise<SocialTracker> {
  const row = await db
    .insert(trackers)
    .values({
      ...data,
      attacks: data.attacks != null ? JSON.stringify(data.attacks) : null,
      strengths: data.strengths != null ? JSON.stringify(data.strengths) : null,
      flaws: data.flaws != null ? JSON.stringify(data.flaws) : null,
      imagePosition: data.imagePosition != null ? JSON.stringify(data.imagePosition) : null,
    })
    .returning()
    .execute();

  const inserted = row[0];
  if (!inserted) throw new Error("Failed to insert tracker");

  queryCache.invalidatePattern(/^trackers:/);
  return inserted;
}

export async function updateTracker(
  id: string,
  data: Partial<NewSocialTracker>,
): Promise<SocialTracker | null> {
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
  updateValues.updatedAt = new Date();

  const row = await db
    .update(trackers)
    .set(updateValues)
    .where(eq(trackers.id, id))
    .returning()
    .execute();

  const updated = row[0] ?? null;
  if (updated) invalidateTrackerCache(id);
  return updated;
}

export async function deleteTracker(id: string): Promise<void> {
  await db.delete(trackers).where(eq(trackers.id, id)).execute();

  invalidateTrackerCache(id);
  queryCache.invalidatePattern(/^trackers:/);
}

// Vote mutations
export async function createVote(data: NewSocialVote): Promise<SocialVote> {
  const row = await db.insert(votes).values(data).returning().execute();

  const inserted = row[0];
  if (!inserted) throw new Error("Failed to insert vote");

  queryCache.invalidate(`tracker:${data.trackerId}:stats`);
  queryCache.invalidate(`tracker:${data.trackerId}`);

  return inserted;
}

export async function deleteVote(id: string, trackerId: string): Promise<void> {
  await db.delete(votes).where(eq(votes.id, id)).execute();

  queryCache.invalidate(`tracker:${trackerId}:stats`);
  queryCache.invalidate(`tracker:${trackerId}`);
}

export async function deleteVotesByTracker(trackerId: string): Promise<void> {
  await db.delete(votes).where(eq(votes.trackerId, trackerId)).execute();

  queryCache.invalidate(`tracker:${trackerId}:stats`);
}
