/**
 * Server-side queries for dumphim
 * Migrated from Drizzle/Postgres to Kysely/MySQL
 */

import { getDb } from "~/lib/db";
import type { DumphimTrackerParsed, DumphimVote } from "@pontistudios/db";

// Helper to parse JSON fields
function parseTracker(raw: Record<string, unknown>): DumphimTrackerParsed {
  return {
    ...(raw as Omit<DumphimTrackerParsed, "attacks" | "strengths" | "flaws" | "imagePosition">),
    attacks: typeof raw.attacks === "string" ? JSON.parse(raw.attacks) : (raw.attacks ?? []),
    strengths:
      typeof raw.strengths === "string" ? JSON.parse(raw.strengths) : (raw.strengths ?? []),
    flaws: typeof raw.flaws === "string" ? JSON.parse(raw.flaws) : (raw.flaws ?? []),
    imagePosition:
      typeof raw.imagePosition === "string"
        ? JSON.parse(raw.imagePosition)
        : (raw.imagePosition ?? null),
  };
}

// Trackers
export async function getTrackers(): Promise<DumphimTrackerParsed[]> {
  const db = await getDb();
  const rows = await db.selectFrom("dumphim_trackers").orderBy("createdAt", "desc").execute();
  return rows.map((r) => parseTracker(r as Record<string, unknown>));
}

export async function getTracker(
  id: string,
): Promise<(DumphimTrackerParsed & { votes: DumphimVote[] }) | null> {
  const db = await getDb();
  const trackerRow = await db
    .selectFrom("dumphim_trackers")
    .where("id", "=", id)
    .executeTakeFirst();

  if (!trackerRow) return null;

  const tracker = parseTracker(trackerRow as Record<string, unknown>);
  const votes = await getVotesByTracker(id);

  return { ...tracker, votes };
}

export async function getTrackersByUser(userId: string): Promise<DumphimTrackerParsed[]> {
  const db = await getDb();
  const rows = await db
    .selectFrom("dumphim_trackers")
    .where("userId", "=", userId)
    .orderBy("createdAt", "desc")
    .execute();
  return rows.map((r) => parseTracker(r as Record<string, unknown>));
}

// Votes
export async function getVotesByTracker(trackerId: string): Promise<DumphimVote[]> {
  const db = await getDb();
  return db
    .selectFrom("dumphim_votes")
    .where("trackerId", "=", trackerId)
    .orderBy("createdAt", "desc")
    .execute() as Promise<DumphimVote[]>;
}

export async function getVoteStats(trackerId: string): Promise<{
  total: number;
  stay: number;
  dump: number;
  stayPercentage: number;
}> {
  const allVotes = await getVotesByTracker(trackerId);

  const stayVotes = allVotes.filter((v) => v.value === "stay").length;
  const dumpVotes = allVotes.filter((v) => v.value === "dump").length;

  return {
    total: allVotes.length,
    stay: stayVotes,
    dump: dumpVotes,
    stayPercentage: allVotes.length > 0 ? Math.round((stayVotes / allVotes.length) * 100) : 0,
  };
}
