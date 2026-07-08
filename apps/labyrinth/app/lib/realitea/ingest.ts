/**
 * Ingest job: polls active feeds and stores newly-seen articles.
 *
 * Deliberately decoupled from puzzle generation and run on its own cadence
 * (e.g. hourly) — its only job is to make sure an article gets captured into
 * `articles` before it scrolls out of the source feed's short item window.
 * Dedup happens at the database via the `articles.url` unique constraint, so
 * re-polling a feed that returns the same items is a no-op.
 */

import { db, eq, feeds } from "@pontistudios/db";
import type { Feed } from "@pontistudios/db";
import { XMLParser } from "fast-xml-parser";

import { getErrorMessage } from "../errors";
import { createLogger } from "../logger.server";

import { upsertArticles } from "./repository";
import type { FeedItem } from "./types";

const logger = createLogger();

function extractUrlLikeNode(value: unknown): string | undefined {
  if (!value) return undefined;
  if (Array.isArray(value)) {
    for (const entry of value) {
      const url = extractUrlLikeNode(entry);
      if (url) return url;
    }
    return undefined;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed || undefined;
  }

  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    const candidates = [
      record["@_url"],
      record.url,
      record["@_href"],
      record.href,
      record["#text"],
    ];
    for (const candidate of candidates) {
      if (typeof candidate === "string" && candidate.trim()) {
        return candidate.trim();
      }
    }
  }

  return undefined;
}

export async function fetchFeedItems(feedUrl: string): Promise<FeedItem[]> {
  const res = await fetch(feedUrl);
  if (!res.ok) throw new Error(`Failed to fetch RSS feed: ${res.status}`);
  const xml = await res.text();
  const parser = new XMLParser({ ignoreAttributes: false });
  const parsed = parser.parse(xml);
  const items: unknown[] = parsed?.rss?.channel?.item ?? [];
  return items.map((item: unknown) => {
    const i = item as Record<string, unknown>;
    const description = String(i["description"] ?? "").replace(/<|>/g, "");
    const imageUrl =
      extractUrlLikeNode(i["media:content"]) ??
      extractUrlLikeNode(i["media:thumbnail"]) ??
      extractUrlLikeNode(i["enclosure"]);
    return {
      title: String(i["title"] ?? ""),
      link: String(i["link"] ?? ""),
      pubDate: String(i["pubDate"] ?? ""),
      description,
      ...(imageUrl ? { imageUrl } : {}),
    };
  });
}

function parsePubDate(pubDate: string): Date | undefined {
  const date = new Date(pubDate);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

/** Fetch one feed and store any articles not already known by url. Returns the count newly inserted. */
export async function ingestFeed(feed: Feed): Promise<number> {
  const childLogger = logger.child({ operation: "ingestFeed", feedId: feed.id, url: feed.url });
  try {
    const items = await fetchFeedItems(feed.url);
    const inserted = await upsertArticles(
      feed.id,
      items
        .filter((item) => item.link)
        .map((item) => ({
          url: item.link,
          title: item.title,
          description: item.description || undefined,
          imageUrl: item.imageUrl,
          publishedAt: parsePubDate(item.pubDate),
        })),
    );
    childLogger.info(
      { event: "[FEED_INGESTED]", itemCount: items.length, insertedCount: inserted },
      `ingested ${inserted} new article(s) from feed`,
    );
    return inserted;
  } catch (err) {
    childLogger.error(
      { event: "[FEED_INGEST_ERROR]", error: getErrorMessage(err) },
      "failed to ingest feed",
    );
    return 0;
  }
}

/** Ingest every active feed. Returns the total number of new articles inserted. */
export async function ingestAllActiveFeeds(): Promise<number> {
  const activeFeeds = await db.query.feeds.findMany({ where: eq(feeds.active, true) });
  const results = await Promise.all(activeFeeds.map((feed) => ingestFeed(feed)));
  return results.reduce((sum, n) => sum + n, 0);
}
