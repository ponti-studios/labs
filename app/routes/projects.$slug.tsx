import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { Link, useLoaderData } from "react-router";
import { useRef } from "react";
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { BOOK_CALL_URL } from "~/data/studio";
import { pageMeta } from "~/lib/seo";
import { FinanceMcpDetails, FinanceMcpHero } from "~/components/projects/finance-mcp";
import { WaveformPreview } from "~/components/projects/waveform-preview";
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

export default function ProjectDetail() {
  const { project, next } = useLoaderData<typeof loader>();
  const hasDistinctUrl = Boolean(project.url && project.url !== project.github);
  const portrait = project.screenshotShape === "portrait";
  const screenshots = project.screenshots ?? [];
  const screenshotRailRef = useRef<HTMLDivElement>(null);

  const moveScreenshotRail = (direction: -1 | 1) => {
    const rail = screenshotRailRef.current;
    if (!rail) return;
    const firstSlide = rail.querySelector<HTMLElement>(".sf-project-screenshot");
    const step = firstSlide ? firstSlide.offsetWidth + 20 : rail.clientWidth * 0.8;
    rail.scrollBy({ left: direction * step, behavior: "smooth" });
  };

  return (
    <div className="sf-project-detail">
      <section className="sf-wrap sf-project-detail-hero">
        <Link to="/projects" prefetch="intent" className="sf-project-back">
          <ArrowLeft aria-hidden="true" className="size-4" />
          {copy.page.back}
        </Link>

        <div className="sf-project-detail-heading">
          {project.logo ? <img src={project.logo} alt="" className="sf-project-detail-logo" /> : null}
          <h1 className="sf-h1">{project.name}</h1>
        </div>
        <p className="sf-project-detail-summary">{project.shortDescription}</p>

        <div className="sf-project-detail-links">
          <span className="sf-project-detail-category">{copy.categoryLabels[project.category]}</span>
          <a href={project.github} target="_blank" rel="noopener noreferrer">
            {copy.page.repository} <ArrowRight aria-hidden="true" className="size-4" />
          </a>
          {hasDistinctUrl && project.url ? (
            <a
              href={project.url}
              target={project.url.startsWith("http") ? "_blank" : undefined}
              rel={project.url.startsWith("http") ? "noopener noreferrer" : undefined}
            >
              {project.showcase === "waveform" ? "Full explainer" : copy.page.liveProject} <ArrowRight aria-hidden="true" className="size-4" />
            </a>
          ) : null}
          {project.relatedLinks?.map((link) => (
            <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer">
              {link.label} <ArrowRight aria-hidden="true" className="size-4" />
            </a>
          ))}
        </div>

        {project.heroImage ? (
          <img
            src={project.heroImage.src}
            alt={project.heroImage.alt}
            width={project.heroImage.width}
            height={project.heroImage.height}
            className="sf-project-detail-hero-image"
            loading="eager"
            decoding="async"
          />
        ) : null}
        {project.showcase === "finance-mcp" ? <FinanceMcpHero /> : null}
      </section>

      {project.showcase === "finance-mcp" ? <FinanceMcpDetails /> : null}
      {project.showcase === "waveform" ? <WaveformPreview /> : null}

      {screenshots.length > 0 ? (
        <section className="sf-wrap sf-project-screenshots" aria-label={copy.page.screenshots}>
          <div className="sf-project-screenshot-controls">
            <button
              type="button"
              aria-label="Previous screenshot"
              onClick={() => moveScreenshotRail(-1)}
            >
              <ChevronLeft aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label="Next screenshot"
              onClick={() => moveScreenshotRail(1)}
            >
              <ChevronRight aria-hidden="true" />
            </button>
          </div>
          <div
            ref={screenshotRailRef}
            className={[
              "sf-project-screenshot-rail",
              portrait && "portrait",
              project.screenshotFrame === "iphone" && "iphone",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {screenshots.map((src, index) => (
              <a
                key={src}
                href={src}
                target="_blank"
                rel="noopener noreferrer"
                className={
                  project.screenshotFrame === "iphone"
                    ? "sf-project-screenshot iphone-frame"
                    : "sf-project-screenshot"
                }
              >
                <img
                  src={src}
                  alt={`${project.name} screenshot ${index + 1}`}
                  width={portrait ? 660 : 1280}
                  height={portrait ? 1434 : 720}
                  loading={project.screenshotFrame === "iphone" ? "eager" : "lazy"}
                  decoding="async"
                />
              </a>
            ))}
          </div>
        </section>
      ) : null}

      <div className="sf-wrap sf-project-story">
        <section className="sf-project-story-row">
          <h2>{copy.page.problem}</h2>
          <p className="sf-project-problem">{project.problem}</p>
        </section>

        {project.solution ? (
          <section className="sf-project-story-row">
            <h2>{copy.page.solution}</h2>
            <p>{project.solution}</p>
          </section>
        ) : null}
      </div>

      {project.keyFeatures.length > 0 || project.technicalChallenges.length > 0 ? (
        <section className="sf-project-detail-list-section">
          <div className="sf-wrap">
            {project.keyFeatures.length > 0 ? (
              <section className="sf-project-points-group">
                <h2 className="sf-h2">{copy.page.whatItDoes}</h2>
                <ul className="sf-project-points">
                  {project.keyFeatures.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </section>
            ) : null}

            {project.technicalChallenges.length > 0 ? (
              <section className="sf-project-points-group">
                <h2 className="sf-h2">{copy.page.technicalChallenges}</h2>
                <ul className="sf-project-points">
                  {project.technicalChallenges.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </section>
            ) : null}
          </div>
        </section>
      ) : null}

      <section className="sf-wrap sf-project-next">
        <h2 className="sf-h2">{copy.page.nextProject}</h2>
        <Link to={`/projects/${next.slug}`} prefetch="intent" className="sf-project-next-row">
          <span className="sf-project-next-name">{next.name}</span>
          <span className="sf-project-next-summary">{next.shortDescription}</span>
          <ArrowRight aria-hidden="true" className="sf-project-row-arrow" />
        </Link>
      </section>

      <section className="sf-dark sf-project-detail-cta">
        <div className="sf-wrap sf-project-detail-cta-inner">
          <h2 className="sf-h2">Have a problem worth solving?</h2>
          <div className="sf-project-detail-actions">
            <a href={BOOK_CALL_URL} className="sf-button">
              {t.common.bookCall}
            </a>
            <Link to="/services" prefetch="intent" className="sf-project-services-link">
              {t.common.seeServices}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
