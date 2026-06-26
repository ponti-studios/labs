import "dotenv/config";
import { parseArgs } from "node:util";

import { XMLParser } from "fast-xml-parser";

import { generateEmbedding } from "@pontistudios/ai";
import {
  appendSearchCorpus,
  DbEnv,
  db,
  inArray,
  searchDocuments,
  type NewSearchDocument,
  populateSearchCorpus,
} from "@pontistudios/db";

import { getErrorMessage } from "../app/lib/errors";
import { withDbCleanup } from "../app/lib/realitea-scripts";
import { LabyrinthServerEnv } from "../app/lib/server/env";

type RssItem = {
  title: string;
  link: string;
  pubDate: string;
  description: string;
  categories: string[];
};

type VarietyArticleMeta = {
  title: string;
  description: string;
  author: string[];
  section: string;
  verticals: string[];
  categories: string[];
  keywords: string[];
  publishedAt: string;
};

const FEED_PAGE_LIMIT = 15;
const DEFAULT_SYNC_PAGE_LIMIT = 3;
const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36";

type LoadMode = "refresh" | "sync";

function decodeHtml(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#8217;/g, "’")
    .replace(/&#8216;/g, "‘")
    .replace(/&#8220;/g, "“")
    .replace(/&#8221;/g, "”")
    .replace(/&#8211;/g, "–")
    .replace(/&#8212;/g, "—")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function stripHtml(value: string): string {
  return decodeHtml(value.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
}

function normalize(value: string): string {
  return value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/['’"]/g, "")
    .replace(/[^a-z0-9\s-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function toArray(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.flatMap((entry) => toArray(entry));
  }
  if (typeof value === "string") return [decodeHtml(value)];
  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    if (typeof record["#text"] === "string") return [decodeHtml(record["#text"])];
  }
  return [];
}

async function fetchXml(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      "user-agent": USER_AGENT,
      "accept-language": "en-US,en;q=0.9",
    },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch feed page ${url}: ${response.status}`);
  }
  return response.text();
}

function parseFeedItems(xml: string): RssItem[] {
  const parser = new XMLParser({ ignoreAttributes: false });
  const parsed = parser.parse(xml);
  const rawItems = parsed?.rss?.channel?.item ?? [];
  const items = Array.isArray(rawItems) ? rawItems : [rawItems];

  return items.map((item) => {
    const record = item as Record<string, unknown>;
    return {
      title: decodeHtml(String(record.title ?? "")),
      link: String(record.link ?? ""),
      pubDate: String(record.pubDate ?? ""),
      description: stripHtml(String(record.description ?? "")),
      categories: toArray(record.category),
    };
  });
}

async function fetchFeedPage(page: number): Promise<RssItem[]> {
  const candidates = [
    `https://variety.com/feed/${page}/`,
    `https://variety.com/feed/?paged=${page}`,
  ];

  for (const url of candidates) {
    try {
      const xml = await fetchXml(url);
      const items = parseFeedItems(xml);
      if (items.length > 0) return items;
    } catch (error) {
      if (url === candidates[candidates.length - 1]) {
        throw error;
      }
    }
  }

  return [];
}

async function getKnownSourceUrls(sourceUrls: string[]): Promise<Set<string>> {
  if (sourceUrls.length === 0) return new Set();

  const rows = await db
    .select({ sourceUrl: searchDocuments.sourceUrl })
    .from(searchDocuments)
    .where(inArray(searchDocuments.sourceUrl, sourceUrls));

  return new Set(rows.map((row) => row.sourceUrl));
}

function extractJsonObject(source: string, label: string): Record<string, unknown> | null {
  const startPattern = new RegExp(`${label}\\s*=\\s*`, "m");
  const startMatch = source.match(startPattern);
  if (!startMatch || startMatch.index === undefined) return null;

  const startIndex = startMatch.index + startMatch[0].length;
  const openIndex = source.indexOf("{", startIndex);
  if (openIndex === -1) return null;

  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let index = openIndex; index < source.length; index += 1) {
    const char = source[index];
    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === '"') {
        inString = false;
      }
      continue;
    }

    if (char === '"') {
      inString = true;
      continue;
    }

    if (char === "{") depth += 1;
    if (char === "}") depth -= 1;
    if (depth === 0) {
      const jsonText = source.slice(openIndex, index + 1);
      try {
        return JSON.parse(jsonText) as Record<string, unknown>;
      } catch {
        return null;
      }
    }
  }

  return null;
}

function parseMetaContent(html: string, name: string): string | null {
  const pattern = new RegExp(`<meta[^>]+(?:name|property)=["']${name}["'][^>]+content=["']([^"']+)["']`, "i");
  const match = html.match(pattern);
  return match ? decodeHtml(match[1] ?? "").trim() : null;
}

function deriveKind(verticals: string[], link: string): "movie" | "tv" {
  const normalizedLink = normalize(link);
  if (verticals.some((value) => normalize(value).includes("tv"))) return "tv";
  if (verticals.some((value) => normalize(value).includes("film"))) return "movie";
  if (normalizedLink.includes("/tv/")) return "tv";
  return "movie";
}

async function fetchArticleMeta(item: RssItem): Promise<VarietyArticleMeta> {
  const response = await fetch(item.link, {
    headers: {
      "user-agent": USER_AGENT,
      "accept-language": "en-US,en;q=0.9",
    },
  });

  if (!response.ok) {
    return {
      title: item.title,
      description: item.description,
      author: [],
      section: item.categories[0] ?? "News",
      verticals: [],
      categories: item.categories,
      keywords: item.categories,
      publishedAt: item.pubDate,
    };
  }

  const html = await response.text();
  const pmcFpd = extractJsonObject(html, "window\\.pmc_fpd");

  const title =
    parseMetaContent(html, "og:title") ?? parseMetaContent(html, "twitter:title") ?? item.title;
  const description =
    parseMetaContent(html, "og:description") ??
    parseMetaContent(html, "description") ??
    item.description;

  const article = (pmcFpd?.article ?? {}) as Record<string, unknown>;
  const author = toArray(article.authors ?? article.author);
  const section = String(article.section ?? item.categories[0] ?? "News");
  const verticals = toArray(article.verticals);
  const categories = toArray(article.categories).concat(item.categories);
  const keywords = toArray(article.keywords).concat(categories);
  const publishedAt = String(article.publishedAt ?? item.pubDate);

  return {
    title: decodeHtml(title),
    description: stripHtml(description),
    author,
    section,
    verticals,
    categories: [...new Set(categories.filter(Boolean))],
    keywords: [...new Set(keywords.filter(Boolean))],
    publishedAt,
  };
}

function toYear(value: string): number {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date().getFullYear() : date.getFullYear();
}

function toTagSet(values: Array<string | number>): string[] {
  return [...new Set(values.map((value) => normalize(String(value))).filter(Boolean))];
}

function buildRecord(item: RssItem, meta: VarietyArticleMeta): NewSearchDocument {
  const vertical = meta.verticals.find((value) => normalize(value).includes("tv"))
    ? "TV"
    : meta.verticals.find((value) => normalize(value).includes("film"))
      ? "Film"
      : item.link.includes("/tv/")
        ? "TV"
        : "Film";
  const kind = deriveKind(meta.verticals, item.link);
  const publishedAt = new Date(meta.publishedAt);
  const publishYear = Number.isNaN(publishedAt.getTime()) ? toYear(item.pubDate) : publishedAt.getFullYear();
  const sourceUrl = item.link;
  const sourceUrlSummary = new URL(sourceUrl).pathname.replaceAll("/", " ").trim();
  const body = [
    meta.description,
    `Variety ${meta.section} coverage.`,
    `Vertical: ${vertical}.`,
    `Keywords: ${meta.keywords.join(", ")}.`,
    `Categories: ${meta.categories.join(", ")}.`,
    `Authors: ${meta.author.join(", ")}.`,
    `Path: ${sourceUrlSummary}.`,
  ]
    .filter(Boolean)
    .join(" ");

  const tags = toTagSet([
    ...meta.keywords,
    ...meta.categories,
    ...meta.author,
    vertical,
    kind,
    "Variety",
    publishYear,
  ]);

  const featured =
    meta.keywords.some((value) => /exclusive|first look|ending explained|review/i.test(value)) ||
    meta.categories.some((value) => /news|tv|film/i.test(value)) ||
    item.title.length < 80;

  const recencyScore = Math.max(0, 120 - Math.abs(Date.now() - publishedAt.getTime()) / 86_400_000);
  const popularity = Math.round(recencyScore + tags.length * 2 + (featured ? 15 : 0));

  return {
    kind,
    title: meta.title,
    subtitle: `${meta.section}${meta.author[0] ? ` · ${meta.author[0]}` : ""}`,
    summary: meta.description,
    body,
    category: meta.section,
    location: `Variety · ${vertical}`,
    year: publishYear,
    sourceUrl,
    publishedAt,
    tags,
    featured,
    popularity,
    searchText: [
      meta.title,
      meta.description,
      meta.section,
      vertical,
      meta.author.join(" "),
      meta.categories.join(" "),
      meta.keywords.join(" "),
      item.title,
      item.description,
      sourceUrl,
      publishYear,
    ]
      .map((value) => String(value).toLowerCase())
      .join(" "),
    embedding: [],
  };
}

async function mapLimit<T, R>(items: T[], limit: number, mapper: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = [];
  let index = 0;

  async function worker() {
    while (index < items.length) {
      const currentIndex = index;
      index += 1;
      results[currentIndex] = await mapper(items[currentIndex]!);
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => worker()));
  return results;
}

async function buildSearchRecord(item: RssItem, meta: VarietyArticleMeta): Promise<NewSearchDocument> {
  const record = buildRecord(item, meta);
  try {
    const embedding = await generateEmbedding(record.searchText);
    return { ...record, embedding };
  } catch (error) {
    console.warn(`Embedding generation failed for ${record.title}:`, error);
    return { ...record, embedding: [] };
  }
}

function parseLoadArgs(): { mode: LoadMode; pages: number } {
  const { values } = parseArgs({
    args: process.argv.slice(2),
    options: {
      mode: { type: "string" },
      pages: { type: "string" },
    },
    allowPositionals: true,
    strict: true,
  });

  const mode = values.mode === "sync" ? "sync" : "refresh";
  const defaultPages = mode === "sync" ? DEFAULT_SYNC_PAGE_LIMIT : FEED_PAGE_LIMIT;
  const pages = values.pages ? Number.parseInt(values.pages, 10) : defaultPages;

  if (!Number.isFinite(pages) || pages < 1) {
    throw new Error(`Invalid page count: ${values.pages}`);
  }

  return { mode, pages };
}

async function scrapeVarietyCorpus(pageLimit: number): Promise<NewSearchDocument[]> {
  const seenInRun = new Set<string>();
  const records: NewSearchDocument[] = [];

  for (let page = 1; page <= pageLimit; page += 1) {
    const items = await fetchFeedPage(page);
    if (items.length === 0) break;

    const pageItems = items.filter((item) => {
      if (!item.link || seenInRun.has(item.link)) return false;
      seenInRun.add(item.link);
      return true;
    });

    if (pageItems.length === 0) continue;

    const knownSourceUrls = await getKnownSourceUrls(pageItems.map((item) => item.link));
    const firstKnownIndex = pageItems.findIndex((item) => knownSourceUrls.has(item.link));
    const itemsToProcess = firstKnownIndex === -1 ? pageItems : pageItems.slice(0, firstKnownIndex);

    if (itemsToProcess.length === 0) {
      console.log(`Reached already-seen RSS item on page ${page}; stopping crawl`);
      break;
    }

    const metas = await mapLimit(itemsToProcess, 5, fetchArticleMeta);
    const pairs = itemsToProcess.map((item, index) => ({
      item,
      meta: metas[index]!,
    }));
    const pageRecords = await mapLimit(pairs, 3, async ({ item, meta }) => buildSearchRecord(item, meta));
    records.push(...pageRecords);

    if (firstKnownIndex !== -1) {
      console.log(`Reached already-seen RSS item on page ${page}; stopping crawl after ${pageRecords.length} new items`);
      break;
    }
  }

  return records;
}

async function main() {
  LabyrinthServerEnv.parse(process.env);
  DbEnv.parse(process.env);

  const { mode, pages } = parseLoadArgs();
  const records = await scrapeVarietyCorpus(pages);

  if (mode === "sync") {
    await appendSearchCorpus(records);
    return;
  }

  await populateSearchCorpus(records);
}

if (!process.env.VITEST) {
  await withDbCleanup(main).catch((err) => {
    console.error(getErrorMessage(err));
    process.exit(1);
  });
}
