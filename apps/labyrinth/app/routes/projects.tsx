import { Link } from "react-router";
import { projectSnapshots } from "~/data/projects";

export function meta(): Array<{
  title?: string;
  name?: string;
  content?: string;
}> {
  return [
    { title: "Lab — Ponti Studios" },
    { name: "description", content: "10 active repositories spanning products, infrastructure, tools, and research" },
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
      {/* Hero */}
      <div className="flex flex-col gap-4">
        <h1 className="display-1 text-foreground">The Lab</h1>
        <p className="body-2 text-muted-foreground max-w-2xl">
          9 active repositories spanning full-stack products, enterprise infrastructure, developer tools, and AI research. From published NPM packages to Docker automation to native macOS apps.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-border/40 p-4">
          <div className="heading-3 text-foreground">9</div>
          <div className="body-4 text-muted-foreground">Active Repos</div>
        </div>
        <div className="rounded-lg border border-border/40 p-4">
          <div className="heading-3 text-foreground">3K+</div>
          <div className="body-4 text-muted-foreground">Total Commits</div>
        </div>
        <div className="rounded-lg border border-border/40 p-4">
          <div className="heading-3 text-foreground">7</div>
          <div className="body-4 text-muted-foreground">Languages</div>
        </div>
        <div className="rounded-lg border border-border/40 p-4">
          <div className="heading-3 text-foreground">30+</div>
          <div className="body-4 text-muted-foreground">Releases</div>
        </div>
      </div>

      {/* Projects by Category */}
      {categoryOrder.map((category) => {
        const projects = byCategory[category];
        if (!projects) return null;

        return (
          <section key={category} className="flex flex-col gap-6">
            <h2 className="heading-2 text-foreground">{categoryLabels[category]}</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <Link
                  key={project.slug}
                  to={`/projects/${project.slug}`}
                  className="group flex h-full flex-col gap-4 rounded-lg border border-border/40 p-6 transition-all hover:border-border hover:bg-muted/20 focus-visible:outline-ring outline-none focus-visible:outline-2 focus-visible:outline-offset-4"
                >
                  {/* Header */}
                  <div className="flex flex-col gap-2">
                    <h3 className="heading-3 text-foreground group-hover:text-accent transition-colors">
                      {project.name}
                    </h3>
                    <p className="body-3 text-muted-foreground line-clamp-2">
                      {project.shortDescription}
                    </p>
                  </div>

                  {/* Tech Stack */}
                  <div className="flex flex-wrap gap-2">
                    {project.tech.slice(0, 3).map((t) => (
                      <span
                        key={t}
                        className="inline-flex items-center rounded-full bg-muted px-2 py-1 text-xs font-medium text-muted-foreground"
                      >
                        {t}
                      </span>
                    ))}
                    {project.tech.length > 3 && (
                      <span className="inline-flex items-center text-xs text-muted-foreground">
                        +{project.tech.length - 3}
                      </span>
                    )}
                  </div>

                  {/* Status Badge */}
                  <div className="flex gap-2">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                        project.status === "published"
                          ? "bg-green-500/10 text-green-700 dark:text-green-400"
                          : project.status === "active"
                            ? "bg-blue-500/10 text-blue-700 dark:text-blue-400"
                            : project.status === "development"
                              ? "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                              : "bg-gray-500/10 text-gray-700 dark:text-gray-400"
                      }`}
                    >
                      {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
