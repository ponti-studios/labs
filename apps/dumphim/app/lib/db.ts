import { getDb } from "@pontistudios/db";
import type {
  DumphimTracker,
  DumphimVote,
  NewDumphimTracker,
  NewDumphimVote,
} from "@pontistudios/db";

// Re-export types for use throughout the app
export type {
  DumphimTracker,
  DumphimVote,
  NewDumphimTracker,
  NewDumphimVote,
} from "@pontistudios/db";

export { getDb };
