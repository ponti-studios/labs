export type ProjectTech = {
  name: string;
  icon?: string;
};

export type ProjectSnapshot = {
  slug: string;
  name: string;
  shortDescription: string;
  category: "infrastructure" | "product" | "tool" | "library" | "research";
  tech: string[];
  status: "published" | "active" | "development" | "archived";
};

export type ProjectDetail = ProjectSnapshot & {
  description: string;
  /** The problem this exists to solve — who's affected, why it's hard, what breaks without it. */
  problem: string;
  keyFeatures: string[];
  /** Specific hard technical work required to make the solution real. */
  technicalChallenges: string[];
  techStack: string[];
  lastUpdated?: string;
  deployment?: {
    status: string;
    url?: string;
  };
  github: string;
};

export const projectSnapshots: ProjectSnapshot[] = [
  {
    slug: "kernel",
    name: "Kernel",
    shortDescription: "32 reusable agent skills for Claude Code",
    category: "library",
    tech: ["TypeScript", "Node.js"],
    status: "published",
  },
  {
    slug: "foundation",
    name: "Foundation",
    shortDescription: "Enterprise shared infrastructure with Docker & PostgreSQL",
    category: "infrastructure",
    tech: ["Docker", "PostgreSQL", "GitHub Actions"],
    status: "published",
  },
  {
    slug: "hominem",
    name: "Hominem",
    shortDescription: "Full-stack mobile & web platform with Expo + React",
    category: "product",
    tech: ["TypeScript", "React Native", "Hono", "PostgreSQL"],
    status: "active",
  },
  {
    slug: "hollywood",
    name: "Hollywood",
    shortDescription: "Entertainment data research platform with LLM extraction",
    category: "product",
    tech: ["TypeScript", "Python", "Hono", "SQLite"],
    status: "development",
  },
  {
    slug: "labs",
    name: "Labs (Labyrinth)",
    shortDescription: "Personal brand platform with 5 interconnected apps",
    category: "product",
    tech: ["TypeScript", "React", "PostgreSQL", "Tailwind"],
    status: "active",
  },
  {
    slug: "geo",
    name: "Geo (geokit)",
    shortDescription: "Swift geocoding CLI & macOS review application",
    category: "tool",
    tech: ["Swift", "Apple Maps", "macOS"],
    status: "development",
  },
  {
    slug: "toolbox",
    name: "Toolbox",
    shortDescription: "7 polyglot CLI tools (Rust, Go, Swift, Python)",
    category: "tool",
    tech: ["Rust", "Go", "Swift", "Python"],
    status: "development",
  },
  {
    slug: "ponti-mobile-starter",
    name: "Ponti Mobile Starter",
    shortDescription: "Reusable Expo framework for mobile experiments",
    category: "library",
    tech: ["TypeScript", "React Native", "Expo"],
    status: "development",
  },
  {
    slug: "ai-lab",
    name: "AI Lab",
    shortDescription: "Claude API research lab for extraction & agents",
    category: "research",
    tech: ["Python", "Claude API"],
    status: "development",
  },
];

export const projectDetails: Record<string, ProjectDetail> = {
  kernel: {
    slug: "kernel",
    name: "Kernel",
    shortDescription: "32 reusable agent skills for Claude Code",
    category: "library",
    tech: ["TypeScript", "Node.js"],
    status: "published",
    description:
      "32 specialized skills for software development and content production, published to NPM and installable through skills.sh.",
    problem:
      "Useful engineering judgment is often trapped in people's heads or buried in documentation. Kernel turns that judgment into skills an AI assistant can invoke for recurring work such as migrations, security reviews, and content production.",
    keyFeatures: [
      "32 skills across 7 categories (Writing, Music, Image, Development, UI & Brand, Audit, Operations)",
      "Individual or bulk installation with npx skills add",
      "Covers engineering, architecture, documentation, and content production",
      "Publicly published for the Claude Code community",
    ],
    technicalChallenges: [
      "Designing precise triggers so 32 skills coexist without collisions",
      "Keeping the format machine-readable, versioned, and editable by hand",
      "Validating every skill against real tasks before publishing",
    ],
    techStack: ["TypeScript", "Node.js", "skills.sh"],
    lastUpdated: "2026-07-11",
    deployment: {
      status: "Published (NPM)",
      url: "https://github.com/ponti-studios/kernel",
    },
    github: "https://github.com/ponti-studios/kernel",
  },

  foundation: {
    slug: "foundation",
    name: "Foundation",
    shortDescription: "Enterprise shared infrastructure with Docker & PostgreSQL",
    category: "infrastructure",
    tech: ["Docker", "PostgreSQL", "GitHub Actions"],
    status: "published",
    description:
      "Shared infrastructure for PostgreSQL, Redis, Docker Compose environments, and CI/CD across the organization.",
    problem:
      "Teams needing vector search or geospatial queries were rebuilding PostgreSQL images per project. Foundation provides one tested image and repeatable environments so development and production do not quietly drift apart.",
    keyFeatures: [
      "Custom PostgreSQL 18 image with pgvector, PostGIS, and pgRouting",
      "Docker Compose stacks for development, test, and production",
      "Automated GitHub Actions releases with semantic versioning",
      "Digest-pinned images and a machine-readable service catalog",
    ],
    technicalChallenges: [
      "Compiling three PostgreSQL extensions into one reliable PostgreSQL 18 image",
      "Making every deployment reproducible with immutable image digests",
      "Automating releases so shared infrastructure can update without a manual ritual",
    ],
    techStack: ["Docker", "PostgreSQL", "Redis", "GitHub Actions", "Just"],
    lastUpdated: "2026-07-06",
    deployment: {
      status: "Active CI/CD Pipeline",
      url: "ghcr.io/ponti-studios/foundation",
    },
    github: "https://github.com/ponti-studios/foundation",
  },

  hominem: {
    slug: "hominem",
    name: "Hominem",
    shortDescription: "One platform for mobile, web, and shared personal data",
    category: "product",
    tech: ["TypeScript", "React Native", "Hono", "PostgreSQL"],
    status: "active",
    description:
      "A product platform spanning the Omiro iOS app, Finance and Career web apps, and a centralized API.",
    problem:
      "Finance, career, and daily life are connected, but the tools that track them are usually isolated. Hominem puts those surfaces on one platform with shared data, auth, and infrastructure.",
    keyFeatures: [
      "Omiro iOS app built with Expo and React Native",
      "Finance and Career web applications",
      "Centralized Hono API with shared auth and data packages",
      "Turbo monorepo with type-safe shared infrastructure",
    ],
    technicalChallenges: [
      "Sharing typed business logic between native and web surfaces",
      "Enforcing dependency direction across apps, packages, and API layers",
      "Extracting reusable mobile infrastructure from a production app",
    ],
    techStack: ["TypeScript", "React", "React Native", "Expo", "Hono", "PostgreSQL", "Drizzle ORM"],
    lastUpdated: "2026-07-11",
    deployment: {
      status: "In active use",
    },
    github: "https://github.com/ponti-studios/hominem",
  },

  hollywood: {
    slug: "hollywood",
    name: "Hollywood",
    shortDescription: "Entertainment research platform with structured LLM extraction",
    category: "product",
    tech: ["TypeScript", "Python", "Hono", "SQLite"],
    status: "development",
    description:
      "A local-first platform that combines entertainment data ingestion with Claude-powered extraction from unstructured submissions.",
    problem:
      "Entertainment research is split across many sources, while the most valuable material arrives as unstructured submissions. Hollywood brings both into one searchable system and extracts useful fields automatically.",
    keyFeatures: [
      "Ingestion from trade publications, industry directories, and public databases",
      "Claude-powered extraction from query letters, decks, and submissions",
      "Unified entity graph for people, companies, projects, and submissions",
      "Raw payload archiving, JSONL export, and documented REST API",
    ],
    technicalChallenges: [
      "Normalizing eight-plus source types without losing provenance",
      "Preserving raw inputs so extraction can be re-run as prompts improve",
      "Modeling evolving relationships without an unmaintainable schema",
    ],
    techStack: ["TypeScript", "Python", "Hono", "SQLite", "Claude API", "OpenAPI"],
    lastUpdated: "2026-07-07",
    deployment: {
      status: "Development (localhost:4000)",
    },
    github: "https://github.com/ponti-studios/hollywood",
  },

  labs: {
    slug: "labs",
    name: "Labs (Labyrinth)",
    shortDescription: "Five connected apps on one shared platform",
    category: "product",
    tech: ["TypeScript", "React", "PostgreSQL", "Tailwind"],
    status: "active",
    description:
      "A monorepo containing Labyrinth and four connected applications, each with its own product surface and deployment workflow.",
    problem:
      "A static portfolio asks visitors to take capability on faith. Labs makes the work executable: live dashboards, maps, voting, and other product surfaces built on one design system and infrastructure layer.",
    keyFeatures: [
      "Labyrinth, Health, Commune, and Earth product surfaces",
      "Storybook-backed shared component library",
      "Shared PostgreSQL database with app-specific schemas",
      "WebSocket support for live updates and voting",
      "Independent development and deployment workflows in Turbo",
    ],
    technicalChallenges: [
      "Isolating five app schemas on one PostgreSQL instance",
      "Sharing reliable WebSocket connection and reconnection behavior",
      "Keeping one design system useful across a portfolio, dashboard, map, and community app",
    ],
    techStack: ["TypeScript", "React", "PostgreSQL", "Tailwind CSS", "Turbo", "Storybook"],
    lastUpdated: "2026-07-11",
    deployment: {
      status: "Active Development",
    },
    github: "https://github.com/ponti-studios/labs",
  },

  geo: {
    slug: "geo",
    name: "Geo (geokit)",
    shortDescription: "Geocoding tools with a native review workflow",
    category: "tool",
    tech: ["Swift", "Apple Maps", "macOS"],
    status: "development",
    description:
      "A Swift geocoding CLI and native macOS app for curating place data with Apple Maps.",
    problem:
      "Automated geocoding is fast but ambiguous, while manual review is accurate but slow. Geo combines batch geocoding with a native workflow for checking and correcting results before they enter a dataset.",
    keyFeatures: [
      "CLI for individual queries and SQLite batch processing",
      "Native SwiftUI macOS review application",
      "Apple Maps geocoding with SQLite enrichment",
      "Search, filtering, bulk operations, and request pacing",
    ],
    technicalChallenges: [
      "Adapting MapKit and CoreLocation APIs for headless batch work",
      "Respecting Apple's usage limits with configurable request pacing",
      "Keeping CLI output and native corrections consistent through one package and schema",
    ],
    techStack: ["Swift", "Apple Maps", "SQLite", "SwiftUI"],
    lastUpdated: "2026-07-06",
    deployment: {
      status: "Development (macOS CLI + App)",
    },
    github: "https://github.com/ponti-studios/geo",
  },

  toolbox: {
    slug: "toolbox",
    name: "Toolbox",
    shortDescription: "Seven CLI tools for data, media, and content",
    category: "tool",
    tech: ["Rust", "Go", "Swift", "Python"],
    status: "development",
    description:
      "A monorepo of focused CLI tools for content, media, data cleanup, and AI workflows.",
    problem:
      "Personal automation often starts as a throwaway script and becomes a liability. Toolbox turns recurring jobs involving content, media, and personal data into tested commands with explicit safeguards.",
    keyFeatures: [
      "Content pipeline from raw notes to scheduled social drafts",
      "File, photo, transcription, and Internet Archive utilities",
      "Post deletion and AI agent analytics tools",
      "Unified Justfile command surface across the monorepo",
    ],
    technicalChallenges: [
      "Matching each tool to the constraints of its runtime and data source",
      "Adding dry-run and verification steps before destructive operations",
      "Keeping one consistent command surface across four toolchains",
    ],
    techStack: ["Rust", "Go", "Swift", "Python", "TypeScript"],
    lastUpdated: "2026-07-06",
    deployment: {
      status: "Development (CLI Tools)",
    },
    github: "https://github.com/ponti-studios/toolbox",
  },

  "ponti-mobile-starter": {
    slug: "ponti-mobile-starter",
    name: "Ponti Mobile Starter",
    shortDescription: "Production-tested Expo starter for mobile apps",
    category: "library",
    tech: ["TypeScript", "React Native", "Expo"],
    status: "development",
    description:
      "A reusable mobile framework extracted from the production Omiro app, with the setup needed to start new Expo projects quickly.",
    problem:
      "New mobile projects lose time rebuilding auth, navigation, theming, and observability before product work starts. This starter extracts those patterns from a production app instead of offering an untested template.",
    keyFeatures: [
      "Application shell, navigation, and design tokens",
      "Authentication and API client integration points",
      "Observability hooks and Expo/EAS release profiles",
      "Patterns extracted from a production iOS app",
    ],
    technicalChallenges: [
      "Extracting shared concerns from Omiro without destabilizing it",
      "Keeping the starter generic while preserving production lessons",
      "Encoding real operational decisions instead of empty scaffolding",
    ],
    techStack: ["TypeScript", "React Native", "Expo", "EAS"],
    lastUpdated: "2026-07-06",
    deployment: {
      status: "Template (Development)",
    },
    github: "https://github.com/ponti-studios/ponti-mobile-starter",
  },

  "ai-lab": {
    slug: "ai-lab",
    name: "AI Lab",
    shortDescription: "Evaluation and extraction workflows for Claude",
    category: "research",
    tech: ["Python", "Claude API"],
    status: "development",
    description:
      "An internal lab for evaluating Claude workflows, building extraction workers, and orchestrating agents.",
    problem:
      "LLM prompts change quickly, but without evaluation those changes ship untested and regressions surface silently. AI Lab makes prompt and extraction quality measurable before a workflow reaches a product.",
    keyFeatures: [
      "Structured extraction workers and retrieval experiments",
      "Agent pipeline orchestration",
      "Prompt contracts, model benchmarks, and regression tests",
      "CLI smoke tests and validation workflows",
    ],
    technicalChallenges: [
      "Testing prompt and extraction changes for silent regressions",
      "Benchmarking models and prompt variants on the same task",
      "Keeping evaluated pipelines reusable across products",
    ],
    techStack: ["Python", "Claude API"],
    lastUpdated: "2026-07-06",
    deployment: {
      status: "Internal Research Lab",
    },
    github: "https://github.com/ponti-studios/ai-lab",
  },
};
