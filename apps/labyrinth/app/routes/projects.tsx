import { Link } from "react-router";
import { ListRowMedia } from "~/components/ListRowMedia";
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
      <h1 className="display-1 text-primary">The Lab</h1>

      {/* Projects by Category */}
      {projectSections.map((section) => {
        return (
          <section key={section.category} className="layout-stack">
            <h2 className="heading-2 text-primary border-subtle border-b pb-3">{section.label}</h2>
            <div className="border-subtle divide-border-subtle divide-y border-b">
              {section.projects.map((project) => (
                <div key={project.slug} className="list-row group">
                  <Link
                    to={`/projects/${project.slug}`}
                    prefetch="intent"
                    className="hover:bg-inset/20 flex min-w-0 flex-1 flex-row items-start gap-4 transition-colors outline-none md:gap-6"
                  >
                    {project.logo ? (
                      <ListRowMedia
                        fallback={project.name.slice(0, 2).toUpperCase()}
                        src={project.logo}
                        variant="square"
                      />
                    ) : null}
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <h3 className="heading-2 text-primary group-hover:text-accent transition-colors motion-reduce:transition-none">
                        {project.name}
                      </h3>
                      <p className="body-2 text-secondary max-w-2xl">{project.shortDescription}</p>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </section>
        );
      })}

      {/* Playground — disabled while experiments are being rewritten */}
    </div>
  );
}
