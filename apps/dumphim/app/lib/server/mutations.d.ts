/**
 * Server-side mutations for dumphim
 * Replaces Supabase client mutations
 *
 * OPTIMIZATIONS:
 * - Automatic cache invalidation after mutations
 * - Type-safe operations
 * - Consistent updatedAt timestamps
 */
import type { TrackerInsert, VoteInsert } from "@pontistudios/db/schema";
export declare function createTracker(data: TrackerInsert): Promise<{
  id: string;
  name: string;
  createdAt: Date;
  hp: string | null;
  cardType: string | null;
  description: string | null;
  attacks:
    | {
        name: string;
        damage: number;
      }[]
    | null;
  strengths: string[] | null;
  flaws: string[] | null;
  commitmentLevel: string | null;
  colorTheme: string | null;
  photoUrl: string | null;
  imageScale: number | null;
  imagePosition: {
    x: number;
    y: number;
  } | null;
  userId: string;
  updatedAt: Date;
}>;
export declare function updateTracker(
  id: string,
  data: Partial<TrackerInsert>,
): Promise<{
  id: string;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  hp: string | null;
  cardType: string | null;
  description: string | null;
  attacks:
    | {
        name: string;
        damage: number;
      }[]
    | null;
  strengths: string[] | null;
  flaws: string[] | null;
  commitmentLevel: string | null;
  colorTheme: string | null;
  photoUrl: string | null;
  imageScale: number | null;
  imagePosition: {
    x: number;
    y: number;
  } | null;
  userId: string;
}>;
export declare function deleteTracker(id: string): Promise<void>;
export declare function createVote(data: VoteInsert): Promise<{
  value: "stay" | "dump";
  id: string;
  createdAt: Date;
  userId: string | null;
  trackerId: string;
  fingerprint: string;
  raterName: string;
  comment: string | null;
  updatedAt: Date;
}>;
export declare function deleteVote(id: string, trackerId: string): Promise<void>;
export declare function deleteVotesByTracker(trackerId: string): Promise<void>;
//# sourceMappingURL=mutations.d.ts.map
