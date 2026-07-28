import { ScrollArea } from "@ponti-studios/ui/layout";
import { ExternalLink, FolderGit2 } from "lucide-react";
import { Link, useParams } from "react-router";
import { DetailHeader, DetailNavigation } from "~/components/DetailPage";
import { ListRowMedia } from "~/components/ListRowMedia";
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
      <div className="page-bleed">
        <section className="section section-hero">
          <h1 className="display-1 text-foreground">{t.projects.page.notFound}</h1>
          <Link
            to="/projects"
            prefetch="intent"
            className="text-accent min-h-11 w-fit content-center text-sm underline underline-offset-4 outline-none"
          >
            ← {t.projects.page.back}
          </Link>
        </section>
      </div>
    );
  }

  const currentIndex = projects.findIndex((candidate) => candidate.slug === project.slug);
  const previous = currentIndex > 0 ? projects[currentIndex - 1] : null;
  const next = currentIndex < projects.length - 1 ? projects[currentIndex + 1] : null;
  const hasDistinctUrl = Boolean(project.url && project.url !== project.github);
  const howItWorks = [...project.keyFeatures, ...project.technicalChallenges];

  return (
    <div className="page-bleed">
      <DetailHeader
        back={
          <Link
            to="/projects"
            prefetch="intent"
            className="text-muted-foreground hover:text-foreground min-h-11 w-fit content-center text-sm outline-none"
          >
            ← {t.projects.page.title}
          </Link>
        }
        media={
          project.logo ? (
            <ListRowMedia
              fallback={project.name.slice(0, 2).toUpperCase()}
              loading="eager"
              src={project.logo}
            />
          ) : null
        }
        title={project.name}
        metadata={
          <span className="flex flex-wrap gap-x-4 gap-y-2">
            <a
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-accent inline-flex min-h-11 items-center gap-2 underline-offset-4 outline-none hover:underline"
            >
              {t.projects.page.repository}
              <FolderGit2 size={16} aria-hidden="true" />
            </a>
            {hasDistinctUrl && project.url ? (
              <a
                href={project.url}
                target={project.url.startsWith("http") ? "_blank" : undefined}
                rel={project.url.startsWith("http") ? "noopener noreferrer" : undefined}
                className="hover:text-accent inline-flex min-h-11 items-center gap-2 underline-offset-4 outline-none hover:underline"
              >
                {t.projects.page.liveProject}
                <ExternalLink size={16} aria-hidden="true" />
              </a>
            ) : null}
          </span>
        }
        summary={project.shortDescription}
      />

      <section className="section">
        <h2 className="text-foreground text-xl font-semibold tracking-tight">
          {t.projects.page.problem}
        </h2>
        <p className="text-muted-foreground max-w-2xl text-base">{project.problem}</p>
      </section>

      {project.solution ? (
        <section className="section">
          <h2 className="text-foreground text-xl font-semibold tracking-tight">
            {t.projects.page.solution}
          </h2>
          <p className="text-muted-foreground max-w-2xl text-base">{project.solution}</p>
        </section>
      ) : null}

      {project.screenshots && project.screenshots.length > 0 ? (
        <section className="section">
          <h2 className="text-foreground text-xl font-semibold tracking-tight">
            {t.projects.page.screenshots}
          </h2>
          <ScrollArea className="-mx-4 gap-4 px-4 md:mx-0 md:px-0" snap="start">
            {project.screenshots.map((src, index) => (
              <a
                key={src}
                href={src}
                target="_blank"
                rel="noopener noreferrer"
                className="border-border hover:border-accent/40 aspect-video w-72 shrink-0 overflow-hidden rounded-lg border outline-none sm:w-80"
              >
                <img
                  src={src}
                  alt={`${project.name} screenshot ${index + 1}`}
                  width={1280}
                  height={720}
                  loading="lazy"
                  decoding="async"
                  sizes="(min-width: 640px) 20rem, 18rem"
                  className="h-full w-full object-cover"
                />
              </a>
            ))}
          </ScrollArea>
        </section>
      ) : null}

      {howItWorks.length > 0 ? (
        <section className="section gap-8">
          <h2 className="text-foreground text-xl font-semibold tracking-tight">
            {t.projects.page.howItWorks}
          </h2>
          <ul className="flex max-w-2xl flex-col gap-3">
            {howItWorks.map((point) => (
              <li key={`${project.slug}-${point}`} className="flex gap-3">
                <span className="text-accent mt-1" aria-hidden="true">
                  •
                </span>
                <span className="text-muted-foreground text-base">{point}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <DetailNavigation
        ariaLabel="Project navigation"
        previous={
          previous
            ? {
                label: t.projects.page.previous,
                title: previous.name,
                to: `/projects/${previous.slug}`,
              }
            : null
        }
        next={
          next
            ? { label: t.projects.page.next, title: next.name, to: `/projects/${next.slug}` }
            : null
        }
      />
    </div>
  );
}
