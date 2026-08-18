import { Button } from "@ponti-studios/ui/primitives";
import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { Link, useLoaderData } from "react-router";
import { DetailNavigation } from "~/components/DetailPage";
import { Kicker } from "~/components/Kicker";
import { BOOK_CALL_URL, caseSnapshots, type CaseStat } from "~/data/studio";
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
  const [firstOutcome, secondOutcome] = snapshot.outcomes;

  return (
    <div className="page-bleed">
      {/* Hero */}
      <section className="section pt-14 pb-0 md:pt-20">
        <Link
          to="/work"
          prefetch="intent"
          className="text-muted-foreground hover:text-foreground mb-6 inline-block min-h-11 w-fit content-center text-sm outline-none"
        >
          ← {copy.backToWork}
        </Link>
        <Kicker>
          {copy.caseStudyLabel} · {snapshot.industry}
        </Kicker>
        <h1 className="text-foreground max-w-3xl text-6xl leading-[.85] font-black tracking-tighter sm:text-7xl md:text-8xl">
          {snapshot.client}
        </h1>

        <div className="mt-12 grid gap-8 md:grid-cols-[1.25fr_.75fr] md:items-end">
          <p className="text-foreground max-w-2xl text-2xl leading-tight tracking-tight sm:text-3xl md:text-4xl">
            {snapshot.problem}
          </p>
          <div className="border-border grid grid-cols-2 gap-5 border-t pt-4">
            <div>
              <small className="text-muted-foreground mb-1.5 block text-[11px] font-black tracking-wide uppercase">
                {copy.roleLabel}
              </small>
              <div className="text-sm leading-relaxed">{snapshot.role}</div>
            </div>
            <div>
              <small className="text-muted-foreground mb-1.5 block text-[11px] font-black tracking-wide uppercase">
                {copy.timelineLabel}
              </small>
              <div className="text-sm leading-relaxed">{snapshot.timeline}</div>
            </div>
          </div>
        </div>

        <div className="bg-accent mt-10 grid gap-6 rounded-[28px] p-7 text-[#15110f] sm:p-10 md:grid-cols-[1.2fr_.8fr] md:items-end">
          <div className="text-3xl leading-[.98] font-black tracking-tight sm:text-4xl md:text-5xl">
            {snapshot.description}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[firstOutcome, secondOutcome].filter((o): o is CaseStat => Boolean(o)).map((outcome) => (
              <div key={outcome.label} className="min-h-[110px] rounded-2xl border border-[#11110f]/28 p-4">
                <b className="block text-3xl tracking-tight">{outcome.value}</b>
                <span className="mt-2 block text-[11px] font-black tracking-wide uppercase">
                  {outcome.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What we did */}
      <section className="section grid gap-8 md:grid-cols-[.6fr_1.4fr]">
        <div className="ui-eyebrow">
          01 / {proof.whatWeDidLabel}
        </div>
        <p className="text-foreground max-w-3xl text-2xl leading-snug tracking-tight sm:text-3xl">
          {snapshot.whatWeDid}
        </p>
      </section>

      {/* Approach — dark panel, always dark regardless of system theme */}
      <section className="section">
        <div className="rounded-[28px] bg-[#171714] px-6 py-12 text-white sm:px-10 md:py-16">
          <div className="ui-eyebrow text-[#aaa79f]">
            02 / {copy.approachTitle}
          </div>

          <div className="mt-8 grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-px overflow-hidden rounded-[22px] bg-[#373731]">
            {snapshot.approach.map((step, index) => (
              <div key={step} className="min-h-[220px] bg-[#1e1e1a] p-6">
                <div className="mb-14 text-xs font-black text-[#aaa79f]">
                  {String(index + 1).padStart(2, "0")}
                </div>
                <p className="text-sm leading-relaxed text-[#d8d5cd]">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pullquote */}
      <section className="section-compact py-20 text-center md:py-28">
        <p className="text-accent mx-auto max-w-4xl text-4xl leading-[.98] font-black tracking-tighter sm:text-5xl md:text-6xl">
          “{t.manifesto.quote}”
        </p>
      </section>

      {/* Outcome */}
      <section className="section">
        <div className="ui-eyebrow mb-8">
          03 / {proof.outcomeLabel}
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {snapshot.outcomes.map((outcome) => (
            <div key={outcome.label} className="border-foreground border-t-[3px] pt-5">
              <b className="text-foreground mb-1.5 block text-4xl tracking-tight sm:text-5xl">
                {outcome.value}
              </b>
              <p className="text-muted-foreground leading-relaxed">{outcome.label}</p>
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
      <section className="section-compact border-border border-t border-b py-20 text-center md:py-28">
        <h2 className="text-foreground mx-auto mb-5 max-w-3xl text-4xl leading-[.95] font-semibold tracking-tighter sm:text-5xl md:text-6xl">
          {copy.nextCta.title}
        </h2>
        <p className="text-muted-foreground mx-auto mb-7 max-w-xl text-lg leading-relaxed">
          {copy.nextCta.body}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-6">
          <Button asChild size="lg" className="rounded-full px-6">
            <a href={BOOK_CALL_URL} target="_blank" rel="noreferrer">
              {t.common.bookCall}
            </a>
          </Button>
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
