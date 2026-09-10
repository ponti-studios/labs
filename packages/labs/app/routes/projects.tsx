import { Link } from "react-router";
import { RevealGroup, RevealItem } from "~/components/Reveal";
import { SpecimenCard } from "~/components/projects/specimen-card";
import { projectSections } from "~/data/projects";
import { toSpecimenCard } from "~/lib/specimen-cards";
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
        <p className="text-muted-foreground max-w-2xl text-lg leading-relaxed">
          {t.projects.page.metaDescription}
        </p>
      </section>

      {/* Projects by Category */}
      {projectSections.map((section) => {
        return (
          <section key={section.category} className="layout-stack">
            <h2 className="border-border text-muted-foreground border-b pb-3 text-xs font-medium tracking-wide uppercase">
              {section.label}
            </h2>
            <RevealGroup className="grid grid-cols-1 place-items-center gap-6 py-8 sm:grid-cols-2 lg:grid-cols-3">
              {section.projects.map((project) => (
                <RevealItem key={project.slug}>
                  <SpecimenCard
                    {...toSpecimenCard(project)}
                    data-testid={`lab-project-${project.slug}`}
                  />
                </RevealItem>
              ))}
            </RevealGroup>
          </section>
        );
      })}

      {/* Playground */}
      <section className="layout-stack">
        <div className="border-border flex items-baseline justify-between gap-4 border-b pb-3">
          <h2 className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            Playground
          </h2>
          <Link
            to="/playground/essays"
            prefetch="intent"
            className="text-muted-foreground hover:text-accent press shrink-0 text-sm underline underline-offset-4"
          >
            Read the essays
          </Link>
        </div>
        <RevealGroup className="grid grid-cols-1 place-items-center gap-6 py-8 sm:grid-cols-2 lg:grid-cols-3">
          {playgroundItems.map((item) => (
            <RevealItem key={item.slug}>
              <SpecimenCard
                id={item.slug}
                href={item.href}
                logoAlt={`${item.name} icon`}
                title={item.name}
                category="experiment"
                label={item.category}
                status="Playground"
                data-testid={`lab-playground-${item.slug}`}
              />
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
  /** Displayed on the specimen card's badge — each experiment gets its own, unlike the shared "experiment" finish. */
  category: string;
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
    category: "Interaction",
  },
  {
    slug: "theatre-management",
    name: "Theater P&L",
    shortDescription: "Screen allocation and profit-and-loss modeling for a theater chain.",
    href: "/experiments/theatre-management",
    category: "Economics",
  },
  {
    slug: "glass",
    name: "Physics of Glass",
    shortDescription:
      "How SVG filters recreate the refraction, dispersion, and light behavior of real glass.",
    href: "/experiments/glass",
    category: "Material",
  },
  {
    slug: "layouts",
    name: "Layouts",
    shortDescription:
      "Reusable motion layouts — an ambient vertical marquee and an infinite horizontal carousel.",
    href: "/toys/layouts/vertical",
    category: "Motion",
  },
  {
    slug: "threegl-ai-explainer",
    name: "Particle Field",
    shortDescription: "A tunable three.js particle simulation with live controls.",
    href: "/experiments/threegl-ai-explainer",
    category: "Simulation",
  },
  {
    slug: "llm-interface",
    name: "Context Chemistry",
    shortDescription: "An interactive look at how an LLM's context window is assembled from turns.",
    href: "/experiments/llm-interface",
    category: "Cognition",
  },
];
