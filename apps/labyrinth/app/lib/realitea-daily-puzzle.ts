import { normalizeAnswer, REALITEA_ANSWER_LENGTH, REALITEA_TIME_ZONE, type PuzzleAnswerType } from "./realitea";

export const BRAVO_FRANCHISE = "bravo";
export const BRAVO_PRIMARY_SOURCE_DOMAIN = "bravotv.com";
export const BRAVO_REPEAT_WINDOW_DAYS = 90;
export const REALITEA_READY_INVENTORY_DAYS = 7;

// --- Types ---

export interface DailyPuzzle {
  answer: string;
  answerType: PuzzleAnswerType;
  clue: string;
  dateKey: string;
  detail: string;
  role: string;
}

export interface PuzzleRecord {
  id?: number;
  answer: string;
  answerType: PuzzleAnswerType;
  clue: string;
  createdAt?: Date | null;
  dateKey: string | null;
  detail: string;
  expireAt?: Date | null;
  franchise: string;
  normalizedAnswer: string;
  publishAt?: Date | null;
  role: string;
  scheduledForDateKey: string | null;
  sourcePublishedAt: string[];
  sourceSummary: string[];
  sourceTitles: string[];
  sourceUrls: string[];
  status: string;
  updatedAt?: Date | null;
}

export interface PuzzleWindow {
  dateKey: string;
  expireAt: Date;
  publishAt: Date;
}

export interface ValidationResult {
  normalizedAnswer: string;
  reasons: string[];
  valid: boolean;
}

// --- Date helpers ---

const DATE_KEY_FORMAT = /^\d{4}-\d{2}-\d{2}$/;

function getPuzzleDateParts(date: Date): [number, number, number] {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: REALITEA_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = formatter.formatToParts(date);
  return [
    Number.parseInt(parts.find((p) => p.type === "year")?.value ?? "", 10),
    Number.parseInt(parts.find((p) => p.type === "month")?.value ?? "", 10),
    Number.parseInt(parts.find((p) => p.type === "day")?.value ?? "", 10),
  ];
}

export function getDateKey(date: Date): string {
  const [year, month, day] = getPuzzleDateParts(date);
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function isDateKey(value: string): boolean {
  return DATE_KEY_FORMAT.test(value);
}

export function parseDate(value: string | null | undefined): Date | null {
  if (!value || !isDateKey(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  if ([year, month, day].some(Number.isNaN)) return null;
  // UTC noon keeps the Pacific calendar day stable across DST transitions.
  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
}

export function addDaysToDateKey(value: string, days: number): string | null {
  const date = parseDate(value);
  if (!date) return null;
  date.setUTCDate(date.getUTCDate() + days);
  return getDateKey(date);
}

function getMidnightInTimeZone(year: number, month: number, day: number, tz: string): Date {
  // Converge on the exact UTC instant that is midnight in `tz` on the given date.
  let candidate = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  for (let i = 0; i < 4; i++) {
    const fmt = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    });
    const parts = fmt.formatToParts(candidate);
    const get = (type: string) =>
      Number.parseInt(parts.find((p) => p.type === type)?.value ?? "", 10);
    const actualUtc = Date.UTC(
      get("year"),
      get("month") - 1,
      get("day"),
      get("hour"),
      get("minute"),
      get("second"),
    );
    const targetUtc = Date.UTC(year, month - 1, day, 0, 0, 0);
    const delta = actualUtc - targetUtc;
    if (delta === 0) break;
    candidate = new Date(candidate.getTime() - delta);
  }
  return candidate;
}

export function getPuzzleWindow(date: Date): PuzzleWindow {
  const dateKey = getDateKey(date);
  const [year, month, day] = dateKey.split("-").map(Number);
  const publishAt = getMidnightInTimeZone(year, month, day, REALITEA_TIME_ZONE);
  const nextDateKey = addDaysToDateKey(dateKey, 1);
  if (!nextDateKey) throw new Error(`Invalid puzzle date key: ${dateKey}`);
  const [ny, nm, nd] = nextDateKey.split("-").map(Number);
  const expireAt = getMidnightInTimeZone(ny, nm, nd, REALITEA_TIME_ZONE);
  return { dateKey, expireAt, publishAt };
}

// --- Validation ---

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
  const normalizedAnswer = normalizeAnswer(candidate.answer);

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
