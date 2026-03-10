/**
 * Server-side mutations for dumphim
 * Replaces Supabase client mutations
 *
 * OPTIMIZATIONS:
 * - Automatic cache invalidation after mutations
 * - Type-safe operations
 * - Consistent updatedAt timestamps
 */

import { eq } from "drizzle-orm";
import { db } from "~/lib/db";
import { trackers, votes } from "@pontistudios/db/schema";
import type { TrackerInsert, VoteInsert } from "@pontistudios/db/schema";
import { queryCache, invalidateTrackerCache } from "./cache";

// Tracker mutations
export async function createTracker(data: TrackerInsert) {
  const [tracker] = await db
    .insert(trackers)
    .values({ ...data, updatedAt: new Date() })
    .returning();

  // Invalidate tracker list cache
  queryCache.invalidatePattern(/^trackers:/);

  return tracker;
}

export async function updateTracker(id: string, data: Partial<TrackerInsert>) {
  const [tracker] = await db
    .update(trackers)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(trackers.id, id))
    .returning();

  // Invalidate specific tracker cache
  invalidateTrackerCache(id);

  return tracker;
}

export async function deleteTracker(id: string) {
  await db.delete(trackers).where(eq(trackers.id, id));

  // Invalidate all related caches
  invalidateTrackerCache(id);
  queryCache.invalidatePattern(/^trackers:/);
}

// Vote mutations
export async function createVote(data: VoteInsert) {
  const [vote] = await db
    .insert(votes)
    .values({ ...data, updatedAt: new Date() })
    .returning();

  // Invalidate vote stats and tracker caches
  queryCache.invalidate(`tracker:${data.trackerId}:stats`);
  queryCache.invalidate(`tracker:${data.trackerId}`);

  return vote;
}

export async function deleteVote(id: string, trackerId: string) {
  await db.delete(votes).where(eq(votes.id, id));

  // Invalidate vote stats and tracker caches
  queryCache.invalidate(`tracker:${trackerId}:stats`);
  queryCache.invalidate(`tracker:${trackerId}`);
}

export async function deleteVotesByTracker(trackerId: string) {
  await db.delete(votes).where(eq(votes.trackerId, trackerId));

  // Invalidate vote stats
  queryCache.invalidate(`tracker:${trackerId}:stats`);
}
