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
      metaDescription: "Products, infrastructure, tools, and research I build for myself.",
      detailMetaDescription: "Project details and information",
      notFound: "Project not found",
      back: "Back to Lab",
      previous: "Previous",
      next: "Next",
      problem: "The Problem",
      solution: "The Solution",
      howItWorks: "How It Works",
      repository: "Repository",
      liveProject: "Live project",
      screenshots: "Screenshots",
    },
    entries: {
      kernel: {
        name: "Kernel",
        shortDescription: "Engineering judgment shouldn't die in someone's head. Kernel turns it into 32 skills an AI can run.",
        solution:
          "32 specialized skills for software development and content production, published to NPM and installable through skills.sh.",
        problem:
          "Good engineering judgment usually lives in someone's head, not in a doc anyone reads. Kernel turns that judgment into skills an AI assistant can actually invoke — for migrations, security reviews, content, the recurring stuff.",
        keyFeatures: [
          "32 skills across writing, music, image, development, UI, audit, and operations",
          "Install one skill or the full set with npx skills add",
          "Turn recurring engineering and content work into callable actions",
        ],
        technicalChallenges: [
          "Writing precise triggers so 32 skills can coexist without collisions",
          "Keeping every skill readable, versioned, and machine-usable",
          "Testing each skill against real work before publishing it",
        ],
      },
      foundation: {
        name: "Foundation",
        shortDescription: "Every team was rebuilding the same Postgres image. Foundation means nobody has to again.",
        solution:
          "Shared infrastructure for PostgreSQL, Redis, Docker Compose environments, and CI/CD across the organization.",
        problem:
          "Every team needing vector search or geospatial queries was rebuilding its own Postgres image. Foundation gives everyone one tested image and repeatable environments, so dev and prod stop quietly drifting apart.",
        keyFeatures: [
          "One PostgreSQL 18 image with pgvector, PostGIS, and pgRouting",
          "Docker Compose environments for development, test, and production",
          "Automated releases through GitHub Actions and semantic versioning",
          "Digest-pinned images with a machine-readable service catalog",
        ],
        technicalChallenges: [
          "Compiling three extensions into one reliable PostgreSQL image",
          "Making every deployment reproducible with immutable digests",
          "Shipping infrastructure updates without a manual release ritual",
        ],
      },
      omiro: {
        name: "Omiro",
        shortDescription: "Your notes, tasks, and calendar don't talk to each other. Omiro makes them one connected app.",
        solution:
          "An iOS app that captures everything you want to remember — tasks, notes, events, and ideas — into one searchable, connected personal knowledge graph.",
        problem:
          "Your notes, reminders, calendar, and messages don't talk to each other. Omiro puts it all in one app where a task links to a note, a note links to an event, and search actually finds it.",
        keyFeatures: [
          "Capture tasks, notes, events, and ideas in one place",
          "Connect everything through typed knowledge-graph relationships",
          "Keep working offline with a local-first architecture",
          "Share one product foundation across the iOS experience",
        ],
        technicalChallenges: [
          "Reconciling offline writes without losing user changes",
          "Modeling open-ended relationships without an unbounded schema",
          "Keeping business logic reusable across the app and shared packages",
        ],
      },
      career: {
        name: "Career",
        shortDescription: "Your resume crushes a decade of work into two pages. Career keeps the whole story.",
        solution:
          "A web app pairing a career-long work journal — roles, achievements, skills gained, performance history — with a job-search pipeline for applications, interviews, follow-ups, and offers.",
        problem:
          "A resume flattens years of real work into two pages a manager skims in six seconds. No wonder they can't tell what you've actually done — nobody kept the record as they went. Career logs the work itself, from your first job to your last, and runs the job-search pipeline on top of it.",
        keyFeatures: [
          "Log roles, achievements, and skills gained as a running career timeline",
          "Track applications through stages, notes, and follow-ups",
          "Schedule interviews and keep feedback beside each application",
          "Keep recruiters and referrals connected to the search",
        ],
        technicalChallenges: [
          "Modeling a career as a timeline of roles and events without losing the narrative",
          "Making a rich pipeline fast enough for daily updates",
          "Sharing auth and data patterns across Career, Finance, and Omiro",
        ],
      },
      finance: {
        name: "Finance",
        shortDescription: "Money stuff is stressful. Finance makes it just numbers.",
        solution:
          "A web app for tracking personal finances — accounts, transactions, budgets, and net worth trends — with a clean dashboard.",
        problem:
          "Most finance tools are either toy-simple or spreadsheet-complex. Finance sits in the middle: enough structure to see real trends and budgets, simple enough you'll actually open it every week.",
        keyFeatures: [
          "Bring accounts together and categorize transactions",
          "Set budgets around real spending categories",
          "See net-worth trends and monthly summaries",
          "Share the same personal data foundation as sibling products",
        ],
        technicalChallenges: [
          "Modeling account aggregation without relying on third-party dependencies",
          "Keeping budget calculations fast and correct as data grows",
        ],
      },
      "hominem-api": {
        name: "Hominem API",
        shortDescription: "Three apps, same personal data. One API instead of three duct-taped together.",
        solution:
          "A centralized Hono API that serves Omiro, Career, and Finance with shared auth, typed RPC contracts, and an MCP server for AI agent access to personal data.",
        problem:
          "Three products sharing the same personal data don't need three separate APIs. Hominem is one server with typed contracts, shared auth, and MCP support — so AI agents can reach personal data without breaking permission boundaries.",
        keyFeatures: [
          "Serve web, mobile, and agents from typed Hono contracts",
          "Expose personal data through an MCP server with permission checks",
          "Share Better Auth with passkeys and OTP support",
          "Generate database types once for every consuming product",
        ],
        technicalChallenges: [
          "Keeping one contract coherent across web, mobile, and MCP clients",
          "Adding MCP as a first-class protocol beside the HTTP API",
          "Enforcing permission boundaries around agent access to personal data",
        ],
      },
      hollywood: {
        name: "Hollywood",
        shortDescription: "Entertainment research, minus the twenty scattered sources.",
        solution:
          "A local-first platform that combines entertainment data ingestion with Claude-powered extraction from unstructured submissions.",
        problem:
          "Entertainment research is scattered everywhere, and the best material shows up as unstructured submissions nobody can search. Hollywood pulls it all into one system and extracts the useful fields automatically.",
        keyFeatures: [
          "Ingest trade publications, directories, and public databases",
          "Extract structure from query letters, decks, and submissions",
          "Connect people, companies, projects, and submissions in one graph",
          "Archive raw payloads and export clean JSONL through a documented API",
        ],
        technicalChallenges: [
          "Normalize eight-plus source types without losing provenance",
          "Preserve raw inputs so extraction can improve over time",
          "Model evolving relationships without creating an unmaintainable schema",
        ],
      },
      commune: {
        name: "Commune",
        shortDescription: "Anonymous strangers give you a straighter answer than your friends will.",
        solution:
          "A social decision-making app that turns a personal situation into a neutral case for a small anonymous jury.",
        problem:
          "Advice from friends is shaped by how you tell the story and by the relationship underneath it. Commune strips that out: an AI writes the neutral version, then a jury votes independently and explains why.",
        keyFeatures: [
          "Turn a personal story into a neutral decision brief",
          "Collect independent agree-or-disagree votes from an anonymous jury",
          "Reveal comments and verdicts once the quorum is reached",
          "Track and share cases from a personal decision docket",
        ],
        technicalChallenges: [
          "Remove persuasive framing without losing the underlying facts",
          "Keep early votes from influencing later independent judgments",
          "Preserve case ownership and vote integrity while keeping participants anonymous",
        ],
      },
      earth: {
        name: "Earth",
        shortDescription: "London's traffic cameras, on a map that doesn't fight you.",
        solution:
          "A live geospatial viewer for browsing London's TfL traffic camera network on an interactive map.",
        problem:
          "Camera data is only useful if you can find the camera fast. Earth puts a large, changing network on a map — search, camera detail, live availability, no digging.",
        keyFeatures: [
          "Explore camera locations on an interactive MapLibre map",
          "Find cameras by name or location",
          "See live and offline availability at a glance",
          "Open camera details with coordinates and feeds",
        ],
        technicalChallenges: [
          "Render a large geospatial dataset without overwhelming the map",
          "Keep external camera data current when feeds disappear",
          "Connect map selection, search, and detail routes into one workflow",
        ],
      },
      health: {
        name: "Health",
        shortDescription: "Symptoms, appointments, meds — one place, not five apps.",
        solution:
          "A personal health workspace for understanding symptoms, tracking progress, and organizing care.",
        problem:
          "Health decisions get scattered across symptoms, appointments, medication, insurance, and finding care nearby. Health puts those recurring tasks in one workspace instead of a separate lookup every time.",
        keyFeatures: [
          "Track symptoms with guidance, monitoring, and follow-up",
          "Manage appointments from one upcoming-care view",
          "Calculate medication-pen duration before the next dose",
          "Compare hospitals and Medicare options in context",
        ],
        technicalChallenges: [
          "Give useful symptom guidance without implying a diagnosis",
          "Keep symptoms, resolutions, and appointments coherent over time",
          "Combine medication, hospital, and Medicare tools without fragmenting care",
        ],
      },
      geo: {
        name: "Geo (geokit)",
        shortDescription: "Automated geocoding is fast and wrong. Geo adds the review step that makes it right.",
        solution:
          "A Swift geocoding CLI and native macOS app for curating place data with Apple Maps.",
        problem:
          "Automated geocoding is fast but wrong sometimes. Manual review is right but slow. Geo does the batch pass, then gives you a native app to check and fix results before they hit your dataset.",
        keyFeatures: [
          "Run individual queries or SQLite-backed batch processing",
          "Review and correct results in a native SwiftUI macOS app",
          "Enrich geocoding results with Apple Maps and SQLite",
          "Search, filter, edit in bulk, and pace requests safely",
        ],
        technicalChallenges: [
          "Adapt MapKit and CoreLocation for headless batch work",
          "Respect Apple's usage limits with configurable request pacing",
          "Keep CLI output and native corrections aligned through one schema",
        ],
      },
      toolbox: {
        name: "Toolbox",
        shortDescription: "Eight CLI tools, built because the throwaway script always comes back.",
        solution:
          "A monorepo of eight focused CLI tools: file processing (filekit), image optimization (iconkit), video transcription (mediakit), photo metadata (photokit), content pipeline (monotone), AI agent analytics (agentkit), X post management (xkit), and Internet Archive crawling (datpiff).",
        problem:
          "Personal automation starts as a script you'll delete later. It never gets deleted. Toolbox turns those recurring jobs — content, media, personal data — into tested commands with real safeguards.",
        keyFeatures: [
          "Turn raw notes into scheduled social posts through Typefully",
          "Transcribe video, optimize images, and manage photo metadata",
          "Track agent usage and cost across Claude Code, Copilot, and OpenRouter",
          "Delete X posts safely with OAuth 2.0 PKCE and rate-limit checks",
          "Crawl Internet Archive collections for downstream processing",
          "Run every tool through one command surface with dry-run safeguards",
        ],
        technicalChallenges: [
          "Match each tool to the limits of its runtime and data source",
          "Require dry-run and verification before destructive operations",
          "Keep six toolchains coherent behind one command surface",
        ],
      },
      realitea: {
        name: "RealiTea",
        shortDescription: "A word game that reads the news, so it's never stale.",
        solution:
          "A daily word puzzle where players guess real celebrity names by spelling them out from clues, with new puzzles generated from actual entertainment journalism every day.",
        problem:
          "Most word games run the same mechanic forever. RealiTea pulls from live entertainment news to write a fresh puzzle every day, tied to what's actually happening instead of a static dictionary.",
        keyFeatures: [
          "Generate a fresh puzzle each day from live entertainment headlines",
          "Give letter-by-letter feedback as players solve",
          "Reconcile scheduled puzzles through Drizzle and PostgreSQL",
          "Check puzzle quality and freshness before publication",
          "Preview and manage puzzles from an admin panel",
        ],
        technicalChallenges: [
          "Turn raw, unstructured news into playable puzzles",
          "Fill schedule gaps without generating duplicates",
          "Keep difficulty consistent across changing source material",
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
      description: "Product engineering, design, and advisory. Scoped clearly, shipped with proof.",
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
      intro: "First conversation to signed scope. Nothing in between but the work.",
    },
    cta: {
      title: "Ready when you are.",
      body: "Thirty minutes. No pitch deck. If it's a fit, you'll leave with a clear next step.",
    },
  },

  work: {
    meta: {
      title: "Selected Work | Ponti Studios",
      description: "Products and platforms made clearer, faster, and harder to break.",
    },
    hero: {
      title: "The Work.",
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
      snapshots: [
        {
          slug: "lumina",
          client: "Lumina",
          industry: "EdTech",
          description: "Learning platform for professional development.",
          timeline: "2025",
          role: "Senior Product & Platform Engineer",
          problem: "Checkout leakage and broken course discovery were killing retention.",
          whatWeDid:
            "Six independently shippable workstreams: search, retention, payments, frontend performance, grading reliability.",
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
          description: "Tour planning and routing for independent musicians.",
          timeline: "2024–2025",
          role: "Product Lead",
          problem: "Musicians were planning tours blind — no reliable audience, routing, or financial data.",
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
          description: "AI-assisted submission review for showrunner teams.",
          timeline: "2024",
          role: "Product Lead",
          problem: "Showrunner teams were drowning in submission triage during peak staffing.",
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
          description: "Live streaming tools for creators, teams, and media companies.",
          timeline: "2020–2024",
          role: "Lead Product Engineer & Product Manager",
          problem: "A creator product needed workspaces, roles, and a path into B2B.",
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
          description: "Live instruction platform for dance, yoga, and fitness.",
          timeline: "2020–2021",
          role: "Platform Engineer",
          problem: "Generic video tools couldn't handle movement instruction or school privacy rules.",
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
          description: "Streaming data infrastructure for financial research.",
          timeline: "2019–2020",
          role: "Head of Data Engineering",
          problem: "A multimodal data pipeline broke under load and ran on tribal knowledge.",
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
          description: "Whole-person care tools across voice, mobile, and chat.",
          timeline: "2018–2019",
          role: "Product Lead / Architecture Lead",
          problem: "Senior care was held back by unsafe UX, stale data, and fragmented access.",
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
          description: "Enterprise identity platform for white-label and global markets.",
          timeline: "2018",
          role: "Senior Software Engineer / Engineering Lead",
          problem: "An enterprise console blocked white-label expansion while delivery stalled.",
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
          description: "Volunteer coordination platform for UK-wide operations.",
          timeline: "2016",
          role: "Product Engineer",
          problem: "Volunteer coordination ran on a shared spreadsheet with no roles or audit trail.",
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
          description: "Unified deployment and monitoring tools for global teams.",
          timeline: "2015–2018",
          role: "Senior Software Engineer",
          problem: "Siloed tooling, a slow API, and a monolith were choking global operations.",
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
          description: "Campaign optimization and automation for digital advertising teams.",
          timeline: "2013–2015",
          role: "Software Developer",
          problem: "Ad managers were burning hours on rate limits and repetitive campaign work.",
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
          "By scope, complexity, and engagement type. Not by the hour. A discovery call, then a written proposal with deliverables, timeline, and investment. No rate card — no two engagements are the same.",
      },
      {
        question: "Who is this a good fit for?",
        answer:
          "Pre-seed to Series A founders who move fast, and teams modernizing a system that's outgrown itself — especially if a cut-rate shop already burned you once. Not a fit: lowest-bid procurement, or scope built assuming corners get cut.",
      },
      {
        question: "Is testing and documentation included?",
        answer:
          "Yes, always. I don't ship untested work, and you should never need me to understand what I built. Every engagement ends with a real handoff, not a disappearing act.",
      },
      {
        question: "What's not covered by the engagement?",
        answer:
          "Third-party software licenses, hosting, and API fees are passed through at cost. Copy, brand, and content are on you — I integrate them, I don't write them. Ongoing maintenance isn't included. That's what retainers are for.",
      },
      {
        question: "Do you work with early-stage startups with limited budgets?",
        answer:
          "Yes, with the right engagement. Early-stage founders are a strong fit for fractional product management, advisory, or a focused MVP build. Not a fit if the budget means cutting quality.",
      },
      {
        question: "Can I start with a smaller engagement before committing to a larger one?",
        answer:
          "Yes. A technical consulting engagement or strategy workshop is a natural first step. You get a real deliverable, and we both find out whether a bigger partnership makes sense.",
      },
      {
        question: "What is the payment structure?",
        answer:
          "Projects are typically billed in milestones — a portion at kick-off, at mid-point, and at delivery. Retainers are billed monthly. Advisory engagements are typically billed 50% at start, 50% at delivery.",
      },
      {
        question: "What if the scope changes after we start?",
        answer:
          "Scope changes happen. I handle them with a simple change order: what changed, the adjusted timeline, the adjusted investment. No surprises.",
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
            "Every decision starts with the customer and works backward. Data lives on-device; access is a right, not a feature I grant. User needs beat profit, always — I never sell data or use it for ads. Teams are systems, not heroic individuals.",
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
            "Most software ships fast and dies young, built by people learning on someone else's budget. I refuse that. Every codebase I deliver is clean, tested, and maintainable. Simple beats complex, and I fix problems at the root, not the surface.",
        },
        {
          title: "Wider impact, on purpose.",
          description:
            "Mentorship and business education help marginalized entrepreneurs build sustainable businesses. Content earns attention through research, not spray-and-pray. Mission and profit reinforce each other — I invest that impact in education, healthcare, and finance.",
        },
        {
          title: "Function over decoration.",
          description:
            "If a feature, screen, or line of code doesn't serve your product's function, I cut it. You don't pay for decoration. Every dollar buys something that actually works for your users.",
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
            "You get an honest picture of what's built, tested, and still rough. Not complexity hidden behind a shiny surface. No surprises waiting at handoff.",
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
      subtitle: "Product and engineering built to solve the problem you actually have.",
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
            { path: "/experiments/threegl-ai-explainer", label: "ThreeGL AI Explainer" },
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
