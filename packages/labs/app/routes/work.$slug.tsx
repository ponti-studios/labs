import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { Link, useLoaderData } from "react-router";
import { BookCallButton } from "~/components/BookCallButton";
import { RevealGroup, RevealItem } from "~/components/Reveal";
import { caseLogos, caseSnapshots } from "~/data/studio";
import { t } from "~/translations";

const copy = t.work;

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
  const logo = caseLogos[snapshot.slug];

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-16">
      {/* Hero */}
      <section>
        <Link
          to="/work"
          prefetch="intent"
          className="text-muted-foreground hover:text-foreground mb-10 inline-block min-h-11 w-fit content-center text-sm outline-none"
        >
          ← {copy.backToWork}
        </Link>

        <div className="flex items-center gap-4">
          {logo ? (
            <div className="rounded-lg bg-white p-2">
              <img
                src={logo}
                alt={`${snapshot.client} logo`}
                className="size-10 shrink-0 object-contain grayscale"
              />
            </div>
          ) : null}
          <h1 className="text-4xl font-medium tracking-tight sm:text-5xl">{snapshot.client}</h1>
        </div>

        <p className="text-muted-foreground mt-2 max-w-fit rounded-full px-4 py-1 text-sm shadow">
          {snapshot.industry}
        </p>

        <dl className="border-border text-muted-foreground mt-10 flex flex-wrap gap-x-10 gap-y-2 border-t border-b py-4 text-sm">
          <div className="flex gap-2">
            <dt className="uppercase">{copy.roleLabel}</dt>
            <dd className="text-foreground">{snapshot.role}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="uppercase">{copy.timelineLabel}</dt>
            <dd className="text-foreground">{snapshot.timeline}</dd>
          </div>
        </dl>
      </section>

      {/* Problem */}
      <section>
        <h2 className="text-muted-foreground mb-3 text-xs font-medium tracking-wide uppercase">
          {copy.problemTitle}
        </h2>
        <p className="text-foreground text-2xl leading-snug font-normal tracking-tight sm:text-3xl">
          {snapshot.problem}
        </p>
      </section>

      {/* Approach */}
      <section>
        <h2 className="text-muted-foreground mb-3 text-xs font-medium tracking-wide uppercase">
          {copy.approachTitle}
        </h2>
        <p className="text-muted-foreground mb-8 text-lg leading-relaxed">{snapshot.whatWeDid}</p>
        <RevealGroup as="ol" className="border-border divide-border divide-y border-t">
          {snapshot.approach.map((step, index) => (
            <RevealItem key={step} as="li" className="flex items-baseline gap-6 py-5 first:pt-0">
              <span className="text-muted-foreground font-mono text-xs">
                {String(index + 1).padStart(2, "0")}
              </span>
              <p className="text-foreground leading-relaxed">{step}</p>
            </RevealItem>
          ))}
        </RevealGroup>
      </section>

      {/* Outcomes */}
      <section className="border-border border-t pt-10">
        <RevealGroup className="border-border divide-border divide-y border-b">
          {snapshot.outcomes.map((outcome) => (
            <RevealItem
              key={outcome.label}
              className="flex items-baseline justify-between gap-6 py-5 first:pt-0"
            >
              <b className="text-foreground text-3xl tracking-tight sm:text-4xl">{outcome.value}</b>
              <p className="text-muted-foreground text-right text-sm leading-relaxed">
                {outcome.label}
              </p>
            </RevealItem>
          ))}
        </RevealGroup>
      </section>

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
