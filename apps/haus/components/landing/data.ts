import type { Service } from "./types";

export const SERVICES: Service[] = [
  {
    id: "engineering",
    title: "Engineering",
    subtitle: "From zero to launch and beyond",
    description:
      "We build software people actually want to use. Polished, thoughtful, and production-ready from day one.",
    features: [
      {
        category: "Full-Stack Development",
        items: [
          "Modern progressive web applications",
          "Mobile apps",
          "API development",
          "Database design",
          "Cloud infrastructure",
        ],
      },
    ],
    differentiators: [
      "Scalable codebases",
      "Rigorously and thoroughly tested",
      "Performance optimization built in, not bolted on",
      "Security best practices",
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
    id: "design",
    title: "Design",
    subtitle: "Interface and experience design that delights",
    description:
      "Good design isn't decoration. It makes complex things feel simple and mundane tasks feel effortless.",
    features: [
      {
        category: "UX/UI Design",
        items: [
          "User research - Understanding who we're designing for",
          "Information architecture - Structuring complexity into clarity",
          "Wireframing & prototyping - Testing ideas before building them",
          "Visual design - Interfaces that feel premium",
          "Interaction design - Making software feel alive",
          "Design systems - Consistent, scalable component libraries",
          "Usability testing - Validating designs with real users",
        ],
      },
      {
        category: "Specialized Design Services",
        items: [
          "Mobile app design - iOS and Android",
          "Web application design - SaaS, dashboards, admin panels",
          "Marketing websites - Landing pages that convert",
          "Brand identity - Logos, color systems, typography",
          "Illustration & iconography - Custom assets that elevate your brand",
        ],
      },
    ],
    process: [
      "Research - Understand users and context",
      "Explore - Generate multiple concepts",
      "Design - Refine the strongest direction",
      "Test - Validate with real users",
      "Deliver - High-fidelity designs ready for development",
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
      "Great products are built on ruthless prioritization. We keep teams focused on what moves the needle.",
    features: [
      {
        category: "Product Strategy",
        items: [
          "Vision & roadmap development - Where are we going and why?",
          "Market & competitive analysis - Understanding the landscape",
          "Product positioning - What makes you different?",
          "Go-to-market strategy - How does this reach users?",
          "Pricing & packaging - What should you charge and why?",
        ],
      },
      {
        category: "Tactical Product Management",
        items: [
          "Feature prioritization - What ships now vs. later?",
          "User story writing - Clear requirements for development",
          "Sprint planning - Breaking big ideas into achievable sprints",
          "Stakeholder management - Keeping everyone aligned",
          "Metrics & analytics - Measuring what matters",
          "User feedback synthesis - Turning insights into action",
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
    id: "planning",
    title: "Planning",
    subtitle: "Future-proof your business with intentional strategy",
    description:
      "Great companies shape markets. We know where industries are headed so you can outpace the competition.",
    features: [
      {
        category: "Product Planning & Innovation",
        items: [
          "Product roadmap development - Multi-year vision for your product line",
          "Market opportunity analysis - Where should you focus next?",
          "New product strategy - Validate ideas before investing",
          "Innovation workshops - Generate breakthrough concepts with your team",
          "Product-market fit assessment - Are you solving real problems?",
        ],
      },
      {
        category: "Not-For-Profit & Impact Strategy",
        items: [
          "Mission-driven product development - Technology that creates lasting impact",
          "Social enterprise strategy - Sustainable models for social good",
          "Community-centered design - Products that serve underserved populations",
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
    title: "Brand & Marketing",
    subtitle: "Help brands deliver their stories online",
    description:
      "Your brand is what people feel when they encounter you. We help you define it, articulate it, and deliver it consistently.",
    features: [
      {
        category: "Brand",
        items: [
          "Brand positioning - What makes you uniquely valuable?",
          "Voice & tone development - How should you sound?",
          "Visual identity - Colors, typography, imagery that reflects who you are",
          "Messaging framework - What you say to different audiences",
          "Brand guidelines - Consistency across all touchpoints",
          "Copy & content - Words that actually persuade",
          "Site photography - Custom photography that elevates your brand",
        ],
      },
      {
        category: "Marketing",
        items: [
          "Content strategy - What to create and why",
          "SEO optimization - Getting found by the right people",
          "Email marketing - Nurturing leads and customers",
          "Social media strategy - Where to show up and what to say",
          "Analytics & tracking - Understanding what's working",
          "Marketing websites - Sites that tell your story and convert visitors",
          "Landing pages - Focused pages for campaigns and acquisition",
          "Conversion optimization - Improving what you already have",
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
      "Sometimes you need a second opinion more than a full team. We've made every mistake in the book — learn from our scars, not your own.",
    features: [
      {
        category: "Technical Architecture Review",
        items: [
          "System design evaluation - Is this architecture sound?",
          "Tech stack recommendations - The right tools for your stage",
          "Scalability planning - Will this grow with you?",
          "Security audit - Are you protecting user data properly?",
          "Performance optimization - Why is this slow and how do we fix it?",
        ],
      },
      {
        category: "Code Review & Quality Assessment",
        items: [
          "Codebase audit - Honest assessment of what you've built",
          "Technical debt identification - What needs fixing and when?",
          "Testing strategy - How to prevent bugs from reaching users",
          "DevOps review - Is your deployment pipeline bulletproof?",
        ],
      },
      {
        category: "Hiring & Team Building",
        items: [
          "Technical interviewing - Help you hire the right engineers",
          "Job description writing - Attract top talent",
          "Team structure recommendations - Who to hire when",
          "Onboarding process design - Get new hires productive fast",
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
      "Old systems don't just slow you down — they hold your whole business back. We replace them without disrupting what's working.",
    features: [
      {
        category: "Legacy System Modernization",
        items: [
          "Assessment - What's worth keeping vs. replacing?",
          "Migration strategy - How to move without breaking things",
          "Incremental rollout - Ship improvements continuously",
          "Data migration - Move data safely and completely",
          "Team training - Get everyone up to speed on new systems",
        ],
      },
      {
        category: "Website Modernization",
        items: [
          "Redesign & rebuild - Modern tech stack, fresh design",
          "Performance optimization - Make your site blazing fast",
          "Mobile optimization - Work perfectly on all devices",
          "SEO improvement - Get found by more people",
          "Accessibility fixes - Make sure everyone can use your site",
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
      "Building something great is only half the job. We get it in front of the right people and turn them into customers.",
    features: [
      {
        category: "Top-of-Funnel Growth",
        items: [
          "SEO strategy & implementation - Improve Google rankings",
          "Content marketing - Create content that attracts your audience",
          "Paid acquisition strategy - Ads that actually work",
          "Partnership development - Strategic integrations and collabs",
          "Community building - Cultivate your early advocates",
        ],
      },
      {
        category: "Conversion Optimization",
        items: [
          "Funnel analysis - Where are people dropping off?",
          "A/B testing - Test hypotheses, measure results",
          "User research - Why aren't people converting?",
          "Copy & messaging optimization - Say the right thing to the right people",
          "Onboarding optimization - Get users to aha moments faster",
        ],
      },
      {
        category: "Analytics & Measurement",
        items: [
          "Analytics implementation - Track what matters",
          "Dashboard creation - Monitor metrics that drive decisions",
          "Experiment design - Test rigorously, learn quickly",
          "Reporting & insights - Turn data into action",
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
      "Stock photos look like stock photos. We create custom imagery that makes your brand instantly recognizable.",
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

export const APPROACH = [
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

export const ENGAGEMENT_MODELS = [
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

export const PROCESS_STEPS = [
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

export const PRICING_RANGES = [
  { label: "Product design", range: "$25K - $100K" },
  { label: "Product development", range: "$80K - $300K+" },
  { label: "Product management", range: "$8K - $15K/month" },
  { label: "Consulting", range: "$5K - $25K per engagement" },
  { label: "Workshops", range: "$5K - $15K per session" },
];

export const CTA_STEPS = [
  "Schedule a call - No pressure conversation about your needs (30 mins)",
  "Discovery session - If we're aligned, we'll dig deeper (1-2 weeks)",
  "Proposal - Detailed scope, timeline, and investment",
  "Partnership - If you love it, we start building together",
];

export const TOGETHER_NEEDS = [
  { title: "Clarity", description: "Be honest about goals, constraints, and concerns" },
  { title: "Availability", description: "Responsive feedback keeps projects moving" },
  { title: "Trust", description: "We'll challenge your assumptions for good reason" },
  { title: "Decisions", description: "When we present options, choose and move forward" },
];

export const TOGETHER_GAINS = [
  { title: "Excellence", description: "Work we're proud to put our name on" },
  { title: "Transparency", description: "No surprises, ever" },
  { title: "Partnership", description: "We're invested in your success" },
  { title: "Results", description: "Tangible outcomes, not just activity" },
];

export const FIT_GOOD_FOR = [
  "Early-stage startups (pre-seed through Series A)",
  "Founders who care deeply about quality",
  "Companies modernizing their technology",
  "Organizations entering new markets",
  "Teams who've been burned by cheap alternatives",
];

export const FIT_NOT_RIGHT = [
  "Companies optimizing for lowest cost",
  "Organizations needing body-shop staffing",
  "Projects requiring compromise on quality",
  "Teams not ready to invest in excellence",
];
