import type { Tracker } from "~/db/schema";
export declare const MAX_HP = 150;
/**
 * Calculate the HP for a relationship tracker based on various factors
 * Higher HP means a healthier relationship
 */
export declare function calculateHP(tracker: Tracker): {
  hp: number;
  maxHp: number;
  percentage: number;
};
/**
 * Determine the energy type based on the relationship status
 */
export declare function determineEnergyTypes(tracker: Tracker): string[];
/**
 * Generate a Pokemon-style description for the relationship
 */
export declare function generateRelationshipDescription(tracker: Tracker): string;
//# sourceMappingURL=pokemon-hp.d.ts.map
