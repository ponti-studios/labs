import { normalizeGuess, REALITEA_ANSWER_LENGTH } from "./realitea";
import type { ValidationResult } from "./realitea.types";

export const BRAVO_FRANCHISE = "bravo";
export const BRAVO_PRIMARY_SOURCE_DOMAIN = "bravotv.com";
export const BRAVO_REPEAT_WINDOW_DAYS = 90;
export const REALITEA_READY_INVENTORY_DAYS = 7;

export function validateCandidate(
  candidate: {
    answer: string;
    answerType: string;
    clue: string;
    detail: string;
    sourceUrls: string[];
  },
  previousAnswers: Set<string> = new Set(),
): ValidationResult {
  const reasons: string[] = [];
  const normalizedAnswer = normalizeGuess(candidate.answer);

  if (normalizedAnswer.length !== REALITEA_ANSWER_LENGTH) {
    reasons.push("answer must normalize to exactly five letters");
  }
  if (!normalizedAnswer || /[^A-Z]/.test(normalizedAnswer)) {
    reasons.push("answer does not normalize cleanly to letters");
  }
  if (!candidate.answerType) {
    reasons.push("answer type is missing");
  }
  if (candidate.answerType === "person") {
    reasons.push("answer type must not be a person; prefer a storyline, moment, place, or phrase");
  }
  if (
    candidate.clue.toUpperCase().includes(normalizedAnswer) ||
    candidate.detail.toUpperCase().includes(normalizedAnswer)
  ) {
    reasons.push("answer is leaked in clue or detail");
  }
  if (previousAnswers.has(normalizedAnswer)) {
    reasons.push("answer repeats inside cooldown window");
  }
  const hasBravoSource = candidate.sourceUrls.some((url) => {
    try {
      return new URL(url).hostname.replace(/^www\./, "") === BRAVO_PRIMARY_SOURCE_DOMAIN;
    } catch {
      return false;
    }
  });
  if (!hasBravoSource) {
    reasons.push("candidate is missing a bravotv.com source URL");
  }

  return { normalizedAnswer, reasons, valid: reasons.length === 0 };
}
