import Link from "next/link";

const APPROACH = [
  {
    title: "We're builders, not vendors.",
    description:
      "We don't hand you a quote and disappear. We partner with you, shoulder-to-shoulder, until the work is done right.",
  },
  {
    title: "We think in systems.",
    description:
      "Design, engineering, and strategy aren't separate—they're inseparable parts of building great products.",
  },
  {
    title: "We ship quality or we don't ship.",
    description:
      "Rushing to meet arbitrary deadlines with compromised work isn't our style. We'd rather launch late and proud than on-time and embarrassed.",
  },
  {
    title: "We're honest to a fault.",
    description:
      "If something's a bad idea, we'll tell you. If there's a better way, we'll show you. Sugar-coating helps no one.",
  },
];

interface ServiceFeature {
  category: string;
  items: readonly string[];
}

interface ServiceEngagement {
  duration: string;
  team: string;
  delivery: string;
  investment: string;
}

interface Service {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  features: ServiceFeature[];
  differentiators?: string[];
  process?: string[];
  engagement: ServiceEngagement;
  perfectFor: string[];
}

const SERVICES: Service[] = [
  {
    id: "product-development",
    title: "Product Development",
    subtitle: "From zero to launch and beyond",
    description:
      "We build digital products that people actually want to use. Not minimum viable products that barely work—polished, thoughtful experiences that feel premium from day one.",
    features: [
      {
        category: "Full-Stack Development",
        items: [
          "Modern web applications — React, Next.js, TypeScript, Node.js",
          "Mobile apps — Native iOS/Android or React Native",
          "Progressive web apps — The best of web and native",
          "API development — RESTful and GraphQL services",
          "Database design — PostgreSQL, MongoDB, Redis, and more",
          "Cloud infrastructure — AWS, Vercel, Railway, Fly.io",
        ],
      },
    ],
    differentiators: [
      "Clean, maintainable code that your future team will thank you for",
      "Automated testing so bugs don't reach production",
      "Performance optimization built in, not bolted on",
      "Security best practices from day one",
      "Documentation that actually helps",
    ],
    engagement: {
      duration: "8-16 weeks for MVP",
      team: "1-2 engineers, 1 designer, 1 product manager",
      delivery: "Working software every week",
      investment: "$80K - $200K+",
    },
    perfectFor: [
      "Founders with product vision but no technical co-founder",
      "Companies modernizing legacy systems",
      "Startups racing to market with quality",
      "Teams who've been burned by cheap dev shops",
    ],
  },
  {
    id: "product-design",
    title: "Product Design",
    subtitle: "Interface and experience design that delights",
    description:
      "We believe all digital products should be beautiful. Not decoration—thoughtful design that makes complex things feel simple and mundane tasks feel delightful.",
    features: [
      {
        category: "UX/UI Design",
        items: [
          "User research — Understanding who we're designing for",
          "Information architecture — Structuring complexity into clarity",
          "Wireframing & prototyping — Testing ideas before building them",
          "Visual design — Interfaces that feel premium",
          "Interaction design — Making software feel alive",
          "Design systems — Consistent, scalable component libraries",
          "Usability testing — Validating designs with real users",
        ],
      },
      {
        category: "Specialized Design Services",
        items: [
          "Mobile app design — iOS and Android",
          "Web application design — SaaS, dashboards, admin panels",
          "Marketing websites — Landing pages that convert",
          "Brand identity — Logos, color systems, typography",
          "Illustration & iconography — Custom assets that elevate your brand",
        ],
      },
    ],
    process: [
      "Research — Understand users and context",
      "Explore — Generate multiple concepts",
      "Design — Refine the strongest direction",
      "Test — Validate with real users",
      "Deliver — High-fidelity designs ready for development",
    ],
    engagement: {
      duration: "4-8 weeks",
      team: "1-2 designers",
      delivery: "Figma files, design system, prototypes",
      investment: "$25K - $75K",
    },
    perfectFor: [
      "Products that need a design refresh",
      "Startups launching their first product",
      "Companies with engineering but no design team",
      "Teams who know their current design isn't good enough",
    ],
  },
  {
    id: "product-management",
    title: "Product Management",
    subtitle: "Strategic direction meets tactical execution",
    description:
      "Great products don't just happen—they're the result of ruthless prioritization, clear strategy, and relentless focus on what matters.",
    features: [
      {
        category: "Product Strategy",
        items: [
          "Vision & roadmap development — Where are we going and why?",
          "Market & competitive analysis — Understanding the landscape",
          "Product positioning — What makes you different?",
          "Go-to-market strategy — How does this reach users?",
          "Pricing & packaging — What should you charge and why?",
        ],
      },
      {
        category: "Tactical Product Management",
        items: [
          "Feature prioritization — What ships now vs. later?",
          "User story writing — Clear requirements for development",
          "Sprint planning — Breaking big ideas into achievable sprints",
          "Stakeholder management — Keeping everyone aligned",
          "Metrics & analytics — Measuring what matters",
          "User feedback synthesis — Turning insights into action",
        ],
      },
      {
        category: "Fractional PM Services",
        items: [
          "Weekly strategy sessions",
          "Sprint planning & backlog grooming",
          "Feature specs & requirements",
          "Stakeholder communication",
          "Roadmap management",
        ],
      },
    ],
    engagement: {
      duration: "3-6 months (or ongoing retainer)",
      team: "10-20 hours/week commitment",
      delivery: "Roadmap, specs, prioritized backlog",
      investment: "$8K - $15K/month",
    },
    perfectFor: [
      "Technical founders who need product expertise",
      "Growing startups between first product and first PM hire",
      "Companies with stalled product development",
      "Teams shipping features but not moving metrics",
    ],
  },
  {
    id: "strategic-planning",
    title: "Strategic Planning",
    subtitle: "Future-proof your business with intentional strategy",
    description:
      "Most companies react to the market. Great ones shape it. We help you think strategically about where your business is headed and build the capabilities to get there.",
    features: [
      {
        category: "Product Planning & Innovation",
        items: [
          "Product roadmap development — Multi-year vision for your product line",
          "Market opportunity analysis — Where should you focus next?",
          "New product strategy — Validate ideas before investing",
          "Innovation workshops — Generate breakthrough concepts with your team",
          "Product-market fit assessment — Are you solving real problems?",
        ],
      },
      {
        category: "Not-For-Profit & Impact Strategy",
        items: [
          "Mission-driven product development — Technology that creates lasting impact",
          "Social enterprise strategy — Sustainable models for social good",
          "Community-centered design — Products that serve underserved populations",
          "Build products beneficial to citizens, consumers, and users everywhere",
          "Digital remote-first approach to greenfield research in technology, organization, and process",
        ],
      },
    ],
    engagement: {
      duration: "4-8 weeks",
      team: "Strategist, product manager, workshop facilitator",
      delivery: "Strategic recommendations, roadmap, action plan",
      investment: "$15K - $50K",
    },
    perfectFor: [
      "Founders deciding what to build next",
      "Companies expanding into new markets",
      "Organizations with a mission to solve social problems",
      "Teams wanting to innovate beyond their current product",
    ],
  },
  {
    id: "brand-marketing",
    title: "Brand & Marketing Strategy",
    subtitle: "Help brands deliver their stories online",
    description:
      "Your brand isn't your logo. It's what people think and feel when they encounter your company. We help you figure out who you are, what you stand for, and how to communicate that consistently everywhere.",
    features: [
      {
        category: "Brand Strategy",
        items: [
          "Brand positioning — What makes you uniquely valuable?",
          "Voice & tone development — How should you sound?",
          "Visual identity — Colors, typography, imagery that reflects who you are",
          "Messaging framework — What you say to different audiences",
          "Brand guidelines — Consistency across all touchpoints",
        ],
      },
      {
        category: "Digital Marketing",
        items: [
          "Content strategy — What to create and why",
          "SEO optimization — Getting found by the right people",
          "Email marketing — Nurturing leads and customers",
          "Social media strategy — Where to show up and what to say",
          "Analytics & tracking — Understanding what's working",
        ],
      },
      {
        category: "Website Development & Optimization",
        items: [
          "Marketing websites — Sites that tell your story and convert visitors",
          "Landing pages — Focused pages for campaigns and acquisition",
          "Conversion optimization — Improving what you already have",
          "Copy & content — Words that actually persuade",
          "Site photography — Custom photography that elevates your brand",
        ],
      },
    ],
    engagement: {
      duration: "6-12 weeks for brand work",
      team: "Strategist, designer, copywriter",
      delivery: "Brand guidelines, website, content",
      investment: "$35K - $100K",
    },
    perfectFor: [
      "Companies with inconsistent branding",
      "Startups ready to look professional",
      "Businesses entering new markets",
      "Teams who know their website isn't converting",
    ],
  },
  {
    id: "technical-consulting",
    title: "Technical Consulting & Advisory",
    subtitle: "Expert guidance when you need it most",
    description:
      "Sometimes you don't need a full team—you need expert advice to make the right decisions. We've built dozens of products and made every mistake there is to make. Learn from our scars, not your own.",
    features: [
      {
        category: "Technical Architecture Review",
        items: [
          "System design evaluation — Is this architecture sound?",
          "Tech stack recommendations — The right tools for your stage",
          "Scalability planning — Will this grow with you?",
          "Security audit — Are you protecting user data properly?",
          "Performance optimization — Why is this slow and how do we fix it?",
        ],
      },
      {
        category: "Code Review & Quality Assessment",
        items: [
          "Codebase audit — Honest assessment of what you've built",
          "Technical debt identification — What needs fixing and when?",
          "Testing strategy — How to prevent bugs from reaching users",
          "DevOps review — Is your deployment pipeline bulletproof?",
        ],
      },
      {
        category: "Hiring & Team Building",
        items: [
          "Technical interviewing — Help you hire the right engineers",
          "Job description writing — Attract top talent",
          "Team structure recommendations — Who to hire when",
          "Onboarding process design — Get new hires productive fast",
        ],
      },
      {
        category: "Build vs. Buy Analysis",
        items: [
          "Should you build this or buy existing tools?",
          "Total cost of ownership projections",
          "Risk assessment",
          "Recommendation with rationale",
        ],
      },
    ],
    engagement: {
      duration: "1-4 weeks",
      team: "Async review + sync sessions",
      delivery: "Written reports, recommendations, action plans",
      investment: "$5K - $25K",
    },
    perfectFor: [
      "CTOs making big technical decisions",
      "Non-technical founders evaluating technical work",
      "Companies considering major refactors",
      "Teams before making expensive commitments",
    ],
  },
  {
    id: "modernization",
    title: "Modernization & Transformation",
    subtitle: "Replace outdated tooling with new web services",
    description:
      "That system you built 5 years ago? It's holding you back. Let's modernize it without disrupting your business.",
    features: [
      {
        category: "Legacy System Modernization",
        items: [
          "Assessment — What's worth keeping vs. replacing?",
          "Migration strategy — How to move without breaking things",
          "Incremental rollout — Ship improvements continuously",
          "Data migration — Move data safely and completely",
          "Team training — Get everyone up to speed on new systems",
        ],
      },
      {
        category: "Website Modernization",
        items: [
          "Redesign & rebuild — Modern tech stack, fresh design",
          "Performance optimization — Make your site blazing fast",
          "Mobile optimization — Work perfectly on all devices",
          "SEO improvement — Get found by more people",
          "Accessibility fixes — Make sure everyone can use your site",
        ],
      },
      {
        category: "Internal Tool Development",
        items: [
          "Custom dashboards and admin panels",
          "Workflow automation",
          "Data integration and synchronization",
          "Reporting and analytics tools",
        ],
      },
    ],
    engagement: {
      duration: "12-24 weeks",
      team: "Full cross-functional team",
      delivery: "Incremental, risk-managed rollout",
      investment: "$100K - $300K+",
    },
    perfectFor: [
      "Companies with legacy systems limiting growth",
      "Businesses losing customers to modern competitors",
      "Organizations with technical debt crisis",
      "Teams stuck maintaining instead of innovating",
    ],
  },
  {
    id: "growth-optimization",
    title: "Growth & Optimization",
    subtitle: "Increase traffic, engagement, and conversion",
    description:
      "You've built something great. Now let's get it in front of more people and convert them into customers.",
    features: [
      {
        category: "Top-of-Funnel Growth",
        items: [
          "SEO strategy & implementation — Improve Google rankings",
          "Content marketing — Create content that attracts your audience",
          "Paid acquisition strategy — Ads that actually work",
          "Partnership development — Strategic integrations and collabs",
          "Community building — Cultivate your early advocates",
        ],
      },
      {
        category: "Conversion Optimization",
        items: [
          "Funnel analysis — Where are people dropping off?",
          "A/B testing — Test hypotheses, measure results",
          "User research — Why aren't people converting?",
          "Copy & messaging optimization — Say the right thing to the right people",
          "Onboarding optimization — Get users to aha moments faster",
        ],
      },
      {
        category: "Analytics & Measurement",
        items: [
          "Analytics implementation — Track what matters",
          "Dashboard creation — Monitor metrics that drive decisions",
          "Experiment design — Test rigorously, learn quickly",
          "Reporting & insights — Turn data into action",
        ],
      },
    ],
    engagement: {
      duration: "3-6 months ongoing",
      team: "Monthly retainer format",
      delivery: "Tests, improvements, reports",
      investment: "$10K - $25K/month",
    },
    perfectFor: [
      "Products with users but not enough growth",
      "Companies with traffic but low conversion",
      "Teams drowning in data without insights",
      "Businesses ready to scale acquisition",
    ],
  },
  {
    id: "photography",
    title: "Photography & Visual Content",
    subtitle: "Elevate your brand with professional imagery",
    description:
      "Stock photos are boring. Your brand deserves better. We create custom photography and visual content that makes your brand unforgettable.",
    features: [
      {
        category: "Product Photography",
        items: [
          "Lifestyle shots that show your product in context",
          "Detail shots that highlight craftsmanship",
          "E-commerce photography that converts",
          "Video content for social and web",
        ],
      },
      {
        category: "Brand Photography",
        items: [
          "Team photos that show your culture",
          "Office and workspace photography",
          "Event coverage",
          "Behind-the-scenes content",
        ],
      },
      {
        category: "Specialized Services",
        items: [
          "Site photography for web and marketing",
          "Social media content creation",
          "Video production",
          "Photo editing and retouching",
        ],
      },
    ],
    engagement: {
      duration: "1-3 days shooting + editing",
      team: "Full commercial use rights",
      delivery: "High-res images, web-optimized versions",
      investment: "$5K - $20K per shoot",
    },
    perfectFor: [
      "E-commerce brands needing product shots",
      "Companies wanting to showcase their team",
      "Brands tired of stock photography",
      "Products launching that need visual assets",
    ],
  },
];

const ENGAGEMENT_MODELS = [
  {
    title: "Project-Based",
    description:
      "Fixed scope, fixed timeline, fixed budget. Best when you know exactly what you need.",
  },
  {
    title: "Retainer",
    description:
      "Ongoing partnership with monthly commitment. Best for continuous product development and support.",
  },
  {
    title: "Time & Materials",
    description: "Flexible scope, pay for what you use. Best for exploration and discovery phases.",
  },
  {
    title: "Fractional Team",
    description:
      "We become your product/design/engineering team. Best for early-stage startups pre-Series A.",
  },
];

const PROCESS_STEPS = [
  {
    step: "01",
    title: "Discovery",
    duration: "1-2 weeks",
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
    duration: "1-2 weeks",
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
];

const PRICING_RANGES = [
  { label: "Product design", range: "$25K - $100K" },
  { label: "Product development", range: "$80K - $300K+" },
  { label: "Product management", range: "$8K - $15K/month" },
  { label: "Consulting", range: "$5K - $25K per engagement" },
  { label: "Workshops", range: "$5K - $15K per session" },
];

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="container flex items-center justify-between py-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="grid h-10 w-10 grid-cols-3 grid-rows-3 gap-0.5">
              <div className="bg-foreground" />
              <div className="col-span-2 bg-foreground" />
              <div className="bg-transparent" />
              <div className="bg-foreground" />
              <div className="bg-foreground" />
              <div className="col-span-2 bg-foreground" />
              <div className="bg-foreground" />
            </div>
            <span className="text-lg font-bold tracking-tight uppercase">Ponti Studios</span>
          </Link>

          <div className="hidden items-center gap-8 text-sm font-medium md:flex">
            <Link href="/#services" className="transition-opacity hover:opacity-60">
              Services
            </Link>
            <Link href="/#work" className="transition-opacity hover:opacity-60">
              Work
            </Link>
            <Link href="/#principles" className="transition-opacity hover:opacity-60">
              Principles
            </Link>
            <Link
              href="/#contact"
              className="rounded-none border border-foreground px-4 py-2 uppercase tracking-wider hover:bg-foreground hover:text-background transition-colors"
            >
              Contact
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="border-b border-border pt-32 pb-20 md:pb-28">
        <div className="container">
          <span className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Services
          </span>
          <h1 className="mt-3 max-w-3xl text-4xl font-normal uppercase tracking-[-0.04em] md:text-5xl lg:text-6xl">
            Services that ship excellence
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-muted-foreground">
            We're a luxury technology practice for entrepreneurs and early-stage startups who refuse
            to compromise on quality. We don't just build features—we craft experiences that make
            people's lives better, products that scale gracefully, and brands that resonate deeply.
          </p>
          <p className="mt-4 max-w-xl text-sm leading-7 text-muted-foreground border-l-2 border-foreground pl-4">
            If you're looking for cheap and fast, we're not for you. If you're looking for
            exceptional work from people who care as much as you do, let's talk.
          </p>
        </div>
      </section>

      {/* Our Approach */}
      <section className="border-b border-border bg-muted">
        <div className="container py-20 md:py-28">
          <span className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Our Approach
          </span>
          <h2 className="mt-3 text-3xl font-normal uppercase tracking-[-0.04em]">
            How we think about work
          </h2>
          <div className="mt-12 grid gap-5 md:grid-cols-2">
            {APPROACH.map((item) => (
              <div key={item.title} className="border border-border bg-background p-7">
                <p className="text-base font-semibold uppercase tracking-[-0.02em]">{item.title}</p>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Jump links */}
      <div className="border-b border-border bg-background sticky top-18.25 z-40">
        <div className="container overflow-x-auto">
          <div className="flex text-xs uppercase tracking-[0.18em] whitespace-nowrap">
            {SERVICES.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="px-4 py-4 border-r border-border text-muted-foreground hover:text-foreground transition-colors first:pl-0"
              >
                {s.title}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Service sections */}
      {SERVICES.map((service, i) => (
        <section
          key={service.id}
          id={service.id}
          className={`border-b border-border ${i % 2 === 0 ? "bg-background" : "bg-muted"}`}
        >
          <div className="container py-20 md:py-28">
            {/* Header */}
            <div className="grid gap-8 lg:grid-cols-[1fr_2fr]">
              <div>
                <span className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  0{i + 1}
                </span>
                <h2 className="mt-3 text-3xl font-normal uppercase tracking-[-0.04em]">
                  {service.title}
                </h2>
                <p className="mt-2 text-sm italic text-muted-foreground">{service.subtitle}</p>
              </div>
              <p className="text-base leading-8 text-muted-foreground self-end">
                {service.description}
              </p>
            </div>

            {/* Feature cards */}
            <div
              className={`mt-12 grid gap-5 ${
                service.features.length > 1 ? "md:grid-cols-2 lg:grid-cols-3" : "md:grid-cols-2"
              }`}
            >
              {service.features.map((feature) => (
                <div key={feature.category} className="border border-border bg-background p-7">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground mb-5">
                    {feature.category}
                  </p>
                  <ul className="space-y-2">
                    {feature.items.map((item) => (
                      <li key={item} className="text-sm leading-6 text-foreground flex gap-2">
                        <span className="text-muted-foreground shrink-0 mt-0.5">—</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              {service.differentiators && (
                <div className="border border-border bg-background p-7">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground mb-5">
                    What Makes Us Different
                  </p>
                  <ul className="space-y-2">
                    {service.differentiators.map((item) => (
                      <li key={item} className="text-sm leading-6 text-foreground flex gap-2">
                        <span className="text-muted-foreground shrink-0 mt-0.5">—</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {service.process && (
                <div className="border border-border bg-background p-7">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground mb-5">
                    Our Process
                  </p>
                  <ol className="space-y-2">
                    {service.process.map((step, idx) => (
                      <li key={step} className="text-sm leading-6 text-foreground flex gap-2">
                        <span className="text-muted-foreground shrink-0 tabular-nums">
                          {idx + 1}.
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>

            {/* Engagement + Perfect For */}
            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <div className="border border-border bg-background p-7">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground mb-5">
                  Typical Engagement
                </p>
                <dl className="space-y-3">
                  <div className="flex gap-4">
                    <dt className="text-xs uppercase tracking-[0.14em] text-muted-foreground w-24 shrink-0 pt-0.5">
                      Duration
                    </dt>
                    <dd className="text-sm text-foreground">{service.engagement.duration}</dd>
                  </div>
                  <div className="flex gap-4">
                    <dt className="text-xs uppercase tracking-[0.14em] text-muted-foreground w-24 shrink-0 pt-0.5">
                      Team
                    </dt>
                    <dd className="text-sm text-foreground">{service.engagement.team}</dd>
                  </div>
                  <div className="flex gap-4">
                    <dt className="text-xs uppercase tracking-[0.14em] text-muted-foreground w-24 shrink-0 pt-0.5">
                      Delivery
                    </dt>
                    <dd className="text-sm text-foreground">{service.engagement.delivery}</dd>
                  </div>
                  <div className="flex gap-4 border-t border-border pt-3 mt-3">
                    <dt className="text-xs uppercase tracking-[0.14em] text-muted-foreground w-24 shrink-0 pt-0.5">
                      Investment
                    </dt>
                    <dd className="text-sm font-semibold text-foreground">
                      {service.engagement.investment}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="border border-border bg-background p-7">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground mb-5">
                  Perfect For
                </p>
                <ul className="space-y-2">
                  {service.perfectFor.map((item) => (
                    <li key={item} className="text-sm leading-6 text-foreground flex gap-2">
                      <span className="text-muted-foreground shrink-0 mt-0.5">—</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* How We Work */}
      <section className="border-b border-border bg-muted">
        <div className="container py-20 md:py-28">
          <span className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            How We Work
          </span>
          <h2 className="mt-3 text-3xl font-normal uppercase tracking-[-0.04em]">
            Engagement models
          </h2>

          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {ENGAGEMENT_MODELS.map((model) => (
              <div key={model.title} className="border border-border bg-background p-7">
                <p className="text-base font-semibold uppercase tracking-[-0.02em]">
                  {model.title}
                </p>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">{model.description}</p>
              </div>
            ))}
          </div>

          <h3 className="mt-20 text-2xl font-normal uppercase tracking-[-0.04em]">Our process</h3>
          <div className="mt-8 border border-border bg-background divide-y divide-border">
            {PROCESS_STEPS.map((step) => (
              <div
                key={step.step}
                className="grid md:grid-cols-[80px_200px_1fr] gap-4 md:gap-0 p-7 items-start"
              >
                <span className="text-2xl font-normal tabular-nums text-muted-foreground">
                  {step.step}
                </span>
                <div>
                  <p className="text-base font-semibold uppercase tracking-[-0.02em]">
                    {step.title}
                  </p>
                  <p className="text-xs text-muted-foreground uppercase tracking-[0.14em] mt-1">
                    {step.duration}
                  </p>
                </div>
                <p className="text-sm leading-7 text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Working Together */}
      <section className="border-b border-border bg-background">
        <div className="container py-20 md:py-28">
          <span className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Working Together
          </span>
          <h2 className="mt-3 text-3xl font-normal uppercase tracking-[-0.04em]">What to expect</h2>

          <div className="mt-12 grid gap-5 md:grid-cols-2">
            <div className="border border-border p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground mb-5">
                What We Need From You
              </p>
              <ul className="space-y-4">
                {[
                  {
                    title: "Clarity",
                    description: "Be honest about goals, constraints, and concerns",
                  },
                  {
                    title: "Availability",
                    description: "Responsive feedback keeps projects moving",
                  },
                  {
                    title: "Trust",
                    description: "We'll challenge your assumptions for good reason",
                  },
                  {
                    title: "Decisions",
                    description: "When we present options, choose and move forward",
                  },
                ].map((item) => (
                  <li key={item.title} className="flex gap-3">
                    <span className="text-xs font-semibold uppercase tracking-[0.14em] text-foreground w-24 shrink-0 pt-0.5">
                      {item.title}
                    </span>
                    <span className="text-sm leading-6 text-muted-foreground">
                      {item.description}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border border-border p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground mb-5">
                What You Get From Us
              </p>
              <ul className="space-y-4">
                {[
                  { title: "Excellence", description: "Work we're proud to put our name on" },
                  { title: "Transparency", description: "No surprises, ever" },
                  { title: "Partnership", description: "We're invested in your success" },
                  { title: "Results", description: "Tangible outcomes, not just activity" },
                ].map((item) => (
                  <li key={item.title} className="flex gap-3">
                    <span className="text-xs font-semibold uppercase tracking-[0.14em] text-foreground w-24 shrink-0 pt-0.5">
                      {item.title}
                    </span>
                    <span className="text-sm leading-6 text-muted-foreground">
                      {item.description}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Philosophy */}
      <section className="border-b border-border bg-muted">
        <div className="container py-20 md:py-28">
          <span className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Pricing
          </span>
          <h2 className="mt-3 text-3xl font-normal uppercase tracking-[-0.04em]">
            Pricing philosophy
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-8 text-muted-foreground">
            We're not cheap. We're expensive for a reason—we deliver work that lasts, teams that
            care, and products that win.
          </p>

          <div className="mt-12 grid gap-5 md:grid-cols-2">
            <div className="border border-border bg-background p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground mb-5">
                Why We Cost More
              </p>
              <ul className="space-y-2">
                {[
                  "We hire senior practitioners, not junior contractors",
                  "We build for the long-term, not just launch day",
                  "We include quality assurance and testing in everything",
                  "We document our work so you're not dependent on us",
                  "We stick around to make sure it works",
                ].map((item) => (
                  <li key={item} className="text-sm leading-6 text-foreground flex gap-2">
                    <span className="text-muted-foreground shrink-0 mt-0.5">—</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border border-border bg-background p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground mb-5">
                Why We're Worth It
              </p>
              <ul className="space-y-2">
                {[
                  "Lower total cost of ownership (less rework, fewer bugs)",
                  "Faster time to meaningful value (we know what we're doing)",
                  "Better outcomes (quality drives retention and growth)",
                  "Strategic partnership (we make you smarter about product)",
                  "Peace of mind (you can trust we'll deliver)",
                ].map((item) => (
                  <li key={item} className="text-sm leading-6 text-foreground flex gap-2">
                    <span className="text-muted-foreground shrink-0 mt-0.5">—</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-5 border border-border bg-background p-7">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground mb-6">
              Investment Ranges
            </p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {PRICING_RANGES.map((item) => (
                <div
                  key={item.label}
                  className="flex items-baseline justify-between border-b border-border pb-3"
                >
                  <span className="text-sm text-muted-foreground uppercase tracking-widest">
                    {item.label}
                  </span>
                  <span className="text-sm font-semibold tabular-nums">{item.range}</span>
                </div>
              ))}
            </div>
            <p className="mt-6 text-xs text-muted-foreground">
              Every project is different. These ranges give you a sense, but we'll provide detailed
              proposals based on your specific needs.
            </p>
          </div>
        </div>
      </section>

      {/* Who We Work With */}
      <section className="border-b border-border bg-background">
        <div className="container py-20 md:py-28">
          <span className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Fit
          </span>
          <h2 className="mt-3 text-3xl font-normal uppercase tracking-[-0.04em]">
            Who we work with
          </h2>

          <div className="mt-12 grid gap-5 md:grid-cols-2">
            <div className="border border-border p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground mb-5">
                We're Great For
              </p>
              <ul className="space-y-2">
                {[
                  "Early-stage startups (pre-seed through Series A)",
                  "Founders who care deeply about quality",
                  "Companies modernizing their technology",
                  "Organizations entering new markets",
                  "Teams who've been burned by cheap alternatives",
                ].map((item) => (
                  <li key={item} className="text-sm leading-6 text-foreground flex gap-2">
                    <span className="text-muted-foreground shrink-0 mt-0.5">—</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border border-border p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground mb-5">
                We're Probably Not Right For
              </p>
              <ul className="space-y-2">
                {[
                  "Companies optimizing for lowest cost",
                  "Organizations needing body-shop staffing",
                  "Projects requiring compromise on quality",
                  "Teams not ready to invest in excellence",
                ].map((item) => (
                  <li key={item} className="text-sm leading-6 text-foreground flex gap-2">
                    <span className="text-muted-foreground shrink-0 mt-0.5">—</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-b border-border bg-muted">
        <div className="container py-20 md:py-28">
          <div className="border border-border bg-background p-8 md:p-12">
            <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
              <div>
                <span className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  Let's Build
                </span>
                <h2 className="mt-3 max-w-3xl text-3xl font-normal uppercase tracking-[-0.04em]">
                  Let's build something exceptional
                </h2>
                <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">
                  Ready to create something you'll be proud of? Let's talk.
                </p>
                <div className="mt-6 space-y-2">
                  {[
                    "Schedule a call — No pressure conversation about your needs (30 mins)",
                    "Discovery session — If we're aligned, we'll dig deeper (1-2 weeks)",
                    "Proposal — Detailed scope, timeline, and investment",
                    "Partnership — If you love it, we start building together",
                  ].map((step, idx) => (
                    <div key={step} className="flex gap-3 text-sm text-muted-foreground">
                      <span className="text-foreground font-semibold tabular-nums shrink-0">
                        {idx + 1}.
                      </span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-4 sm:flex-row lg:justify-end">
                <Link
                  href="mailto:hello@ponti.io"
                  className="rounded-none bg-foreground px-6 py-3 text-center text-sm font-semibold uppercase tracking-wider text-background hover:opacity-90"
                >
                  hello@ponti.io
                </Link>
                <Link
                  href="https://cal.com/ponti-studios"
                  className="rounded-none border border-foreground px-6 py-3 text-center text-sm font-semibold uppercase tracking-wider hover:bg-foreground hover:text-background transition-colors"
                >
                  Book a call
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-background py-12">
        <div className="container">
          <p className="text-sm uppercase tracking-widest text-muted-foreground">
            © {new Date().getFullYear()} Ponti Studios. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
