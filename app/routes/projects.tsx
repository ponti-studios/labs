import { ArrowRight } from "lucide-react";
import { Link } from "react-router";
import { RevealGroup, RevealItem } from "~/components/Reveal";
import { projectSections } from "~/data/projects";
import { pageMeta } from "~/lib/seo";
import { t } from "~/translations";

const playgroundItems = [
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
];

export function meta() {
  return pageMeta({
    title: "Lab — Ponti Studios",
    description: t.projects.page.metaDescription,
    path: "/projects",
  });
}

type ProjectRowProps = {
  href: string;
  name: string;
  description: string;
  meta?: string;
  logo?: string;
  testId?: string;
};

function ProjectRow({ href, name, description, meta, logo, testId }: ProjectRowProps) {
  return (
    <Link to={href} prefetch="intent" className="sf-project-row" data-testid={testId}>
      <span className="sf-project-row-title">
        {logo ? <img src={logo} alt="" loading="lazy" /> : null}
        <span>{name}</span>
      </span>
      <span className="sf-project-row-description">{description}</span>
      <span className="sf-project-row-meta">
        {meta ? <span className="sf-project-row-stack">{meta}</span> : null}
      </span>
      <ArrowRight aria-hidden="true" className="sf-project-row-arrow" />
    </Link>
  );
}

export default function Projects() {
  return (
    <div className="sf-projects-page">
      <section className="sf-wrap sf-projects-hero">
        <h1 className="sf-h1">The Lab</h1>
        <p className="sf-copy">{t.projects.page.metaDescription}</p>
      </section>

      <div className="sf-wrap sf-projects-catalog">
        {projectSections.map((section) => (
          <section key={section.category} className="sf-project-group">
            <h2 className="sf-h2">{section.label}</h2>
            <RevealGroup className="sf-project-list">
              {section.projects.map((project) => (
                <RevealItem key={project.slug}>
                  <ProjectRow
                    href={`/projects/${project.slug}`}
                    name={project.name}
                    description={project.shortDescription}
                    logo={project.logo}
                    testId={`lab-project-${project.slug}`}
                  />
                </RevealItem>
              ))}
            </RevealGroup>
          </section>
        ))}

        <section className="sf-project-group sf-playground-group">
          <div className="sf-project-group-heading">
            <h2 className="sf-h2">Playground</h2>
            <Link to="/playground/essays" prefetch="intent" className="sf-project-essays-link">
              Read the essays <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </div>
          <RevealGroup className="sf-project-list">
            {playgroundItems.map((item) => (
              <RevealItem key={item.slug}>
                <ProjectRow
                  href={item.href}
                  name={item.name}
                  description={item.shortDescription}
                  meta={item.category}
                />
              </RevealItem>
            ))}
          </RevealGroup>
        </section>
      </div>

      <section className="sf-dark sf-projects-cta">
        <div className="sf-wrap sf-projects-cta-inner">
          <h2 className="sf-h2">Have a problem worth solving?</h2>
          <Link to="/services" prefetch="intent" className="sf-button">
            See how I can help <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
