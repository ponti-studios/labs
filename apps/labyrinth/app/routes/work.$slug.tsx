import { Button } from "@pontistudios/ui";
import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { Link, useLoaderData } from "react-router";
import { BOOK_CALL_URL, caseSnapshots } from "~/data/studio";
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

  return (
    <div className="flex w-full flex-col">
      {/* Hero */}
      <section className="border-border/60 flex flex-col gap-6 border-b px-6 py-20">
        <Link
          to="/work"
          className="body-3 text-muted-foreground hover:text-foreground w-fit underline-offset-4 hover:underline"
        >
          ← {copy.backToWork}
        </Link>
        <h1 className="display-1 text-foreground max-w-4xl">{snapshot.client}</h1>
        <p className="body-2 text-muted-foreground max-w-2xl">
          {snapshot.industry}
          <span className="text-muted-foreground/50 mx-2" aria-hidden="true">
            ·
          </span>
          {snapshot.role}
          <span className="text-muted-foreground/50 mx-2" aria-hidden="true">
            ·
          </span>
          {snapshot.timeline}
        </p>
        <p className="body-1 text-foreground max-w-2xl">{snapshot.problem}</p>
      </section>

      {/* What I did */}
      <section className="border-border/60 flex flex-col gap-4 border-b px-6 py-16">
        <h2 className="heading-2 text-foreground">{proof.whatWeDidLabel}</h2>
        <p className="body-1 text-muted-foreground max-w-2xl">{snapshot.whatWeDid}</p>
      </section>

      {/* Approach */}
      <section className="border-border/60 flex flex-col gap-10 border-b px-6 py-16">
        <h2 className="heading-2 text-foreground">{copy.approachTitle}</h2>
        <ol className="flex flex-col gap-8">
          {snapshot.approach.map((step, index) => (
            <li key={step} className="grid gap-2 sm:grid-cols-[minmax(0,4rem)_1fr] sm:gap-8">
              <span className="body-2 text-muted-foreground tabular-nums">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="body-1 text-foreground max-w-2xl">{step}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* Outcomes — pull quotes, not metric tiles */}
      <section className="border-border/60 flex flex-col gap-12 border-b px-6 py-16">
        <h2 className="heading-2 text-foreground">{proof.outcomeLabel}</h2>
        <div className="flex flex-col gap-12">
          {snapshot.outcomes.map((outcome) => (
            <div key={outcome.label} className="flex max-w-3xl flex-col gap-1">
              <p className="display-2 text-accent">{outcome.value}</p>
              <p className="heading-4 text-foreground">{outcome.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Close CTA */}
      <section className="flex flex-col gap-6 px-6 py-20">
        <h2 className="display-2 text-foreground max-w-3xl">{copy.nextCta.title}</h2>
        <p className="body-1 text-muted-foreground max-w-xl">{copy.nextCta.body}</p>
        <div className="flex flex-wrap items-center gap-6 pt-2">
          <Button asChild size="lg">
            <a href={BOOK_CALL_URL} target="_blank" rel="noreferrer">
              {t.common.bookCall}
            </a>
          </Button>
          <Link
            to="/services"
            className="body-2 text-foreground underline-offset-4 hover:underline"
          >
            {t.home.services.cta}
          </Link>
        </div>
      </section>
    </div>
  );
}
