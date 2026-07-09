export const STUDIO_TRANSLATIONS_EN = {
  nav: {
    brandAlt: "Ponti Studios",
    services: "Services",
    work: "Work",
    process: "Process",
    manifesto: "Manifesto",
    book: "Book",
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
      content: "Content",
      advisory: "Advisory",
    },
  },

  services: {
    meta: {
      title: "Services | Ponti Studios",
      description:
        "Premium product and content development with published outcomes. Engineering, design, brand, and content strategy for teams who refuse to compromise.",
    },
    overview: {
      eyebrow: "What I do",
      title: "Services",
    },
    proof: {
      eyebrow: "Proof",
      title: "Selected work",
      intro: "Hard numbers from product and engineering engagements — not adjectives.",
      problemLabel: "Problem",
      whatWeDidLabel: "What I did",
      outcomeLabel: "Outcome",
      servicesLabel: "Services",
      readCaseStudy: "Read the full case study →",
      snapshots: [
        {
          slug: "streamyard",
          client: "StreamYard",
          industry: "Creator Economy",
          timeline: "2020–2024",
          role: "Lead Product Engineer & Product Manager",
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
          services: ["Engineering", "Product"],
        },
        {
          slug: "lumina",
          client: "Lumina",
          industry: "EdTech",
          timeline: "2025",
          role: "Senior Product & Platform Engineer",
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
          services: ["Engineering", "Modernization", "Product"],
        },
        {
          slug: "prolog",
          client: "Prolog",
          industry: "Entertainment / AI",
          timeline: "2024",
          role: "Product Lead",
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
          services: ["Engineering", "Product Design"],
        },
        {
          slug: "thomson-reuters",
          client: "Thomson Reuters",
          industry: "Enterprise",
          timeline: "2015–2018",
          role: "Senior Software Engineer",
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
          services: ["Engineering", "Modernization"],
        },
        {
          slug: "kensho",
          client: "Kensho",
          industry: "Financial data",
          timeline: "2019–2020",
          role: "Head of Data Engineering",
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
          services: ["Engineering", "Modernization"],
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
      brandIdentity: {
        name: "Brand Identity",
        deliverables: [
          {
            label: "Positioning",
            description: "Who you are for, why you win, and how you stand apart",
          },
          {
            label: "Messaging",
            description: "What to say to each audience without reinventing it every time",
          },
          {
            label: "Voice",
            description: "Tone guidelines so every writer sounds like the same company",
          },
          {
            label: "Visual identity",
            description: "Logo, color, type, and imagery direction that hold together",
          },
          {
            label: "Guidelines",
            description: "A brand document your team and vendors can actually follow",
          },
        ],
      },
      copyMessaging: {
        name: "Copy & Messaging",
        deliverables: [
          {
            label: "Website copy",
            description: "Pages and landings written to move the right reader to act",
          },
          {
            label: "Campaign copy",
            description: "Emails and ads with a clear offer and a clear next step",
          },
          {
            label: "Message hierarchy",
            description: "What to lead with for each audience — and what to leave out",
          },
          {
            label: "CTAs",
            description: "Calls to action that match the decision the reader is ready to make",
          },
        ],
      },
      contentStrategy: {
        name: "Content Strategy",
        deliverables: [
          {
            label: "SEO strategy",
            description: "Keywords and topics that match how your buyers actually search",
          },
          {
            label: "Editorial plan",
            description: "A calendar of what to publish, for whom, and why it compounds",
          },
          {
            label: "Email",
            description: "Sequences that nurture and convert without becoming noise",
          },
          {
            label: "Social",
            description: "A channel plan with formats and cadence your team can sustain",
          },
          {
            label: "Analytics",
            description: "Measurement so you know which content earns its keep",
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
        question: "Is testing and documentation included?",
        answer:
          "Yes, always. I do not ship untested work, and you should never be dependent on me to understand what I built. Every engagement ends with a defined handoff, not a disappearing act.",
      },
      {
        question: "What's not covered by the engagement?",
        answer:
          "Third-party software licenses, hosting, and API fees are passed through at cost. Content you provide (copy, images, data) I can produce, but it's scoped separately. Ongoing maintenance after project close isn't assumed — I offer retainers for that.",
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

  process: {
    meta: {
      title: "How I Work | Ponti Studios",
      description:
        "How Charles Ponti engages, runs projects, and partners with clients from first call to launch and beyond.",
    },
    engagementModels: {
      title: "How I engage",
      intro: "Four shapes. Pick the one that matches the work.",
      items: [
        {
          name: "Project",
          description:
            "Fixed scope and timeline for a build, brand system, redesign, or modernization.",
        },
        {
          name: "Retainer",
          description:
            "Week-over-week partnership for product leadership, content, or continuous delivery.",
        },
        {
          name: "Advisory",
          description: "Bounded engagement with a written output — audit, review, or workshop.",
        },
        {
          name: "Fractional Team",
          description:
            "I become your product, design, and engineering team. Best for early-stage startups pre-Series A.",
        },
      ],
    },
    steps: {
      title: "My process",
      items: [
        {
          step: "01",
          title: "Discovery",
          duration: "1–2 weeks",
          description:
            "Understand your business, users, and goals. Assess technical and design requirements. Identify risks and opportunities. Align on success metrics.",
        },
        {
          step: "02",
          title: "Planning",
          duration: "1 week",
          description:
            "Define scope and timeline. Create project roadmap. Establish communication cadence. Set up tools and workflows.",
        },
        {
          step: "03",
          title: "Execution",
          duration: "Varies",
          description:
            "Weekly sprints with visible progress. Regular demos and check-ins. Continuous testing and quality assurance. Iterative refinement based on feedback.",
        },
        {
          step: "04",
          title: "Launch",
          duration: "1–2 weeks",
          description:
            "Final testing and optimization. Deployment to production. Monitoring and support. Knowledge transfer and documentation.",
        },
        {
          step: "05",
          title: "Growth",
          duration: "Ongoing",
          description:
            "Measure performance against goals. Iterate based on user feedback. Ongoing support and enhancement. Strategic partnership as you scale.",
        },
      ],
    },
    whatWeNeed: {
      title: "What I need from you",
      items: [
        { title: "Clarity", description: "Be honest about goals, constraints, and concerns" },
        { title: "Availability", description: "Responsive feedback keeps projects moving" },
        { title: "Trust", description: "I'll challenge your assumptions for good reason" },
        { title: "Decisions", description: "When I present options, choose and move forward" },
      ],
    },
    whatYouGet: {
      title: "What you get from me",
      items: [
        { title: "Excellence", description: "Work I'm proud to put my name on" },
        { title: "Transparency", description: "No surprises, ever" },
        { title: "Partnership", description: "I'm invested in your success" },
        { title: "Results", description: "Tangible outcomes, not just activity" },
      ],
    },
  },

  manifesto: {
    meta: {
      title: "Manifesto | Ponti Studios",
      description: "What I believe and how it shapes everything I build.",
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
            "Knowing what to build, why, and when to stop is what I'm paid for — not generating code. I don't sell process decks; I ship, and the work is the argument. Evidence beats performance, and the best work bridges product and engineering into one discipline.",
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
      description:
        "Premium product and content development for teams who refuse to compromise on quality.",
    },
    hero: {
      eyebrow: "Product & content studio",
      title: "Premium product and content, built to last.",
      disclaimer: "If you're looking for cheap and fast, I'm not for you.",
      seeServices: "See all services",
    },
    fit: {
      eyebrow: "Fit",
      title: "Who this is for",
      intro: "I turn down more work than I take. Here's the filter.",
      goodLabel: "Good fit",
      good: [
        "Pre-seed to Series A founders who move fast",
        "Teams modernizing a system that's outgrown itself",
        "Founders who'd rather ship late than ship broken",
        "Anyone burned by a cut-rate shop before",
      ],
      notLabel: "Not a fit",
      notRight: [
        "Lowest-bid procurement",
        "Body-shop staffing requests",
        "Scope that assumes corners get cut",
        "Teams not ready to invest in the work",
      ],
    },
    services: {
      eyebrow: "What I do",
      title: "Product and Content",
      cta: "See all services →",
    },
    work: {
      eyebrow: "Proof",
      title: "Selected work",
      items: [
        { name: "Prolog", category: "Entertainment / AI" },
        { name: "Lumina", category: "Education" },
        { name: "StreamYard", category: "Creator Economy" },
        { name: "Humana", category: "Healthcare / Innovation" },
        { name: "Kensho", category: "Data / Finance" },
        { name: "Thomson Reuters", category: "Enterprise" },
        { name: "Mimecast", category: "Enterprise" },
        { name: "Revrock", category: "Music / Independent Artists" },
        { name: "Whistle", category: "Education / Video" },
      ],
    },
    founder: {
      eyebrow: "Who's behind this",
      name: "Charles Ponti",
      initials: "CP",
      bio: "Eleven years building product and engineering — from senior engineer at Thomson Reuters, to leading a 15-person data engineering team through S&P Global's acquisition of Kensho, to lead product engineer driving StreamYard's Business tier to $15M+ in enterprise ARR before it was acquired by Hopin. Founded Ponti Studios in 2024 to bring that same bar to entertainment and product teams directly.",
    },
    principles: {
      eyebrow: "How I think",
      title: "Principles",
      cta: "Read the manifesto →",
      items: [
        {
          name: "Clarity over hype",
          description:
            "Say the hard thing plainly. Surface the decision, reduce noise, make the next step obvious.",
        },
        {
          name: "Systems over features",
          description: "Design the working whole. The product stays coherent as it grows.",
        },
        {
          name: "Quality or nothing",
          description:
            "Ship late and proud, never on-time and embarrassed. I'd rather tell you it's not ready.",
        },
        {
          name: "Builder, not vendor",
          description:
            "I don't hand you a quote and disappear. I'm shoulder-to-shoulder with you until the work is done right.",
        },
        {
          name: "Taste matters",
          description: "Restraint, proportion, sharp language. The interface should feel composed.",
        },
        {
          name: "Honest to a fault",
          description: "If it's a bad idea, I'll tell you. If there's a better way, I'll show you.",
        },
      ],
    },
    process: {
      eyebrow: "Partnership",
      title: "How I work",
      cta: "process →",
    },
    lab: {
      eyebrow: "Side projects",
      title: "The Lab",
      description:
        "Games, experiments, tools, and take-home challenges built for practice and play.",
      sourcePrefix: "Source:",
      categories: [
        {
          name: "Games",
          entries: [
            { path: "/games/realitea", label: "RealiTea" },
            { path: "/games/cards", label: "Cards" },
            { path: "/games/tetris", label: "Tetris" },
          ],
        },
        {
          name: "Experiments",
          entries: [
            { path: "/experiments/career-resume-animated", label: "Career Resume Animated" },
            { path: "/experiments/calendar", label: "Calendar" },
            { path: "/experiments/pixel-descent.html", label: "Pixel Descent" },
            { path: "/experiments/theatre-management", label: "Theatre Management" },
            { path: "/experiments/llm-interface", label: "LLM Interface" },
            { path: "/experiments/glass", label: "Glass" },
            { path: "/experiments/threegl-web-request", label: "ThreeGL Web Request" },
            { path: "/experiments/threegl-image-gallery", label: "ThreeGL Image Gallery" },
            { path: "/experiments/infinite-scroll", label: "Infinite Scroll" },
          ],
        },
        {
          name: "Tools",
          entries: [
            { path: "/gen/image", label: "Image Generation" },
            { path: "/tarot", label: "Tarot" },
            { path: "/covid", label: "COVID Analytics" },
          ],
        },
        {
          name: "Challenges",
          entries: [
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
            { path: "/challenges/qubit", label: "CSS Selector Engine", source: "Qubit" },
            { path: "/challenges/red-badger", label: "Mars Robot Navigator", source: "Red Badger" },
          ],
        },
      ],
    },
  },
} as const;
