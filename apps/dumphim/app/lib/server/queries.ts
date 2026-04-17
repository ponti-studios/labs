/**
 * Server-side queries for dumphim
 * Uses Drizzle ORM with Postgres
 */

import { desc, eq } from 'drizzle-orm';
import { db, trackers, votes } from '~/lib/db';
import type { DumphimTrackerParsed, DumphimVote, DumphimTracker } from '~/lib/db';

function parseTracker(raw: DumphimTracker): DumphimTrackerParsed {
  return {
    ...(raw as unknown as Omit<DumphimTrackerParsed, 'attacks' | 'strengths' | 'flaws' | 'imagePosition'>),
    attacks: typeof raw.attacks === 'string' ? JSON.parse(raw.attacks) : (raw.attacks ?? []),
    strengths:
      typeof raw.strengths === 'string' ? JSON.parse(raw.strengths) : (raw.strengths ?? []),
    flaws: typeof raw.flaws === 'string' ? JSON.parse(raw.flaws) : (raw.flaws ?? []),
    imagePosition:
      typeof raw.imagePosition === 'string'
        ? JSON.parse(raw.imagePosition)
        : (raw.imagePosition ?? null),
  };
}

// Trackers
export async function getTrackers(): Promise<DumphimTrackerParsed[]> {
  const rows = await db
    .select()
    .from(trackers)
    .orderBy(desc(trackers.createdAt))
    .execute();
  return rows.map((r) => parseTracker(r));
}

export async function getTracker(
  id: string,
): Promise<(DumphimTrackerParsed & { votes: DumphimVote[] }) | null> {
  const row = await db
    .select()
    .from(trackers)
    .where(eq(trackers.id, id))
    .execute();

  const trackerRow = row[0];
  if (!trackerRow) return null;

  const tracker = parseTracker(trackerRow);
  const trackerVotes = await getVotesByTracker(id);

  return { ...tracker, votes: trackerVotes };
}

export async function getTrackersByUser(userId: string): Promise<DumphimTrackerParsed[]> {
  const rows = await db
    .select()
    .from(trackers)
    .where(eq(trackers.userId, userId))
    .orderBy(desc(trackers.createdAt))
    .execute();
  return rows.map((r) => parseTracker(r));
}

// Votes
export async function getVotesByTracker(trackerId: string): Promise<DumphimVote[]> {
  return db
    .select()
    .from(votes)
    .where(eq(votes.trackerId, trackerId))
    .orderBy(desc(votes.createdAt))
    .execute();
}

export async function getVoteStats(trackerId: string): Promise<{
  total: number;
  stay: number;
  dump: number;
  stayPercentage: number;
}> {
  const allVotes = await getVotesByTracker(trackerId);

  const stayVotes = allVotes.filter((v) => v.value === 'stay').length;
  const dumpVotes = allVotes.filter((v) => v.value === 'dump').length;

  return {
    total: allVotes.length,
    stay: stayVotes,
    dump: dumpVotes,
    stayPercentage: allVotes.length > 0 ? Math.round((stayVotes / allVotes.length) * 100) : 0,
  };
}
