export const STUDIO_TRANSLATIONS_EN = {
  nav: {
    brandAlt: "Ponti Studios",
    services: "Services",
    process: "Process",
    manifesto: "Manifesto",
  },

  common: {
    bookCall: "Book a call",
    replyWithin: "We reply within 24 hours.",
    contactSteps: [
      {
        title: "Schedule a call",
        description: "No pressure conversation about your needs (30 mins)",
      },
      { title: "Discovery session", description: "If we're aligned, we'll dig deeper (1–2 weeks)" },
      { title: "Proposal", description: "Detailed scope, timeline, and investment" },
      { title: "Partnership", description: "If you love it, we start building together" },
    ],
    readyTitle: "Ready to build something real?",
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
    hero: {
      eyebrow: "What we do",
      title: "Senior product and content partnership.",
      introPillarsPrefix: "We work across two pillars:",
      introPillarsAnd: "and",
      introPillarsSuffix:
        "AI is applied as a capability layer throughout — not a separate service, but part of how we work.",
      introScope:
        "Every engagement is scoped to your problem. We share a clear proposal after we understand the work — not a rate card that pretends every project is the same.",
      proofLine:
        "Outcomes for StreamYard, Lumina, Prolog, Thomson Reuters, Kensho, Humana, and others.",
      seeServices: "See services",
      seeEngagement: "How we work together",
    },
    trust: {
      eyebrow: "Selected work",
      names: [
        "StreamYard",
        "Thomson Reuters",
        "Humana",
        "Kensho",
        "Mimecast",
        "Lumina",
        "Prolog",
        "Whistle",
        "Revrock",
      ],
    },
    overview: {
      eyebrow: "What we do",
      title: "Services",
      intro: "Open a service for what's included.",
    },
    engagementTypes: {
      title: "How we engage",
      intro: "We structure work around the shape of the problem — not a single contract template.",
      items: [
        {
          name: "Project",
          description:
            "Fixed scope and timeline for a defined outcome — a product build, brand system, redesign, or modernization program.",
        },
        {
          name: "Retainer",
          description:
            "Ongoing partnership for work that compounds week over week — product leadership, content, continuous delivery.",
        },
        {
          name: "Advisory",
          description:
            "A bounded engagement with a written output — audits, architecture reviews, build-vs-buy, facilitated workshops.",
        },
        {
          name: "Production",
          description:
            "Photography and video scoped by shoot and deliverables when you need original assets, not stock.",
        },
      ],
    },
    proof: {
      eyebrow: "Proof",
      title: "Selected outcomes",
      intro: "Hard numbers from product and engineering engagements — not adjectives.",
      problemLabel: "Problem",
      whatWeDidLabel: "What we did",
      outcomeLabel: "Outcome",
      servicesLabel: "Services",
      snapshots: [
        {
          slug: "streamyard",
          client: "StreamYard",
          industry: "Creator Economy",
          problem:
            "Solo-creator product hit a B2B ceiling — no workspaces, no real roles, no path for agencies and media teams.",
          whatWeDid:
            "Led product and engineering for Teams/Business tier and the creator marketplace, from architecture through launch.",
          outcomes: [
            "$15M+ enterprise ARR unlocked",
            "13% consumer growth within 3 months of Business launch",
            "300% YoY creator collaborations",
          ],
          services: ["Engineering", "Product"],
        },
        {
          slug: "lumina",
          client: "Lumina",
          industry: "EdTech",
          problem:
            "Acquisition leaking at checkout; retention broken by discovery, course continuity, and grading trust.",
          whatWeDid:
            "Six independently shippable workstreams across search, retention, payments, frontend performance, and grading reliability.",
          outcomes: [
            "Feed engagement +43%",
            "Course return 1–2 weeks → 2 days",
            "Second-course enrollment ~40% higher",
            "Time-to-interactive 32% faster",
          ],
          services: ["Engineering", "Modernization", "Product"],
        },
        {
          slug: "prolog",
          client: "Prolog",
          industry: "Entertainment / AI",
          problem:
            "Showrunner teams drowning in email and spreadsheet submission triage during peak staffing.",
          whatWeDid:
            "Designed and built an AI extraction and review pipeline with confidence scoring and human override.",
          outcomes: [
            "~95% extraction accuracy",
            "Review time ~70% down",
            "3× reviewer throughput",
          ],
          services: ["Engineering", "Product Design"],
        },
        {
          slug: "thomson-reuters",
          client: "Thomson Reuters",
          industry: "Enterprise",
          problem:
            "Global deploy and monitoring tooling siloed; primary API ~14s; a monolith optimized for no one.",
          whatWeDid:
            "Unified the Compass platform, migrated the API, decomposed the monolith, and ran technical debt as a product program.",
          outcomes: [
            "Primary API 97% faster (13.8s → 0.5s)",
            "Data transfer −72%",
            "Cloud cost −30%",
            "Critical debt −65%",
          ],
          services: ["Engineering", "Modernization"],
        },
        {
          slug: "kensho",
          client: "Kensho",
          industry: "Financial data",
          problem:
            "Multi-modal data pipeline collapsing under peak load; operational knowledge trapped in individual heads.",
          whatWeDid:
            "Led batch-to-streaming platform migration, hardware-aware routing, and durable on-call and onboarding systems.",
          outcomes: [
            "Throughput 24×",
            "Market-data latency ~10 min → <50 ms",
            "Time-to-first-PR 1 week → 3 hours",
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
            description: "Deploy pipelines and environment config your team can run without us",
          },
          {
            label: "Handoff",
            description: "Documentation so the codebase stays maintainable after we leave",
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
            description: "Your team understands the new system before we step away",
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
      visualProduction: {
        name: "Visual Production",
        deliverables: [
          {
            label: "Art direction",
            description: "Shot list and visual plan before anything is captured",
          },
          {
            label: "Photography",
            description: "Product and brand images that look like you, not a stock library",
          },
          {
            label: "Deliverables",
            description: "Web-ready and high-res files sized for the places you'll use them",
          },
          {
            label: "Rights",
            description: "Full commercial use so legal is not a later surprise",
          },
          {
            label: "Video",
            description: "Motion content on request when stills aren't enough",
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
    scope: {
      alwaysIncluded: {
        title: "What's always included",
        items: [
          "Quality assurance and testing — We do not ship untested work",
          "Documentation — You should not be dependent on us to understand what we built",
          "A defined handoff — Clear transition, not a disappearing act",
          "Honest communication — If something changes the scope or timeline, we tell you before it's a problem",
        ],
      },
      notIncluded: {
        title: "What's not included",
        items: [
          "Third-party software licenses, hosting costs, or API fees — these are passed through at cost",
          "Content you provide (copy, images, data) — we can produce this, but it is scoped separately",
          "Ongoing maintenance after project close — we offer retainers for this; it is not assumed",
        ],
      },
    },
    faqs: {
      title: "Frequently asked questions",
      items: [
        {
          question: "How do you price engagements?",
          answer:
            "By scope, complexity, and engagement type — not by the hour. After a discovery call we send a written proposal with deliverables, timeline, and investment. Every engagement is different; we won't pretend a rate card can replace that conversation.",
        },
        {
          question: "Do you work with early-stage startups with limited budgets?",
          answer:
            "Yes, with the right engagement. Early-stage founders are a strong fit for fractional product management, advisory, or a focused MVP build. We are not a fit if the budget requires cutting quality.",
        },
        {
          question: "Can we start with a smaller engagement before committing to a larger one?",
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
            "Scope changes happen. We handle them with a simple change order — written description of what changed, the adjusted timeline, and the adjusted investment. No surprises.",
        },
        {
          question: "How long does it take to get a proposal?",
          answer:
            "After a 30-minute discovery call, we typically deliver a written proposal within five business days.",
        },
      ],
    },
    gettingStarted: {
      title: "How to get started",
    },
  },


  process: {
    meta: {
      title: "How We Work | Ponti Studios",
      description:
        "How Ponti Studios engages, runs projects, and partners with clients from first call to launch and beyond.",
    },
    eyebrow: "Partnership",
    title: "How we work",
    engagementModels: {
      title: "Engagement models",
      items: [
        {
          name: "Project-Based",
          description:
            "Fixed scope, fixed timeline, fixed budget. Best when you know exactly what you need.",
        },
        {
          name: "Retainer",
          description:
            "Ongoing partnership with monthly commitment. Best for continuous product development and support.",
        },
        {
          name: "Time & Materials",
          description:
            "Flexible scope, pay for what you use. Best for exploration and discovery phases.",
        },
        {
          name: "Fractional Team",
          description:
            "We become your product, design, and engineering team. Best for early-stage startups pre-Series A.",
        },
      ],
    },
    steps: {
      title: "Our process",
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
      title: "What we need from you",
      items: [
        { title: "Clarity", description: "Be honest about goals, constraints, and concerns" },
        { title: "Availability", description: "Responsive feedback keeps projects moving" },
        { title: "Trust", description: "We'll challenge your assumptions for good reason" },
        { title: "Decisions", description: "When we present options, choose and move forward" },
      ],
    },
    whatYouGet: {
      title: "What you get from us",
      items: [
        { title: "Excellence", description: "Work we're proud to put our name on" },
        { title: "Transparency", description: "No surprises, ever" },
        { title: "Partnership", description: "We're invested in your success" },
        { title: "Results", description: "Tangible outcomes, not just activity" },
      ],
    },
  },

  manifesto: {
    meta: {
      title: "Manifesto | Ponti Studios",
      description: "What we believe and how it shapes everything we build.",
    },
    title: "Manifesto",
    intro:
      "We are not a vendor. We are not a feature factory. We are not here to execute tickets. We build things that last — because we believe the people using them deserve better than what they usually get.",
    believe: {
      title: "What we believe",
      items: [
        {
          title: "Humans deserve their data.",
          description:
            "We store data on users' devices whenever possible. Access is not a feature we grant — it is a right we protect. An application that holds your data hostage is not a product; it is a trap.",
        },
        {
          title: "Humans deserve better software.",
          description:
            "Most software is built to ship, not to last. It is staffed by people learning on someone else's budget, scoped to minimize cost rather than maximize value, and handed off without documentation or tests. We refuse this model. Every codebase we deliver is clean, tested, and maintainable by the team that inherits it.",
        },
        {
          title: "Humans deserve better businesses.",
          description:
            "We believe accessible mentorship, practical business education, and the right tools can help marginalized entrepreneurs build sustainable businesses. Decreasing income inequality is not a side project — it is a priority we build toward deliberately.",
        },
        {
          title: "Humans deserve better content.",
          description:
            "Traditional content production has long been an exclusive club that frequently creates work that doesn't connect. We move away from the spray-and-pray approach and toward content that resonates — built on research, shaped by craft, and measured by outcomes.",
        },
      ],
    },
    build: {
      title: "How we build",
      subtitle:
        "Kanso. Ma. Shibui. Wabi-sabi. These four principles are not aesthetic preferences. They are a discipline.",
      footer: "Efficiency through subtraction. Authority through stillness. Value through clarity.",
      principles: [
        {
          name: "Kanso",
          jp: "簡素",
          description:
            "The death of decoration. Beauty is a byproduct of utility, not an addition to it. We do not decorate; we architect.",
        },
        {
          name: "Ma",
          jp: "間",
          description:
            "The power of the void. Space is not empty — it is structural. We use negative space to give ideas room to breathe.",
        },
        {
          name: "Shibui",
          jp: "渋い",
          description:
            "The strength of stillness. Understated, deliberate, built for the long term. Our substance is enough.",
        },
        {
          name: "Wabi-sabi",
          jp: "侘寂",
          description:
            "The precision of truth. Monospace clarity. Rigid grids. The raw precision of the machine.",
        },
      ],
    },
    values: {
      title: "Core values",
      items: [
        {
          name: "Consumer First",
          description:
            "We will always put the needs of our users first. We will never sacrifice the user experience for the sake of profit.",
        },
        {
          name: "Privacy First",
          description:
            "We will never sell user data, and we will never use it for advertising. We will only use it to improve our products and services.",
        },
        {
          name: "Social Separate From Media",
          description: "Keep social interactions distinct from media consumption.",
        },
      ],
    },
    think: {
      title: "How we think",
      items: [
        {
          name: "Code is cheap. Judgment is not.",
          description:
            "Anyone can generate code. Knowing what to build, why, and when to stop — that is what we are paid for.",
        },
        {
          name: "The work is the argument.",
          description:
            "We do not sell process decks or methodology slides. We ship. The quality of the output is the only credential that matters.",
        },
        {
          name: "Invent and simplify.",
          description:
            "The right answer is almost never more complexity. Most problems are solved by removing something.",
        },
        {
          name: "Fix it permanently.",
          description:
            "Temporary solutions are permanent the moment they ship. A workaround is a debt that someone will pay with interest.",
        },
        {
          name: "Start with the customer, work backward.",
          description:
            "Every decision traces back to a human being trying to accomplish something.",
        },
      ],
    },
    refuse: {
      title: "What we refuse",
      items: [
        "We do not staff engagements with people learning on your budget.",
        "We do not ship untested work.",
        "We do not disappear after delivery.",
        "We do not mistake activity for results.",
        "We do not value comfort over honesty. If something is going wrong, we tell you before it is too late to fix it.",
      ],
    },
    quote: "Eliminate the unnecessary so that the necessary may speak.",
    founders: {
      title: "The founder's principles",
      subtitle:
        "These are not studio policies. They are personal operating beliefs shaped by a decade of building across companies, teams, and domains.",
      principles: [
        {
          title: "Evidence before performance.",
          description:
            "Stories before slogans. Reflection before polish. The goal is to know the real work well enough that any conversation about it becomes a conversation about judgment, not a recitation of memorized answers.",
        },
        {
          title: "User value before vanity metrics.",
          description:
            "Technical quality in service of product clarity. Teams as systems, not collections of heroic individuals.",
        },
        {
          title: "The product-engineering bridge is the job.",
          description:
            "The strongest work happens where product and engineering are not treated as separate worlds — turning ambiguous problems into clear systems: user research into product direction, technical constraints into architecture, and team confusion into operating rhythm.",
        },
        {
          title: "Sustainable businesses create the oxygen for long-term product work.",
          description:
            "Mission and profitability are not opposed. The healthiest version is when user value, team health, and business strength reinforce each other.",
        },
      ],
      industriesTitle: "Industries that matter",
      industries: [
        {
          name: "Education",
          description:
            "because traditional schooling did not align with my learning style, and I believe in products that adapt to students instead of forcing every student through the same path.",
        },
        {
          name: "Healthcare",
          description:
            "because access, awareness, and prevention change lives. Technology is most valuable when it removes barriers to care.",
        },
        {
          name: "Finance",
          description:
            "because growing up in a low-income environment showed how much financial knowledge shapes opportunity.",
        },
      ],
    },
  },

  home: {
    meta: {
      title: "Ponti Studios",
      description:
        "Premium product and content development for teams who refuse to compromise on quality.",
    },
    hero: {
      title: "Premium product and content, built to last.",
      description:
        "Ponti Studios builds premium products and content for founders and teams who refuse to compromise on quality. Strategy, design, engineering, and brand — from concept to shipping work.",
      disclaimer: "If you're looking for cheap and fast, we're not for you.",
      seeServices: "See all services",
    },
    fit: {
      goodEyebrow: "We're great for",
      good: [
        "Early-stage startups (pre-seed through Series A)",
        "Founders who care deeply about quality",
        "Companies modernizing their technology",
        "Organizations entering new markets",
        "Teams who've been burned by cheap alternatives",
      ],
      notEyebrow: "We're probably not right for",
      notRight: [
        "Companies optimizing for lowest cost",
        "Organizations needing body-shop staffing",
        "Projects requiring compromise on quality",
        "Teams not ready to invest in excellence",
      ],
    },
    services: {
      eyebrow: "What we do",
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
    principles: {
      eyebrow: "How we think",
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
            "Ship late and proud, never on-time and embarrassed. We'd rather tell you it's not ready.",
        },
        {
          name: "Builders, not vendors",
          description:
            "We don't hand you a quote and disappear. We're shoulder-to-shoulder with you until the work is done right.",
        },
        {
          name: "Taste matters",
          description: "Restraint, proportion, sharp language. The interface should feel composed.",
        },
        {
          name: "Honest to a fault",
          description:
            "If it's a bad idea, we'll tell you. If there's a better way, we'll show you.",
        },
      ],
    },
    process: {
      eyebrow: "Partnership",
      title: "How we work",
      cta: "Engagement models and process →",
    },
    contact: {
      title: "Ready to build something real?",
      description:
        "Concept, mess, ambition, rebuild — bring it. We bring structure, standards, and execution.",
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
