import type { CategoryGroup } from "./picker";

/**
 * Hand-written fixture bank for correctness testing. Deliberately includes a
 * few groups whose words/riskWords overlap with each other (see the
 * comments below) so tests can prove the collision check actually rejects
 * bad combinations rather than always trivially passing.
 */
export const fixtureBank: CategoryGroup[] = [
  // --- yellow (easiest, literal) ---
  {
    id: "y1",
    category: "Popular Programming Languages",
    difficulty: "yellow",
    words: ["Python", "Ruby", "Rust", "Go"],
    riskWords: ["Java", "Swift"],
  },
  {
    id: "y2",
    category: "Git Commands",
    difficulty: "yellow",
    words: ["Push", "Pull", "Commit", "Merge"],
    riskWords: ["Fetch", "Rebase"],
  },
  {
    id: "y3",
    category: "HTTP Methods",
    difficulty: "yellow",
    words: ["GET", "POST", "PUT", "DELETE"],
    riskWords: ["PATCH"],
  },
  {
    id: "y4",
    category: "Text Editors",
    difficulty: "yellow",
    words: ["Vim", "Emacs", "Nano", "Sublime"],
    riskWords: ["Atom"],
  },
  // y5 intentionally shares the literal word "Java" with y1's risk list, and
  // also collides with y6 on the word "Swift" — used to test that the
  // picker never seats y1 alongside y5, or y1 alongside y6.
  {
    id: "y5",
    category: "Coffee Terms Borrowed by Tech",
    difficulty: "yellow",
    words: ["Java", "Mocha", "Latte", "Grind"],
  },
  {
    id: "y6",
    category: "Also a Bird",
    difficulty: "yellow",
    words: ["Swift", "Firefox", "Raven", "Phoenix"],
  },
  {
    id: "y7",
    category: "Cloud Providers (initialisms)",
    difficulty: "yellow",
    words: ["AWS", "GCP", "Azure", "IBM"],
  },

  // --- green (medium) ---
  {
    id: "g1",
    category: "___ Overflow",
    difficulty: "green",
    words: ["Stack", "Buffer", "Integer", "Call"],
    riskWords: ["Array"],
  },
  {
    id: "g2",
    category: "Words Before 'Engineer'",
    difficulty: "green",
    words: ["Software", "DevOps", "Data", "Platform"],
  },
  {
    id: "g3",
    category: "Database Types",
    difficulty: "green",
    words: ["Relational", "Document", "Graph", "Key-Value"],
  },
  {
    id: "g4",
    category: "Famous Outages",
    difficulty: "green",
    words: ["CrowdStrike", "Cloudflare", "Fastly", "Solarwinds"],
  },
  {
    id: "g5",
    category: "Words Before 'Debt'",
    difficulty: "green",
    words: ["Technical", "National", "Credit", "Public"],
  },
  {
    id: "g6",
    category: "Standup Meeting Lies",
    difficulty: "green",
    words: ["Almost done", "Just a quick fix", "Should be quick", "Works on my machine"],
  },
  {
    id: "g7",
    category: "Things That Get 'Deprecated'",
    difficulty: "green",
    words: ["API", "Feature", "Browser", "Library"],
  },

  // --- blue (harder) ---
  {
    id: "b1",
    category: "Words Before 'Trace'",
    difficulty: "blue",
    words: ["Stack", "Back", "Foot", "Con"],
    // b1 collides with g1 on "Stack" -- proves the check works across tiers too.
  },
  {
    id: "b2",
    category: "VC Pitch-Deck Buzzwords",
    difficulty: "blue",
    words: ["Synergy", "Moat", "Runway", "Traction"],
  },
  {
    id: "b3",
    category: "Things With a 'Root'",
    difficulty: "blue",
    words: ["Square", "Directory", "Cause", "Access"],
  },
  {
    id: "b4",
    category: "Hacker News Comment Clichés",
    difficulty: "blue",
    words: ["Show HN", "This but unironically", "Rewrite it in Rust", "cool story"],
  },
  {
    id: "b5",
    category: "Types of Testing",
    difficulty: "blue",
    words: ["Unit", "Smoke", "Regression", "Canary"],
  },
  {
    id: "b6",
    category: "Things That Can Be 'Deployed'",
    difficulty: "blue",
    words: ["Troops", "Code", "Parachute", "Airbag"],
  },

  // --- purple (hardest, wordplay) ---
  {
    id: "p1",
    category: "Snack Foods That Are Also Tech Terms",
    difficulty: "purple",
    words: ["Kernel", "Chip", "Cookie", "Cracker"],
    riskWords: ["Root", "Byte"],
  },
  {
    id: "p2",
    category: "Sound-Alikes for Programming Concepts",
    difficulty: "purple",
    words: ["Cache", "Byte", "Sequel", "Currying"],
  },
  {
    id: "p3",
    category: "Terminal Double Meanings",
    difficulty: "purple",
    words: ["Terminal", "Shell", "Root", "Session"],
    // p3 collides with p1's riskWords ("Root") -- another cross-check case.
  },
  {
    id: "p4",
    category: "Mascots",
    difficulty: "purple",
    words: ["Tux", "Duke", "Gopher", "Ferris"],
  },
  {
    id: "p5",
    category: "Also Slang for a Person Who's Annoying",
    difficulty: "purple",
    words: ["Git", "Muppet", "Wally", "Plonker"],
  },
];
