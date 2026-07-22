import { Button } from "@ponti-studios/ui/primitives";
import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { Link, useLoaderData } from "react-router";
import { DetailHeader, DetailNavigation } from "~/components/DetailPage";
import { ListRowMedia } from "~/components/ListRowMedia";
import { BOOK_CALL_URL, caseLogos, caseSnapshots } from "~/data/studio";
import { t } from "~/translations";

const copy = t.work;
const proof = t.catalog.proof;

export async function loader({ params }: LoaderFunctionArgs) {
  const snapshot = caseSnapshots.find((entry) => entry.slug === params.slug);
  if (!snapshot) throw new Response("Not Found", { status: 404 });
  return { snapshot };
}

export const meta: MetaFunction = ({ params }) => {
  const snapshot = caseSnapshots.find((entry) => entry.slug === params.slug);
  if (!snapshot) return [{ title: "Case study | Ponti Studios" }];
  return [
    { title: `${snapshot.client} | Ponti Studios` },
    { name: "description", content: snapshot.problem },
  ];
};

export default function WorkSlug() {
  const { snapshot } = useLoaderData<typeof loader>();
  const currentIndex = caseSnapshots.findIndex((entry) => entry.slug === snapshot.slug);
  const previous = currentIndex > 0 ? caseSnapshots[currentIndex - 1] : null;
  const next = currentIndex < caseSnapshots.length - 1 ? caseSnapshots[currentIndex + 1] : null;

  return (
    <div className="page-bleed">
      <DetailHeader
        back={
          <Link
            to="/work"
            prefetch="intent"
            className="text-sm text-muted-foreground hover:text-foreground min-h-11 w-fit content-center outline-none"
          >
            ← {copy.backToWork}
          </Link>
        }
        media={
          caseLogos[snapshot.slug] ? (
            <ListRowMedia
              fallback={snapshot.client.slice(0, 2).toUpperCase()}
              loading="eager"
              src={caseLogos[snapshot.slug]}
            />
          ) : null
        }
        title={snapshot.client}
        metadata={
          <>
            {snapshot.role}
            <span className="mx-2" aria-hidden="true">
              ·
            </span>
            {snapshot.timeline}
          </>
        }
        summary={snapshot.problem}
      />

      {/* What I did */}
      <section className="section">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">{proof.whatWeDidLabel}</h2>
        <p className="text-base text-muted-foreground max-w-2xl">{snapshot.whatWeDid}</p>
      </section>

      {/* Approach */}
      <section className="section gap-8">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">{copy.approachTitle}</h2>
        <ol className="flex flex-col gap-8">
          {snapshot.approach.map((step, index) => (
            <li key={step} className="grid gap-2 sm:grid-cols-[minmax(0,4rem)_1fr] sm:gap-8">
              <span className="text-sm text-muted-foreground tabular-nums">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="text-base text-foreground max-w-2xl">{step}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* Outcomes — pull quotes, not metric tiles */}
      <section className="section gap-10 md:gap-12">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">{proof.outcomeLabel}</h2>
        <div className="flex flex-col gap-12">
          {snapshot.outcomes.map((outcome) => (
            <div key={outcome.label} className="flex max-w-3xl flex-col gap-1">
              <p className="display-2 text-accent">{outcome.value}</p>
              <p className="text-base font-semibold text-foreground">{outcome.label}</p>
            </div>
          ))}
        </div>
      </section>

      <DetailNavigation
        ariaLabel="Case study navigation"
        previous={
          previous
            ? { label: "Previous case study", title: previous.client, to: `/work/${previous.slug}` }
            : null
        }
        next={
          next ? { label: "Next case study", title: next.client, to: `/work/${next.slug}` } : null
        }
      />

      {/* Close CTA */}
      <section className="section gap-6 border-b-0 py-16 md:py-20">
        <h2 className="display-2 text-foreground max-w-3xl">{copy.nextCta.title}</h2>
        <p className="text-base text-muted-foreground max-w-xl">{copy.nextCta.body}</p>
        <div className="flex flex-wrap items-center gap-6 pt-2">
          <Button asChild>
            <a href={BOOK_CALL_URL} target="_blank" rel="noreferrer">
              {t.common.bookCall}
            </a>
          </Button>
          <Link
            to="/services"
            prefetch="intent"
            className="text-sm text-foreground underline-offset-4 hover:underline"
          >
            {t.home.services.cta}
          </Link>
        </div>
      </section>
    </div>
  );
}
