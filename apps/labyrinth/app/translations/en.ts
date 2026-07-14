export const STUDIO_TRANSLATIONS_EN = {
  nav: {
    brandAlt: "Ponti Studios",
    services: "Services",
    work: "Work",
    projects: "Projects",
    manifesto: "Manifesto",
    book: "Book",
  },
  projects: {
    categoryLabels: {
      product: "Products",
      infrastructure: "Infrastructure",
      library: "Libraries",
      tool: "Tools",
      research: "Research",
    },
    statusLabels: {
      published: "Published",
      active: "Active",
      development: "Development",
      archived: "Archived",
    },
    page: {
      title: "The Lab",
      metaDescription: "11 projects spanning products, infrastructure, tools, and research",
      detailMetaDescription: "Project details and information",
      notFound: "Project not found",
      back: "Back to Lab",
      previous: "Previous",
      next: "Next",
      problem: "The Problem",
      howItWorks: "How It Works",
      engineeringChallenges: "Engineering Challenges",
      repository: "Repository",
    },
    entries: {
      kernel: {
        name: "Kernel",
        shortDescription: "32 reusable agent skills for Claude Code",
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
      },
      foundation: {
        name: "Foundation",
        shortDescription: "Enterprise shared infrastructure with Docker & PostgreSQL",
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
      },
      hominem: {
        name: "Hominem",
        shortDescription: "One platform for mobile, web, and shared personal data",
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
      },
      hollywood: {
        name: "Hollywood",
        shortDescription: "Entertainment research platform with structured LLM extraction",
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
      },
      commune: {
        name: "Commune",
        shortDescription: "Anonymous peer deliberation for difficult decisions",
        description:
          "A social decision-making app that turns a personal situation into a neutral case for a small anonymous jury.",
        problem:
          "Advice from friends is often shaped by the way a story is told and by existing relationships. Commune separates the account from the decision: an AI creates a neutral version, then friends vote independently and explain their reasoning.",
        keyFeatures: [
          "AI-assisted neutralization of the original situation",
          "Anonymous jury with independent agree or disagree votes",
          "Comments and quorum-based verdict reveal",
          "Shareable cases with a personal docket for tracking decisions",
        ],
        technicalChallenges: [
          "Removing identifying and persuasive framing without losing the facts",
          "Preventing early votes from influencing later independent judgments",
          "Handling anonymous participation while preserving case ownership and vote integrity",
        ],
      },
      earth: {
        name: "Earth",
        shortDescription: "Live map for exploring London traffic cameras",
        description:
          "A live geospatial viewer for browsing London's TfL traffic camera network on an interactive map.",
        problem:
          "Traffic camera data is useful only when it is easy to locate and inspect. Earth puts a large, changing camera network into a map interface with direct search, camera detail, and live availability state.",
        keyFeatures: [
          "Interactive MapLibre map with camera locations",
          "Search by camera name or location",
          "Live and offline camera availability indicators",
          "Camera detail views with coordinates and feeds",
        ],
        technicalChallenges: [
          "Rendering a large geospatial dataset without making the map difficult to use",
          "Keeping external camera data current while handling unavailable feeds",
          "Connecting map selection, search results, and detail routes into one workflow",
        ],
      },
      health: {
        name: "Health",
        shortDescription: "Personal workspace for symptoms, care, and medication",
        description:
          "A personal health workspace for understanding symptoms, tracking progress, and organizing care.",
        problem:
          "Health decisions are spread across symptoms, appointments, medication, insurance, and local care options. Health brings those recurring tasks into one practical workspace instead of treating each decision as a separate lookup.",
        keyFeatures: [
          "Symptom guidance with monitoring and follow-up status",
          "Appointment scheduling and upcoming-care dashboard",
          "Medication pen duration calculator",
          "Hospital lookup and Medicare comparison tools",
        ],
        technicalChallenges: [
          "Presenting symptom guidance clearly without turning it into a diagnosis",
          "Keeping monitored symptoms, resolutions, and appointments coherent over time",
          "Building focused tools for medication planning, hospitals, and Medicare without fragmenting the experience",
        ],
      },
      geo: {
        name: "Geo (geokit)",
        shortDescription: "Geocoding tools with a native review workflow",
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
      },
      toolbox: {
        name: "Toolbox",
        shortDescription: "Seven CLI tools for data, media, and content",
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
      },
      "ponti-mobile-starter": {
        name: "Ponti Mobile Starter",
        shortDescription: "Production-tested Expo starter for mobile apps",
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
      },
      "ai-lab": {
        name: "AI Lab",
        shortDescription: "Evaluation and extraction workflows for Claude",
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
      },
    },
  },

  common: {
    bookCall: "Book a call",
    replyWithin: "I reply within 24 hours.",
    contactSteps: [
      {
        title: "Schedule a call",
        description: "No pressure conversation about your needs (30 mins)",
      },
      { title: "Discovery session", description: "If it's a fit, I'll dig deeper (1–2 weeks)" },
      { title: "Proposal", description: "Detailed scope, timeline, and investment" },
      { title: "Partnership", description: "If you love it, I get to work" },
    ],
    pillars: {
      product: "Product",
      advisory: "Advisory",
    },
  },

  services: {
    meta: {
      title: "Services | Ponti Studios",
      description:
        "Product engineering, design, and advisory — scoped clearly, shipped with proof.",
    },
    hero: {
      title: "You have problems.",
      punch: "I solve them.",
      seeWork: "See the work",
    },
    services: {
      title: "What I do",
      intro: "No vague retainers. No hidden fees. Just clear outcomes.",
    },
    process: {
      title: "How we start",
      intro: "Simple path from first conversation to signed scope. No process theater.",
    },
    cta: {
      title: "Ready when you are.",
      body: "Thirty minutes. No pitch deck. If it's a fit, you'll leave with a clear next step.",
    },
    faqLink: "Questions about pricing, scope, and fit",
  },

  work: {
    meta: {
      title: "Selected Work | Ponti Studios",
      description: "deployed improvements",
    },
    hero: {
      title: "Selected work",
      description: "deployed improvements",
    },
    approachTitle: "Approach",
    backToWork: "All work",
    nextCta: {
      title: "Need something similar solved?",
      body: "If the problem looks familiar, let's talk about yours.",
    },
  },

  catalog: {
    proof: {
      title: "Selected work",
      whatWeDidLabel: "What I did",
      outcomeLabel: "Outcome",
      readCaseStudy: "Read the full case study →",
      // Reverse chronological. Source of truth: vault ponti-studios/projects/* — only vault-backed outcomes.
      // listHook is index-only (short); full outcomes stay on the case study page.
      snapshots: [
        {
          slug: "lumina",
          client: "Lumina",
          industry: "EdTech",
          timeline: "2025",
          role: "Senior Product & Platform Engineer",
          listHook: { value: "+43%", label: "feed engagement" },
          problem:
            "Acquisition leaking at checkout; retention broken by discovery, course continuity, and grading trust.",
          whatWeDid:
            "Six independently shippable workstreams across search, retention, payments, frontend performance, and grading reliability.",
          approach: [
            "Structured the rebuild as six independently shippable workstreams with clear interface boundaries, so no single risky rewrite blocked delivery",
            "Built hybrid BM25 + pgvector search directly in Postgres instead of adding an external search service the scale didn't justify",
            "Migrated Svelte 4 to 5 surface-by-surface behind feature flags — every component reversible without a deploy",
            "Fixed grading disputes by moving from floating-point to integer arithmetic with write serialization",
          ],
          outcomes: [
            { value: "+43%", label: "Feed engagement" },
            { value: "2 days", label: "Course return time, down from 1–2 weeks" },
            { value: "~40%", label: "Higher second-course enrollment" },
            { value: "32%", label: "Faster time-to-interactive" },
          ],
        },
        {
          slug: "revrock",
          client: "Revrock",
          industry: "Music",
          timeline: "2024–2025",
          role: "Product Lead",
          listHook: { value: "Weeks → hrs", label: "tour planning" },
          problem:
            "Independent musicians planned tours on intuition and spreadsheets — no audience density, routing efficiency, or financial viability until after the tour.",
          whatWeDid:
            "Product-led the MVP: user research through launch for tour routing, venue selection, and planning financials.",
          approach: [
            "Cut a 12–18 month founder vision to a three-week MVP by ranking features on user urgency, not enthusiasm",
            "Modeled tour routing as an operations problem — geography, market sequencing, and cost held in one tool",
            "Made venue selection audience-informed instead of guesswork-driven",
            "Surfaced estimated revenue and viability during planning, not after the tour ended",
          ],
          outcomes: [
            { value: "Hours", label: "Tour planning time, down from weeks" },
            { value: "20–35%", label: "Higher estimated revenue vs. manual tours" },
          ],
        },
        {
          slug: "prolog",
          client: "Prolog",
          industry: "Entertainment",
          timeline: "2024",
          role: "Product Lead",
          listHook: { value: "~95%", label: "extraction accuracy" },
          problem:
            "Showrunner teams drowning in email and spreadsheet submission triage during peak staffing.",
          whatWeDid:
            "Designed and built an AI extraction and review pipeline with confidence scoring and human override.",
          approach: [
            "Replaced manual email and spreadsheet triage with a structured intake and extraction pipeline",
            "Added confidence scoring so low-certainty extractions route to human review instead of failing silently",
            "Designed the review UI around peak-staffing-season volume, not steady-state usage",
          ],
          outcomes: [
            { value: "~95%", label: "Extraction accuracy" },
            { value: "~70%", label: "Reduction in review time" },
            { value: "3×", label: "Reviewer throughput" },
          ],
        },
        {
          slug: "streamyard",
          client: "StreamYard",
          industry: "Creator",
          timeline: "2020–2024",
          role: "Lead Product Engineer & Product Manager",
          listHook: { value: "$15M+", label: "enterprise ARR" },
          problem:
            "Solo-creator product hit a B2B ceiling — no workspaces, no real roles, no path for agencies and media teams.",
          whatWeDid:
            "Led product and engineering for Teams/Business tier and the creator marketplace, from architecture through launch.",
          approach: [
            "Introduced a workspace abstraction so assets and permissions could be shared instead of tied to a single userId",
            "Replaced the boolean isHost flag with numeric RBAC (role values as integers) so future roles slot in without schema changes",
            "Migrated to the new model in four independently-deployable phases — zero downtime, no phase depended on the next having shipped",
            "Built vector-based creator recommendations and AI conversation starters to fix a 34% collaboration-to-conversation drop-off",
          ],
          outcomes: [
            { value: "$15M+", label: "Enterprise ARR unlocked" },
            { value: "13%", label: "Consumer growth within 3 months of Business launch" },
            { value: "300%", label: "YoY creator collaborations" },
          ],
        },
        {
          slug: "whistle",
          client: "Whistle",
          industry: "Education",
          timeline: "2020–2021",
          role: "Platform Engineer",
          listHook: { value: "100%", label: "class continuity" },
          problem:
            "Generic video tools broke movement pedagogy — wrong topology, noise cancellation killing music, layouts built for conversation, and no self-hosted path for schools with minors.",
          whatWeDid:
            "Built a purpose-built streaming stack for dance, yoga, and fitness instruction during COVID lockdowns.",
          approach: [
            "Selected WebRTC topology adaptively by class size instead of forcing one mode for every session",
            "Rebuilt the audio pipeline so music was not treated as noise to cancel",
            "Designed full-body video layouts for correction, not head-and-shoulder conference framing",
            "Shipped a self-hosted deployment path so data never left the organization's infrastructure",
          ],
          outcomes: [
            { value: "100%", label: "Curriculum continuity in NYC ballet pilot" },
            { value: "−35%", label: "Bandwidth vs. generic platforms" },
            { value: "<100ms", label: "Latency at 720p+ across variable networks" },
          ],
        },
        {
          slug: "kensho",
          client: "Kensho",
          industry: "Finance",
          timeline: "2019–2020",
          role: "Head of Data Engineering",
          listHook: { value: "24×", label: "data throughput" },
          problem:
            "Multi-modal data pipeline collapsing under peak load; operational knowledge trapped in individual heads.",
          whatWeDid:
            "Led batch-to-streaming platform migration, hardware-aware routing, and durable on-call and onboarding systems.",
          approach: [
            "Migrated batch ETL to Kafka and Faust streaming, running both pipelines in parallel until output matched before any cutover",
            "Split GPU-intensive transcription from market-data ticks onto separate hardware-routed worker pools",
            "Replaced tribal knowledge with explicit on-call ownership, escalation protocols, and self-describing alerts",
            "Led the 15-person engineering org through the S&P Global acquisition integration",
          ],
          outcomes: [
            { value: "24×", label: "Data throughput" },
            { value: "<50ms", label: "Market-data latency, down from ~10 min" },
            { value: "3 hrs", label: "Time-to-first-PR, down from 1 week" },
          ],
        },
        {
          slug: "humana",
          client: "Humana",
          industry: "Healthcare",
          timeline: "2018–2019",
          role: "Product Lead / Architecture Lead",
          listHook: { value: "<30s", label: "claims lag" },
          problem:
            "Senior care UX was a clinical safety problem; PHI on non-BAA infrastructure; enrollment and claims data hours stale; Android users locked out of health tracking.",
          whatWeDid:
            "Led whole-person care product framing across voice, mobile, and chat, then a ten-issue architecture audit and redesign of the Edge platform.",
          approach: [
            "Interviewed seniors and care managers to reframe the product from symptom reporting to contact that felt worth initiating",
            "Partitioned PHI off Alexa standard infrastructure before a HIPAA exposure became an incident",
            "Rebuilt claims visibility with CDC + Kafka so care advocates stopped acting on multi-hour-stale data",
            "Added Android health integration via FHIR R4 and BIPA-compliant biometric consent across IL, TX, WA, and NY",
          ],
          outcomes: [
            { value: "<30s", label: "Claims data lag, down from hours" },
            { value: "3 modes", label: "Care platform live — voice, mobile, chat" },
            { value: "BIPA", label: "Biometric consent across IL, TX, WA, NY" },
          ],
        },
        {
          slug: "mimecast",
          client: "Mimecast",
          industry: "Security",
          timeline: "2018",
          role: "Senior Software Engineer / Engineering Lead",
          listHook: { value: "2 weeks", label: "ahead of deadline" },
          problem:
            "Enterprise console blocked white-label and non-English markets; a government identity platform was 4+ weeks behind with 30% of eng time lost to merge conflicts.",
          whatWeDid:
            "Built theming and i18n as architecture, then recovered the identity platform with explicit ownership swimlanes.",
          approach: [
            "Implemented white-label theming via CSS custom properties so a new client theme is one config file, not component rewrites",
            "Redistributed task ownership with a swimlane model after workflow analysis showed coordination overhead, not capacity, was the bottleneck",
            "Cut code review from multi-day cycles by making ownership boundaries and interface contracts explicit",
          ],
          outcomes: [
            { value: "2 weeks", label: "Ahead of original deadline (was 4 behind)" },
            { value: "−80%", label: "Merge conflicts" },
            { value: "+40%", label: "Team productivity" },
            { value: "4 hrs", label: "Code review, down from 2 days" },
          ],
        },
        {
          slug: "help-refugees",
          client: "Help Refugees",
          industry: "Nonprofit",
          timeline: "2016",
          role: "Product Engineer",
          listHook: { value: "Sheet → app", label: "volunteer ops" },
          problem:
            "UK refugee volunteer coordination ran on a shared Google Sheet — no roles, no validation, no audit trail, operations stuck managing the sheet instead of the work.",
          whatWeDid:
            "Pro-bono React/Rails volunteer interface that replaced the sheet with role separation, validated submissions, and a full audit trail.",
          approach: [
            "Drew a hard boundary between volunteer submission and operations admin — enforced in the product, not by trust",
            "Replaced free-form fields with validated structured forms so malformed data never reached the ops team",
            "Logged every change with volunteer identity, timestamp, and content for real-time coordination and post-hoc tracing",
            "Scoped ruthlessly: only what was essential to retire the Google Sheet",
          ],
          outcomes: [
            { value: "UK-wide", label: "Volunteer network on the new platform" },
            { value: "1 system", label: "Replaced the shared Google Sheet" },
            { value: "Full", label: "Audit trail on every submission" },
          ],
        },
        {
          slug: "thomson-reuters",
          client: "Thomson Reuters",
          industry: "Enterprise",
          timeline: "2015–2018",
          role: "Senior Software Engineer",
          listHook: { value: "97%", label: "faster API" },
          problem:
            "Global deploy and monitoring tooling siloed; primary API ~14s; a monolith optimized for no one.",
          whatWeDid:
            "Unified the Compass platform, migrated the API, decomposed the monolith, and ran technical debt as a product program.",
          approach: [
            "Migrated the Rails API to Node/GraphQL so clients fetched only the fields they needed, not full records",
            "Decomposed one monolithic Angular app into three sub-applications after usage tracking showed three user groups with divergent workflows",
            "Raised end-to-end test coverage to 90%+ as the prerequisite for the migration, not an afterthought",
            "Tagged technical debt with user-impact scores and ran a standing monthly review to keep it visible to stakeholders",
          ],
          outcomes: [
            { value: "97%", label: "Faster primary API (13.8s → 0.5s)" },
            { value: "−72%", label: "Data transfer volume" },
            { value: "−30%", label: "Cloud infrastructure cost" },
            { value: "−65%", label: "Critical technical debt" },
          ],
        },
        {
          slug: "glow",
          client: "Glow Digital",
          industry: "AdTech",
          timeline: "2013–2015",
          role: "Software Developer",
          listHook: { value: "−90%", label: "API load" },
          problem:
            "Facebook Ads API rate ceilings during peak periods; campaign optimization and variation setup burned 2–5 hours a week per manager on mechanical work.",
          whatWeDid:
            "Built the platform intelligence layer — caching, request batching, and automation for bids, budgets, and campaign variations.",
          approach: [
            "Served reads from a Redis cache with batched, user-scoped Facebook API requests instead of redundant live calls",
            "Automated bid, budget, and targeting adjustments against performance thresholds",
            "Generated campaign variation sets (headlines × images × audiences) so A/B tests no longer required 60+ manual entries",
          ],
          outcomes: [
            { value: "−90%", label: "Facebook Ads API requests" },
            { value: "0", label: "Rate-limiting incidents after launch" },
            { value: "2–5 hrs", label: "Returned per manager per week" },
          ],
        },
      ],
    },
    entries: {
      engineering: {
        name: "Engineering",
        deliverables: [
          {
            label: "Production app",
            description: "A full-stack web or mobile product ready to ship and scale",
          },
          {
            label: "Test suite",
            description: "Automated coverage so regressions get caught before users do",
          },
          {
            label: "CI/CD",
            description: "Deploy pipelines and environment config your team can run without me",
          },
          {
            label: "Handoff",
            description: "Documentation so the codebase stays maintainable after I leave",
          },
        ],
      },
      productDesign: {
        name: "Product Design",
        deliverables: [
          {
            label: "Research",
            description: "What users need, where they get stuck, and what to build next",
          },
          {
            label: "Flows",
            description: "Wireframes and interaction paths for the journeys that matter",
          },
          {
            label: "Visual design",
            description: "High-fidelity screens in Figma ready for engineering",
          },
          {
            label: "Design system",
            description: "Components and patterns so the product stays coherent as it grows",
          },
          {
            label: "Prototype",
            description: "A clickable path stakeholders can try before you write code",
          },
        ],
      },
      fractionalProductManagement: {
        name: "Fractional Product Management",
        deliverables: [
          {
            label: "Roadmap",
            description: "A prioritized plan tied to outcomes, not a feature wishlist",
          },
          {
            label: "Sprints",
            description: "Planning and backlog grooming so the team always knows what ships next",
          },
          {
            label: "Specs",
            description: "Clear requirements so engineering builds the right thing the first time",
          },
          {
            label: "Alignment",
            description: "Stakeholder communication that keeps decisions moving",
          },
          {
            label: "Metrics",
            description: "Find out what is working and what isn't",
          },
        ],
      },
      technicalConsulting: {
        name: "Technical Consulting",
        deliverables: [
          {
            label: "Architecture review",
            description: "Whether the system design will hold under real load and change",
          },
          {
            label: "Codebase audit",
            description: "Where debt is slowing you down — and what to fix first",
          },
          {
            label: "Security & performance",
            description: "Risks and bottlenecks before they become incidents",
          },
          {
            label: "Build vs buy",
            description: "A clear recommendation when the choice is expensive either way",
          },
          {
            label: "Action plan",
            description: "Written next steps ranked by impact, not a vague slide deck",
          },
        ],
      },
      modernization: {
        name: "Modernization",
        deliverables: [
          {
            label: "Assessment",
            description: "What to keep, what to replace, and the safest order to do it",
          },
          {
            label: "Rollout plan",
            description: "Incremental delivery so the business keeps running during the change",
          },
          {
            label: "Data migration",
            description: "Move the records that matter without silent loss or downtime surprises",
          },
          {
            label: "Internal tools",
            description: "Dashboards and workflows rebuilt for how the team works now",
          },
          {
            label: "Training",
            description: "Your team understands the new system before I step away",
          },
        ],
      },
      strategyWorkshop: {
        name: "Strategy Workshop",
        deliverables: [
          {
            label: "Prep",
            description: "Materials and framing so the session starts at full speed",
          },
          {
            label: "Facilitation",
            description: "A half-day or full-day working session built around your decision",
          },
          {
            label: "Summary",
            description: "Written findings and decisions the room actually agreed to",
          },
          {
            label: "Action plan",
            description: "Prioritized next steps you can run the week after",
          },
        ],
      },
      fractionalCto: {
        name: "Fractional CTO",
        deliverables: [
          {
            label: "Technical leadership",
            description:
              "Senior judgment on architecture, hiring, and roadmap without a full-time hire",
          },
          {
            label: "Standing cadence",
            description: "Weekly or biweekly touchpoints so decisions don't wait on availability",
          },
          {
            label: "Team review",
            description: "An honest read on your engineering org — who's strong, what's missing",
          },
          {
            label: "Board-ready updates",
            description: "Technical narrative your investors and board actually understand",
          },
        ],
      },
      technicalDueDiligence: {
        name: "Technical Due Diligence",
        deliverables: [
          {
            label: "Codebase and architecture audit",
            description: "What you're actually buying, not what the deck says",
          },
          {
            label: "Team assessment",
            description: "Who's load-bearing, who's a flight risk, what breaks if they leave",
          },
          {
            label: "Risk report",
            description:
              "Ranked technical risks with real cost-to-fix estimates, not vague red flags",
          },
          {
            label: "Go/no-go recommendation",
            description: "A clear call you can act on before the deal closes",
          },
        ],
      },
      productStrategy: {
        name: "Product Strategy",
        deliverables: [
          {
            label: "Market and product read",
            description: "Where you actually have leverage, not where it's comfortable to play",
          },
          {
            label: "Bet selection",
            description: "Which one or two bets are worth the company's limited attention",
          },
          {
            label: "Prioritization framework",
            description: "A way to decide what's next that survives past this quarter",
          },
          {
            label: "Written recommendation",
            description: "A decision memo, not a slide deck you present once and shelve",
          },
        ],
      },
    },
  },

  faq: {
    meta: {
      title: "FAQ | Ponti Studios",
      description:
        "Answers to common questions about pricing, scope, fit, and how engagements work.",
    },
    eyebrow: "Questions",
    title: "Frequently asked questions",
    items: [
      {
        question: "How do you price engagements?",
        answer:
          "By scope, complexity, and engagement type — not by the hour. After a discovery call I send a written proposal with deliverables, timeline, and investment. Every engagement is different; I won't pretend a rate card can replace that conversation.",
      },
      {
        question: "Who is this a good fit for?",
        answer:
          "Pre-seed to Series A founders who move fast, and teams modernizing a system that's outgrown itself — especially if you've been burned by a cut-rate shop before. Not a fit: lowest-bid procurement or scope that assumes corners get cut.",
      },
      {
        question: "Is testing and documentation included?",
        answer:
          "Yes, always. I do not ship untested work, and you should never be dependent on me to understand what I built. Every engagement ends with a defined handoff, not a disappearing act.",
      },
      {
        question: "What's not covered by the engagement?",
        answer:
          "Third-party software licenses, hosting, and API fees are passed through at cost. Copy, brand, and content are your responsibility — I integrate them, I don't produce them. Ongoing maintenance after project close isn't assumed — I offer retainers for that.",
      },
      {
        question: "Do you work with early-stage startups with limited budgets?",
        answer:
          "Yes, with the right engagement. Early-stage founders are a strong fit for fractional product management, advisory, or a focused MVP build. I'm not a fit if the budget requires cutting quality.",
      },
      {
        question: "Can I start with a smaller engagement before committing to a larger one?",
        answer:
          "Yes. A technical consulting engagement or strategy workshop is a natural first step. It gives you a clear deliverable and lets us both assess whether a larger partnership makes sense.",
      },
      {
        question: "What is the payment structure?",
        answer:
          "Projects are typically billed in milestones — a portion at kick-off, at mid-point, and at delivery. Retainers are billed monthly. Advisory engagements are typically billed 50% at start, 50% at delivery.",
      },
      {
        question: "What if the scope changes after we start?",
        answer:
          "Scope changes happen. I handle them with a simple change order — written description of what changed, the adjusted timeline, and the adjusted investment. No surprises.",
      },
      {
        question: "How long does it take to get a proposal?",
        answer:
          "After a 30-minute discovery call, I typically deliver a written proposal within five business days.",
      },
    ],
  },

  manifesto: {
    meta: {
      title: "Manifesto | Ponti Studios",
      description: "What I believe and how it shapes everything I build.",
    },
    hero: {
      title: "How I",
      punch: "think.",
      body: "Nine tenets. No filler. The rules that shape every engagement before a line of code is written.",
    },
    tenets: {
      title: "Core tenets",
      items: [
        {
          title: "Users first, always.",
          description:
            "Every decision starts with the customer and works backward. I store data on-device; access is a right, not a feature I grant. User needs come before profit, always — I never sell data or use it for ads. Teams are systems, not heroic individuals.",
        },
        {
          title: "Judgment over theater.",
          description:
            "You're not hiring me for meetings about meetings. You're hiring someone who's seen this exact fork before, made the call, and ships the proof instead of a deck. Evidence beats performance, always.",
        },
        {
          title: "In, done, gone.",
          description:
            "I'm not here to become your team. I solve the specific thing you couldn't solve, hand it off clean, and get out of the way — no retainer you don't need, no relationship to manage.",
        },
        {
          title: "Simple, permanent, built to last.",
          description:
            "Most software ships fast and dies young, built by people learning on someone else's budget. I refuse that — every codebase I deliver is clean, tested, and maintainable. Simplicity beats complexity, and I fix problems at the root, not the surface.",
        },
        {
          title: "Wider impact, on purpose.",
          description:
            "Mentorship and business education help marginalized entrepreneurs build sustainable businesses. Content earns attention through research, not spray-and-pray. Mission and profit reinforce each other — I invest that impact in education, healthcare, and finance.",
        },
        {
          title: "Function over decoration.",
          description:
            "If a feature, screen, or line of code doesn't serve your product's function, I cut it. You don't pay for decoration — every dollar buys something that actually works for your users.",
        },
        {
          title: "Room to grow, not clutter.",
          description:
            "I don't cram every possible feature in on day one. The product stays uncluttered and breathes, so you can add what's next later without a costly rebuild.",
        },
        {
          title: "Built for the long haul.",
          description:
            "I skip flashy trends I'd have to rip out in a year. What I ship still works and still looks right five years from now — substance over demo-day spectacle.",
        },
        {
          title: "Honest, not just polished.",
          description:
            "You get an honest picture of what's built, tested, and still rough — not complexity hidden behind a shiny surface. No surprises waiting at handoff.",
        },
      ],
    },
    quote: "Eliminate the unnecessary so that the necessary may speak.",
  },

  home: {
    meta: {
      title: "Ponti Studios",
      description: "Premium product and engineering for teams who refuse to compromise on quality.",
    },
    hero: {
      title: "Problems, solved.",
      wordBefore: "Problems",
      wordAfter: "Solved.",
      subtitle: "Computational business intelligence, put to work for you.",
    },
    services: {
      title: "What I do",
      intro: "Product and engineering, from a scoped build to embedded leadership.",
      cta: "Services ",
    },
    work: {
      title: "Work",
    },
    projects: {
      title: "The Lab",
    },
    principles: {
      title: "Manifesto",
    },
    lab: {
      title: "Playground",
      description: "practice and play.",
      categories: [
        {
          name: "Experiments",
          entries: [
            { path: "/games/realitea", label: "RealiTea" },
            { path: "/games/cards", label: "Cards" },
            { path: "/games/tetris", label: "Tetris" },
            { path: "/experiments/career-resume-animated", label: "Career Resume Animated" },
            { path: "/experiments/calendar", label: "Calendar" },
            { path: "/experiments/pixel-descent.html", label: "Pixel Descent" },
            { path: "/experiments/theatre-management", label: "Theatre Management" },
            { path: "/experiments/llm-interface", label: "LLM Interface" },
            { path: "/experiments/glass", label: "Glass" },
            { path: "/experiments/threegl-web-request", label: "ThreeGL Web Request" },
            { path: "/experiments/threegl-image-gallery", label: "ThreeGL Image Gallery" },
            { path: "/experiments/infinite-scroll", label: "Infinite Scroll" },
            { path: "/gen/image", label: "Image Generation" },
            { path: "/tarot", label: "Tarot" },
            { path: "/covid", label: "COVID Analytics" },
            { path: "/challenges/anagrams", label: "Group Anagrams", source: "ChartHop" },
            {
              path: "/challenges/click-therapeutics",
              label: "Election Vote Counter",
              source: "Click Therapeutics",
            },
            {
              path: "/challenges/cloudmargin",
              label: "Financial Accruals Manager",
              source: "CloudMargin",
            },
            { path: "/challenges/cloud-pricing", label: "Cloud Cost Calculator" },
            { path: "/challenges/fee-or-upfront", label: "Payment Fee Calculator" },
            {
              path: "/challenges/search-studio",
              label: "Search Studio",
              source: "Vendigo + Kensho",
            },
            {
              path: "/challenges/peterson-academy",
              label: "Infinite Image Carousel",
              source: "Peterson Academy",
            },
            { path: "/challenges/prime-countdown", label: "Prime Number Countdown" },
            { path: "/challenges/red-badger", label: "Mars Robot Navigator", source: "Red Badger" },
          ],
        },
      ],
    },
  },
} as const;
