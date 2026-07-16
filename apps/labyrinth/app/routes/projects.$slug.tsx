import { ScrollArea } from "@pontistudios/ui";
import { ExternalLink } from "lucide-react";
import { Link, useParams } from "react-router";
import { projects } from "~/data/projects";
import { t } from "~/translations";

export function meta() {
  return [
    { title: "Lab — Ponti Studios" },
    { name: "description", content: t.projects.page.detailMetaDescription },
  ];
}

export default function ProjectDetail() {
  const { slug } = useParams();
  const project = slug ? projects.find((candidate) => candidate.slug === slug) : null;

  if (!project) {
    return (
      <div className="relative mx-auto flex w-full flex-col gap-8 px-6 py-20">
        <div className="flex flex-col gap-4">
          <h1 className="display-1 text-foreground">{t.projects.page.notFound}</h1>
          <Link
            to="/projects"
            prefetch="intent"
            className="text-accent hover:text-accent/80 underline"
          >
            ← {t.projects.page.back}
          </Link>
        </div>
      </div>
    );
  }

  const allSlugs = projects.map((p) => p.slug);
  const currentIndex = allSlugs.indexOf(project.slug);
  const prevProject = currentIndex > 0 ? projects[currentIndex - 1] : null;
  const nextProject = currentIndex < allSlugs.length - 1 ? projects[currentIndex + 1] : null;

  return (
    <div className="relative mx-auto flex w-full flex-col gap-12 px-6 py-20">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <Link
          to="/projects"
          prefetch="intent"
          className="text-muted-foreground hover:text-foreground w-fit transition-colors"
        >
          ← {t.projects.page.title}
        </Link>
        <div className="flex flex-col gap-2">
          <h1 className="display-1 text-foreground">{project.name}</h1>
          <div className="flex flex-wrap gap-4">
            {project.github && (
              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                className="body-4 text-muted-foreground hover:text-accent flex items-center gap-1.5 transition-colors"
              >
                <ExternalLink size={14} />
                {project.github.replace("https://", "")}
              </a>
            )}
            {project.url && (
              <a
                href={project.url}
                target={project.url.startsWith("http") ? "_blank" : undefined}
                rel={project.url.startsWith("http") ? "noopener noreferrer" : undefined}
                className="body-4 text-muted-foreground hover:text-accent flex items-center gap-1.5 transition-colors"
              >
                <ExternalLink size={14} />
                {project.url.replace("https://", "")}
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid gap-12 lg:grid-cols-3">
        {/* Left Column - Description */}
        <div className="flex flex-col gap-8 lg:col-span-2">
          {/* The Problem */}
          <section className="flex flex-col gap-4">
            <h2 className="heading-2 text-foreground">{t.projects.page.problem}</h2>
            <p className="body-1 text-muted-foreground">{project.problem}</p>
          </section>

          {/* The Solution */}
          {project.solution && (
            <section className="flex flex-col gap-4">
              <h2 className="heading-2 text-foreground">{t.projects.page.solution}</h2>
              <p className="body-1 text-muted-foreground">{project.solution}</p>
            </section>
          )}

          {/* Key Features */}
          {project.keyFeatures.length > 0 && (
            <section className="flex flex-col gap-4">
              <h2 className="heading-2 text-foreground">{t.projects.page.howItWorks}</h2>
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
              <h2 className="heading-2 text-foreground">{t.projects.page.engineeringChallenges}</h2>
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
        <div className="flex flex-col gap-8" />
      </div>

      {/* Screenshots */}
      {project.screenshots && project.screenshots.length > 0 && (
        <section className="flex flex-col gap-4">
          <h2 className="heading-2 text-foreground">Screenshots</h2>
          <ScrollArea className="gap-4" snap="start">
            {project.screenshots.map((src, idx) => (
              <a
                key={idx}
                href={src}
                target="_blank"
                rel="noopener noreferrer"
                className="border-border/40 hover:border-accent/40 aspect-video w-80 shrink-0 overflow-hidden rounded-lg border transition-colors"
              >
                <img
                  src={src}
                  alt={`${project.name} screenshot ${idx + 1}`}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </a>
            ))}
          </ScrollArea>
        </section>
      )}

      {/* Navigation */}
      <div className="border-border/40 flex justify-between border-t pt-12">
        {prevProject ? (
          <Link
            to={`/projects/${prevProject.slug}`}
            prefetch="intent"
            className="hover:text-accent group flex flex-col gap-1 transition-colors"
          >
            <div className="body-4 text-muted-foreground group-hover:text-accent">
              ← {t.projects.page.previous}
            </div>
            <div className="heading-3 text-foreground">{prevProject.name}</div>
          </Link>
        ) : (
          <div />
        )}
        {nextProject ? (
          <Link
            to={`/projects/${nextProject.slug}`}
            prefetch="intent"
            className="hover:text-accent group flex flex-col gap-1 text-right transition-colors"
          >
            <div className="body-4 text-muted-foreground group-hover:text-accent">
              {t.projects.page.next} →
            </div>
            <div className="heading-3 text-foreground">{nextProject.name}</div>
          </Link>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
}
