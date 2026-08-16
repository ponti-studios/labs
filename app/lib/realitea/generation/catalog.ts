export const DEFAULT_REALITEA_GAME_SLUG = "rhobh";

export const REALITEA_GAME_CATALOG = [
  {
    slug: "rhobh",
    name: "Reality",
    genre: "celebrity",
    feedUrl: "https://realityblurb.com/feed",
    feedLabel: "Reality Blurb",
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
