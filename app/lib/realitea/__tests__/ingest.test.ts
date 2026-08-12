import { describe, expect, it, vi } from "vitest";

import { extractArticleText, fetchFeedItems } from "../ingest";

describe("fetchFeedItems", () => {
  it("normalizes RSS markup and control content while preserving safe fields", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(
          new Response(
            `<rss><channel><item><title>Tea &amp; Drama</title><link>https://realityblurb.com/story</link><pubDate>not-a-date</pubDate><description><![CDATA[<p>Line one</p>\u000BLine two</b>]]></description></item></channel></rss>`,
            { status: 200 },
          ),
        )
        .mockResolvedValueOnce(
          new Response("<html><body><article><p>The full story text.</p></article></body></html>"),
        ),
    );

    await expect(fetchFeedItems("https://realityblurb.com/feed")).resolves.toEqual([
      {
        title: "Tea & Drama",
        link: "https://realityblurb.com/story",
        pubDate: "not-a-date",
        description: "Line one Line two",
        articleText: "The full story text.",
      },
    ]);
  });

  it("returns an empty list when an RSS channel has no items", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("<rss><channel /></rss>")));

    await expect(fetchFeedItems("https://realityblurb.com/feed")).resolves.toEqual([]);
  });
});

describe("extractArticleText", () => {
  it("keeps the article body while excluding navigation and page chrome", () => {
    const text = extractArticleText(
      `<!doctype html><html><head><title>Story</title></head><body>
        <nav>Home Celebrity Shopping Subscribe</nav>
        <main><article>
          <header><h1>Celebrity reveals a surprise move</h1><p>By Reporter</p></header>
          <p>The actor announced the move during an interview.</p>
          <p>The decision followed months of private planning.</p>
        </article></main>
        <aside>Read more Trending stories</aside><footer>Terms Privacy</footer>
      </body></html>`,
      "https://example.com/story",
    );

    expect(text).toContain("The actor announced the move during an interview.");
    expect(text).toContain("The decision followed months of private planning.");
    expect(text).not.toContain("Subscribe");
    expect(text).not.toContain("Terms Privacy");
  });

  it("returns empty text when no readable article is present", () => {
    expect(
      extractArticleText(
        "<html><body><nav>Only navigation</nav><footer>Only footer</footer></body></html>",
        "https://example.com/no-article",
      ),
    ).toBe("");
  });
});
