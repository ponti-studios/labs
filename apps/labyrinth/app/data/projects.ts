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

export const projectMetadata: ProjectMetadata[] = [
  {
    slug: "kernel",
    category: "library",
    tech: ["TypeScript", "Node.js"],
    status: "published",
    github: "https://github.com/ponti-studios/kernel",
    url: "https://github.com/ponti-studios/kernel",
    logo: `/experiments/logo.kernel.500x500.webp`,
  },
  {
    slug: "omiro",
    category: "product",
    tech: ["TypeScript", "React Native", "Expo", "iOS"],
    status: "active",
    github: "https://github.com/ponti-studios/hominem",
    logo: `/experiments/logo.omiro.500x500.webp`,
  },
  {
    slug: "career",
    category: "product",
    tech: ["TypeScript", "React", "Hono", "PostgreSQL"],
    status: "published",
    github: "https://github.com/ponti-studios/hominem",
    url: "https://career.ponti.io",
    screenshots: ["/screenshots/career-craftd-demo-portfolio.png"],
    logo: `/experiments/logo.career.500x500.webp`,
  },
  {
    slug: "finance",
    category: "product",
    tech: ["TypeScript", "React", "Hono", "PostgreSQL"],
    status: "development",
    github: "https://github.com/ponti-studios/hominem",
    logo: `/experiments/logo.finance.500x500.webp`,
  },
  {
    slug: "hominem-api",
    category: "infrastructure",
    tech: ["TypeScript", "Hono", "MCP", "PostgreSQL", "Drizzle"],
    status: "published",
    github: "https://github.com/ponti-studios/hominem",
    logo: `/experiments/logo.hominem-api.500x500.webp`,
  },
  {
    slug: "commune",
    category: "product",
    tech: ["TypeScript", "React", "PostgreSQL", "AI"],
    status: "development",
    github: "https://github.com/ponti-studios/labs",
    logo: `/experiments/logo.commune.500x500.webp`,
  },
  {
    slug: "health",
    category: "product",
    tech: ["TypeScript", "React", "React Router", "SQLite"],
    status: "development",
    github: "https://github.com/ponti-studios/labs",
    logo: `/experiments/logo.health.500x500.webp`,
  },
  {
    slug: "earth",
    category: "product",
    tech: ["TypeScript", "React", "MapLibre", "PostgreSQL"],
    status: "development",
    github: "https://github.com/ponti-studios/labs",
    logo: `/experiments/logo.earth.500x500.webp`,
  },
  {
    slug: "foundation",
    category: "infrastructure",
    tech: ["Docker", "PostgreSQL", "GitHub Actions"],
    status: "published",
    github: "https://github.com/ponti-studios/foundation",
    logo: `/experiments/logo.foundation.500x500.webp`,
  },
  {
    slug: "hollywood",
    category: "infrastructure",
    tech: ["TypeScript", "Python", "Hono", "SQLite"],
    status: "development",
    github: "https://github.com/ponti-studios/hollywood",
    logo: `/experiments/logo.hollywood.500x500.webp`,
  },
  {
    slug: "realitea",
    category: "product",
    tech: ["TypeScript", "React", "React Router", "PostgreSQL", "Drizzle"],
    status: "published",
    github: "https://github.com/ponti-studios/labs",
    url: "/games/realitea",
    screenshots: ["/screenshots/realitea-gameplay.png", "/screenshots/realitea-solved.png"],
    logo: `/experiments/logo.realitea.500x500.webp`,
  },
  {
    slug: "geo",
    category: "tool",
    tech: ["Swift", "Apple Maps", "macOS"],
    status: "development",
    github: "https://github.com/ponti-studios/geo",
  },
  {
    slug: "toolbox",
    category: "tool",
    tech: ["Rust", "Go", "Swift", "Python", "TypeScript", "Bash"],
    status: "development",
    github: "https://github.com/ponti-studios/toolbox",
  },
];

export const projects: Project[] = projectMetadata.map((metadata) => ({
  ...metadata,
  ...t.projects.entries[metadata.slug],
}));
