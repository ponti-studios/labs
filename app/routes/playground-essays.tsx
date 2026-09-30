import { Link } from "react-router";
import { RevealGroup, RevealItem } from "~/components/Reveal";
import { t } from "~/translations";

const copy = t.playgroundEssays;

export function meta(): Array<{
  title?: string;
  name?: string;
  content?: string;
}> {
  return [{ title: copy.meta.title }, { name: "description", content: copy.meta.description }];
}

export default function PlaygroundEssays() {
  return (
    <div className="page-shell">
      {/* Hero */}
      <section className="layout-stack">
        <p className="ui-eyebrow">{copy.hero.eyebrow}</p>
        <h1 className="heading-hero text-foreground max-w-4xl">{copy.hero.title}</h1>
        <p className="text-muted-foreground max-w-2xl text-lg leading-relaxed">{copy.hero.dek}</p>
      </section>

      {/* Table of contents */}
      <nav className="flex flex-wrap gap-2 px-4 md:px-6" aria-label="Jump to an essay">
        {copy.entries.map((entry) => (
          <a
            key={entry.slug}
            href={`#${entry.slug}`}
            className="border-border text-muted-foreground hover:text-accent hover:border-accent/50 rounded-md border px-3 py-1.5 font-mono text-xs tracking-wide uppercase transition-colors"
          >
            {entry.title.split(" ").slice(0, 2).join(" ")}
          </a>
        ))}
      </nav>

      {/* Essays */}
      <section className="section gap-10">
        <RevealGroup as="ol" className="flex flex-col">
          {copy.entries.map((entry) => (
            <RevealItem
              key={entry.slug}
              as="li"
              id={entry.slug}
              className="border-border scroll-mt-24 border-t py-10 first:border-t-0 first:pt-0"
            >
              <div className="flex max-w-3xl flex-col gap-3">
                <p className="ref-tag">
                  Specimen — {entry.specimen}
                  <br />
                  Medium — {entry.medium}
                </p>
                <h2 className="font-serif text-2xl italic sm:text-3xl">{entry.title}</h2>
                <div className="flex flex-col gap-4">
                  {entry.paragraphs.map((paragraph) => (
                    <p
                      key={paragraph.slice(0, 32)}
                      className="text-muted-foreground text-base leading-relaxed"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
                <Link
                  to={entry.specimen}
                  prefetch="intent"
                  className="text-accent press w-fit text-sm underline underline-offset-4"
                >
                  Open the experiment →
                </Link>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </section>
    </div>
  );
}
