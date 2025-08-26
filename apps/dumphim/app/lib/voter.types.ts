import type { Tracker } from "~/db/schema";

// Utility types for parsed pros/cons
export interface TrackerWithParsedArrays
	extends Omit<Tracker, "pros" | "cons"> {
	parsedPros: string[];
	parsedCons: string[];
}

// Helper functions to work with pros/cons
export function getParsedPros(tracker: Tracker): string[] {
	// strengths is now a JSON array in the DB schema
	if (Array.isArray(tracker.strengths)) {
		return tracker.strengths;
	}
	// fallback: try to parse if it's a string (legacy/SSR)
	if (typeof tracker.strengths === "string") {
		try {
			return JSON.parse(tracker.strengths);
		} catch (e) {
			console.error("Error parsing strengths JSON:", e);
		}
	}
	return [];
}

export function getParsedWeaknesses(tracker: Tracker): string[] {
	// flaws is now a JSON array in the DB schema
	if (Array.isArray(tracker.flaws)) {
		return tracker.flaws;
	}
	if (typeof tracker.flaws === "string") {
		try {
			return JSON.parse(tracker.flaws);
		} catch (e) {
			console.error("Error parsing flaws JSON:", e);
		}
	}
	return [];
}

export function convertToTrackerWithParsedArrays(
	tracker: Tracker,
): TrackerWithParsedArrays {
	// strengths and flaws are required for TrackerWithParsedArrays
	return {
		...tracker,
		parsedPros: getParsedPros(tracker),
		parsedCons: getParsedWeaknesses(tracker),
	};
}

// For creating a new tracker, before it has an ID from Supabase
export type NewTracker = Omit<
	Tracker,
	"id" | "created_at" | "user_id" | "votes"
> & {
	photo_file?: File; // For upload
};
