import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { Link, useLoaderData } from "react-router";
import { BookCallButton } from "~/components/BookCallButton";
import { ProjectTile } from "~/components/projects/project-tile";
import { RevealGroup, RevealItem } from "~/components/Reveal";
import { pageMeta } from "~/lib/seo";
import { projects } from "~/data/projects";
import { t } from "~/translations";

const copy = t.projects;

export async function loader({ params }: LoaderFunctionArgs) {
  const index = projects.findIndex((candidate) => candidate.slug === params.slug);
  if (index < 0) throw new Response("Not Found", { status: 404 });
  const project = projects[index];
  const next = projects[(index + 1) % projects.length];
  return { project, next };
}

export const meta: MetaFunction = ({ params }) => {
  const project = projects.find((candidate) => candidate.slug === params.slug);
  if (!project) return [{ title: "Lab | Ponti Studios" }];
  return pageMeta({
    title: `${project.name} | Ponti Studios`,
    description: project.shortDescription,
    path: `/projects/${project.slug}`,
  });
};

const linkClassName =
  "text-muted-foreground hover:text-foreground underline underline-offset-4 outline-none";

export default function ProjectDetail() {
  const { project, next } = useLoaderData<typeof loader>();
  const hasDistinctUrl = Boolean(project.url && project.url !== project.github);
  const howItWorks = [...project.keyFeatures, ...project.technicalChallenges];
  const portrait = project.screenshotShape === "portrait";
  const screenshots = project.screenshots ?? [];

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-20 pt-8 pb-24 sm:gap-28">
      {/* Hero */}
      <section>
        <Link
          to="/projects"
          prefetch="intent"
          aria-label={copy.page.back}
          className="text-muted-foreground hover:text-foreground inline-flex min-h-11 w-fit items-center font-mono text-xl outline-none"
        >
          ←
        </Link>

        <div className="mt-8 flex flex-wrap items-center gap-5">
          {project.logo ? (
            <span className="border-border rounded-sm border bg-white p-2">
              <img
                src={project.logo}
                alt={`${project.name} logo`}
                className="size-12 shrink-0 object-contain grayscale"
              />
            </span>
          ) : null}
          <h1 className="text-foreground text-5xl font-semibold tracking-tight sm:text-7xl">
            {project.name}
          </h1>
        </div>

        <p className="text-muted-foreground mt-5 max-w-3xl text-xl leading-snug">
          {project.shortDescription}
        </p>

        <p className="text-muted-foreground mt-6 text-sm">
          {copy.categoryLabels[project.category]} · {copy.statusLabels[project.status]} ·{" "}
          {project.tech.join(", ")}
        </p>

        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <a
            href={project.github}
            target="_blank"
            rel="noopener noreferrer"
            className={linkClassName}
          >
            {copy.page.repository}
          </a>
          {hasDistinctUrl && project.url ? (
            <a
              href={project.url}
              target={project.url.startsWith("http") ? "_blank" : undefined}
              rel={project.url.startsWith("http") ? "noopener noreferrer" : undefined}
              className={linkClassName}
            >
              {copy.page.liveProject}
            </a>
          ) : null}
        </div>
      </section>

      {/* Screenshots lead: for a product, the product is the proof */}
      {screenshots.length > 0 ? (
        <section aria-label={copy.page.screenshots}>
          <RevealGroup
            as="ul"
            className={
              portrait
                ? "grid grid-cols-2 gap-4 sm:grid-cols-4"
                : "grid grid-cols-1 gap-4 sm:grid-cols-2"
            }
          >
            {screenshots.map((src, index) => (
              <RevealItem key={src} as="li">
                <a
                  href={src}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border-border hover:border-foreground block overflow-hidden rounded-sm border transition-colors duration-200 outline-none focus-visible:ring-2"
                >
                  <img
                    src={src}
                    alt={`${project.name} screenshot ${index + 1}`}
                    width={portrait ? 660 : 1280}
                    height={portrait ? 1434 : 720}
                    loading="lazy"
                    decoding="async"
                    className="h-auto w-full"
                  />
                </a>
              </RevealItem>
            ))}
          </RevealGroup>
        </section>
      ) : null}

      {/* Problem */}
      <section className="grid gap-6 lg:grid-cols-[14rem_1fr] lg:gap-16">
        <h2 className="text-foreground self-start lg:sticky lg:top-24">{copy.page.problem}</h2>
        <p className="text-foreground text-2xl leading-snug font-medium tracking-tight sm:text-3xl">
          {project.problem}
        </p>
      </section>

      {/* Solution */}
      {project.solution ? (
        <section className="grid gap-6 lg:grid-cols-[14rem_1fr] lg:gap-16">
          <h2 className="text-foreground self-start lg:sticky lg:top-24">{copy.page.solution}</h2>
          <p className="text-muted-foreground text-lg leading-relaxed">{project.solution}</p>
        </section>
      ) : null}

      {/* How It Works */}
      {howItWorks.length > 0 ? (
        <section className="grid gap-6 lg:grid-cols-[14rem_1fr] lg:gap-16">
          <h2 className="text-foreground self-start lg:sticky lg:top-24">{copy.page.howItWorks}</h2>
          <RevealGroup as="ol" className="border-border divide-border divide-y border-t">
            {howItWorks.map((point, index) => (
              <RevealItem
                key={`${project.slug}-${point}`}
                as="li"
                className="flex items-baseline gap-6 py-5"
              >
                <span className="text-muted-foreground font-mono text-xs">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className="text-foreground text-lg leading-relaxed">{point}</p>
              </RevealItem>
            ))}
          </RevealGroup>
        </section>
      ) : null}

      {/* Next project */}
      <section className="border-border grid gap-6 border-t pt-12 lg:grid-cols-[14rem_1fr] lg:gap-16">
        <h2 className="text-foreground self-start">{copy.page.nextProject}</h2>
        <ProjectTile
          className="max-w-md"
          href={`/projects/${next.slug}`}
          name={next.name}
          description={next.shortDescription}
          status={copy.statusLabels[next.status]}
          meta={next.tech.slice(0, 3).join(" · ")}
          logo={next.logo}
        />
      </section>

      {/* Close CTA */}
      <section className="text-center">
        <div className="flex flex-wrap items-center justify-center gap-6">
          <BookCallButton>{t.common.bookCall}</BookCallButton>
          <Link
            to="/services"
            prefetch="intent"
            className="text-foreground text-sm underline-offset-4 hover:underline"
          >
            {t.common.seeServices}
          </Link>
        </div>
      </section>
    </div>
  );
}
