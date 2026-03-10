import type { Tracker } from "~/db/schema";
export interface TrackerWithParsedArrays extends Omit<Tracker, "pros" | "cons"> {
  parsedPros: string[];
  parsedCons: string[];
}
export declare function getParsedPros(tracker: Tracker): string[];
export declare function getParsedWeaknesses(tracker: Tracker): string[];
export declare function convertToTrackerWithParsedArrays(tracker: Tracker): TrackerWithParsedArrays;
export type NewTracker = Omit<Tracker, "id" | "created_at" | "user_id" | "votes"> & {
  photo_file?: File;
};
//# sourceMappingURL=voter.types.d.ts.map
