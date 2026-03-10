import type { Symptom } from "@/types/symptom";

// Determine if a score is within a given range
export function isWithinRange(score: number, range: number[]) {
  if (Number.isNaN(score)) return false;
  return score >= Math.min(...range) && score <= Math.max(...range);
}

// Get the value at the middle of the range.
export const getRangeMidpoint = (range: number[]) => (Math.min(...range) + Math.max(...range)) / 2;

export function getScoreFromRange(range: number[], query?: number, baseScore = 25) {
  const maxIntensity = Math.max(...range);
  const minIntensity = Math.min(...range);

  // Score doesn't require calculation if score is not defined or 0.
  if (query === undefined || query === null || query === 0) return 0;

  // Check if intensity is within range. Score doesn't require calculation if score is not within range.
  if (!isWithinRange(query, range)) return 0;

  // Get distance from query intensity to the midpoint of the range. Use absolute value to avoid negative distances.
  const distance = Math.abs(query - getRangeMidpoint(range));

  // Get the maximum distance between either end of the range and the midpoint.
  const maxDistance = (maxIntensity - minIntensity) / 2;

  /**
   * Calculate the score based on the distance from the midpoint.
   * The closer the query is to the midpoint, the higher the score. We want to increase the score based on the
   * the query's relation to the midpoint because the range provides a representation of the average intensity for the
   * causality. If the logic weighted one of the range ends, it would be biased towards potential other causalities.
   * We subtract from 1 to get a score between 0 and 1.
   */
  return baseScore * (1 - distance / maxDistance);
}

// Calculate match score for a symptom based on name, intensity, and duration
export function calculateMatchScore(
  dbSymptom: Symptom,
  query: { symptom: string; intensity?: number; duration?: number },
): number {
  let score = 0;
  const intensityRange = dbSymptom.intensity_range;
  const normalizedSymptomName = dbSymptom.name.toLowerCase();
  const normalizedQuerySymptom = query.symptom.toLowerCase();

  // Name match gives highest score
  if (normalizedSymptomName.includes(normalizedQuerySymptom)) {
    score += 100;

    // Boost score for exact matches
    if (normalizedSymptomName === normalizedQuerySymptom) {
      score += 500;
    }
  }

  // Modify score based on the query intensity's relation to the symptom's intensity range
  score += getScoreFromRange(intensityRange, query.intensity, 25);

  // Modify score based on the query duration's relation to the symptom's duration range
  score += getScoreFromRange(dbSymptom.duration_range, query.duration, 25);

  return score;
}
