import archiveMoments from "../data/rhobh-archive-moments.json";
import { z } from "zod";
import {
  type RhobhAnswerType,
  type RhobhNewsMode,
  normalizeRhobhAnswer,
  type RhobhPuzzle,
} from "./realitea";

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
export const RHOBH_MIN_ANSWER_LENGTH = 4;
export const RHOBH_MAX_ANSWER_LENGTH = 10;

export type RhobhPuzzleSource = "database" | "static";
export type RhobhGenerationStatus = "failed" | "published";
export type RhobhValidationStatus = "approved" | "rejected";

export interface RhobhSourceItem {
  title: string;
  url: string;
  publishedAt: string;
  summary: string;
  domain: string;
}

export interface RhobhGeneratedCandidate extends RhobhPuzzle {
  answerType: RhobhAnswerType;
  newsMode: RhobhNewsMode;
  rationale: string;
  sourceUrls: string[];
  sourceTitles: string[];
  sourcePublishedAt: string[];
  sourceSummary: string[];
}

export interface RhobhStoredPuzzle extends RhobhPuzzle {
  answerType?: RhobhAnswerType;
  newsMode?: RhobhNewsMode;
  puzzleKey: string;
  source: RhobhPuzzleSource;
}

export interface RhobhPuzzleRecord {
  answer: string;
  answerType: RhobhAnswerType;
  clue: string;
  createdAt?: Date | null;
  dateUtc: string;
  detail: string;
  franchise: string;
  generationStatus: RhobhGenerationStatus | string;
  id?: number;
  newsMode: RhobhNewsMode;
  normalizedAnswer: string;
  role: string;
  sourcePublishedAt: string;
  sourceSummary: string;
  sourceTitles: string;
  sourceUrls: string;
  updatedAt?: Date | null;
  validationStatus: RhobhValidationStatus | string;
}

export interface RhobhValidationContext {
  archiveAnswers?: Set<string>;
  previousAnswers?: Set<string>;
  sources?: RhobhSourceItem[];
}

export interface RhobhValidationResult {
  normalizedAnswer: string;
  reasons: string[];
  valid: boolean;
}

export interface RhobhPuzzleEnvelope {
  puzzle: RhobhStoredPuzzle;
}

const rhobhGeneratedCandidateSchema = z.object({
  answer: z.string().min(1),
  answerType: z.enum(["moment", "object", "person", "phrase", "place", "storyline"]),
  clue: z.string().min(1),
  detail: z.string().min(1),
  newsMode: z.enum(["archive", "current"]),
  rationale: z.string().min(1),
  role: z.string().min(1),
  sourcePublishedAt: z.array(z.string()),
  sourceSummary: z.array(z.string()),
  sourceTitles: z.array(z.string()),
  sourceUrls: z.array(z.string()),
});

const rhobhGeneratedCandidateListSchema = z.array(rhobhGeneratedCandidateSchema).min(3).max(5);

export function getRhobhDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function isRhobhDateKey(value: string): boolean {
  return RHOBH_DATE_FORMAT.test(value);
}

export function parseRhobhDate(value: string | null | undefined): Date | null {
  if (!value || !isRhobhDateKey(value)) {
    return null;
  }

  const parsed = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function parseStringArray(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

export function serializeStringArray(values: string[]): string {
  return JSON.stringify(values);
}

export function getRhobhArchiveMoments(): RhobhGeneratedCandidate[] {
  return (archiveMoments as Array<{
    answer: string;
    answerType: RhobhAnswerType;
    clue: string;
    detail: string;
    role: string;
    newsMode: RhobhNewsMode;
  }>).map((moment) => ({
    ...moment,
    rationale: "Curated RHOBH archive fallback",
    sourceUrls: [],
    sourceTitles: [],
    sourcePublishedAt: [],
    sourceSummary: [],
  }));
}

export function getRhobhAllowedSourceDomain(url: string): string | null {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, "");
    return RHOBH_ALLOWED_SOURCE_DOMAINS.find((domain) => hostname === domain || hostname.endsWith(`.${domain}`)) ?? null;
  } catch {
    return null;
  }
}

export function validateRhobhCandidate(
  candidate: RhobhGeneratedCandidate,
  context: RhobhValidationContext = {},
): RhobhValidationResult {
  const reasons: string[] = [];
  const normalizedAnswer = normalizeRhobhAnswer(candidate.answer);
  const clueUpper = candidate.clue.toUpperCase();
  const detailUpper = candidate.detail.toUpperCase();
  const archiveAnswers =
    context.archiveAnswers ?? new Set(getRhobhArchiveMoments().map((moment) => normalizeRhobhAnswer(moment.answer)));
  const previousAnswers = context.previousAnswers ?? new Set<string>();
  const sources = context.sources ?? [];

  if (normalizedAnswer.length < RHOBH_MIN_ANSWER_LENGTH || normalizedAnswer.length > RHOBH_MAX_ANSWER_LENGTH) {
    reasons.push("answer length is unsupported");
  }

  if (!normalizedAnswer || /[^A-Z]/.test(normalizedAnswer)) {
    reasons.push("answer does not normalize cleanly to letters");
  }

  if (!candidate.answerType) {
    reasons.push("answer type is missing");
  }

  if (clueUpper.includes(normalizedAnswer) || detailUpper.includes(normalizedAnswer)) {
    reasons.push("answer is leaked in clue or detail");
  }

  if (previousAnswers.has(normalizedAnswer)) {
    reasons.push("answer repeats inside cooldown window");
  }

  if (candidate.newsMode === "current") {
    const sourceDomains = new Set(
      candidate.sourceUrls.map((url) => getRhobhAllowedSourceDomain(url) ?? "").filter(Boolean),
    );
    const domains = new Set(
      sources
        .map((source) => source.domain || getRhobhAllowedSourceDomain(source.url) || "")
        .filter(Boolean),
    );
    const effectiveDomains = sourceDomains.size > 0 ? sourceDomains : domains;

    if (!effectiveDomains.has(RHOBH_PRIMARY_SOURCE_DOMAIN)) {
      reasons.push("current candidate is missing Bravo primary coverage");
    }

    if (effectiveDomains.size < 2) {
      reasons.push("current candidate is missing a corroborating source");
    }
  }

  if (candidate.newsMode === "archive" && !archiveAnswers.has(normalizedAnswer)) {
    reasons.push("archive candidate is not backed by the curated archive pool");
  }

  return {
    normalizedAnswer,
    reasons,
    valid: reasons.length === 0,
  };
}

export function parseRhobhGenerationResponse(text: string): RhobhGeneratedCandidate[] {
  return rhobhGeneratedCandidateListSchema.parse(JSON.parse(text));
}

export function chooseArchivePuzzle(
  date: Date,
  previousAnswers: Set<string>,
  archivePool = getRhobhArchiveMoments(),
): RhobhGeneratedCandidate {
  const eligible = archivePool.filter((moment) => !previousAnswers.has(normalizeRhobhAnswer(moment.answer)));
  const pool = eligible.length > 0 ? eligible : archivePool;
  const dayIndex = Math.floor(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) / 86_400_000);
  return pool[dayIndex % pool.length];
}

export function buildRhobhStoredPuzzle(
  date: Date,
  candidate: RhobhGeneratedCandidate,
  source: RhobhPuzzleSource,
): RhobhStoredPuzzle {
  return {
    answer: candidate.answer,
    answerType: candidate.answerType,
    clue: candidate.clue,
    detail: candidate.detail,
    newsMode: candidate.newsMode,
    puzzleKey: `rhobh-${Math.floor(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) / 86_400_000)}`,
    role: candidate.role,
    source,
  };
}

export function mapPuzzleRecordToStoredPuzzle(record: RhobhPuzzleRecord): RhobhStoredPuzzle {
  return {
    answer: record.answer,
    answerType: record.answerType,
    clue: record.clue,
    detail: record.detail,
    newsMode: record.newsMode,
    puzzleKey: `rhobh-${Math.floor(Date.UTC(new Date(record.dateUtc).getUTCFullYear(), new Date(record.dateUtc).getUTCMonth(), new Date(record.dateUtc).getUTCDate()) / 86_400_000)}`,
    role: record.role,
    source: "database",
  };
}
