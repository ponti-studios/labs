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
  const nextProject =
    currentIndex < allSlugs.length - 1 ? projectSnapshots[currentIndex + 1] : null;

  return (
    <div className="relative mx-auto flex w-full flex-col gap-12 px-6 py-20">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <Link
          to="/projects"
          className="text-muted-foreground hover:text-foreground w-fit transition-colors"
        >
          ← Lab
        </Link>
        <div className="flex flex-col gap-2">
          <h1 className="display-1 text-foreground">{project.name}</h1>
          <p className="body-1 text-muted-foreground">{project.description}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid gap-12 lg:grid-cols-3">
        {/* Left Column - Description */}
        <div className="flex flex-col gap-8 lg:col-span-2">
          {/* The Problem */}
          <section className="flex flex-col gap-4">
            <h2 className="heading-2 text-foreground">The Problem</h2>
            <p className="body-1 text-muted-foreground">{project.problem}</p>
          </section>

          {/* Key Features */}
          {project.keyFeatures.length > 0 && (
            <section className="flex flex-col gap-4">
              <h2 className="heading-2 text-foreground">How It Works</h2>
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

          {/* Engineering Challenges */}
          {project.technicalChallenges.length > 0 && (
            <section className="flex flex-col gap-4">
              <h2 className="heading-2 text-foreground">Engineering Challenges</h2>
              <ul className="flex flex-col gap-3">
                {project.technicalChallenges.map((point, idx) => (
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
          <section className="border-border/40 flex flex-col gap-6 rounded-lg border p-6">
            {/* Tech Stack */}
            <div className="flex flex-col gap-3">
              <h3 className="heading-4 text-foreground">Tech Stack</h3>
              <div className="flex flex-wrap gap-2">
                {project.techStack.map((tech) => (
                  <span
                    key={tech}
                    className="bg-muted text-muted-foreground inline-flex items-center rounded-full px-3 py-1 text-xs font-medium"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="border-border/40 border-t" />

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
                    className="text-accent hover:text-accent/80 mt-1 text-sm break-all underline transition-colors"
                  >
                    {project.deployment.url}
                  </a>
                )}
              </div>
            )}

            {/* Divider */}
            <div className="border-border/40 border-t" />

            {/* GitHub */}
            <a
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-accent focus-visible:outline-ring hover:bg-muted/20 -mx-6 -my-6 flex flex-col gap-2 rounded-lg px-6 py-6 text-left transition-colors outline-none focus-visible:outline-2 focus-visible:outline-offset-4"
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
      <div className="border-border/40 flex justify-between border-t pt-12">
        {prevProject ? (
          <Link
            to={`/projects/${prevProject.slug}`}
            className="hover:text-accent group flex flex-col gap-1 transition-colors"
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
            className="hover:text-accent group flex flex-col gap-1 text-right transition-colors"
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
