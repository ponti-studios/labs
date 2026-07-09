export const STUDIO_TRANSLATIONS_EN = {
  nav: {
    brandAlt: "Ponti Studios",
    services: "Services",
    pricing: "Pricing",
    process: "Process",
    manifesto: "Manifesto",
  },

  common: {
    bookCall: "Book a call",
    startingAt: "Starting at",
    replyWithin: "We reply within 24 hours.",
    contactSteps: [
      { title: "Schedule a call", description: "No pressure conversation about your needs (30 mins)" },
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
        "Premium product and content development services. Engineering, design, brand, and content strategy for teams who refuse to compromise.",
    },
    eyebrow: "What we do",
    title: "Services",
    introPillarsPrefix: "We work across two pillars:",
    introPillarsAnd: "and",
    introPillarsSuffix:
      "AI is applied as a capability layer throughout — not a separate service, but part of how we work.",
    introRanges:
      "Every engagement is different. The ranges below give you a calibrated starting point. We provide detailed proposals once we understand your specific scope. For a full explanation of how pricing works, see",
    pricingLink: "Pricing",
    whatYouGet: "What you get",
    bestFor: "Best for",
    investment: "Investment",
    readyTitle: "Ready to talk?",
    entries: {
      engineering: {
        name: "Engineering",
        problem: "You need software built that will hold up — not just at launch, but at scale.",
        description:
          "We build full-stack web and mobile applications from the ground up: architecture, backend, frontend, APIs, databases, and cloud infrastructure. Every codebase we deliver is clean, tested, documented, and maintainable by your future team.",
        deliverables: [
          "Production-ready web or mobile application",
          "Automated test suite",
          "CI/CD pipeline and deployment configuration",
          "Technical documentation and handoff",
        ],
        bestFor:
          "Founders with product vision but no technical co-founder. Companies modernizing legacy systems or racing to market without sacrificing quality.",
        unit: "project",
      },
      productDesign: {
        name: "Product Design",
        problem:
          "Your product is hard to use, or it doesn't feel as premium as the problem it solves.",
        description:
          "We design interfaces from research through high-fidelity — user research, information architecture, interaction design, visual design, and design systems. We make complex things feel simple and mundane tasks feel effortless.",
        deliverables: [
          "User research synthesis",
          "Wireframes and interaction flows",
          "High-fidelity visual designs (Figma)",
          "Design system and component library",
          "Prototype ready for development handoff",
        ],
        bestFor:
          "Products that need a design refresh. Startups launching their first product. Companies with engineering capacity but no design team.",
        unit: "project",
      },
      fractionalProductManagement: {
        name: "Fractional Product Management",
        problem: "You're shipping features but not moving metrics. No one owns the roadmap.",
        description:
          "We embed as your product team — running strategy, prioritization, sprint planning, and stakeholder communication until you're ready to hire. Weekly involvement, not just advisory calls.",
        deliverables: [
          "Product roadmap and prioritization framework",
          "Sprint planning and backlog grooming",
          "Feature specs and requirements",
          "Stakeholder communication and alignment",
          "Metrics tracking and reporting",
        ],
        bestFor:
          "Technical founders who need product expertise. Growth-stage startups between their first product and their first PM hire.",
        unit: "per month · retainer",
      },
      technicalConsulting: {
        name: "Technical Consulting",
        problem:
          "You're about to make an expensive decision and you want a second opinion from someone who's made every mistake in the book.",
        description:
          "We review your architecture, codebase, security posture, and technical direction — then deliver written recommendations and a clear action plan. Async-first with sync sessions where they matter.",
        deliverables: [
          "System design and architecture review",
          "Codebase audit and technical debt assessment",
          "Security and performance evaluation",
          "Build-vs-buy analysis",
          "Written recommendations and prioritized action plan",
        ],
        bestFor:
          "CTOs making big technical decisions. Non-technical founders evaluating work they've commissioned. Companies before a major refactor or platform commitment.",
        unit: "per engagement",
      },
      modernization: {
        name: "Modernization",
        problem:
          "That system you built five years ago is holding your business back. We replace it without disrupting what's working.",
        description:
          "We assess, plan, and execute legacy system modernization — incremental rollouts, data migration, and internal tooling — on a timeline that keeps your business running.",
        deliverables: [
          "Legacy system assessment and migration strategy",
          "Incremental rollout plan",
          "Data migration (safe and complete)",
          "Rebuilt or replaced internal tools and dashboards",
          "Team training and documentation",
        ],
        bestFor:
          "Companies with legacy systems limiting growth. Teams stuck maintaining instead of innovating. Businesses losing customers to more modern competitors.",
        unit: "project",
      },
      brandIdentity: {
        name: "Brand Identity",
        problem: "Your brand is inconsistent, underdeveloped, or no longer reflects who you are.",
        description:
          "We define your positioning, develop your voice, and build the visual system that makes your brand recognizable and credible across every touchpoint — from your website to your pitch deck.",
        deliverables: [
          "Brand positioning and competitive differentiation",
          "Messaging framework (what you say to different audiences)",
          "Voice and tone guidelines",
          "Visual identity — logo, color system, typography, imagery direction",
          "Brand guidelines document",
        ],
        bestFor:
          "Startups ready to look professional. Companies with inconsistent branding. Businesses entering new markets or repositioning after a pivot.",
        unit: "project",
      },
      copyMessaging: {
        name: "Copy & Messaging",
        problem: "Your words aren't converting the right people — or there aren't enough of them.",
        description:
          "We write the copy that carries your brand: landing pages, website, campaigns, and sales materials. Grounded in your positioning and written to move the reader toward a decision.",
        deliverables: [
          "Website and landing page copy",
          "Campaign and email copy",
          "Messaging hierarchy for different audiences",
          "Call-to-action strategy",
        ],
        bestFor:
          "Teams with a visual identity but weak written voice. Launches that need sharp copy fast. Companies whose website isn't converting.",
        unit: "project · often bundled with Brand Identity",
      },
      contentStrategy: {
        name: "Content Strategy",
        problem:
          "You're not showing up where your audience is, or you're showing up with the wrong things.",
        description:
          "We build the content engine: SEO strategy, editorial planning, email, and social — mapped to your funnel and tied to measurable outcomes. We can plan, produce, or both.",
        deliverables: [
          "SEO audit and keyword strategy",
          "Editorial calendar and content plan",
          "Email marketing strategy and sequences",
          "Social media content strategy",
          "Analytics setup and reporting framework",
        ],
        bestFor:
          "Products with an audience but low organic reach. Companies ready to invest in content as a growth channel. Teams with content output but no coherent strategy.",
        unit: "per month ongoing · or project",
      },
      visualProduction: {
        name: "Visual Production",
        problem: "Stock photos look like stock photos. Your brand deserves better.",
        description:
          "We create custom photography and video — product shots, brand photography, campaign imagery, and social content — built for web, marketing, and launch assets.",
        deliverables: [
          "Art direction and shot list",
          "Product and brand photography",
          "Web-optimized and high-res image deliverables",
          "Full commercial use rights",
          "Video content (on request)",
        ],
        bestFor:
          "E-commerce brands needing product shots. Companies wanting to showcase their team and culture. Products launching that need strong visual assets.",
        unit: "per shoot",
      },
      strategyWorkshop: {
        name: "Strategy Workshop",
        problem:
          "Your team needs alignment before you can build. Or you have a decision to make and you need structured thinking to make it well.",
        description:
          "A facilitated working session — in-person or remote — designed around your specific question. We come prepared, run the session, and deliver a written output you can act on immediately.",
        deliverables: [
          "Pre-session preparation and materials",
          "Facilitated working session (half-day or full-day)",
          "Written summary of findings and decisions",
          "Prioritized action plan",
        ],
        bestFor:
          "Founders deciding what to build next. Leadership teams misaligned on priorities. Organizations with a clear question that needs a structured answer.",
        unit: "per session",
      },
    },
  },

  pricing: {
    meta: {
      title: "Pricing | Ponti Studios",
      description:
        "How Ponti Studios prices premium product and content development. Transparent ranges, clear engagement types, and an honest explanation of what moves a quote.",
    },
    eyebrow: "Investment",
    title: "Pricing",
    intro:
      "We publish our pricing because we respect your time. These ranges reflect the real cost of senior-level work done well. If you're comparing us to cheaper alternatives, we're probably not the right fit — and that's fine.",
    thinking: {
      title: "How we think about pricing",
      paragraph1:
        "We do not price by the hour. We price by engagement type, scope, and the complexity of the problem you're bringing us. Hourly billing creates the wrong incentives — it rewards inefficiency and penalizes speed. We are a small, senior team. We move faster than larger agencies and produce less waste. Pricing by the hour would mean charging you more for being slower, which is backwards.",
      paragraph2:
        "What you are paying for is judgment, craft, and outcomes — not seat time. We also build quality assurance, documentation, and testing into every engagement. These are not line items you negotiate out. They are how we ensure the work holds up after we hand it over.",
    },
    engagementTypes: {
      title: "Engagement types",
      items: [
        {
          name: "Project",
          description:
            "Fixed scope, fixed timeline, fixed budget. You know what you need, we scope it, we build it. Best for defined deliverables — a product build, a brand identity, a redesign.",
        },
        {
          name: "Monthly Retainer",
          description:
            "Ongoing partnership with a monthly commitment. Best for continuous work that compounds over time — product management, content strategy, growth. We become a consistent part of your operating rhythm.",
        },
        {
          name: "Per Engagement",
          description:
            "Bounded advisory work with a clear output. Best for audits, architecture reviews, build-vs-buy analysis, and strategy workshops. One question, one deliverable, one fee.",
        },
        {
          name: "Per Shoot",
          description:
            "Production work priced by the day and complexity of output. Best for photography and video campaigns.",
        },
      ],
    },
    byService: {
      title: "Pricing by service",
      service: "Service",
      startingAt: "Starting at",
      unit: "Unit",
      pushesUp: "Pushes the quote up",
      keepsDown: "Keeps the quote down",
    },
    groups: {
      advisory: {
        name: "Advisory",
        description: "For bounded decisions that need expert judgment, not a full team.",
        rows: {
          technicalConsulting: { service: "Technical Consulting", unit: "per engagement" },
          strategyWorkshop: { service: "Strategy Workshop", unit: "per session" },
        },
        pushesUp: [
          "Large or complex codebase requiring extended review time",
          "Multiple systems or stakeholders involved",
          "Synthesis-heavy output — not just findings but implementation-ready recommendations",
          "High-risk decision with significant downstream consequences",
          "Workshop requiring custom facilitation design and pre-session research",
        ],
        keepsDown: [
          "Narrow scope — one system, one question, one decision",
          "Async-first — written review without extensive sync sessions",
          "Existing documentation that accelerates the review",
        ],
      },
      visualProduction: {
        name: "Visual Production",
        description: "For brands that need custom photography and video built for real use.",
        rows: {
          visualProduction: { service: "Visual Production", unit: "per shoot" },
        },
        pushesUp: [
          "Multiple locations or shooting days",
          "Talent coordination and casting",
          "Video in addition to photography",
          "Large shot list with high post-processing volume",
          "Campaign-level production with broader commercial use",
        ],
        keepsDown: ["Single location, focused shot list", "Light post-processing", "Photography only"],
      },
      ongoingPartnership: {
        name: "Ongoing Partnership",
        description: "For teams that need sustained involvement over time, not a one-off deliverable.",
        rows: {
          fractionalProductManagement: {
            service: "Fractional Product Management",
            unit: "monthly retainer",
          },
          contentStrategy: { service: "Content Strategy", unit: "monthly retainer" },
        },
        pushesUp: [
          "More weekly hours and active involvement",
          "Multiple stakeholders or teams to coordinate across",
          "Heavier experimentation, reporting, or content production volume",
          "High-stakes roadmap decisions requiring strategic depth",
          "Execution management in addition to advisory",
        ],
        keepsDown: [
          "Lighter cadence — strategy and oversight without daily execution",
          "Single focused workstream",
          "Stable team that needs direction, not coordination",
        ],
      },
      designAndBrand: {
        name: "Design & Brand",
        description: "For products and companies that need to look and sound like they mean it.",
        rows: {
          copyMessaging: { service: "Copy & Messaging", unit: "project" },
          productDesign: { service: "Product Design", unit: "project" },
          brandIdentity: { service: "Brand Identity", unit: "project" },
        },
        pushesUp: [
          "Many screens, flows, or user types",
          "Deep user research before design begins",
          "Design system built from scratch (not adapted from an existing one)",
          "Brand creation (not extension) — starting from no identity",
          "Multiple audiences requiring distinct messaging",
          "Website and marketing assets included alongside core identity work",
        ],
        keepsDown: [
          "One focused product area or flow family",
          "Light research — assumptions already validated",
          "Brand extension — existing identity in good shape, needs refinement",
          "Standalone copy engagement without accompanying visual work",
        ],
      },
      productBuild: {
        name: "Product Build",
        description: "For software that needs to be built from scratch or substantially rebuilt.",
        rows: {
          engineering: { service: "Engineering", unit: "project" },
          modernization: { service: "Modernization", unit: "project" },
        },
        pushesUp: [
          "Multiple user roles with distinct permissions and workflows",
          "Complex backend logic, data models, or algorithmic requirements",
          "Third-party integrations that require custom connectors",
          "Mobile in addition to web",
          "Timeline compression — faster delivery requires more parallel capacity",
          "Regulated industries with compliance or audit requirements",
        ],
        keepsDown: [
          "Narrow scope with one core workflow",
          "Standard infrastructure with few integrations",
          "Clear, stable requirements before we start",
          "Flexible timeline",
        ],
      },
    },
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
    quoteVariables: {
      title: "What moves any quote",
      intro:
        "These variables apply across all engagement types. Understanding them helps you understand where your project is likely to land before we talk.",
      columns: { variable: "Variable", lower: "Lower end", higher: "Higher end" },
      rows: [
        { variable: "Scope clarity", lower: "Defined and bounded", higher: "Still being discovered" },
        {
          variable: "Stakeholder count",
          lower: "One decision-maker",
          higher: "Many reviewers and approval loops",
        },
        {
          variable: "Workflow complexity",
          lower: "One core flow",
          higher: "Multiple user journeys and edge cases",
        },
        {
          variable: "Technical complexity",
          lower: "Standard stack, few integrations",
          higher: "Custom systems, migrations, compliance",
        },
        {
          variable: "Research burden",
          lower: "Assumptions already validated",
          higher: "Discovery still needed",
        },
        { variable: "Timeline", lower: "Flexible", higher: "Compressed or launch-sensitive" },
        {
          variable: "Quality bar",
          lower: "Functional and well-built",
          higher: "Premium polish with heavier QA",
        },
        {
          variable: "Operational risk",
          lower: "Greenfield or low continuity risk",
          higher: "Must preserve existing business operations",
        },
        {
          variable: "Asset volume",
          lower: "Few outputs",
          higher: "Many screens, pages, or content deliverables",
        },
      ],
    },
    whyWeCostMore: {
      title: "Why we cost more than alternatives",
      intro: "This is a fair question. Here is an honest answer.",
      items: [
        {
          name: "Senior practitioners, not junior contractors.",
          description:
            "Every person on your project has done this before. We do not staff engagements with people learning on your budget.",
        },
        {
          name: "Lower total cost of ownership.",
          description:
            "Cheaper work usually costs more in the long run — rework, bugs, missed deadlines, and technical debt that takes years to unwind. We build for the long term from day one.",
        },
        {
          name: "Fewer surprises.",
          description:
            "We scope carefully, communicate proactively, and tell you when something is going wrong before it is too late to fix it. That has real economic value.",
        },
        {
          name: "We document and hand off.",
          description:
            "When we leave, you own the work and understand it. You are not dependent on us to keep the lights on.",
        },
        {
          name: "We include QA.",
          description:
            "Testing is not optional for us. It is the difference between software that works and software that works until it matters.",
        },
      ],
    },
    faqs: {
      title: "Frequently asked questions",
      items: [
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
            "Scope changes happen. We handle them with a simple change order — written description of what changed, the adjusted timeline, and the adjusted cost. No surprises.",
        },
        {
          question: "Do you offer payment plans?",
          answer:
            "For large projects, yes. We can structure milestone payments across the timeline. We do not offer deferred payment.",
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
          description: "Fixed scope, fixed timeline, fixed budget. Best when you know exactly what you need.",
        },
        {
          name: "Retainer",
          description:
            "Ongoing partnership with monthly commitment. Best for continuous product development and support.",
        },
        {
          name: "Time & Materials",
          description: "Flexible scope, pay for what you use. Best for exploration and discovery phases.",
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
          description: "Every decision traces back to a human being trying to accomplish something.",
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
          description: "Say the hard thing plainly. Surface the decision, reduce noise, make the next step obvious.",
        },
        {
          name: "Systems over features",
          description: "Design the working whole. The product stays coherent as it grows.",
        },
        {
          name: "Quality or nothing",
          description: "Ship late and proud, never on-time and embarrassed. We'd rather tell you it's not ready.",
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
          description: "If it's a bad idea, we'll tell you. If there's a better way, we'll show you.",
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
      description: "Concept, mess, ambition, rebuild — bring it. We bring structure, standards, and execution.",
    },
    lab: {
      eyebrow: "Side projects",
      title: "The Lab",
      description: "Games, experiments, tools, and take-home challenges built for practice and play.",
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
