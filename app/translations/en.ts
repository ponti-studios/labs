export const STUDIO_TRANSLATIONS_EN = {
  nav: {
    brandAlt: "Ponti Studios",
    services: "Services",
    work: "Work",
    projects: "Lab",
    manifesto: "Manifesto",
    book: "Book",
    game: "Newsboy",
    career: "Career",
    apps: "Apps",
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
      title: "Lab",
      metaDescription: "Products, infrastructure, libraries, and research I build for myself.",
      detailMetaDescription: "Project details and information",
      notFound: "Project not found",
      back: "Back to Lab",
      nextProject: "Next project",
      previous: "Previous",
      next: "Next",
      problem: "The Problem",
      solution: "The Solution",
      howItWorks: "How It Works",
      whatItDoes: "What it does",
      technicalChallenges: "What took work",
      repository: "Repository",
      liveProject: "Live project",
      screenshots: "Screenshots",
      status: "Status",
      stack: "Stack",
    },
    entries: {
      kernel: {
        name: "Kernel",
        shortDescription:
          "Engineering judgment shouldn't die in someone's head. Kernel turns it into 31 skills an AI can run.",
        solution:
          "31 specialized skills for software development and content production, published to NPM and installable through skills.sh.",
        problem:
          "Good engineering judgment usually lives in someone's head, not in a doc anyone reads. Kernel turns that judgment into skills an AI assistant can actually invoke — for migrations, security reviews, content, the recurring stuff.",
        keyFeatures: [
          "31 skills across writing, music, image, development, UI, audit, and operations",
          "Install one skill or the full set with npx skills add",
          "Turn recurring engineering and content work into callable actions",
        ],
        technicalChallenges: [
          "Writing precise triggers so 32 skills can coexist without collisions",
          "Keeping every skill readable, versioned, and machine-usable",
          "Testing each skill against real work before publishing it",
        ],
      },
      waveform: {
        name: "Waveform",
        shortDescription:
          "An accurate audio visualizer that turns pitch, timing, and loudness into an orb of dots.",
        solution:
          "A Swift audio engine and React visualizer for turning live audio or prepared signals into clear, time-aligned waveforms, spectra, and an orb.",
        problem:
          "A flat meter tells you how loud sound is, while a spectrogram can be hard to read at a glance. Waveform makes pitch, timing, and loudness visible together, so you can see what a voice or sound is doing.",
        keyFeatures: [
          "Visualize pitch, time, and loudness in an animated field of dots",
          "Capture live microphone audio on iPhone and Mac with Swift",
          "Explore the same visual language in React with an interactive explainer",
          "Switch between an orb, a scrolling waveform, and a flat spectrum map",
        ],
        technicalChallenges: [
          "Keep each visual frame aligned to the audio clock",
          "Measure exact sample windows and log-spaced frequency bands",
          "Move audio through the capture and render pipeline without allocating on the audio thread",
        ],
      },
      foundation: {
        name: "Foundation",
        shortDescription:
          "Every team was rebuilding the same Postgres image. Foundation means nobody has to again.",
        solution:
          "Shared infrastructure for PostgreSQL, Redis, MinIO object storage, and Docker Compose environments across the organization.",
        problem:
          "Every team needing vector search, geospatial queries, or object storage was rebuilding its own stack. Foundation gives everyone one tested image and repeatable environments, so dev and prod stop quietly drifting apart.",
        keyFeatures: [
          "One PostgreSQL 18 image with pgvector, PostGIS, and pgRouting compiled in",
          "Redis and MinIO object storage running alongside Postgres in one Compose stack",
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
        shortDescription:
          "Most apps make you decide what a thought is before saving it. Omiro just captures it.",
        solution:
          "A capture-first iOS app built for neurodivergent knowledge workers — every thought starts as a note, then becomes a task, a chat, or connected context, without slowing down to classify it first.",
        problem:
          "Most productivity tools force you to choose a structure — task, note, event — before you know what you're trying to say. That friction is especially costly for neurodivergent minds, where a slow capture flow means the thought is gone before it's saved. Omiro's one hard rule: capture can never be slower than the native Notes app.",
        keyFeatures: [
          "Capture a thought in one tap — notes, tasks, and chats all start from the same composer",
          "Turn a note into a task or a reasoned conversation without losing the original capture",
          "Keep working offline with a local-first architecture",
          "Built for neurodivergent minds",
        ],
        technicalChallenges: [
          "Reconciling offline writes without losing user changes",
          "Keeping capture faster than iOS Notes while still classifying content in the background",
          "Modeling open-ended note-to-task-to-chat relationships without an unbounded schema",
        ],
      },
      thames: {
        name: "Thames",
        shortDescription:
          "Walks are for thinking out loud. Thames listens, thinks, and answers out loud, from your iPhone or your wrist.",
        solution:
          "A voice companion for iPhone and Apple Watch. Tap the orb, say what's on your mind, and Thames transcribes it, answers with the whole conversation in mind, and speaks the reply in a voice you choose.",
        problem:
          "Typing a question on a walk breaks the walk, and most voice assistants give one-line answers and forget what you just said. Thames keeps the conversation going while your hands and eyes stay free.",
        keyFeatures: [
          "One orb on the iPhone and the Apple Watch: tap to talk, tap to send, tap to interrupt",
          "Conversations stay on your device, and you can switch between them from your wrist",
          "Pick the reply voice from the roughly 100 voices of Microsoft's MAI Voice, in dozens of languages",
          "Replies start speaking as soon as the first sentence is ready",
        ],
        technicalChallenges: [
          "Keeping the Watch and the iPhone in agreement over WatchConnectivity, where messages arrive late or out of order",
          "Cutting the wait for spoken audio by synthesizing a reply in sentence-sized chunks while it plays",
          "Sharing one status model between the React Native app and the SwiftUI Watch app",
        ],
      },
      still: {
        name: "Still",
        shortDescription: "A clear view of what you own, want, and everything in between.",
        solution:
          "An iOS app for possessions and shopping: items move from wanted to planned to ordered to owned to archived, live in containers, and gather in collections. Sign-in is an email code, and the session stays in the Keychain.",
        problem:
          "Possessions live in spreadsheet rows, order emails, and memory — so rebuying, losing, and forgetting what you own is normal. Still replaces the inventory spreadsheet with an app that follows an item through its whole life.",
        keyFeatures: [
          "Follow every item from wanted to planned to ordered to owned to archived",
          "See what you own, its estimated value, and what's on the way from one Overview",
          "Keep items in containers and gather them into collections",
          "Sign in with an email code; sessions stay in the app-private Keychain",
        ],
        technicalChallenges: [
          "Replacing a Vite web app with a bare React Native app without losing the store and mapping logic",
          "Sharing one email-OTP auth client between Thames and Still while keeping each app's Keychain private",
          "Shipping to TestFlight with a hand-rolled archive and deploy pipeline instead of a hosted build service",
        ],
      },
      career: {
        name: "Career",
        shortDescription:
          "Every application wants a different version of your story. Career keeps the reusable parts.",
        solution:
          "A private job-search workspace: import your resume, derive AI-backed proof of your skills, publish a shareable portfolio, and track every application from first tailor to final offer.",
        problem:
          "A resume gets rebuilt from scratch for every role, the strongest proof of your work is scattered across old portfolios and dead links, and after enough applications the search blurs into noise. Career isn't a job board or an ATS — it's the private workspace for the parts of the search you actually control.",
        keyFeatures: [
          "Import a resume and let AI parse it into structured, reusable career data",
          "Derive skills from real work history — every skill traces to the role or project that proves it, no self-reported endorsements",
          "Publish a shareable portfolio page with SEO and OG cards",
          "Tailor a resume to a specific role from your existing career records, not a blank page",
        ],
        technicalChallenges: [
          "Modeling a career as a timeline of roles and events without losing the narrative",
          "Making a rich pipeline fast enough for daily updates",
          "Sharing auth and data patterns across Career, Finance, and Omiro",
        ],
      },
      finance: {
        name: "Finance MCP",
        shortDescription:
          "Your money, queryable by the AI you already use. No dashboard to log into, no vendor holding the history.",
        solution:
          "Retire the interface. Finance is now an MCP server on the Hominem API, so the assistant you already talk to is the front end, and the ledger stays in a database you control.",
        problem:
          "Finance apps keep your history inside their interface and their business. When Mint shut down, years of categorized spending went with it. A web app I built myself had the same flaw in a smaller form: the data was only reachable through screens I had to maintain.",
        keyFeatures: [
          "Answers net worth, runway and spending questions in plain language",
          "Imports years of history safely, with a dry run before every write",
          "Matches accounts, tags and categories without caring about case",
          "Returns a named reason for every rejected row",
        ],
        technicalChallenges: [
          "Making every write repeatable, so a retry never doubles a transaction",
          "Turning service failures into named errors instead of opaque 500s",
          "Keeping closed accounts visible to every tool that reads the same data",
          "Reconciling 16,426 messy rows against 14,486 clean ones",
        ],
      },
      "hominem-api": {
        name: "Hominem API",
        shortDescription:
          "Three apps, same personal data. One API instead of three duct-taped together.",
        solution:
          "A centralized Hono API that owns identity, data access, background workers, and storage for Omiro, Career, and Finance — plus an MCP server for AI agent access to personal data.",
        problem:
          "Three products sharing the same personal data don't need three separate APIs, three auth systems, or three job queues. Hominem is one server with typed contracts, shared auth, and MCP support — so AI agents can reach personal data without breaking permission boundaries.",
        keyFeatures: [
          "Serve web, mobile, and agents from typed Hono contracts",
          "Own identity, background workers, queues, and storage policy in one place",
          "Expose personal data through an MCP server with permission checks",
          "Share Better Auth with passkeys and OTP support across every surface",
        ],
        technicalChallenges: [
          "Keeping one contract coherent across web, mobile, and MCP clients",
          "Adding MCP as a first-class protocol beside the HTTP API",
          "Enforcing permission boundaries around agent access to personal data",
        ],
      },
      hollywood: {
        name: "Hollywood",
        shortDescription:
          "Entertainment has no Bloomberg — just IMDb, WGA, and spreadsheets. Hollywood resolves them.",
        solution:
          "A local-first entity graph — a Hono API that ingests trade press, WGA credits, TMDB, and Wikidata into one queryable SQLite database of people, titles, companies, and credits.",
        problem:
          "Every question about who represents whom, what stage a project is at, or who's worked with whom gets answered by manually cross-referencing IMDb, WGA, TMDB, and trade press. Assistants build the same spreadsheet by hand, every project, and it's stale before the next one starts. Hollywood pulls those sources into one entity graph instead.",
        keyFeatures: [
          "Ingest trade press, WGA credits, TMDB, and Wikidata through dedicated source adapters",
          "Archive every raw payload by content hash before normalizing it into the graph",
          "Connect people, titles, companies, and credits in one queryable database",
          "Track ingest runs, timing, and record counts for every source",
        ],
        technicalChallenges: [
          "Resolving the same real-world person across sources that each assign their own ID",
          "Normalizing four different source formats — RSS feeds, a directory crawl, a REST API, and SPARQL — into one schema",
          "Preserving raw payloads and provenance so extraction quality can improve after the fact",
        ],
      },
      commune: {
        name: "Commune",
        shortDescription:
          "Anonymous strangers give you a straighter answer than your friends will.",
        solution:
          "A social decision-making app that turns a personal situation into a neutral case for a small anonymous jury.",
        problem:
          "Group chats give you bad signal, not because your friends are bad advisors, but because group dynamics structurally prevent honest answers — the first response anchors everyone else, and no one wants to be the friend who was wrong. Commune strips that out: an AI neutralizes the framing, then an anonymous jury votes independently before anyone sees the room.",
        keyFeatures: [
          "Turn a personal story into a neutral, fact-based case before anyone votes",
          "Collect blind votes — no juror sees a result until they've cast their own",
          "Require a reason before a verdict, so no one just follows the room",
          "Reveal comments and verdicts only once a minimum quorum is reached",
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
        shortDescription:
          "Google your symptoms and spiral, or call a doctor and wait. Health gives a third option.",
        solution:
          "A personal health workspace built in three layers — triage a symptom right now, track it over time, and manage the appointments and history that come after.",
        problem:
          "When you feel unwell, you either google your symptoms and spiral, or call a doctor and wait — neither gives you a clear answer to what to do right now. And nothing remembers: you can't look back and see when the headaches started, or whether the medication helped. Health data lives in a paper prescription here, a GP portal there, and none of it talks to each other.",
        keyFeatures: [
          "Check a symptom and get a severity score with a clear next step — monitor, schedule, or go now",
          "Track an active symptom over time: pain level, onset, resolution",
          "See live counts of active symptoms, resolved symptoms, and upcoming appointments at a glance",
          "Find the nearest hospital with directions and a call button when it's urgent",
        ],
        technicalChallenges: [
          "Give useful symptom guidance without implying a diagnosis",
          "Fuzzy-match natural-language symptom input against a structured severity database",
          "Keep symptoms, appointments, and resolutions coherent as a longitudinal record",
        ],
      },
      walksgpx: {
        name: "WalksGPX",
        shortDescription: "Your walks live in Health. WalksGPX gives their routes back to you.",
        solution:
          "A personal iPhone and Mac archive for browsing walking routes, viewing them on a map, and exporting them as portable GPX files.",
        problem:
          "Health records your walks, but its routes are difficult to browse as an archive or use elsewhere. WalksGPX makes them searchable by month, puts each route on a map, and exports ordinary GPX files you can keep and use in other tools.",
        keyFeatures: [
          "Browse walking workouts by month, date, and duration",
          "See a selected GPS route on an interactive map",
          "Export GPX files to share or save outside the app",
          "Keep an iPhone and Mac library in sync through private iCloud storage",
        ],
        technicalChallenges: [
          "Read HealthKit workouts and routes without writing to Health",
          "Import long walk histories while handling missing or unavailable GPS routes",
          "Keep CloudKit library sync separate from portable iCloud Drive exports",
        ],
      },
      toolbox: {
        name: "Toolbox",
        shortDescription: "Eight CLI tools, built because the throwaway script always comes back.",
        solution:
          "A monorepo of eight focused CLI tools for file processing (filekit), image and photo metadata (imagekit), video transcription (mediakit), AI agent usage analytics (agentkit), and more — distributed through Homebrew behind one command surface.",
        problem:
          "Personal automation starts as a script you'll delete later. It never gets deleted. Toolbox turns those recurring jobs — files, media, agent usage, personal data — into tested commands with real safeguards.",
        keyFeatures: [
          "Process and rename files, photos, and frontmatter through filekit",
          "Transcribe video and audio to Markdown with mediakit, and clean up image metadata with imagekit",
          "Track agent usage and cost across Claude Code, Codex, Copilot, and OpenRouter with agentkit",
          "Delete X posts safely with OAuth 2.0 PKCE and rate-limit checks via xkit",
          "Crawl Internet Archive collections for downstream processing with datpiff",
          "Run every tool through one command surface with dry-run safeguards",
        ],
        technicalChallenges: [
          "Match each tool to the limits of its runtime and data source",
          "Require dry-run and verification before destructive operations",
          "Keep eight toolchains coherent behind one command surface",
        ],
      },
      game: {
        name: "Newsboy",
        shortDescription: "A daily word puzzle built around the news you're reading.",
        solution:
          "A daily five-letter puzzle tied to a current news story, with a new shared answer for each topic every day.",
        problem:
          "Word games can feel disconnected from the world outside the grid. Newsboy ties each daily puzzle to a current story, turning the headlines into a quick test of what you've been reading.",
        keyFeatures: [
          "Play a shared five-letter puzzle for each news topic every day",
          "Get letter and position feedback across six guesses",
          "Receive a final clue before the last guess",
          "Play without an account and save progress on your device",
          "Sign in to unlock the full puzzle archive and track stats",
        ],
        technicalChallenges: [
          "Turn current news stories into concise, fair puzzle clues",
          "Check generated puzzles before they reach the daily schedule",
          "Keep daily answers and player progress consistent across topics",
        ],
      },
      covid: {
        name: "COVID Analytics",
        shortDescription:
          "Interactive pandemic data exploration across 50+ metrics and every country.",
        solution:
          "An analytics dashboard with wave detection, seasonal pattern analysis, vaccination effectiveness modeling, and outlier detection — built directly on the OWID COVID dataset.",
        problem:
          "Raw pandemic data is massive and opaque. The OWID dataset covers every country across 50-plus metrics, but making sense of a three-year pandemic requires more than a CSV download.",
        keyFeatures: [
          "Explore pandemic metrics across any country with interactive charts",
          "Detect pandemic waves with peak dates, intensity, and growth rates",
          "Uncover seasonal patterns and vaccination effectiveness trends",
          "Identify statistical outliers and data quality issues",
          "Switch between five analytics tabs without waiting with Suspense and React Query caching",
        ],
        technicalChallenges: [
          "Processing half a million time-series rows for instant exploration",
          "Building wave-detection algorithms that work across different transmission patterns",
          "Keeping five analytics tabs snappy with React Suspense and React Query caching",
        ],
      },
    },
  },

  common: {
    bookCall: "Book a call",
    seeServices: "See services",
    replyWithin: "I reply within 24 hours.",
    contactSteps: [
      {
        title: "Schedule a call",
        description: "A 20 min chat about your needs.",
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
      description: "Build a product, fix what's slowing it down, or get clear on what to do next.",
    },
    hero: {
      title: "Get unstuck. Get it shipped.",
      subtitle: "Build a product, fix what's slowing it down, or get clear on what to do next.",
    },
    services: {
      title: "What I do",
    },
    process: {
      title: "A clear way to start.",
    },
    cta: {
      title: "Have something to build or fix?",
      body: "Book 20 minutes. No pitch deck. We'll work out the next useful step.",
    },
  },

  work: {
    meta: {
      title: "Selected Work | Ponti Studios",
      description:
        "Products, platforms, and systems built to solve real problems, with outcomes you can see.",
    },
    hero: {
      title: "Selected work.",
      subtitle: "Products, platforms, and systems built to solve real problems.",
    },
    moreTitle: "More work",
    problemTitle: "Problem",
    solutionTitle: "The solution",
    approachTitle: "Approach",
    nextCase: "Next case",
    backToWork: "All work",
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
          description: "Learning platform for professionals.",
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
            { value: "2 days", label: "to return a course, from 1–⁠2 weeks" },
            { value: "~40%", label: "more learners enrolling in a second course" },
            { value: "+43%", label: "engagement with the learning feed" },
          ],
        },
        {
          slug: "revrock",
          client: "Revrock",
          industry: "Music",
          description: "Tour planning for independent musicians.",
          timeline: "2024–2025",
          role: "Product Lead",
          problem:
            "Musicians were planning tours blind — no reliable audience, routing, or financial data.",
          whatWeDid:
            "Product-led the MVP: user research through launch for tour routing, venue selection, and planning financials.",
          approach: [
            "Cut a 12–18 month founder vision to a three-week MVP by ranking features on user urgency, not enthusiasm",
            "Modeled tour routing as an operations problem — geography, market sequencing, and cost held in one tool",
            "Made venue selection audience-informed instead of guesswork-driven",
            "Surfaced estimated revenue and viability during planning, not after the tour ended",
          ],
          outcomes: [
            { value: "3 weeks", label: "to MVP, from a 12–⁠18 month plan" },
            { value: "20–35%", label: "more estimated revenue than hand-planned tours" },
          ],
        },
        {
          slug: "prolog",
          client: "Prolog",
          industry: "Entertainment",
          description: "AI submission review for showrunners.",
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
            { value: "~70%", label: "less review time" },
            { value: "~95%", label: "extraction accuracy" },
            { value: "3×", label: "submissions reviewed per person" },
          ],
        },
        {
          slug: "streamyard",
          client: "StreamYard",
          industry: "Creator",
          description: "Guest matching for new streamers.",
          timeline: "2020–2024",
          role: "Lead Product Engineer & Product Manager",
          problem:
            "Streaming alone is hard, and it's easy to skip a day. With a guest it's easy to fill an hour, but 34% of collaboration attempts never became a conversation.",
          whatWeDid:
            "Led a small squad building Collab, a two-sided marketplace where creators find guests for their streams and guest spots on other streams. Also led product and engineering for the Teams/Business tier.",
          approach: [
            "Replaced category-based discovery with vector similarity, then rebalanced scoring toward content similarity over raw follower count: recommendation acceptance up 25%",
            "Paired newer creators with slightly larger ones: motivating, and good for their growth",
            "Built an Opportunities board where hosts post guest requests, like a job posting, and creators apply: 58% of new conversations",
            "Cut first contact to one click and added AI conversation starters: conversation initiation up 32%",
            "Launched invite-only in cohorts to balance supply and demand per niche, hand-curating the first 200 profiles",
            "Ran human moderation alongside automated screening, plus blocking and reporting: 40% fewer policy violations, 60% faster approvals",
            "For the Business tier, introduced a workspace abstraction and numeric RBAC, migrated in four independently-deployable phases with zero downtime",
          ],
          outcomes: [
            {
              value: "64%",
              label: "higher 90-day creator retention",
            },
            { value: "3×", label: "collaborations between users, year over year" },
            { value: "58%", label: "of new conversations started on the Opportunities board" },
            { value: "$15M+", label: "in enterprise annual revenue unlocked" },
          ],
        },
        {
          slug: "whistle",
          client: "Whistle",
          industry: "Education",
          description: "Live classes for dance, yoga, and fitness.",
          timeline: "2020–2021",
          role: "Platform Engineer",
          problem:
            "Generic video tools couldn't handle movement instruction or school privacy rules.",
          whatWeDid:
            "Built a purpose-built streaming stack for dance, yoga, and fitness instruction during COVID lockdowns.",
          approach: [
            "Selected WebRTC topology adaptively by class size instead of forcing one mode for every session",
            "Rebuilt the audio pipeline so music was not treated as noise to cancel",
            "Designed full-body video layouts for correction, not head-and-shoulder conference framing",
            "Shipped a self-hosted deployment path so data never left the organization's infrastructure",
          ],
          outcomes: [
            { value: "100%", label: "curriculum continuity in a ballet pilot" },
            { value: "−35%", label: "bandwidth compared with generic video tools" },
            { value: "<100ms", label: "latency at 720p or better, on uneven networks" },
          ],
        },
        {
          slug: "kensho",
          client: "Kensho",
          industry: "Finance",
          description: "Streaming data for financial research.",
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
            { value: "24×", label: "data throughput" },
            { value: "<50ms", label: "market-data latency, down from about 10 minutes" },
            {
              value: "3 hrs",
              label: "for a new engineer to ship a first change, down from a week",
            },
          ],
        },
        {
          slug: "humana",
          client: "Humana",
          industry: "Healthcare",
          description: "Care tools across voice, mobile, and chat.",
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
            { value: "<30s", label: "claims-data lag, from hours" },
            { value: "3 channels", label: "voice, mobile, and chat, unified in one care platform" },
            {
              value: "0",
              label: "HIPAA exposures, after moving health data off Alexa infrastructure",
            },
          ],
        },
        {
          slug: "mimecast",
          client: "Mimecast",
          industry: "Security",
          description: "Identity platform for white-label markets.",
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
            { value: "2 weeks", label: "ahead of schedule, from 4 weeks behind" },
            { value: "−80%", label: "merge conflicts" },
            { value: "4 hrs", label: "to complete a code review, down from 2 days" },
          ],
        },
        {
          slug: "help-refugees",
          client: "Choose Love",
          industry: "Nonprofit",
          description: "Volunteer coordination, UK-wide.",
          timeline: "2016",
          role: "Product Engineer",
          problem:
            "Volunteer coordination ran on a shared spreadsheet with no roles or audit trail.",
          whatWeDid:
            "Pro-bono React/Rails volunteer interface that replaced the sheet with role separation, validated submissions, and a full audit trail.",
          approach: [
            "Drew a hard boundary between volunteer submission and operations admin — enforced in the product, not by trust",
            "Replaced free-form fields with validated structured forms so malformed data never reached the ops team",
            "Logged every change with volunteer identity, timestamp, and content for real-time coordination and post-hoc tracing",
            "Scoped ruthlessly: only what was essential to retire the Google Sheet",
          ],
          outcomes: [
            { value: "0", label: "bad submissions reaching ops" },
            { value: "100%", label: "of submissions with a full audit trail, up from none" },
            { value: "UK-wide", label: "volunteer network running on the new platform" },
          ],
        },
        {
          slug: "thomson-reuters",
          client: "Thomson Reuters",
          industry: "Enterprise",
          description: "Deployment and monitoring tools.",
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
            { value: "97%", label: "faster API, 13.8s to 0.5s" },
            { value: "−72%", label: "data transferred" },
            { value: "−30%", label: "cloud infrastructure cost" },
          ],
        },
        {
          slug: "glow",
          client: "Glow Digital",
          industry: "AdTech",
          description: "Ad campaign automation.",
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
            { value: "−90%", label: "Facebook Ads API calls" },
            { value: "0", label: "rate-limiting incidents after launch" },
            { value: "2–5 hrs", label: "saved per manager each week" },
          ],
        },
      ],
    },
    entries: {
      engineering: {
        name: "Build",
        deliverables: [
          {
            label: "Production app",
            description: "A full-stack product, ready to ship and scale",
          },
          {
            label: "Test suite",
            description: "Automated coverage so regressions get caught",
          },
          {
            label: "CI/CD",
            description: "Deploy pipelines your team can run without me",
          },
          {
            label: "Handoff",
            description: "Docs so the codebase stays maintainable after",
          },
        ],
      },
      productDesign: {
        name: "Design",
        deliverables: [
          {
            label: "Research",
            description: "What users need and where they get stuck",
          },
          {
            label: "Flows",
            description: "Interaction paths for the journeys that matter",
          },
          {
            label: "Visual design",
            description: "High-fidelity screens in Figma, ready to build",
          },
          {
            label: "Design system",
            description: "Components so the product stays coherent",
          },
        ],
      },
      fractionalProductManagement: {
        name: "Delivery",
        deliverables: [
          {
            label: "Roadmap",
            description: "A prioritized plan tied to outcomes",
          },
          {
            label: "Sprints",
            description: "Planning so the team always knows what's next",
          },
          {
            label: "Specs",
            description: "Clear requirements engineering can build from",
          },
          {
            label: "Metrics",
            description: "Find out what's working and what isn't",
          },
        ],
      },
      technicalConsulting: {
        name: "Diagnosis",
        deliverables: [
          {
            label: "Architecture review",
            description: "Whether the design holds under real load",
          },
          {
            label: "Codebase audit",
            description: "Where debt is slowing you down, and the fix",
          },
          {
            label: "Security & performance",
            description: "Risks and bottlenecks before they hit",
          },
          {
            label: "Action plan",
            description: "Next steps ranked by impact, not a slide deck",
          },
        ],
      },
      modernization: {
        name: "Infrastructure",
        deliverables: [
          {
            label: "Assessment",
            description: "What to keep, replace, and the safest order",
          },
          {
            label: "Rollout plan",
            description: "Incremental delivery, business keeps running",
          },
          {
            label: "Data migration",
            description: "Move what matters, no silent loss or downtime",
          },
          {
            label: "Internal tools",
            description: "Dashboards rebuilt for how the team works now",
          },
        ],
      },
      fractionalCto: {
        name: "Leadership",
        deliverables: [
          {
            label: "Technical leadership",
            description: "Senior judgment, no full-time hire needed",
          },
          {
            label: "Standing cadence",
            description: "Weekly touchpoints so decisions don't wait",
          },
          {
            label: "Team review",
            description: "An honest read on who's strong, what's missing",
          },
          {
            label: "Board-ready updates",
            description: "A technical story your board understands",
          },
        ],
      },
      technicalDueDiligence: {
        name: "Due Diligence",
        deliverables: [
          {
            label: "Codebase and architecture audit",
            description: "What you're actually buying, not the deck",
          },
          {
            label: "Team assessment",
            description: "Who's load-bearing, who's a flight risk",
          },
          {
            label: "Risk report",
            description: "Ranked risks with real cost-to-fix estimates",
          },
          {
            label: "Go/no-go recommendation",
            description: "A clear call before the deal closes",
          },
        ],
      },
      productStrategy: {
        name: "Strategy",
        deliverables: [
          {
            label: "Market read",
            description: "Where you actually have leverage",
          },
          {
            label: "Build vs buy",
            description: "A clear call when the choice is expensive",
          },
          {
            label: "Prioritization",
            description: "A way to decide what's next, past this quarter",
          },
          {
            label: "Written recommendation",
            description: "A decision memo, not a shelved slide deck",
          },
        ],
      },
    },
  },

  faq: {
    meta: {
      title: "FAQ | Ponti Studios",
      description: "Pricing, scope, timing, and what to expect when we work together.",
    },
    eyebrow: "Questions",
    title: "Straight answers.",
    items: [
      {
        question: "How do you price engagements?",
        answer:
          "Each proposal sets the scope, deliverables, timeline, and price. I price the work, not the hours.",
      },
      {
        question: "Who is this a good fit for?",
        answer:
          "Founders moving fast and teams whose systems have outgrown them. I’m not a fit for lowest-bid work or plans that depend on cutting corners.",
      },
      {
        question: "Is testing and documentation included?",
        answer: "Yes. Work is tested, documented, and handed over so your team can maintain it.",
      },
      {
        question: "What's not covered by the engagement?",
        answer:
          "Software licenses, hosting, and API fees are billed at cost. You provide copy, brand, and content. Ongoing maintenance is a separate agreement.",
      },
      {
        question: "Do you work with early-stage startups with limited budgets?",
        answer:
          "Yes. A focused MVP, product management, or advisory engagement can fit an early-stage team without cutting quality.",
      },
      {
        question: "Can I start with a smaller engagement before committing to a larger one?",
        answer:
          "Yes. Start with technical consulting or a strategy workshop. You get a useful deliverable before deciding on a larger project.",
      },
      {
        question: "What is the payment structure?",
        answer:
          "Projects are billed at agreed milestones. Retainers are monthly. Advisory work is usually 50% at the start and 50% at delivery.",
      },
      {
        question: "What if the scope changes after we start?",
        answer:
          "I’ll write up what changed, along with the new timeline and price, before the extra work begins.",
      },
      {
        question: "How long does it take to get a proposal?",
        answer: "Usually within five business days after a 30-minute discovery call.",
      },
    ],
  },

  manifesto: {
    meta: {
      title: "Manifesto | Ponti Studios",
      description: "What I believe and how it shapes everything I build.",
    },
    hero: {
      title: "The Manifesto.",
    },
    tenets: {
      title: "Core tenets",
      items: [
        {
          title: "Users first, always.",
          description:
            "Every decision starts with the customer and works backward. Data lives on-device; access is a right, not a feature I grant. User needs beat profit, always — I never sell data or use it for ads.",
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
          title: "Simple, permanent, built to last.",
          description:
            "Most software ships fast and dies young, built by people learning on someone else's budget. I refuse that. Every codebase I deliver is clean, tested, and maintainable. Simple beats complex, and I fix problems at the root, not the surface. I skip flashy trends I'd have to rip out in a year, so what I ship still works and still looks right five years from now.",
        },
        {
          title: "Honest, not just polished.",
          description:
            "You get an honest picture of what's built, tested, and still rough. Not complexity hidden behind a shiny surface. No surprises waiting at handoff.",
        },
        {
          title: "Wider impact, on purpose.",
          description:
            "Mentorship and business education help marginalized entrepreneurs build sustainable businesses. Content earns attention through research, not spray-and-pray. Mission and profit reinforce each other — I invest that impact in education, healthcare, and finance.",
        },
      ],
    },
    quote: "Eliminate the unnecessary so that the necessary may speak.",
  },

  playgroundEssays: {
    meta: {
      title: "Cabinet of Small Machines | Ponti Studios",
      description:
        "Three essays on the Lab's playground experiments — what each one quietly claims about time, money, or light.",
    },
    hero: {
      title: "Cabinet of Small Machines",
      dek: "Three unfinished experiments, read again as arguments instead of demos. Not what each one does — what it's quietly claiming.",
    },
    entries: [
      {
        slug: "calendar",
        specimen: "/experiments/calendar",
        medium: "React, continuous scroll, no grid",
        title: "Your Day Is Not a Grid",
        paragraphs: [
          "Every calendar you have ever used is a piece of quiet Newtonian propaganda. It carves the day into identical boxes — nine o'clock, ten o'clock, eleven — and asks you to believe that an hour in a dentist's waiting room and an hour falling in love occupy the same amount of time. The grid is administratively convenient and phenomenologically false.",
          "Henri Bergson had a word for what the grid erases: durée, the lived, unequal thickness of experienced time, as opposed to the interchangeable units a clock hands out. A grid calendar is clock-time with a UI. It lets you schedule a life but not describe one.",
          "This experiment replaces the boxes with a single vertical stream — one line the day moves down, events surfacing and receding as you scroll instead of sitting bolted into hour-wide cells. Nothing here solves scheduling. It asks a smaller, stranger question: if the interface didn't insist on uniform units, what would a day actually look like laid out honestly? Would deep work get to be as long, visually, as it feels? Would the gap after lunch — the underrated, undecorated openness of open time — get to look like relief instead of a blank cell waiting to be filled?",
          "A stream can't be subdivided the way a grid can, and that's the point: it resists the grid's implicit argument that all hours are fungible and any of them can be moved or double-booked without loss. Durée doesn't optimize. It accumulates — and most people meet that argument daily, at nine a.m., without ever suspecting it's philosophy.",
        ],
      },
      {
        slug: "theatre-management",
        specimen: "/experiments/theatre-management",
        medium: "React, screen-allocation & P&L model",
        title: "The Ledger Behind the Curtain",
        paragraphs: [
          "André Bazin called cinema “the myth of total cinema” — the dream of an image so complete it becomes indistinguishable from reality, watched together, in the dark, by strangers who agree for two hours to want the same thing. It's one of the more sincere claims art has made for itself.",
          "None of that survives contact with a P&L statement, and this experiment doesn't pretend it does. It's a screen-allocation and profit model for a theater chain: sliders for ticket price, concession attach rate, staffing, screen count per title — the unglamorous arithmetic that decides whether Tuesday's 7:40 slot goes to the awards contender or the fourth showing of a marketable sequel. Move enough sliders and you feel a manager's actual week: the myth of total cinema, reallocated hourly, one auditorium at a time.",
          "It would be easy to read this as cynicism — art demoted to inventory. The more interesting reading is that the ledger was always there, underneath the myth, and pretending otherwise doesn't make theaters more sacred, it just makes their operators less visible. A screening survives because someone did the allocation math correctly enough times in a row. The total-cinema experience an audience gets to feel unbothered by economics is a product of someone else being thoroughly bothered by economics on their behalf.",
          "The model doesn't resolve the tension between the theater as ritual space and the theater as square footage generating yield per showtime. It just puts both in the same interface, so you can't hold one thought without the other sitting right next to it on the same screen.",
        ],
      },
      {
        slug: "glass",
        specimen: "/experiments/glass",
        medium: "SVG filter graph, no photons",
        title: "A Substance Made of What's Behind It",
        paragraphs: [
          "Glass is a strange thing to render because glass, visually, has almost no properties of its own. You cannot describe what glass looks like without describing what's behind it, bent. Its whole identity is deference — refraction, dispersion, the way it takes an image of the world and quietly lies about where things are.",
          "This experiment fakes that lie with SVG filter primitives — displacement maps, chromatic offsets, blur stacked on blur, no photons anywhere in the pipeline. It runs a reproduction of The School of Athens behind a pane of nothing and asks a feed of matrices to convince you there's a physical object there, distorting light the way physical objects do. It usually works, which should feel a little uncanny once you notice it: you're not looking at glass, or even a picture of glass. You're looking at an argument about glass, written entirely in mathematics that has never met a lens.",
          "Gaston Bachelard wrote about the “material imagination” — the way certain substances carry a poetics prior to, and independent of, any actual sample of the substance in front of you. Glass has one too: clarity, fragility, the promise and the threat of seeing straight through something. What's interesting about faking it in code is that the fake only succeeds by honoring that poetics rather than the physics. Real refraction follows Snell's law precisely. This filter graph follows nothing but does it read as glass, tuned by eye, a displacement map dragged until it looks less like a bug and more like a window.",
          "That's the quiet confession inside most convincing digital materials: they aren't simulations of physics, they're simulations of what physics feels like to an eye that already knows what glass is supposed to do. The realism is borrowed entirely from the viewer.",
        ],
      },
    ],
  },

  home: {
    meta: {
      title: "Ponti Studios",
      description:
        "A studio for AI systems, automation, and the software around them. For startups, enterprises, and local businesses.",
    },
    hero: {
      title: "Computational intelligence for real-world problems.",
      wordBefore: "Computational intelligence for",
      wordAfter: "real-world problems.",
      subhead:
        "A studio for AI systems, automation, and the software around them. For startups, for enterprises, and for the business down the road.",
      secondaryCta: "See the work",
    },
    marquee: [
      "Product design",
      "AI systems",
      "Automation",
      "Data intelligence",
      "Platform engineering",
      "Search",
      "Connectors",
      "Governance",
    ],
    capabilities: {
      title: "From should to shipped.",
    },
    services: {
      title: "What I do",
      intro: "Product and engineering, from a scoped build to embedded leadership.",
      cta: "Services ",
    },
    work: {
      title: "Recent work",
      cta: "All work",
    },
    together: {
      title: "Work together",
      items: [
        {
          name: "Build",
          description: "A scoped product, shipped and handed off.",
          to: "/services#engineering",
        },
        {
          name: "Embed",
          description: "Fractional CTO or product lead, inside your team.",
          to: "/services#fractional-cto",
        },
        {
          name: "Advise",
          description: "Diligence, strategy, and second opinions.",
          to: "/services#technical-consulting",
        },
      ],
    },
    clients: {
      title: "Results",
    },
    projects: {
      title: "Lab",
    },
    principles: {
      title: "Manifesto",
    },
    game: {
      eyebrow: "Featured product",
      title: "Newsboy",
      description: "Wordle for reality-TV fans.",
      cta: "Play today",
      live: "Live",
    },
    career: {
      eyebrow: "Featured product",
      title: "Career",
      description: "Resumes crush decades of work into snippets. Career keeps the whole story.",
      cta: "Visit site",
      live: "Live",
    },
    omiro: {
      eyebrow: "In development",
      title: "Omiro",
      description:
        "Your notes, tasks, and calendar don't talk to each other. Omiro makes them one connected app.",
      cta: "Learn more",
    },
    thames: {
      title: "Thames",
      description: "Walks are for thinking out loud. Thames listens, thinks, and answers out loud.",
      cta: "Learn more",
    },
    lab: {
      title: "Playground",
      description: "practice and play.",
      categories: [
        {
          name: "Experiments",
          entries: [
            { path: "/games/cards", label: "Cards" },
            { path: "/games/tetris", label: "Tetris" },
            { path: "/experiments/calendar", label: "Calendar" },
            { path: "/experiments/pixel-descent.html", label: "Pixel Descent" },
            { path: "/experiments/backlog-mercenaries.html", label: "Backlog Mercenaries" },
            { path: "/experiments/theatre-management", label: "Theatre Management" },
            { path: "/experiments/glass", label: "Glass" },
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
