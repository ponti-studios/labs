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
  whatItDoes: string;
  keyFeatures: string[];
  whyItsImpressive: string[];
  techStack: string[];
  commits?: number;
  releases?: number;
  lastUpdated?: string;
  deployment?: {
    status: string;
    url?: string;
  };
  github: string;
};

export const projectSnapshots: readonly ProjectSnapshot[] = [
  {
    slug: "kernel",
    name: "Kernel",
    shortDescription: "31 reusable agent skills for Claude Code",
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
    shortDescription: "31 reusable agent skills for Claude Code",
    category: "library",
    tech: ["TypeScript", "Node.js"],
    status: "published",
    description:
      "Collection of 31 specialized agent skills for software development and content production, published as an NPM package and installed via skills.sh.",
    whatItDoes:
      "Kernel is a library of reusable skills for Claude Code that span full-stack development, content creation, and DevOps. Each skill encodes best practices and workflows that can be installed individually or in bulk.",
    keyFeatures: [
      "31 skills across 12 categories (Writing, Art, API, React, Database, UI, Production, Security)",
      "Individual or bulk installation via npx skills add",
      "Covers essays, videos, transcripts, songs, documentation, design, architecture",
      "Available to Claude Code community (publicly published)",
      "Regular updates and new skill additions",
    ],
    whyItsImpressive: [
      "Adopted and installed by other engineers through a public package — not a demo, a tool people actually run",
      "Two versioned releases and steady commits mean this gets maintained, not abandoned after launch",
      "Skills span backend architecture, security review, and writing — one person fluent in both code and communication",
      "Each skill is a documented, repeatable process — the instinct to turn tacit knowledge into something a team can reuse",
    ],
    techStack: ["TypeScript", "Node.js", "skills.sh"],
    commits: 313,
    releases: 2,
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
      "Shared infrastructure layer for ponti-studios organization. Single source of truth for PostgreSQL, Redis, Docker Compose stacks, and CI/CD automation.",
    whatItDoes:
      "Foundation provides production-grade infrastructure consumed by all ponti-studios products. It includes custom Docker images, Compose stacks, and automated CI/CD pipelines that publish versioned images to GHCR.",
    keyFeatures: [
      "Custom PostgreSQL 18 image with pgvector, PostGIS, and pgRouting",
      "Docker Compose stacks for dev, test, and production environments",
      "Automated GitHub Actions pipeline with semantic versioning",
      "Digest pinning for reproducible deployments",
      "Machine-readable service catalog",
      "Justfile task runner for unified operations",
    ],
    whyItsImpressive: [
      "Every commit to main ships a new versioned image automatically — zero-touch release discipline",
      "Digest-pinned deployments mean environments are reproducible, not \"works on my machine\"",
      "Extends PostgreSQL with vector search and geospatial routing — the same database stack modern recommendation and mapping systems run on",
      "One image, consumed by every other product in the org — infrastructure built to be depended on, not duplicated",
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
    shortDescription: "Full-stack mobile & web platform with Expo + React",
    category: "product",
    tech: ["TypeScript", "React Native", "Hono", "PostgreSQL"],
    status: "active",
    description:
      "Product monorepo with active surfaces spanning mobile (Omiro iOS app), web applications (Finance, Career, Rocco), and centralized API. Demonstrates full-stack architectural patterns.",
    whatItDoes:
      "Hominem is a comprehensive product platform with multiple user-facing surfaces built from a shared codebase. It includes a native iOS app via Expo, multiple web applications for different domains, a centralized Hono backend, and shared packages for database, auth, UI, and more.",
    keyFeatures: [
      "Omiro: Native iOS app with Expo and React Native",
      "Finance: Financial tracking and portfolio management web app",
      "Career: Job search and career timeline management",
      "Rocco: Specialized feature application",
      "Workers: Background job processing and scheduling",
      "Centralized Hono API with proper auth layer",
      "Shared packages: db, env, auth, rpc, ui, telemetry, hooks",
      "Monorepo architecture with Turbo orchestration",
    ],
    whyItsImpressive: [
      "A native iOS app, three web products, and a shared API — one architecture serving every surface",
      "1,830+ commits and a tagged v1.0.1 release — this shipped, it didn't stall at 80%",
      "Dependencies only flow one direction (apps → shared packages → API) — the discipline that keeps a codebase workable after year two",
      "The mobile shell was pulled out into its own reusable starter — built for the next project, not just this one",
    ],
    techStack: ["TypeScript", "React", "React Native", "Expo", "Hono", "PostgreSQL", "Drizzle ORM"],
    commits: 1830,
    lastUpdated: "2026-07-11",
    deployment: {
      status: "v1.0.1 Released",
    },
    github: "https://github.com/ponti-studios/hominem",
  },

  hollywood: {
    slug: "hollywood",
    name: "Hollywood",
    shortDescription: "Entertainment data research platform with LLM extraction",
    category: "product",
    tech: ["TypeScript", "Python", "Hono", "SQLite"],
    status: "development",
    description:
      "Local-first platform for ingesting entertainment industry data into unified searchable database. Combines multi-source ingestion with Claude-powered LLM extraction.",
    whatItDoes:
      "Hollywood ingests entertainment data from RSS feeds, structured APIs, and directories into a unified SQLite database. Uses Claude API for intelligent extraction from raw text and PDFs, maintaining raw archives and normalized entity graphs.",
    keyFeatures: [
      "Multi-source ingestion: Variety, Deadline, Hollywood Reporter, The Wrap, TMDB, Wikidata, IMDb, WGA",
      "LLM extraction: Claude-powered structured extraction from submission text",
      "Entity graph: Unified schema for candidates, projects, submissions, people, companies",
      "Raw payload archiving: Preserves original data for audit trail",
      "JSONL export: Data export for analysis and research",
      "REST API with OpenAPI docs for full CRUD operations",
      "Health checks and diagnostics for configuration validation",
    ],
    whyItsImpressive: [
      "Pulls from eight-plus industry sources (Variety, Deadline, TMDB, WGA, IMDb) into one queryable database — the unglamorous data-plumbing work entertainment products depend on",
      "Uses an LLM to turn messy submission documents into structured records — applied extraction solving a real problem, not a chatbot demo",
      "Every raw payload is archived before processing — auditable, re-runnable pipelines instead of one-shot scripts",
      "Ships with OpenAPI docs and health checks — built to be handed to another engineer, not just run locally",
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
    shortDescription: "Personal brand platform with 5 interconnected apps",
    category: "product",
    tech: ["TypeScript", "React", "PostgreSQL", "Tailwind"],
    status: "active",
    description:
      "Monorepo containing Labyrinth and 4 other interconnected applications. A sophisticated personal brand platform showcasing multiple product surfaces.",
    whatItDoes:
      "Labs is an integrated ecosystem of applications including Labyrinth (portfolio), Health (medical dashboard), Commune (social voting), and Earth (geographic browser). All share infrastructure, design system, and real-time capabilities.",
    keyFeatures: [
      "Labyrinth: Personal portfolio and brand showcase (port 3001)",
      "Health: Medical data dashboard with real-time updates (port 3003)",
      "Commune: Social voting and community decision-making (port 3005)",
      "Earth: Geographic data browser with MapLibre and live feeds (port 3006)",
      "Storybook: Component library and design system (port 3007)",
      "Shared PostgreSQL database with app-specific schemas",
      "WebSocket support for real-time updates",
      "OpenRouter AI integration for enhanced features",
      "Turbo monorepo with independent dev workflows",
    ],
    whyItsImpressive: [
      "Five products — portfolio, health tracking, community voting, geographic data — sharing one infrastructure and design system",
      "Real-time updates over WebSockets, not just page reloads — the same pattern behind live dashboards and collaborative tools",
      "12 tagged releases in active development — a cadence, not a one-time launch",
      "A working Storybook component library — the UI is built to be reused, not copy-pasted between pages",
    ],
    techStack: ["TypeScript", "React", "PostgreSQL", "Tailwind CSS", "Turbo", "Storybook"],
    releases: 12,
    lastUpdated: "2026-07-11",
    deployment: {
      status: "Active Development",
    },
    github: "https://github.com/ponti-studios/labs",
  },

  geo: {
    slug: "geo",
    name: "Geo (geokit)",
    shortDescription: "Swift geocoding CLI & macOS review application",
    category: "tool",
    tech: ["Swift", "Apple Maps", "macOS"],
    status: "development",
    description:
      "Native Swift geocoding CLI and macOS application for place data curation using Apple Maps.",
    whatItDoes:
      "Geo provides two tools: a geokit CLI for geocoding queries against Apple Maps and enriching SQLite databases, and a native macOS app for reviewing and correcting geocoded place records.",
    keyFeatures: [
      "geokit CLI: Geocode individual queries or batch process SQLite",
      "geokit-review: Native SwiftUI macOS app for place review workflow",
      "Apple Maps integration (not third-party geocoding)",
      "SQLite database persistence and enrichment",
      "Text search, filtering, and bulk operations",
      "Manual review and correction workflow",
      "Configurable request pacing (geocoding courtesy)",
    ],
    whyItsImpressive: [
      "Built directly on Apple's MapKit, not a third-party geocoding API — comfort working close to the platform, not just consuming SDKs",
      "Ships as both a CLI and a native SwiftUI macOS app — the same logic reused across a scriptable tool and a polished GUI",
      "Includes request pacing to stay a good citizen of Apple's geocoding service — the kind of operational courtesy that keeps API access from getting revoked",
      "Solves a real, unglamorous problem: reviewing and correcting messy location data by hand, made fast",
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
    shortDescription: "7 polyglot CLI tools (Rust, Go, Swift, Python)",
    category: "tool",
    tech: ["Rust", "Go", "Swift", "Python"],
    status: "development",
    description:
      "Monorepo of specialized command-line tools and utilities built with polyglot approach, choosing the right language for each job.",
    whatItDoes:
      "Toolbox is a collection of CLI tools and small applications solving personal productivity problems. Each tool is implemented in the most appropriate language: Rust for performance, Go for networking, Swift for OS integration, Python for data processing.",
    keyFeatures: [
      "filekit (Rust): Frontmatter, calendar, file utilities, essay classification",
      "careerkit (Go): Markdown-to-DOCX resume builder with verification",
      "xkit (Go): X/Twitter post deletion tool",
      "mediakit (Swift): Video/audio transcription via Apple Speech",
      "datpiff (Python): Internet Archive mixtape crawler",
      "photokit (Python): EXIF analysis, date repair, batch renaming",
      "agentkit (TypeScript): AI agent analytics (Claude, OpenRouter, etc)",
      "Unified Justfile orchestration across all tools",
    ],
    whyItsImpressive: [
      "Seven tools, four languages — Rust where speed matters, Go for networking, Swift for OS integration, Python for data wrangling",
      "Each tool solves a real, specific problem (resume generation, media transcription, EXIF repair) rather than existing as a language exercise",
      "One Justfile ties every tool together — comfort building and maintaining tooling across ecosystems, not just within one",
      "The kind of range a small team needs when there's no one else to reach for the right tool",
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
    shortDescription: "Reusable Expo framework for mobile experiments",
    category: "library",
    tech: ["TypeScript", "React Native", "Expo"],
    status: "development",
    description:
      "Reusable mobile framework extracted from production Omiro app, enabling rapid mobile experiments with pre-built patterns.",
    whatItDoes:
      "Ponti Mobile Starter is a template and framework for launching new mobile applications quickly. It encodes the patterns, architecture, and theming system from the production Omiro app, while remaining reusable across experiments.",
    keyFeatures: [
      "Application shell with navigation structure",
      "Theming and design tokens system",
      "Authentication seams and initialization patterns",
      "API client integration points",
      "Observability and monitoring hooks",
      "Expo and EAS release profiles for iOS",
      "Extracted from production app (proven patterns)",
    ],
    whyItsImpressive: [
      "Extracted from a shipping app, not built from a tutorial — the patterns here already survived contact with real users",
      "Auth, theming, and API integration are pre-wired — the boring 80% of every new app, solved once",
      "Comes with Expo/EAS release profiles ready to go — a new iOS app can reach TestFlight in hours, not weeks",
      "Evidence of thinking past the current project: building the thing that makes the next five projects faster",
    ],
    techStack: ["TypeScript", "React Native", "Expo", "EAS"],
    commits: 113,
    lastUpdated: "2026-07-06",
    deployment: {
      status: "Template (Development)",
    },
    github: "https://github.com/ponti-studios/ponti-mobile-starter",
  },

  "ai-lab": {
    slug: "ai-lab",
    name: "AI Lab",
    shortDescription: "Claude API research lab for extraction & agents",
    category: "research",
    tech: ["Python", "Claude API"],
    status: "development",
    description:
      "Internal research lab for experimenting with Claude API, building extraction workers, and orchestrating agent workflows.",
    whatItDoes:
      "AI Lab is a workspace for researching and developing Claude-powered features. It includes extraction worker experiments, retrieval system prototypes, agent pipeline orchestration, and evaluation frameworks.",
    keyFeatures: [
      "Extraction worker development for structured data",
      "Retrieval system experimentation",
      "Agent pipeline orchestration",
      "Evaluation frameworks with regression testing",
      "Prompt contracts and model benchmarking",
      "CLI entry points for smoke tests and validation",
    ],
    whyItsImpressive: [
      "Every extraction pipeline ships with regression tests — prompts are treated like code, with the same expectation of not silently breaking",
      "Built to benchmark models and prompt variants against each other — decisions backed by evaluation, not vibes",
      "Infrastructure-first approach: reusable extraction and retrieval components, not one-off scripts glued to a single use case",
      "The kind of internal tooling that lets a small team ship AI features with production-level confidence",
    ],
    techStack: ["Python", "Claude API"],
    commits: 155,
    lastUpdated: "2026-07-06",
    deployment: {
      status: "Internal Research Lab",
    },
    github: "https://github.com/ponti-studios/ai-lab",
  },
};
