import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { Link, useLoaderData } from "react-router";
import { BookCallButton } from "~/components/BookCallButton";
import { RevealGroup, RevealItem } from "~/components/Reveal";
import { CaseTile } from "~/components/work/case-tile";
import { pageMeta } from "~/lib/seo";
import { caseLogos, caseSnapshots } from "~/data/studio";
import { t } from "~/translations";

const copy = t.work;

// Static class names so Tailwind can see them.
const OUTCOME_COLUMNS: Record<number, string> = {
  1: "lg:grid-cols-1",
  2: "lg:grid-cols-2",
  3: "lg:grid-cols-3",
  4: "lg:grid-cols-4",
};

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
  const columns = OUTCOME_COLUMNS[Math.min(snapshot.outcomes.length, 4)] ?? "lg:grid-cols-3";

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-20 pt-8 pb-24 sm:gap-28">
      {/* Hero */}
      <section>
        <Link
          to="/work"
          prefetch="intent"
          aria-label={copy.backToWork}
          className="text-muted-foreground hover:text-foreground inline-flex min-h-11 w-fit items-center font-mono text-xl outline-none"
        >
          ←
        </Link>

        <div className="mt-8 flex flex-wrap items-center gap-5">
          {logo ? (
            <span className="border-border rounded-sm border bg-white p-2">
              <img
                src={logo}
                alt={`${snapshot.client} logo`}
                className="size-12 shrink-0 object-contain grayscale"
              />
            </span>
          ) : null}
          <h1 className="text-foreground text-5xl font-semibold tracking-tight sm:text-7xl">
            {snapshot.client}
          </h1>
        </div>

        <p className="text-muted-foreground mt-5 text-lg">
          {snapshot.industry} · {snapshot.role} · {snapshot.timeline}
        </p>
      </section>

      {/* Outcomes lead: proof before story */}
      <section aria-label={snapshot.client}>
        <RevealGroup
          className={`border-border divide-border grid divide-y border-y lg:divide-x lg:divide-y-0 ${columns}`}
        >
          {snapshot.outcomes.map((outcome) => (
            <RevealItem
              key={outcome.label}
              className="flex items-baseline justify-between gap-6 py-6 lg:flex-col lg:items-start lg:justify-start lg:gap-3 lg:px-8 lg:py-10 lg:first:pl-0"
            >
              <b className="text-foreground text-4xl font-semibold tracking-tight tabular-nums sm:text-5xl lg:text-6xl">
                {outcome.value}
              </b>
              <p className="text-muted-foreground max-w-[28ch] text-right text-sm leading-snug lg:text-left">
                {outcome.label}
              </p>
            </RevealItem>
          ))}
        </RevealGroup>
      </section>

      {/* Problem */}
      <section className="grid gap-6 lg:grid-cols-[14rem_1fr] lg:gap-16">
        <h2 className="text-foreground self-start lg:sticky lg:top-24">{copy.problemTitle}</h2>
        <p className="text-foreground text-2xl leading-snug font-medium tracking-tight sm:text-3xl">
          {snapshot.problem}
        </p>
      </section>

      {/* Approach */}
      <section className="grid gap-6 lg:grid-cols-[14rem_1fr] lg:gap-16">
        <h2 className="text-foreground self-start lg:sticky lg:top-24">{copy.approachTitle}</h2>
        <div>
          <p className="text-muted-foreground mb-10 text-lg leading-relaxed">
            {snapshot.whatWeDid}
          </p>
          <RevealGroup as="ol" className="border-border divide-border divide-y border-t">
            {snapshot.approach.map((step, index) => (
              <RevealItem key={step} as="li" className="flex items-baseline gap-6 py-5">
                <span className="text-muted-foreground font-mono text-xs">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className="text-foreground text-lg leading-relaxed">{step}</p>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* Next case */}
      <section className="border-border grid gap-6 border-t pt-12 lg:grid-cols-[14rem_1fr] lg:gap-16">
        <h2 className="text-foreground self-start">{copy.nextCase}</h2>
        <CaseTile snapshot={next} className="max-w-md" />
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
