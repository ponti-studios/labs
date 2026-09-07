import { cn } from "@ponti-studios/ui/utilities";
import { Link } from "react-router";
import styles from "~/components/list-row.module.css";
import { ListRowMedia } from "~/components/ListRowMedia";
import { RevealGroup, RevealItem } from "~/components/Reveal";
import { projectSections } from "~/data/projects";
import { t } from "~/translations";

export function meta(): Array<{
  title?: string;
  name?: string;
  content?: string;
}> {
  return [
    { title: "Lab — Ponti Studios" },
    {
      name: "description",
      content: t.projects.page.metaDescription,
    },
  ];
}

export default function Projects() {
  return (
    <div className="page-shell">
      <section className="layout-stack">
        <h1 className="heading-hero text-foreground max-w-4xl">The Lab</h1>
      </section>

      {/* Projects by Category */}
      {projectSections.map((section) => {
        return (
          <section key={section.category} className="layout-stack">
            <h2 className="heading-display-sm text-accent border-border border-b pb-3">
              {section.label}
            </h2>
            <RevealGroup className="border-border divide-border-border divide-y border-b">
              {section.projects.map((project) => (
                <RevealItem key={project.slug} className="list-row group">
                  <Link
                    to={`/projects/${project.slug}`}
                    prefetch="intent"
                    className="press hover:bg-muted/20 flex min-w-0 flex-1 flex-row items-start gap-4 transition-colors outline-none md:gap-6"
                  >
                    {project.logo ? (
                      <ListRowMedia
                        fallback={project.name.slice(0, 2).toUpperCase()}
                        src={project.logo}
                        variant="square"
                      />
                    ) : null}
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <h3
                        className={cn({
                          [styles.title]: true,
                          "text-foreground": true,
                          "group-hover:text-accent": true,
                        })}
                      >
                        {project.name}
                      </h3>
                      <p className="text-muted-foreground max-w-2xl text-sm">
                        {project.shortDescription}
                      </p>
                    </div>
                  </Link>
                </RevealItem>
              ))}
            </RevealGroup>
          </section>
        );
      })}

      {/* Playground */}
      <section className="layout-stack">
        <h2 className="heading-display-sm text-accent border-border border-b pb-3">Playground</h2>
        <RevealGroup className="border-border divide-border-border divide-y border-b">
          {playgroundItems.map((item) => (
            <RevealItem key={item.slug} className="list-row group">
              <Link
                to={item.href}
                prefetch="intent"
                className="press hover:bg-muted/20 flex min-w-0 flex-1 flex-row items-start gap-4 transition-colors outline-none md:gap-6"
              >
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <h3
                    className={cn({
                      [styles.title]: true,
                      "text-foreground": true,
                      "group-hover:text-accent": true,
                    })}
                  >
                    {item.name}
                  </h3>
                  <p className="text-muted-foreground max-w-2xl text-sm">{item.shortDescription}</p>
                </div>
              </Link>
            </RevealItem>
          ))}
        </RevealGroup>
      </section>
    </div>
  );
}

export type PlaygroundItem = {
  slug: string;
  name: string;
  shortDescription: string;
  href: string;
};

// Unpolished, in-progress explorations — kept separate from `projects.ts` (the
// portfolio catalog) since these don't carry the full project metadata (tech,
// status, github, etc.) and aren't meant to be presented as finished work.
export const playgroundItems: PlaygroundItem[] = [
  {
    slug: "calendar",
    name: "Calendar",
    shortDescription: "A single continuous stream for the day's events, instead of a grid.",
    href: "/experiments/calendar",
  },
  {
    slug: "theatre-management",
    name: "Theater P&L",
    shortDescription: "Screen allocation and profit-and-loss modeling for a theater chain.",
    href: "/experiments/theatre-management",
  },
  {
    slug: "glass",
    name: "Physics of Glass",
    shortDescription:
      "How SVG filters recreate the refraction, dispersion, and light behavior of real glass.",
    href: "/experiments/glass",
  },
  {
    slug: "layouts",
    name: "Layouts",
    shortDescription:
      "Reusable motion layouts — an ambient vertical marquee and an infinite horizontal carousel.",
    href: "/toys/layouts/vertical",
  },
  {
    slug: "threegl-ai-explainer",
    name: "Particle Field",
    shortDescription: "A tunable three.js particle simulation with live controls.",
    href: "/experiments/threegl-ai-explainer",
  },
  {
    slug: "llm-interface",
    name: "Context Chemistry",
    shortDescription: "An interactive look at how an LLM's context window is assembled from turns.",
    href: "/experiments/llm-interface",
  },
];
