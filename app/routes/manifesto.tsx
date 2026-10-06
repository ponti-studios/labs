import { RevealGroup, RevealItem } from "~/components/Reveal";
import { pageMeta } from "~/lib/seo";
import { t } from "~/translations";

const copy = t.manifesto;

export function meta() {
  return pageMeta({
    title: copy.meta.title,
    description: copy.meta.description,
    path: "/manifesto",
  });
}

export default function Manifesto() {
  return (
    <div className="page-shell">
      {/* Hero */}
      <section className="layout-stack">
        <h1 className="heading-hero text-foreground max-w-4xl">{copy.hero.title}</h1>
      </section>

      {/* Tenets: title left, argument right, one idea per row */}
      <section>
        <RevealGroup as="ol" className="flex flex-col">
          {copy.tenets.items.map((tenet) => (
            <RevealItem
              key={tenet.title}
              as="li"
              className="border-border grid gap-3 border-t py-7 last:pb-0 sm:gap-4 sm:py-10 lg:grid-cols-[14rem_1fr] lg:gap-16"
            >
              <h2 className="text-foreground text-2xl font-semibold tracking-tight">
                {tenet.title}
              </h2>
              <p className="text-foreground max-w-2xl text-base leading-relaxed sm:text-xl">
                {tenet.description}
              </p>
            </RevealItem>
          ))}
        </RevealGroup>
      </section>

      {/* Closing pull-quote: same inverted panel as the home page */}
      <section className="bg-foreground rounded-sm px-6 py-14 sm:px-12 md:py-20">
        <blockquote className="text-background max-w-4xl text-3xl leading-[1.1] font-semibold tracking-tight sm:text-4xl md:text-5xl">
          &ldquo;{copy.quote}&rdquo;
        </blockquote>
      </section>
    </div>
  );
}
