import { Button } from "@ponti-studios/ui/primitives";
import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { Link, useLoaderData } from "react-router";
import { CARD_THEMES } from "~/components/projects/card-themes";
import { RevealGroup, RevealItem } from "~/components/Reveal";
import { BOOK_CALL_URL, caseLogos, caseSnapshots } from "~/data/studio";
import { clientThemeBySlug } from "~/lib/client-cards";
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
  const themeTokens = CARD_THEMES[clientThemeBySlug(snapshot.slug)];
  const logo = caseLogos[snapshot.slug];

  return (
    <div className="page-shell">
      {/* Hero */}
      <section className="layout-stack">
        <Link
          to="/work"
          prefetch="intent"
          className="text-muted-foreground hover:text-foreground mb-6 inline-block min-h-11 w-fit content-center text-sm outline-none"
        >
          ← {copy.backToWork}
        </Link>

        <div
          className="relative overflow-hidden rounded-[32px] border border-white/10 p-8 sm:p-12"
          style={{ background: themeTokens.background }}
        >
          <div className="relative z-10 flex flex-col gap-4">
            <span
              className="inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-wide uppercase"
              style={{
                backgroundColor: `color-mix(in oklab, ${themeTokens.accent} 18%, transparent)`,
                color: themeTokens.accent,
              }}
            >
              {snapshot.industry}
            </span>
            <div className="flex flex-wrap items-center gap-5">
              {logo ? (
                <img
                  src={logo}
                  alt={`${snapshot.client} logo`}
                  className="size-14 shrink-0 rounded-2xl bg-white/90 object-contain p-2 sm:size-16"
                />
              ) : null}
              <h1
                className="text-4xl font-black tracking-tight sm:text-6xl md:text-7xl"
                style={{ color: themeTokens.foreground }}
              >
                {snapshot.client}
              </h1>
            </div>
          </div>
        </div>

        <div className="border-border mt-12 flex flex-col gap-6 border-t pt-8">
          <div className="text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs tracking-wide">
            <span>
              <span className="uppercase">{copy.roleLabel}</span>{" "}
              <span className="text-foreground">{snapshot.role}</span>
            </span>
            <span aria-hidden="true">·</span>
            <span>
              <span className="uppercase">{copy.timelineLabel}</span>{" "}
              <span className="text-foreground">{snapshot.timeline}</span>
            </span>
          </div>
          <p className="text-foreground max-w-3xl text-3xl leading-[1.15] font-semibold tracking-tight sm:text-4xl md:text-5xl">
            {snapshot.problem}
          </p>
          <p className="text-muted-foreground max-w-2xl text-lg leading-relaxed">
            {snapshot.description}
          </p>
        </div>
      </section>

      {/* Approach */}
      <section className="section">
        <p className="text-foreground mb-8 max-w-3xl text-2xl leading-snug tracking-tight sm:text-3xl">
          {snapshot.whatWeDid}
        </p>
        <RevealGroup className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-px overflow-hidden rounded-lg bg-[#171714] text-white">
          {snapshot.approach.map((step, index) => (
            <RevealItem key={step} className="min-h-[220px] bg-[#1e1e1a] p-6">
              <div className="mb-14 text-xs font-black text-[#aaa79f]">
                {String(index + 1).padStart(2, "0")}
              </div>
              <p className="text-sm leading-relaxed text-[#d8d5cd]">{step}</p>
            </RevealItem>
          ))}
        </RevealGroup>
      </section>

      {/* Outcomes */}
      <section className="section">
        <RevealGroup className="grid gap-3 sm:grid-cols-3">
          {snapshot.outcomes.map((outcome) => (
            <RevealItem
              key={outcome.label}
              className="border-t-[3px] pt-5"
              style={{ borderColor: themeTokens.accent }}
            >
              <b className="text-foreground mb-1.5 block text-4xl tracking-tight sm:text-5xl">
                {outcome.value}
              </b>
              <p className="text-muted-foreground leading-relaxed">{outcome.label}</p>
            </RevealItem>
          ))}
        </RevealGroup>
      </section>

      {/* Close CTA */}
      <section className="section-compact py-20 text-center md:py-28">
        <h2 className="heading-cta text-foreground mx-auto mb-5 max-w-3xl">{copy.nextCta.title}</h2>
        <p className="text-muted-foreground mx-auto mb-7 max-w-xl text-lg leading-relaxed">
          {copy.nextCta.body}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-6">
          <Button asChild size="lg" className="press rounded-full px-6">
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
