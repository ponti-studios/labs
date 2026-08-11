import { describe, expect, it, vi } from "vitest";

import { fetchFeedItems } from "../ingest";

describe("fetchFeedItems", () => {
  it("normalizes RSS markup and control content while preserving safe fields", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          new Response(
            `<rss><channel><item><title>Tea &amp; Drama</title><link>https://realityblurb.com/story</link><pubDate>not-a-date</pubDate><description><![CDATA[<p>Line one</p>\u000BLine two</b>]]></description></item></channel></rss>`,
            { status: 200 },
          ),
        ),
    );

    await expect(fetchFeedItems("https://realityblurb.com/feed")).resolves.toEqual([
      {
        title: "Tea & Drama",
        link: "https://realityblurb.com/story",
        pubDate: "not-a-date",
        description: "Line one Line two",
      },
    ]);
  });

  it("returns an empty list when an RSS channel has no items", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("<rss><channel /></rss>")));

    await expect(fetchFeedItems("https://realityblurb.com/feed")).resolves.toEqual([]);
  });
});
