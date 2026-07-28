import { t } from "~/translations";

export type ProjectTech = {
  name: string;
  icon?: string;
};

export type ProjectCategory = "infrastructure" | "product" | "tool" | "library" | "research";
export type ProjectStatus = "published" | "active" | "development" | "archived";
export type ProjectSlug = keyof typeof t.projects.entries;

export type ProjectMetadata = {
  slug: ProjectSlug;
  category: ProjectCategory;
  tech: string[];
  status: ProjectStatus;
  github: string;
  url?: string;
  logo?: string;
  screenshots?: string[];
};

export type Project = ProjectMetadata & (typeof t.projects.entries)[ProjectSlug];

export type ProjectSection = {
  category: ProjectCategory;
  label: string;
  projects: Project[];
};

const kernel: Project = {
  ...t.projects.entries.kernel,
  slug: "kernel",
  category: "library",
  tech: ["TypeScript", "Node.js"],
  status: "published",
  github: "https://github.com/ponti-studios/kernel",
  url: "https://github.com/ponti-studios/kernel",
  logo: "/experiments/logo.kernel.500x500.webp",
};

const omiro: Project = {
  ...t.projects.entries.omiro,
  slug: "omiro",
  category: "product",
  tech: ["TypeScript", "React Native", "Expo", "iOS"],
  status: "active",
  github: "https://github.com/ponti-studios/hominem",
  logo: "/experiments/logo.omiro.500x500.webp",
};

const career: Project = {
  ...t.projects.entries.career,
  slug: "career",
  category: "product",
  tech: ["TypeScript", "React", "Hono", "PostgreSQL"],
  status: "published",
  github: "https://github.com/ponti-studios/hominem",
  url: "https://career.ponti.io",
  screenshots: ["/screenshots/career-craftd-demo-portfolio.png"],
  logo: "/experiments/logo.career.500x500.webp",
};

const finance: Project = {
  ...t.projects.entries.finance,
  slug: "finance",
  category: "product",
  tech: ["TypeScript", "React", "Hono", "PostgreSQL"],
  status: "development",
  github: "https://github.com/ponti-studios/hominem",
  logo: "/experiments/logo.finance.500x500.webp",
};

const hominemApi: Project = {
  ...t.projects.entries["hominem-api"],
  slug: "hominem-api",
  category: "infrastructure",
  tech: ["TypeScript", "Hono", "MCP", "PostgreSQL", "Drizzle"],
  status: "published",
  github: "https://github.com/ponti-studios/hominem",
  logo: "/experiments/logo.hominem-api.500x500.webp",
};

const commune: Project = {
  ...t.projects.entries.commune,
  slug: "commune",
  category: "product",
  tech: ["TypeScript", "React", "PostgreSQL", "AI"],
  status: "development",
  github: "https://github.com/ponti-studios/labs",
  logo: "/experiments/logo.commune.500x500.webp",
};

const health: Project = {
  ...t.projects.entries.health,
  slug: "health",
  category: "product",
  tech: ["TypeScript", "React", "React Router", "SQLite"],
  status: "development",
  github: "https://github.com/ponti-studios/labs",
  logo: "/experiments/logo.health.500x500.webp",
};

const earth: Project = {
  ...t.projects.entries.earth,
  slug: "earth",
  category: "product",
  tech: ["TypeScript", "React", "MapLibre", "PostgreSQL"],
  status: "development",
  github: "https://github.com/ponti-studios/labs",
  logo: "/experiments/logo.earth.500x500.webp",
};

const foundation: Project = {
  ...t.projects.entries.foundation,
  slug: "foundation",
  category: "infrastructure",
  tech: ["Docker", "PostgreSQL", "GitHub Actions"],
  status: "published",
  github: "https://github.com/ponti-studios/foundation",
  logo: "/experiments/logo.foundation.500x500.webp",
};

const hollywood: Project = {
  ...t.projects.entries.hollywood,
  slug: "hollywood",
  category: "infrastructure",
  tech: ["TypeScript", "Python", "Hono", "SQLite"],
  status: "development",
  github: "https://github.com/ponti-studios/hollywood",
  logo: "/experiments/logo.hollywood.500x500.webp",
};

const realitea: Project = {
  ...t.projects.entries.realitea,
  slug: "realitea",
  category: "product",
  tech: ["TypeScript", "React", "React Router", "PostgreSQL", "Drizzle"],
  status: "published",
  github: "https://github.com/ponti-studios/labs",
  url: "/games/realitea",
  screenshots: ["/screenshots/realitea-gameplay.png", "/screenshots/realitea-solved.png"],
  logo: "/experiments/logo.realitea.500x500.webp",
};

const geo: Project = {
  ...t.projects.entries.geo,
  slug: "geo",
  category: "tool",
  tech: ["Swift", "Apple Maps", "macOS"],
  status: "development",
  github: "https://github.com/ponti-studios/geo",
};

const toolbox: Project = {
  ...t.projects.entries.toolbox,
  slug: "toolbox",
  category: "tool",
  tech: ["Rust", "Go", "Swift", "Python", "TypeScript", "Bash"],
  status: "development",
  github: "https://github.com/ponti-studios/toolbox",
};

// Detail navigation order is explicit and independent from the category presentation order.
export const projects: Project[] = [
  kernel,
  omiro,
  career,
  finance,
  hominemApi,
  commune,
  health,
  earth,
  foundation,
  hollywood,
  realitea,
  geo,
  toolbox,
];

// The listing is authored in its display order so the route does not group or sort at render time.
export const projectSections: ProjectSection[] = [
  {
    category: "product",
    label: t.projects.categoryLabels.product,
    projects: [omiro, career, realitea, finance, commune, health, earth],
  },
  {
    category: "infrastructure",
    label: t.projects.categoryLabels.infrastructure,
    projects: [hominemApi, foundation, hollywood],
  },
  {
    category: "library",
    label: t.projects.categoryLabels.library,
    projects: [kernel],
  },
  {
    category: "tool",
    label: t.projects.categoryLabels.tool,
    projects: [geo, toolbox],
  },
];
