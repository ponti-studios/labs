import { Link } from "react-router";
import { ListRowMedia } from "~/components/ListRowMedia";
import { projects } from "~/data/projects";
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

const STATUS_PRIORITY: Record<string, number> = {
  published: 0,
  active: 0,
  development: 1,
  archived: 2,
};

export default function Projects() {
  // Group projects by category, sorting published/active first, development/archived last
  const byCategory = projects.reduce(
    (acc, project) => {
      if (!acc[project.category]) {
        acc[project.category] = [];
      }
      acc[project.category].push(project);
      return acc;
    },
    {} as Record<string, typeof projects>,
  );

  const categoryLabels: Record<string, string> = {
    ...t.projects.categoryLabels,
  };

  const categoryOrder = ["product", "infrastructure", "library", "tool", "research"];

  return (
    <div className="page-shell">
      <h1 className="display-1 text-foreground">The Lab</h1>

      {/* Projects by Category */}
      {categoryOrder.map((category) => {
        const projects = byCategory[category];
        if (!projects) return null;

        return (
          <section key={category} className="content-stack">
            <h2 className="heading-2 text-foreground border-border/40 border-b pb-3">
              {categoryLabels[category]}
            </h2>
            <div className="border-border/40 divide-border/40 divide-y border-b">
              {[...projects]
                .sort((a, b) => (STATUS_PRIORITY[a.status] ?? 0) - (STATUS_PRIORITY[b.status] ?? 0))
                .map((project) => (
                  <div key={project.slug} className="content-list-row group justify-between">
                    <Link
                      to={`/projects/${project.slug}`}
                      prefetch="intent"
                      className="hover:bg-muted/20 focus-visible:outline-ring flex flex-1 flex-row items-center gap-3 transition-colors outline-none focus-visible:outline-2 focus-visible:outline-offset-2"
                    >
                      {project.logo ? (
                        <ListRowMedia
                          fallback={project.name.slice(0, 2).toUpperCase()}
                          src={project.logo}
                          variant="square"
                        />
                      ) : null}
                      <div className="flex flex-col gap-1">
                        <h3 className="heading-3 text-foreground group-hover:text-accent transition-colors">
                          {project.name}
                        </h3>
                        <p className="body-3 text-muted-foreground">{project.shortDescription}</p>
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
