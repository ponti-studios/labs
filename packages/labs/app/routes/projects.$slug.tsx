import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { Link, useLoaderData } from "react-router";
import { BookCallButton } from "~/components/BookCallButton";
import { RevealGroup, RevealItem } from "~/components/Reveal";
import { projects } from "~/data/projects";
import { t } from "~/translations";

const copy = t.projects;

export async function loader({ params }: LoaderFunctionArgs) {
  const project = projects.find((candidate) => candidate.slug === params.slug);
  if (!project) throw new Response("Not Found", { status: 404 });
  return { project };
}

export const meta: MetaFunction = ({ params }) => {
  const project = projects.find((candidate) => candidate.slug === params.slug);
  if (!project) return [{ title: "Lab | Ponti Studios" }];
  return [
    { title: `${project.name} | Ponti Studios` },
    { name: "description", content: project.shortDescription },
  ];
};

export default function ProjectDetail() {
  const { project } = useLoaderData<typeof loader>();
  const hasDistinctUrl = Boolean(project.url && project.url !== project.github);
  const howItWorks = [...project.keyFeatures, ...project.technicalChallenges];

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-16">
      {/* Hero */}
      <section>
        <Link
          to="/projects"
          prefetch="intent"
          className="text-muted-foreground hover:text-foreground mb-10 inline-block min-h-11 w-fit content-center text-sm outline-none"
        >
          ← {copy.page.back}
        </Link>

        <div className="flex items-center gap-4">
          {project.logo ? (
            <div className="rounded-lg bg-white p-2">
              <img
                src={project.logo}
                alt={`${project.name} logo`}
                className="size-10 shrink-0 object-contain grayscale"
              />
            </div>
          ) : null}
          <h1 className="text-4xl font-medium tracking-tight sm:text-5xl">{project.name}</h1>
        </div>

        <p className="text-muted-foreground mt-2 max-w-fit rounded-full px-4 py-1 text-sm shadow">
          {copy.categoryLabels[project.category]}
        </p>

        <dl className="border-border text-muted-foreground mt-10 flex flex-wrap gap-x-10 gap-y-2 border-t border-b py-4 text-sm">
          <div className="flex gap-2">
            <dt className="uppercase">{copy.page.status}</dt>
            <dd className="text-foreground">{copy.statusLabels[project.status]}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="uppercase">{copy.page.stack}</dt>
            <dd className="text-foreground">{project.tech.join(", ")}</dd>
          </div>
        </dl>

        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <a
            href={project.github}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground underline underline-offset-4 outline-none"
          >
            {copy.page.repository}
          </a>
          {hasDistinctUrl && project.url ? (
            <a
              href={project.url}
              target={project.url.startsWith("http") ? "_blank" : undefined}
              rel={project.url.startsWith("http") ? "noopener noreferrer" : undefined}
              className="text-muted-foreground hover:text-foreground underline underline-offset-4 outline-none"
            >
              {copy.page.liveProject}
            </a>
          ) : null}
        </div>
      </section>

      {/* Problem */}
      <section>
        <h2 className="text-muted-foreground mb-3 text-xs font-medium tracking-wide uppercase">
          {copy.page.problem}
        </h2>
        <p className="text-foreground text-2xl leading-snug font-normal tracking-tight sm:text-3xl">
          {project.problem}
        </p>
      </section>

      {/* Solution */}
      {project.solution ? (
        <section>
          <h2 className="text-muted-foreground mb-3 text-xs font-medium tracking-wide uppercase">
            {copy.page.solution}
          </h2>
          <p className="text-muted-foreground mb-8 text-lg leading-relaxed">{project.solution}</p>
        </section>
      ) : null}

      {/* How It Works */}
      {howItWorks.length > 0 ? (
        <section>
          <h2 className="text-muted-foreground mb-8 text-xs font-medium tracking-wide uppercase">
            {copy.page.howItWorks}
          </h2>
          <RevealGroup as="ol" className="border-border divide-border divide-y border-t">
            {howItWorks.map((point, index) => (
              <RevealItem
                key={`${project.slug}-${point}`}
                as="li"
                className="flex items-baseline gap-6 py-5 first:pt-0"
              >
                <span className="text-muted-foreground font-mono text-xs">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className="text-foreground leading-relaxed">{point}</p>
              </RevealItem>
            ))}
          </RevealGroup>
        </section>
      ) : null}

      {/* Screenshots */}
      {project.screenshots && project.screenshots.length > 0 ? (
        <section className="border-border border-t pt-10">
          <h2 className="text-muted-foreground mb-6 text-xs font-medium tracking-wide uppercase">
            {copy.page.screenshots}
          </h2>
          <RevealGroup as="ul" className="border-border divide-border divide-y border-b">
            {project.screenshots.map((src, index) => (
              <RevealItem key={src} as="li" className="flex items-center gap-6 py-5 first:pt-0">
                <span className="text-muted-foreground w-10 shrink-0 font-mono text-xs">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <a
                  href={src}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border-border hover:border-accent/40 aspect-video w-48 shrink-0 overflow-hidden rounded-md border outline-none"
                >
                  <img
                    src={src}
                    alt={`${project.name} screenshot ${index + 1}`}
                    width={1280}
                    height={720}
                    loading="lazy"
                    decoding="async"
                    sizes="12rem"
                    className="h-full w-full object-cover"
                  />
                </a>
              </RevealItem>
            ))}
          </RevealGroup>
        </section>
      ) : null}

      {/* Close CTA */}
      <section className="pb-24 text-center">
        <div className="flex flex-wrap items-center justify-center gap-6">
          <BookCallButton>{t.common.bookCall}</BookCallButton>
          <Link
            to="/services"
            prefetch="intent"
            className="text-foreground text-sm underline-offset-4 hover:underline"
          >
            {t.home.services.cta}
          </Link>
        </div>
      </section>
    </div>
  );
}