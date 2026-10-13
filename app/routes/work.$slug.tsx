import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { Link, useLoaderData } from "react-router";
import { RevealGroup, RevealItem } from "~/components/Reveal";
import { CaseRow } from "~/components/work/case-row";
import { BOOK_CALL_URL, caseLogos, caseSnapshots } from "~/data/studio";
import { pageMeta } from "~/lib/seo";
import { t } from "~/translations";

const copy = t.work;

export async function loader({ params }: LoaderFunctionArgs) {
  const index = caseSnapshots.findIndex((entry) => entry.slug === params.slug);
  if (index < 0) throw new Response("Not Found", { status: 404 });
  const snapshot = caseSnapshots[index];
  const next = caseSnapshots[(index + 1) % caseSnapshots.length];
  return { snapshot, next };
}

export const meta: MetaFunction = ({ params }) => {
  const snapshot = caseSnapshots.find((entry) => entry.slug === params.slug);
  if (!snapshot) return [{ title: "Case study | Ponti Studios" }];
  return pageMeta({
    title: `${snapshot.client} | Ponti Studios`,
    description: snapshot.problem,
    path: `/work/${snapshot.slug}`,
  });
};

export default function WorkSlug() {
  const { snapshot, next } = useLoaderData<typeof loader>();
  const logo = caseLogos[snapshot.slug];

  return (
    <div className="sf-case-detail">
      <section className="sf-wrap sf-case-hero">
        <Link to="/work" prefetch="intent" className="sf-case-back">
          <span aria-hidden="true">←</span> {copy.backToWork}
        </Link>

        <div className="sf-case-heading">
          {logo && (
            <span className="sf-case-detail-logo">
              <img src={logo} alt="" />
            </span>
          )}
          <div>
            <h1 className="sf-h1">{snapshot.client}</h1>
            <p>{snapshot.description}</p>
          </div>
        </div>
      </section>

      <section className="sf-wrap sf-case-story" aria-label={`${snapshot.client} case study`}>
        <article className="sf-case-story-row">
          <h2>{copy.problemTitle}</h2>
          <p>{snapshot.problem}</p>
        </article>
        <article className="sf-case-story-row">
          <h2>{copy.solutionTitle}</h2>
          <p>{snapshot.whatWeDid}</p>
        </article>
      </section>

      <section className="sf-wrap sf-case-approach">
        <h2 className="sf-h2">{copy.approachTitle}</h2>
        <RevealGroup as="ol" className="sf-case-approach-list">
          {snapshot.approach.map((step) => (
            <RevealItem key={step} as="li">
              <p>{step}</p>
            </RevealItem>
          ))}
        </RevealGroup>
      </section>

      <section className="sf-wrap sf-case-next">
        <h2 className="sf-h2">{copy.nextCase}</h2>
        <CaseRow snapshot={next} />
      </section>

      <section className="sf-dark sf-case-cta">
        <div className="sf-wrap sf-case-cta-inner">
          <h2 className="sf-h2">Have a problem worth solving?</h2>
          <a className="sf-button" href={BOOK_CALL_URL}>
            Book a call
          </a>
        </div>
      </section>
    </div>
  );
}
