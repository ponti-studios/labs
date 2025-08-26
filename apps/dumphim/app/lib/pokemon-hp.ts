import type { Tracker, Vote } from "~/db/schema";

// Define maximum HP value
export const MAX_HP = 150;

/**
 * Calculate the HP for a relationship tracker based on various factors
 * Higher HP means a healthier relationship
 */
export function calculateHP(tracker: Tracker): {
	hp: number;
	maxHp: number;
	percentage: number;
} {
	// Accepts tracker.votes as Vote[] | undefined
	const votes: Vote[] = (tracker as any).votes || [];
	if (!votes || votes.length === 0) {
		return { hp: MAX_HP / 2, maxHp: MAX_HP, percentage: 50 };
	}

	// Start with base HP (could be adjusted based on description positivity analysis in the future)
	const baseHP = MAX_HP * 0.4; // Start with 40% of max HP as base

	// Calculate vote impact: more "stay" votes increase HP, more "dump" votes decrease it
	const stayVotes = votes.filter((vote) => vote.value === "stay").length;
	const dumpVotes = votes.filter((vote) => vote.value === "dump").length;
	const totalVotes = stayVotes + dumpVotes;

	// Vote ratio impact (up to 60% of max HP)
	const voteRatioImpact =
		totalVotes > 0 ? (stayVotes / totalVotes) * (MAX_HP * 0.6) : 0;

	// Calculate total HP
	let hp = Math.floor(baseHP + voteRatioImpact);

	// Ensure HP is within valid range
	hp = Math.max(1, Math.min(hp, MAX_HP)); // HP should never be below 1 or above MAX_HP

	// Calculate percentage for progress bar
	const percentage = Math.round((hp / MAX_HP) * 100);

	return { hp, maxHp: MAX_HP, percentage };
}

/**
 * Determine the energy type based on the relationship status
 */
export function determineEnergyTypes(tracker: Tracker): string[] {
	const energyTypes: string[] = [];
	const votes: Vote[] = (tracker as any).votes || [];

	if (!votes || votes.length === 0) {
		// New or no votes yet
		return ["electric", "normal"]; // Default energies for new trackers
	}

	const stayVotes = votes.filter((vote) => vote.value === "stay").length;
	const dumpVotes = votes.filter((vote) => vote.value === "dump").length;
	const totalVotes = stayVotes + dumpVotes;

	// Stay ratio determines the primary energy type
	const stayRatio = totalVotes > 0 ? stayVotes / totalVotes : 0;

	if (stayRatio >= 0.8) {
		// Great relationship - Grass type (growth, nurturing)
		energyTypes.push("grass");
	} else if (stayRatio >= 0.5) {
		// Good relationship - Water type (flowing, adaptable)
		energyTypes.push("water");
	} else if (stayRatio >= 0.3) {
		// Mixed feelings - Electric type (unpredictable)
		energyTypes.push("electric");
	} else {
		// Bad relationship - Fire type (volatile)
		energyTypes.push("fire");
	}

	// Add a secondary energy type based on vote count
	if (totalVotes >= 10) {
		// Many votes indicates strong opinions - add a second energy
		if (stayRatio >= 0.5) {
			energyTypes.push("electric"); // Some excitement
		} else {
			energyTypes.push("dark"); // Some darkness/negativity
		}
	}

	return energyTypes;
}

/**
 * Generate a Pokemon-style description for the relationship
 */
export function generateRelationshipDescription(tracker: Tracker): string {
	const votes: Vote[] = (tracker as any).votes || [];
	if (!votes || votes.length === 0) {
		return "A mysterious new relationship. Gather votes to learn more!";
	}

	const { hp, maxHp } = calculateHP(tracker);
	const hpRatio = hp / maxHp;

	// Using Math.floor to place the hp ratio in discrete ranges for the switch
	const hpCategory = Math.floor(hpRatio * 5);

	switch (hpCategory) {
		case 4: // 0.8-1.0
			return "This relationship is GLOWING! Friends see amazing potential here!";
		case 3: // 0.6-0.8
			return "A strong bond with some challenges that can easily be overcome.";
		case 2: // 0.4-0.6
			return "This relationship shows mixed signals. Friends' opinions vary.";
		case 1: // 0.2-0.4
			return "Warning: This relationship's energy is fading. Time to recharge?";
		case 0: // 0.0-0.2
			return "Critical low energy! Most friends suggest reconsidering this path.";
		default:
			return "Unable to determine relationship status.";
	}
}
