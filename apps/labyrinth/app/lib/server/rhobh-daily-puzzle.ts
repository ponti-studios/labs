import { and, desc, eq, gte } from "@pontistudios/db";
import { db, rhobhDailyPuzzles } from "@pontistudios/db";
import { chat } from "@tanstack/ai";
import { createOpenRouterText } from "@tanstack/ai-openrouter";
import { z } from "zod";

import {
  chooseArchivePuzzle,
  getRhobhAllowedSourceDomain,
  getRhobhArchiveMoments,
  getRhobhDateKey,
  mapPuzzleRecordToStoredPuzzle,
  RHOBH_FRANCHISE,
  RHOBH_PRIMARY_SOURCE_DOMAIN,
  RHOBH_REPEAT_WINDOW_DAYS,
  serializeStringArray,
  type RhobhGeneratedCandidate,
  type RhobhPuzzleEnvelope,
  type RhobhPuzzleRecord,
  type RhobhSourceItem,
  validateRhobhCandidate,
} from "../rhobh-daily-puzzle";
import { normalizeRhobhAnswer, type RhobhPuzzle } from "../realitea";
import { LabyrinthServerEnv } from "./env";

interface RhobhGenerationDependencies {
  fetchImpl?: typeof fetch;
  now?: Date;
}

const DDG_ENDPOINT = "https://html.duckduckgo.com/html/";
const RHOBH_CURRENT_SOURCE_QUERIES = [
  { domain: RHOBH_PRIMARY_SOURCE_DOMAIN, query: 'site:bravotv.com/the-daily-dish RHOBH OR "Real Housewives of Beverly Hills"' },
  { domain: "people.com", query: 'site:people.com RHOBH OR "Real Housewives of Beverly Hills"' },
  { domain: "ew.com", query: 'site:ew.com RHOBH OR "Real Housewives of Beverly Hills"' },
  { domain: "eonline.com", query: 'site:eonline.com RHOBH OR "Real Housewives of Beverly Hills"' },
  { domain: "usmagazine.com", query: 'site:usmagazine.com RHOBH OR "Real Housewives of Beverly Hills"' },
] as const;

const rhobhGenerationCandidateSchema = z.object({
  answer: z.string().min(1).meta({ description: "The RHOBH answer to guess." }),
  answerType: z
    .enum(["moment", "object", "person", "phrase", "place", "storyline"])
    .meta({ description: "The answer taxonomy." }),
  clue: z
    .string()
    .min(1)
    .meta({ description: "A non-spoiler clue for the final guess only." }),
  detail: z
    .string()
    .min(1)
    .meta({ description: "A spoiler-safe explanation shown after the game ends." }),
  newsMode: z
    .enum(["archive", "current"])
    .meta({ description: "Whether this comes from fresh RHOBH news or the curated archive." }),
  rationale: z.string().min(1).meta({ description: "Why this puzzle is a strong pick today." }),
  role: z.string().min(1).meta({ description: "Short descriptive label for the answer." }),
  sourceUrls: z.array(z.string()).meta({ description: "Source URLs supporting the candidate." }),
  sourceTitles: z.array(z.string()).meta({ description: "Titles matching the source URLs." }),
  sourcePublishedAt: z
    .array(z.string())
    .meta({ description: "Publication timestamps matching the source URLs." }),
  sourceSummary: z
    .array(z.string())
    .meta({ description: "Short summaries matching the source URLs." }),
});

const rhobhGenerationCandidatesSchema = z.array(rhobhGenerationCandidateSchema).min(3).max(5);

function stripHtml(value: string): string {
  return value
    .replace(/<script[\s\S]*?<\/script\s*>/gi, " ")
    .replace(/<style[\s\S]*?<\/style\s*>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function decodeDuckDuckGoRedirect(url: string): string {
  try {
    const parsed = new URL(url, "https://duckduckgo.com");
    const uddg = parsed.searchParams.get("uddg");
    return uddg ? decodeURIComponent(uddg) : parsed.toString();
  } catch {
    return url;
  }
}

function parseDuckDuckGoResults(html: string): Array<{ title: string; url: string }> {
  const matches = Array.from(
    html.matchAll(/<a[^>]*class="[^"]*result__a[^"]*"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi),
  );

  return matches
    .map((match) => ({
      title: stripHtml(match[2]),
      url: decodeDuckDuckGoRedirect(match[1]),
    }))
    .filter((result) => result.title.length > 0 && result.url.startsWith("http"));
}

async function searchSources(fetchImpl: typeof fetch, query: string): Promise<Array<{ title: string; url: string }>> {
  const body = new URLSearchParams({ q: query });
  const response = await fetchImpl(DDG_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": "Mozilla/5.0 RealiTeaBot/1.0",
    },
    body,
  });

  if (!response.ok) {
    return [];
  }

  return parseDuckDuckGoResults(await response.text());
}

async function fetchArticleSummary(fetchImpl: typeof fetch, url: string): Promise<string> {
  const response = await fetchImpl(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 RealiTeaBot/1.0",
    },
  });

  if (!response.ok) {
    return "";
  }

  return stripHtml(await response.text()).slice(0, 1200);
}

export async function collectRhobhCurrentSources(
  dependencies: RhobhGenerationDependencies = {},
): Promise<RhobhSourceItem[]> {
  const fetchImpl = dependencies.fetchImpl ?? fetch;
  const sourceItems: RhobhSourceItem[] = [];

  for (const sourceQuery of RHOBH_CURRENT_SOURCE_QUERIES) {
    const results = await searchSources(fetchImpl, sourceQuery.query);

    for (const result of results) {
      const domain = getRhobhAllowedSourceDomain(result.url);
      if (!domain || sourceItems.some((item) => item.url === result.url)) {
        continue;
      }

      const summary = await fetchArticleSummary(fetchImpl, result.url);

      sourceItems.push({
        domain,
        publishedAt: new Date().toISOString(),
        summary,
        title: result.title,
        url: result.url,
      });

      if (domain === sourceQuery.domain) {
        break;
      }
    }
  }

  return sourceItems;
}

async function generateRhobhCandidatesFromSources(
  dateKey: string,
  sources: RhobhSourceItem[],
  archivePool = getRhobhArchiveMoments(),
  excludedAnswers: string[] = [],
): Promise<RhobhGeneratedCandidate[]> {
  const env = LabyrinthServerEnv.safeParse(process.env);

  if (!env.success) {
    return [];
  }

  try {
    return await chat({
      adapter: createOpenRouterText(
        env.data.openRouterModel as "openai/gpt-5.1",
        env.data.openRouterApiKey,
      ),
      systemPrompts: [
        "You create daily RealiTea puzzles for RHOBH. Prefer current RHOBH news when source support is strong. Use the curated archive pool only when fresh news is thin. Never leak the answer in the clue or detail. Return only well-supported RHOBH-specific candidates.",
      ],
      messages: [
        {
          role: "user",
          content: JSON.stringify(
            {
              archivePool: archivePool.map((moment) => ({
                answer: moment.answer,
                answerType: moment.answerType,
                clue: moment.clue,
                detail: moment.detail,
                role: moment.role,
              })),
              dateKey,
              excludedAnswers,
              sources,
            },
            null,
            2,
          ),
        },
      ],
      outputSchema: rhobhGenerationCandidatesSchema,
    });
  } catch {
    return [];
  }
}

export async function getRecentRhobhAnswers(date: Date): Promise<Set<string>> {
  const cutoff = new Date(date);
  cutoff.setUTCDate(cutoff.getUTCDate() - RHOBH_REPEAT_WINDOW_DAYS);

  const rows = await db
    .select({ normalizedAnswer: rhobhDailyPuzzles.normalizedAnswer })
    .from(rhobhDailyPuzzles)
    .where(
      and(
        eq(rhobhDailyPuzzles.franchise, RHOBH_FRANCHISE),
        eq(rhobhDailyPuzzles.validationStatus, "approved"),
        gte(rhobhDailyPuzzles.dateUtc, getRhobhDateKey(cutoff)),
      ),
    );

  return new Set(rows.map((row) => row.normalizedAnswer));
}

export async function getStoredRhobhPuzzleForDate(date: Date): Promise<RhobhPuzzleRecord | null> {
  const dateKey = getRhobhDateKey(date);
  const row = await db
    .select()
    .from(rhobhDailyPuzzles)
    .where(
      and(
        eq(rhobhDailyPuzzles.franchise, RHOBH_FRANCHISE),
        eq(rhobhDailyPuzzles.dateUtc, dateKey),
        eq(rhobhDailyPuzzles.validationStatus, "approved"),
      ),
    )
    .orderBy(desc(rhobhDailyPuzzles.createdAt))
    .limit(1);

  return (row[0] as RhobhPuzzleRecord | undefined) ?? null;
}

export async function getAllStoredRhobhAnswers(): Promise<Set<string>> {
  const rows = await db
    .select({ normalizedAnswer: rhobhDailyPuzzles.normalizedAnswer })
    .from(rhobhDailyPuzzles)
    .where(eq(rhobhDailyPuzzles.franchise, RHOBH_FRANCHISE));

  return new Set(rows.map((row) => row.normalizedAnswer));
}

export async function loadRhobhPuzzleForDate(
  date: Date,
  fallbackPuzzle: RhobhPuzzle,
): Promise<RhobhPuzzleEnvelope> {
  const stored = await getStoredRhobhPuzzleForDate(date);

  if (stored) {
    return {
      puzzle: mapPuzzleRecordToStoredPuzzle(stored),
    };
  }

  return {
    puzzle: {
      ...fallbackPuzzle,
      puzzleKey: mapPuzzleRecordToStoredPuzzle({
        answer: fallbackPuzzle.answer,
        answerType: fallbackPuzzle.answerType ?? "person",
        clue: fallbackPuzzle.clue,
        dateUtc: getRhobhDateKey(date),
        detail: fallbackPuzzle.detail,
        franchise: RHOBH_FRANCHISE,
        generationStatus: "published",
        newsMode: fallbackPuzzle.newsMode ?? "archive",
        normalizedAnswer: normalizeRhobhAnswer(fallbackPuzzle.answer),
        role: fallbackPuzzle.role,
        sourcePublishedAt: "[]",
        sourceSummary: "[]",
        sourceTitles: "[]",
        sourceUrls: "[]",
        validationStatus: "approved",
      }).puzzleKey,
      source: "static",
    },
  };
}

export async function persistRhobhPuzzle(
  date: Date,
  candidate: RhobhGeneratedCandidate,
): Promise<RhobhPuzzleRecord> {
  const dateKey = getRhobhDateKey(date);
  const normalizedAnswer = normalizeRhobhAnswer(candidate.answer);

  await db
    .delete(rhobhDailyPuzzles)
    .where(and(eq(rhobhDailyPuzzles.franchise, RHOBH_FRANCHISE), eq(rhobhDailyPuzzles.dateUtc, dateKey)));

  const inserted = await db
    .insert(rhobhDailyPuzzles)
    .values({
      answer: candidate.answer,
      answerType: candidate.answerType,
      clue: candidate.clue,
      createdAt: new Date(),
      dateUtc: dateKey,
      detail: candidate.detail,
      franchise: RHOBH_FRANCHISE,
      generationStatus: "published",
      newsMode: candidate.newsMode,
      normalizedAnswer,
      role: candidate.role,
      sourcePublishedAt: serializeStringArray(candidate.sourcePublishedAt),
      sourceSummary: serializeStringArray(candidate.sourceSummary),
      sourceTitles: serializeStringArray(candidate.sourceTitles),
      sourceUrls: serializeStringArray(candidate.sourceUrls),
      updatedAt: new Date(),
      validationStatus: "approved",
    })
    .returning();

  return inserted[0] as RhobhPuzzleRecord;
}

export async function generateRhobhDailyPuzzle(
  date: Date,
  dependencies: RhobhGenerationDependencies = {},
): Promise<RhobhPuzzleRecord | null> {
  const fetchImpl = dependencies.fetchImpl ?? fetch;
  const dateKey = getRhobhDateKey(date);
  const previousAnswers = await getRecentRhobhAnswers(date);
  const sources = await collectRhobhCurrentSources({ fetchImpl, now: dependencies.now });
  const sourceDomains = new Set(sources.map((source) => source.domain).filter(Boolean));
  const hasCurrentCoverage =
    sourceDomains.has(RHOBH_PRIMARY_SOURCE_DOMAIN) && sourceDomains.size >= 2;

  if (!hasCurrentCoverage) {
    return persistRhobhPuzzle(date, chooseArchivePuzzle(date, previousAnswers));
  }

  const archivePool = getRhobhArchiveMoments();
  const rejectedCandidates = new Set<string>();

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const candidates = await generateRhobhCandidatesFromSources(
      dateKey,
      sources,
      archivePool,
      [...previousAnswers, ...rejectedCandidates],
    );

    if (candidates.length === 0) {
      break;
    }

    const validCurrent = candidates
      .map((candidate) => ({
        candidate,
        validation: validateRhobhCandidate(candidate, { previousAnswers, sources }),
      }))
      .sort((left, right) => {
        if (left.validation.valid !== right.validation.valid) {
          return left.validation.valid ? -1 : 1;
        }
        return right.candidate.sourceUrls.length - left.candidate.sourceUrls.length;
      });

    for (const entry of validCurrent) {
      if (entry.validation.valid && entry.candidate.newsMode === "current") {
        return persistRhobhPuzzle(date, entry.candidate);
      }

      rejectedCandidates.add(entry.validation.normalizedAnswer);
      console.warn("Rejected RHOBH candidate", {
        answer: entry.candidate.answer,
        reasons: entry.validation.reasons,
      });
    }
  }

  console.warn("RHOBH daily puzzle generation failed; using static runtime fallback", {
    dateKey,
    rejectedCandidates: [...rejectedCandidates],
  });

  return null;
}

export async function getStoredRhobhAnswersForValidation(): Promise<Set<string>> {
  return getAllStoredRhobhAnswers();
}
