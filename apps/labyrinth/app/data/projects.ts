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
  },
  {
    slug: "foundation",
    category: "infrastructure",
    tech: ["Docker", "PostgreSQL", "GitHub Actions"],
    status: "published",
    github: "https://github.com/ponti-studios/foundation",
  },
  {
    slug: "omiro",
    category: "product",
    tech: ["TypeScript", "React Native", "Expo", "iOS"],
    status: "active",
    github: "https://github.com/ponti-studios/hominem",
  },
  {
    slug: "career",
    category: "product",
    tech: ["TypeScript", "React", "Hono", "PostgreSQL"],
    status: "published",
    github: "https://github.com/ponti-studios/hominem",
    url: "https://career.ponti.io",
    screenshots: [
      "/screenshots/career-dashboard.png",
      "/screenshots/career-pipeline.png",
    ],
  },
  {
    slug: "finance",
    category: "product",
    tech: ["TypeScript", "React", "Hono", "PostgreSQL"],
    status: "development",
    github: "https://github.com/ponti-studios/hominem",
  },
  {
    slug: "hominem-api",
    category: "infrastructure",
    tech: ["TypeScript", "Hono", "MCP", "PostgreSQL", "Drizzle"],
    status: "published",
    github: "https://github.com/ponti-studios/hominem",
  },
  {
    slug: "hollywood",
    category: "product",
    tech: ["TypeScript", "Python", "Hono", "SQLite"],
    status: "development",
    github: "https://github.com/ponti-studios/hollywood",
  },
  {
    slug: "commune",
    category: "product",
    tech: ["TypeScript", "React", "PostgreSQL", "AI"],
    status: "development",
    github: "https://github.com/ponti-studios/labs",
  },
  {
    slug: "earth",
    category: "product",
    tech: ["TypeScript", "React", "MapLibre", "PostgreSQL"],
    status: "development",
    github: "https://github.com/ponti-studios/labs",
  },
  {
    slug: "realitea",
    category: "product",
    tech: ["TypeScript", "React", "React Router", "PostgreSQL", "Drizzle"],
    status: "published",
    github: "https://github.com/ponti-studios/labs",
    url: "/games/realitea",
    screenshots: [
      "/screenshots/realitea-gameplay.png",
      "/screenshots/realitea-solved.png",
    ],
  },
  {
    slug: "health",
    category: "product",
    tech: ["TypeScript", "React", "React Router", "SQLite"],
    status: "development",
    github: "https://github.com/ponti-studios/labs",
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
    tech: ["Rust", "Go", "Swift", "Python"],
    status: "development",
    github: "https://github.com/ponti-studios/toolbox",
  },
  {
    slug: "ponti-mobile-starter",
    category: "library",
    tech: ["TypeScript", "React Native", "Expo"],
    status: "development",
    github: "https://github.com/ponti-studios/ponti-mobile-starter",
  },
  {
    slug: "ai-lab",
    category: "research",
    tech: ["Python", "Claude API"],
    status: "development",
    github: "https://github.com/ponti-studios/ai-lab",
  },
];

export const projects: Project[] = projectMetadata.map((metadata) => ({
  ...metadata,
  ...t.projects.entries[metadata.slug],
}));
