import { useParams, Link } from "react-router";
import { projectDetails, projectSnapshots } from "~/data/projects";

export function meta() {
  return [
    { title: "Lab — Ponti Studios" },
    { name: "description", content: "Project details and information" },
  ];
}

export default function ProjectDetail() {
  const { slug } = useParams();
  const project = slug ? projectDetails[slug] : null;

  if (!project) {
    return (
      <div className="relative mx-auto flex w-full flex-col gap-8 px-6 py-20">
        <div className="flex flex-col gap-4">
          <h1 className="display-1 text-foreground">Project not found</h1>
          <Link to="/projects" className="text-accent hover:text-accent/80 underline">
            ← Back to Lab
          </Link>
        </div>
      </div>
    );
  }

  const allSlugs = projectSnapshots.map((p) => p.slug);
  const currentIndex = allSlugs.indexOf(slug || "");
  const prevProject = currentIndex > 0 ? projectSnapshots[currentIndex - 1] : null;
  const nextProject = currentIndex < allSlugs.length - 1 ? projectSnapshots[currentIndex + 1] : null;

  return (
    <div className="relative mx-auto flex w-full flex-col gap-12 px-6 py-20">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <Link to="/projects" className="text-muted-foreground hover:text-foreground transition-colors w-fit">
          ← Lab
        </Link>
        <div className="flex flex-col gap-2">
          <h1 className="display-1 text-foreground">{project.name}</h1>
          <p className="body-1 text-muted-foreground">{project.description}</p>
        </div>
      </div>

      {/* Meta Info */}
      <div className="grid gap-6 md:grid-cols-2">
        {project.commits && (
          <div>
            <div className="body-4 text-muted-foreground mb-2">Commits</div>
            <div className="heading-3 text-foreground">{project.commits.toLocaleString()}+</div>
          </div>
        )}
        {project.releases && (
          <div>
            <div className="body-4 text-muted-foreground mb-2">Releases</div>
            <div className="heading-3 text-foreground">{project.releases}+</div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="grid gap-12 lg:grid-cols-3">
        {/* Left Column - Description */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          {/* What It Does */}
          <section className="flex flex-col gap-4">
            <h2 className="heading-2 text-foreground">What It Does</h2>
            <p className="body-1 text-muted-foreground">{project.whatItDoes}</p>
          </section>

          {/* Key Features */}
          {project.keyFeatures.length > 0 && (
            <section className="flex flex-col gap-4">
              <h2 className="heading-2 text-foreground">Key Features</h2>
              <ul className="flex flex-col gap-3">
                {project.keyFeatures.map((feature, idx) => (
                  <li key={idx} className="flex gap-3">
                    <span className="text-accent mt-1">•</span>
                    <span className="body-1 text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Why It Matters */}
          {project.whyItsImpressive.length > 0 && (
            <section className="flex flex-col gap-4">
              <h2 className="heading-2 text-foreground">Why It Matters</h2>
              <ul className="flex flex-col gap-3">
                {project.whyItsImpressive.map((point, idx) => (
                  <li key={idx} className="flex gap-3">
                    <span className="text-accent mt-1">—</span>
                    <span className="body-1 text-muted-foreground">{point}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {/* Right Column - Sidebar */}
        <div className="flex flex-col gap-8">
          {/* Combined Card: Tech Stack, Deployment, GitHub */}
          <section className="rounded-lg border border-border/40 p-6 flex flex-col gap-6">
            {/* Tech Stack */}
            <div className="flex flex-col gap-3">
              <h3 className="heading-4 text-foreground">Tech Stack</h3>
              <div className="flex flex-wrap gap-2">
                {project.techStack.map((tech) => (
                  <span
                    key={tech}
                    className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-border/40" />

            {/* Deployment */}
            {project.deployment && (
              <div className="flex flex-col gap-2">
                <h3 className="heading-4 text-foreground">Deployment</h3>
                <div className="body-4 text-muted-foreground">{project.deployment.status}</div>
                {project.deployment.url && (
                  <a
                    href={project.deployment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:text-accent/80 transition-colors underline break-all text-sm mt-1"
                  >
                    {project.deployment.url}
                  </a>
                )}
              </div>
            )}

            {/* Divider */}
            <div className="border-t border-border/40" />

            {/* GitHub */}
            <a
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col gap-2 text-left hover:text-accent transition-colors focus-visible:outline-ring outline-none focus-visible:outline-2 focus-visible:outline-offset-4 -mx-6 -my-6 px-6 py-6 rounded-lg hover:bg-muted/20"
            >
              <h3 className="heading-4 text-foreground">Repository</h3>
              <div className="body-4 text-muted-foreground hover:text-accent break-all">
                github.com/ponti-studios/{project.slug}
              </div>
            </a>
          </section>
        </div>
      </div>

      {/* Navigation */}
      <div className="border-t border-border/40 pt-12 flex justify-between">
        {prevProject ? (
          <Link
            to={`/projects/${prevProject.slug}`}
            className="flex flex-col gap-1 hover:text-accent transition-colors group"
          >
            <div className="body-4 text-muted-foreground group-hover:text-accent">← Previous</div>
            <div className="heading-3 text-foreground">{prevProject.name}</div>
          </Link>
        ) : (
          <div />
        )}
        {nextProject ? (
          <Link
            to={`/projects/${nextProject.slug}`}
            className="flex flex-col gap-1 hover:text-accent transition-colors group text-right"
          >
            <div className="body-4 text-muted-foreground group-hover:text-accent">Next →</div>
            <div className="heading-3 text-foreground">{nextProject.name}</div>
          </Link>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
}
