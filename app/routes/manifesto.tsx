import { RevealGroup, RevealItem } from "~/components/Reveal";
import { t } from "~/translations";

const copy = t.manifesto;

export function meta(): Array<{
  title?: string;
  name?: string;
  content?: string;
}> {
  return [{ title: copy.meta.title }, { name: "description", content: copy.meta.description }];
}

export default function Manifesto() {
  return (
    <div className="page-shell">
      {/* Hero */}
      <section className="layout-stack">
        <h1 className="heading-hero text-foreground max-w-4xl">{copy.hero.title}</h1>
      </section>

      {/* Tenets — single-column editorial list, one idea at a time */}
      <section className="section gap-10">
        <RevealGroup as="ol" className="flex flex-col">
          {copy.tenets.items.map((tenet, index) => (
            <RevealItem
              key={tenet.title}
              as="li"
              className="border-border grid gap-3 border-t py-8 first:pt-0 sm:grid-cols-[minmax(0,4rem)_1fr] sm:gap-10"
            >
              <span className="ref-tag pt-1">{String(index + 1).padStart(2, "0")}</span>
              <div className="flex max-w-3xl flex-col gap-2.5">
                <h2 className="text-foreground sm:text-2xl">{tenet.title}</h2>
                <p className="text-muted-foreground text-base leading-relaxed">
                  {tenet.description}
                </p>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </section>

      {/* Closing pull-quote */}
      <section className="section-compact border-b-0 px-4 py-20 text-center sm:px-6 md:py-28">
        <blockquote className="text-accent mx-auto max-w-3xl font-serif text-4xl leading-[1.05] italic sm:text-5xl md:text-6xl">
          &ldquo;{copy.quote}&rdquo;
        </blockquote>
      </section>
    </div>
  );
}
