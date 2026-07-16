import { Link } from "react-router";
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
    <div className="relative mx-auto flex w-full flex-col gap-16 py-20">
      <h1 className="display-1 text-foreground">The Lab</h1>

      {/* Projects by Category */}
      {categoryOrder.map((category) => {
        const projects = byCategory[category];
        if (!projects) return null;

        return (
          <section key={category} className="flex flex-col gap-4">
            <h2 className="heading-2 text-foreground border-border/40 border-b pb-3">
              {categoryLabels[category]}
            </h2>
            <div className="border-border/40 divide-border/40 divide-y border-b">
              {[...projects]
                .sort((a, b) => (STATUS_PRIORITY[a.status] ?? 0) - (STATUS_PRIORITY[b.status] ?? 0))
                .map((project) => (
                  <div key={project.slug} className="group flex justify-between gap-4 px-2 py-5">
                    <Link
                      to={`/projects/${project.slug}`}
                      prefetch="intent"
                      className="hover:bg-muted/20 focus-visible:outline-ring flex flex-1 flex-row items-center gap-3 transition-colors outline-none focus-visible:outline-2 focus-visible:outline-offset-2"
                    >
                      {project.logo && (
                        <img
                          src={project.logo}
                          alt={`${project.name} logo`}
                          className="size-10 shrink-0 rounded"
                          width={40}
                          height={40}
                        />
                      )}
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
