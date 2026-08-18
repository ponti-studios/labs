import { Link } from "react-router";
import { ListRowMedia } from "~/components/ListRowMedia";
import { RevealGroup, RevealItem } from "~/components/Reveal";
import { playgroundItems } from "~/data/playground";
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
      <h1 className="heading-hero text-foreground">
        The <span className="font-serif italic">Lab</span>
      </h1>

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
                      <h3 className="heading-list-title text-foreground group-hover:text-accent">
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
                  <h3 className="heading-list-title text-foreground group-hover:text-accent">
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
