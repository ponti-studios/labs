export const DEFAULT_GAME_SLUG = "reality";

export const GAME_CATALOG = [
  {
    slug: "reality",
    name: "Reality",
    genre: "celebrity",
    feedUrl: "https://realityblurred.com/feed",
    feedLabel: "Reality Blurred",
  },
  {
    slug: "technology",
    name: "Tech News",
    genre: "technology",
    feedUrl: "https://techcrunch.com/feed/",
    feedLabel: "TechCrunch",
  },
  {
    slug: "page-six",
    name: "Page Six",
    genre: "celebrity",
    feedUrl: "https://pagesix.com/feed/",
    feedLabel: "Page Six",
  },
  {
    slug: "tmz",
    name: "TMZ",
    genre: "celebrity",
    feedUrl: "https://www.tmz.com/rss.xml",
    feedLabel: "TMZ",
  },
  {
    slug: "sports",
    name: "Sports News",
    genre: "sports",
    feedUrl: "https://www.cbssports.com/rss/headlines/",
    feedLabel: "CBS Sports",
  },
] as const;
