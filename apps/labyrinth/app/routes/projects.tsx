import { Link } from "react-router";
import { projectSnapshots } from "~/data/projects";
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
      content: "10 active repositories spanning products, infrastructure, tools, and research",
    },
  ];
}

export default function Projects() {
  // Group projects by category
  const byCategory = projectSnapshots.reduce(
    (acc, project) => {
      if (!acc[project.category]) {
        acc[project.category] = [];
      }
      acc[project.category].push(project);
      return acc;
    },
    {} as Record<string, typeof projectSnapshots>,
  );

  const categoryLabels: Record<string, string> = {
    product: "Products",
    infrastructure: "Infrastructure",
    library: "Libraries",
    tool: "Tools",
    research: "Research",
  };

  const categoryOrder = ["product", "infrastructure", "library", "tool", "research"];

  return (
    <div className="relative mx-auto flex w-full flex-col gap-16 px-6 py-20">
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
              {projects.map((project) => (
                <Link
                  key={project.slug}
                  to={`/projects/${project.slug}`}
                  className="group hover:bg-muted/20 focus-visible:outline-ring flex items-center justify-between gap-4 px-2 py-5 transition-colors outline-none focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                  {/* Header */}
                  <div className="flex flex-col gap-1">
                    <h3 className="heading-3 text-foreground group-hover:text-accent transition-colors">
                      {project.name}
                    </h3>
                    <p className="body-3 text-muted-foreground">{project.shortDescription}</p>
                  </div>

                  <div className="body-4 text-muted-foreground tracking-wide uppercase">
                    {project.status}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        );
      })}

      {/* Playground */}
      <section className="flex flex-col gap-10">
        <h2 className="heading-2 text-foreground">{t.home.lab.title}</h2>
        <div className="grid gap-12 sm:grid-cols-2 sm:gap-16">
          {t.home.lab.categories.map((cat) => (
            <div key={cat.name} className="flex flex-col gap-4">
              <ul className="flex flex-col gap-4">
                {cat.entries.map((entry) => (
                  <li key={entry.path}>
                    <a
                      href={entry.path}
                      className="body-2 text-foreground hover:text-muted-foreground focus-visible:outline-ring rounded-sm underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4"
                    >
                      {entry.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
