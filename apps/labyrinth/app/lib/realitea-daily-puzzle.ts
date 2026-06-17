import { z } from "zod";
import {
  normalizeAnswer,
  REALITEA_ANSWER_LENGTH,
  REALITEA_TIME_ZONE,
  type Puzzle,
  type PuzzleAnswerType,
  type PuzzleNewsMode,
} from "./realitea";

/**
 * RHOBH daily puzzle helpers.
 *
 * This module owns the full lifecycle for a daily puzzle:
 *
 *   archive JSON / generated response / DB record
 *                  |
 *                  v
 *          normalized candidate data
 *                  |
 *          +-------+--------+
 *          |                |
 *          v                v
 *      validate()      build/store puzzle
 *          |                |
 *          +-------+--------+
 *                  |
 *                  v
 *            puzzle for a day
 *
 * The rest of the file is split into a few predictable jobs:
 * - date helpers for stable day-based keys
 * - schema parsing for generated responses and source items
 * - archive selection for fallback puzzles
 * - validation for clue leakage, source coverage, and cooldown rules
 * - mapping helpers for moving between stored records and in-memory puzzles
 *
 * Two ASCII models are especially important:
 *
 * 1. Date bucketing
 *
 *   UTC day
 *   2026-05-29
 *        |
 *        v
 *   rhobh-<day-index>
 *        |
 *        v
 *   puzzleKey / storage lookup
 *
 *   The day index is derived from midnight UTC so the same date always maps
 *   to the same puzzle regardless of local timezone.
 *
 * 2. Validation flow
 *
 *   candidate
 *      |
 *      v
 *   normalize answer
 *      |
 *      +-----------------------------+
 *      | length / character checks    |
 *      | clue and detail leakage      |
 *      | repeat window                |
 *      | archive membership or        |
 *      | current-source corroboration |
 *      +-----------------------------+
 *      |
 *      v
 *   valid or rejected with reasons
 */

export const RHOBH_FRANCHISE = "rhobh";
export const RHOBH_DATE_FORMAT = /^\d{4}-\d{2}-\d{2}$/;
export const RHOBH_ALLOWED_SOURCE_DOMAINS = [
  "bravotv.com",
  "people.com",
  "ew.com",
  "eonline.com",
  "usmagazine.com",
] as const;
export const RHOBH_PRIMARY_SOURCE_DOMAIN = "bravotv.com";
export const RHOBH_REPEAT_WINDOW_DAYS = 90;
export const RHOBH_ANSWER_LENGTH = REALITEA_ANSWER_LENGTH;
export const REALITEA_READY_INVENTORY_DAYS = 7;
export const REALITEA_RESERVE_TARGET = 3;

/**
 * Stored and generated puzzle records are intentionally separated from the
 * UI-facing puzzle shape. That keeps source metadata and persistence details
 * out of the domain object used by the gameplay layer.
 */
export type PuzzleSource = "database";
export type GenerationStatus = "failed" | "published";
export type InventoryStatus =
  | "draft"
  | "ready"
  | "scheduled"
  | "published"
  | "reserve"
  | "consumed"
  | "failed";
export type PuzzleSourceKind = "current" | "evergreen";
export type ValidationStatus = "approved" | "rejected";

export interface SourceItem {
  title: string;
  url: string;
  publishedAt: string;
  summary: string;
  domain: string;
}

export const sourceItemSchema = z
  .object({
    domain: z.string().min(1).optional(),
    published: z.string().min(1).optional(),
    publishedAt: z.string().min(1).optional(),
    source: z.string().min(1).optional(),
    summary: z.string().min(1),
    title: z.string().min(1),
    url: z.string().url(),
  })
  .transform(({ domain, published, publishedAt, source, ...item }) => ({
    ...item,
    domain: domain ?? source ?? "",
    publishedAt: publishedAt ?? published ?? "",
  }))
  .refine((item) => item.domain.length > 0, {
    message: "domain is required",
    path: ["domain"],
  })
  .refine((item) => item.publishedAt.length > 0, {
    message: "publishedAt is required",
    path: ["publishedAt"],
  });

export const sourceItemListSchema = z.array(sourceItemSchema).max(10);

export interface GeneratedCandidate extends Puzzle {
  answerType: PuzzleAnswerType;
  newsMode: PuzzleNewsMode;
  rationale: string;
  sourceUrls: string[];
  sourceTitles: string[];
  sourcePublishedAt: string[];
  sourceSummary: string[];
}

export interface StoredPuzzle extends Puzzle {
  answerType?: PuzzleAnswerType;
  newsMode?: PuzzleNewsMode;
  puzzleKey: string;
  source: PuzzleSource;
}

export interface PuzzleRecord {
  answer: string;
  answerType: PuzzleAnswerType;
  clue: string;
  createdAt?: Date | null;
  dateUtc: string | null;
  detail: string;
  expireAt?: Date | null;
  franchise: string;
  generationBatchId?: string | null;
  generationStatus: GenerationStatus | string;
  id?: number;
  newsMode: PuzzleNewsMode;
  normalizedAnswer: string;
  publishAt?: Date | null;
  role: string;
  scheduledForDateKey?: string | null;
  sourceKind?: PuzzleSourceKind | string | null;
  sourcePublishedAt: string[];
  sourceSummary: string[];
  sourceTitles: string[];
  sourceUrls: string[];
  status?: InventoryStatus | string | null;
  updatedAt?: Date | null;
  validationStatus: ValidationStatus | string;
}

export interface ValidationContext {
  allowEvergreen?: boolean;
  previousAnswers?: Set<string>;
  sources?: SourceItem[];
}

export interface ValidationResult {
  normalizedAnswer: string;
  reasons: string[];
  valid: boolean;
}

export interface PuzzleEnvelope {
  puzzle: StoredPuzzle;
}

export interface PuzzleWindow {
  dateKey: string;
  expireAt: Date;
  publishAt: Date;
}

/**
 * Generated responses are constrained to a small, explicit schema so the
 * backend can reject malformed model output before it reaches storage.
 */
const rhobhGeneratedCandidateSchema = z.object({
  answer: z.string().min(1),
  answerType: z.enum(["moment", "object", "person", "phrase", "place", "storyline"]),
  clue: z.string().min(1),
  detail: z.string().min(1),
  newsMode: z.enum(["current"]),
  rationale: z.string().min(1),
  role: z.string().min(1),
  sourcePublishedAt: z.array(z.string()),
  sourceSummary: z.array(z.string()),
  sourceTitles: z.array(z.string()),
  sourceUrls: z.array(z.string()),
});

const rhobhGeneratedCandidateListSchema = z.array(rhobhGeneratedCandidateSchema).min(3).max(5);

function getLocalDateParts(value: string): [number, number, number] | null {
  if (!RHOBH_DATE_FORMAT.test(value)) {
    return null;
  }

  const [year, month, day] = value.split("-").map((part) => Number.parseInt(part, 10));
  if ([year, month, day].some((part) => Number.isNaN(part))) {
    return null;
  }

  return [year, month, day];
}

function getPuzzleDateParts(date: Date): [number, number, number] {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: REALITEA_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = formatter.formatToParts(date);
  const year = Number.parseInt(parts.find((part) => part.type === "year")?.value ?? "", 10);
  const month = Number.parseInt(parts.find((part) => part.type === "month")?.value ?? "", 10);
  const day = Number.parseInt(parts.find((part) => part.type === "day")?.value ?? "", 10);

  return [year, month, day];
}

function getLocalDayIndex(date: Date): number {
  const [year, month, day] = getPuzzleDateParts(date);
  return Math.floor(Date.UTC(year, month - 1, day) / 86_400_000);
}

/**
 * Convert a Date into the canonical YYYY-MM-DD key used by the daily puzzle
 * pipeline, based on the puzzle's fixed Pacific day boundary.
 */
export function getDateKey(date: Date): string {
  const [year, month, day] = getPuzzleDateParts(date);
  const monthText = `${month}`.padStart(2, "0");
  const dayText = `${day}`.padStart(2, "0");
  return `${year}-${monthText}-${dayText}`;
}

function getDateTimePartsInTimeZone(
  date: Date,
  timeZone: string,
): [number, number, number, number, number, number] {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });
  const parts = formatter.formatToParts(date);

  const year = Number.parseInt(parts.find((part) => part.type === "year")?.value ?? "", 10);
  const month = Number.parseInt(parts.find((part) => part.type === "month")?.value ?? "", 10);
  const day = Number.parseInt(parts.find((part) => part.type === "day")?.value ?? "", 10);
  const hour = Number.parseInt(parts.find((part) => part.type === "hour")?.value ?? "", 10);
  const minute = Number.parseInt(parts.find((part) => part.type === "minute")?.value ?? "", 10);
  const second = Number.parseInt(parts.find((part) => part.type === "second")?.value ?? "", 10);

  return [year, month, day, hour, minute, second];
}

function getDateTimeForTimeZone(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  second: number,
  timeZone: string,
): Date {
  let candidate = new Date(Date.UTC(year, month - 1, day, hour, minute, second));

  for (let step = 0; step < 4; step += 1) {
    const [actualYear, actualMonth, actualDay, actualHour, actualMinute, actualSecond] =
      getDateTimePartsInTimeZone(candidate, timeZone);
    const targetUtc = Date.UTC(year, month - 1, day, hour, minute, second);
    const actualUtc = Date.UTC(
      actualYear,
      actualMonth - 1,
      actualDay,
      actualHour,
      actualMinute,
      actualSecond,
    );
    const deltaMs = actualUtc - targetUtc;

    if (deltaMs === 0) {
      break;
    }

    candidate = new Date(candidate.getTime() - deltaMs);
  }

  return candidate;
}

function createCanonicalPuzzleDate(year: number, month: number, day: number): Date {
  // UTC noon keeps the Pacific calendar day stable across DST and regardless
  // of the runtime's local timezone.
  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
}

function getLocalDayIndexFromParts(year: number, month: number, day: number): number {
  return Math.floor(Date.UTC(year, month - 1, day) / 86_400_000);
}

export function getPuzzleKeyFromDateKey(value: string): string | null {
  const parts = getLocalDateParts(value);
  if (!parts) {
    return null;
  }

  const [year, month, day] = parts;
  return `rhobh-${getLocalDayIndexFromParts(year, month, day)}`;
}

/**
 * Parse a canonical date key into a stable Date that round-trips through
 * getDateKey() in any runtime timezone.
 */
export function parseDate(value: string | null | undefined): Date | null {
  if (!value || !isDateKey(value)) {
    return null;
  }
  const parts = getLocalDateParts(value);
  if (!parts) {
    return null;
  }
  const [year, month, day] = parts;
  const parsed = createCanonicalPuzzleDate(year, month, day);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function addDaysToDateKey(value: string, days: number): string | null {
  const parsed = parseDate(value);
  if (!parsed) {
    return null;
  }

  parsed.setUTCDate(parsed.getUTCDate() + days);
  return getDateKey(parsed);
}

export function getPuzzleWindow(date: Date): PuzzleWindow {
  const dateKey = getDateKey(date);
  const parts = getLocalDateParts(dateKey);
  if (!parts) {
    throw new Error(`Invalid puzzle date key: ${dateKey}`);
  }

  const [year, month, day] = parts;
  const publishAt = getDateTimeForTimeZone(year, month, day, 0, 0, 0, REALITEA_TIME_ZONE);
  const nextDateKey = addDaysToDateKey(dateKey, 1);

  if (!nextDateKey) {
    throw new Error(`Unable to derive next puzzle date key from ${dateKey}`);
  }

  const nextParts = getLocalDateParts(nextDateKey);
  if (!nextParts) {
    throw new Error(`Invalid next puzzle date key: ${nextDateKey}`);
  }

  const [nextYear, nextMonth, nextDay] = nextParts;
  const expireAt = getDateTimeForTimeZone(
    nextYear,
    nextMonth,
    nextDay,
    0,
    0,
    0,
    REALITEA_TIME_ZONE,
  );

  return { dateKey, expireAt, publishAt };
}

/**
 * Check whether a string matches the canonical daily puzzle date key format.
 */
export function isDateKey(value: string): boolean {
  return RHOBH_DATE_FORMAT.test(value);
}

export function parseStringArray(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

export function serializeStringArray(values: string[]): string {
  return JSON.stringify(values);
}

/**
 * Resolve the allowed source domain for a URL.
 *
 * A URL counts if it matches one of the approved domains exactly or is a
 * subdomain of one of them.
 */
export function getAllowedSourceDomain(url: string): string | null {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, "");
    return (
      RHOBH_ALLOWED_SOURCE_DOMAINS.find(
        (domain) => hostname === domain || hostname.endsWith(`.${domain}`),
      ) ?? null
    );
  } catch {
    return null;
  }
}

/**
 * Validate a candidate puzzle.
 *
 * The rules are intentionally layered so the caller gets a precise reason for
 * rejection instead of a single opaque failure.
 *
 * Validation checklist:
 *
 *   1. Normalize the answer.
 *   2. Ensure the answer length is exactly five letters after normalization.
 *   3. Ensure the normalized answer is letters only.
 *   4. Ensure the answer is not leaked in clue or detail.
 *   5. Ensure the answer does not repeat inside the cooldown window.
 *   6. Ensure current candidates have Bravo plus corroboration.
 *   7. Ensure candidates are generated from current sources.
 */
export function validateCandidate(
  candidate: GeneratedCandidate,
  context: ValidationContext = {},
): ValidationResult {
  const reasons: string[] = [];
  const normalizedAnswer = normalizeAnswer(candidate.answer);
  const clueUpper = candidate.clue.toUpperCase();
  const detailUpper = candidate.detail.toUpperCase();
  const previousAnswers = context.previousAnswers ?? new Set<string>();
  const sources = context.sources ?? [];

  if (normalizedAnswer.length !== RHOBH_ANSWER_LENGTH) {
    reasons.push("answer must normalize to exactly five letters");
  }

  if (!normalizedAnswer || /[^A-Z]/.test(normalizedAnswer)) {
    reasons.push("answer does not normalize cleanly to letters");
  }

  if (!candidate.answerType) {
    reasons.push("answer type is missing");
  }

  if (!context.allowEvergreen && candidate.newsMode !== "current") {
    reasons.push("candidate must be generated from current sources");
  }

  if (candidate.newsMode === "current" && candidate.answerType === "person") {
    reasons.push(
      "current candidate is too obvious; prefer a more distinctive RHOBH-specific concept",
    );
  }

  // The normalized answer is the canonical comparison form used by all rules.
  if (clueUpper.includes(normalizedAnswer) || detailUpper.includes(normalizedAnswer)) {
    reasons.push("answer is leaked in clue or detail");
  }

  if (previousAnswers.has(normalizedAnswer)) {
    reasons.push("answer repeats inside cooldown window");
  }

  const sourceDomains = new Set(
    candidate.sourceUrls.map((url) => getAllowedSourceDomain(url) ?? "").filter(Boolean),
  );
  const domains = new Set(
    sources
      .map((source) => source.domain || getAllowedSourceDomain(source.url) || "")
      .filter(Boolean),
  );
  const effectiveDomains = sourceDomains.size > 0 ? sourceDomains : domains;

  if (effectiveDomains.size > 0 && !effectiveDomains.has(RHOBH_PRIMARY_SOURCE_DOMAIN)) {
    reasons.push("current candidate is missing Bravo primary coverage");
  }

  if (effectiveDomains.size >= 2 && effectiveDomains.has(RHOBH_PRIMARY_SOURCE_DOMAIN)) {
    // Strong candidates should be corroborated, but sparse source collections
    // are still allowed to generate a playable puzzle instead of failing hard.
  } else if (effectiveDomains.size > 0) {
    reasons.push("current candidate is missing a corroborating source");
  }

  return {
    normalizedAnswer,
    reasons,
    valid: reasons.length === 0,
  };
}

/**
 * Parse a generated response payload and enforce the response contract.
 *
 * The JSON shape is expected to be a candidate list:
 *
 *   [
 *     { candidate 1 },
 *     { candidate 2 },
 *     { candidate 3 }
 *   ]
 *
 * The min/max bounds are deliberate: enough candidates to choose from, but
 * not so many that downstream selection becomes ambiguous.
 */
export function parseGenerationResponse(text: string): GeneratedCandidate[] {
  return rhobhGeneratedCandidateListSchema.parse(JSON.parse(text));
}

/**
 * Build the persisted puzzle shape from a validated candidate.
 *
 * Diagram:
 *
 *   validated candidate + date
 *                 |
 *                 v
 *            StoredPuzzle
 *                 |
 *                 v
 *         stable puzzleKey for the day
 */
export function buildStoredPuzzle(date: Date, candidate: GeneratedCandidate): StoredPuzzle {
  return {
    answer: candidate.answer,
    answerType: candidate.answerType,
    clue: candidate.clue,
    detail: candidate.detail,
    newsMode: candidate.newsMode,
    puzzleKey: `rhobh-${getLocalDayIndex(date)}`,
    role: candidate.role,
    source: "database",
  };
}

/**
 * Map a database record back into the in-memory stored puzzle shape.
 *
 * This is the inverse of the storage-facing portion of buildStoredPuzzle().
 * It keeps the puzzle key stable by deriving it from the record's local date key.
 */
export function mapRecordToStoredPuzzle(record: PuzzleRecord): StoredPuzzle {
  const puzzleKey = record.scheduledForDateKey
    ? getPuzzleKeyFromDateKey(record.scheduledForDateKey)
    : record.dateUtc
      ? getPuzzleKeyFromDateKey(record.dateUtc)
      : null;
  const parts = getLocalDateParts(record.scheduledForDateKey ?? record.dateUtc ?? "");
  const date = parts ? createCanonicalPuzzleDate(parts[0], parts[1], parts[2]) : new Date();
  return {
    answer: record.answer,
    answerType: record.answerType,
    clue: record.clue,
    detail: record.detail,
    newsMode: record.newsMode,
    puzzleKey: puzzleKey ?? `rhobh-${getLocalDayIndex(date)}`,
    role: record.role,
    source: "database",
  };
}
