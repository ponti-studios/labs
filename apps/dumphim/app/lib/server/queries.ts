import { eq, desc } from "drizzle-orm";
import { db } from "~/lib/db";
import { trackers, votes } from "@pontistudios/db/schema";


/**
 * Server-side queries for dumphim
 * Replaces Supabase client queries
 */

// Trackers
export async function getTrackers() {
  return db.query.trackers.findMany({
    orderBy: desc(trackers.createdAt),
  });
}

export async function getTracker(id: string) {
  return db.query.trackers.findFirst({
    where: eq(trackers.id, id),
    with: {
      votes: true,
    },
  });
}

export async function getTrackersByUser(userId: string) {
  return db.query.trackers.findMany({
    where: eq(trackers.userId, userId),
    orderBy: desc(trackers.createdAt),
  });
}

// Votes
export async function getVotesByTracker(trackerId: string) {
  return db.query.votes.findMany({
    where: eq(votes.trackerId, trackerId),
    orderBy: desc(votes.createdAt),
  });
}

export async function getVoteStats(trackerId: string) {
  const allVotes = await db.query.votes.findMany({
    where: eq(votes.trackerId, trackerId),
  });

  const stayVotes = allVotes.filter((v) => v.value === "stay").length;
  const dumpVotes = allVotes.filter((v) => v.value === "dump").length;

  return {
    total: allVotes.length,
    stay: stayVotes,
    dump: dumpVotes,
    stayPercentage: allVotes.length > 0 ? Math.round((stayVotes / allVotes.length) * 100) : 0,
  };
}
