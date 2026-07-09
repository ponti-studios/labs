import { Button, ParticleBackground } from "@pontistudios/ui";
import { Check, X } from "lucide-react";
import { Link } from "react-router";
import { Founder } from "~/components/studio/founder";
import { BOOK_CALL_URL, servicePillars } from "~/data/studio";
import { t } from "~/translations";

export function meta(): Array<{
  title?: string;
  name?: string;
  content?: string;
}> {
  return [{ title: t.home.meta.title }, { name: "description", content: t.home.meta.description }];
}

function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="ui-eyebrow">{eyebrow}</span>
      <h2 className="heading-2 text-foreground">{title}</h2>
    </div>
  );
}

export default function Home() {
  return (
    <div className="relative flex w-full flex-col">
      <ParticleBackground />

      {/* Hero */}
      <section className="border-border/60 flex flex-col gap-6 border-b py-16">
        <span className="ui-eyebrow">{t.home.hero.eyebrow}</span>
        <h1 className="display-2 text-foreground max-w-3xl">{t.home.hero.title}</h1>
        <p className="body-1 text-muted-foreground max-w-xl italic">{t.home.hero.disclaimer}</p>
        <div className="flex flex-wrap gap-3 pt-2">
          <Button asChild size="lg">
            <a href={BOOK_CALL_URL} target="_blank" rel="noreferrer">
              {t.common.bookCall}
            </a>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/services">{t.home.hero.seeServices}</Link>
          </Button>
        </div>
      </section>

      {/* Fit */}
      <section className="border-border/60 flex flex-col gap-6 border-b py-16">
        <div className="flex flex-col gap-2">
          <SectionHeading eyebrow={t.home.fit.eyebrow} title={t.home.fit.title} />
          <p className="body-2 text-muted-foreground max-w-xl">{t.home.fit.intro}</p>
        </div>
        <div className="grid gap-8 sm:grid-cols-2">
          <div className="flex flex-col gap-3">
            <span className="body-2 text-success font-medium">{t.home.fit.goodLabel}</span>
            <ul className="flex flex-col gap-2">
              {t.home.fit.good.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <Check className="text-success mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  <span className="body-2 text-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col gap-3">
            <span className="body-2 text-destructive font-medium">{t.home.fit.notLabel}</span>
            <ul className="flex flex-col gap-2">
              {t.home.fit.notRight.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <X className="text-destructive mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  <span className="body-2 text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="border-border/60 flex flex-col gap-4 border-b py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading eyebrow={t.home.services.eyebrow} title={t.home.services.title} />
          <Link
            to="/services"
            className="body-2 text-foreground underline-offset-4 hover:underline"
          >
            {t.home.services.cta}
          </Link>
        </div>
        <div className="grid gap-8 sm:grid-cols-3">
          {servicePillars.map((pillar) => (
            <div key={pillar.name} className="flex flex-col gap-3">
              <h3 className="heading-4 text-foreground">{pillar.name}</h3>
              <ul className="flex flex-col gap-2">
                {pillar.services.map((service) => (
                  <li key={service.slug} className="body-3 text-muted-foreground">
                    {service.name}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Selected work */}
      <section className="border-border/60 flex flex-col gap-4 border-b py-16">
        <SectionHeading eyebrow={t.home.work.eyebrow} title={t.home.work.title} />
        <ul className="grid gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
          {t.home.work.items.map((work) => (
            <li
              key={work.name}
              className="border-border/40 flex items-baseline justify-between gap-4 border-b py-2"
            >
              <span className="body-2 text-foreground">{work.name}</span>
              <span className="body-4 text-muted-foreground">{work.category}</span>
            </li>
          ))}
        </ul>
      </section>

      <Founder />

      {/* Principles */}
      <section className="border-border/60 flex flex-col gap-4 border-b py-16">
        <SectionHeading eyebrow={t.home.principles.eyebrow} title={t.home.principles.title} />
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {t.home.principles.items.map((principle) => (
            <div key={principle.name} className="flex flex-col gap-2">
              <h3 className="subheading-3 text-foreground">{principle.name}</h3>
              <p className="body-3 text-muted-foreground">{principle.description}</p>
            </div>
          ))}
        </div>
        <Link to="/manifesto" className="body-2 text-foreground underline-offset-4 hover:underline">
          {t.home.principles.cta}
        </Link>
      </section>

      {/* Process teaser */}
      <section className="border-border/60 flex flex-wrap items-end justify-between gap-4 border-b py-16">
        <SectionHeading eyebrow={t.home.process.eyebrow} title={t.home.process.title} />
        <Link to="/process" className="body-2 text-foreground underline-offset-4 hover:underline">
          {t.home.process.cta}
        </Link>
      </section>

      {/* Lab */}
      <section className="flex flex-col gap-4 py-16">
        <SectionHeading eyebrow={t.home.lab.eyebrow} title={t.home.lab.title} />
        <p className="body-2 text-muted-foreground max-w-xl">{t.home.lab.description}</p>
        <div className="grid gap-8 sm:grid-cols-2">
          {t.home.lab.categories.map((cat) => (
            <div key={cat.name} className="space-y-4">
              <h3 className="ui-eyebrow">{cat.name}</h3>
              <ul className="flex flex-col gap-2">
                {cat.entries.map((entry) => (
                  <li key={entry.path}>
                    <a
                      href={entry.path}
                      title={
                        "source" in entry ? `${t.home.lab.sourcePrefix} ${entry.source}` : undefined
                      }
                      className="hover:bg-muted hover:text-foreground focus-visible:text-foreground focus-visible:outline-ring rounded-md transition-colors duration-100 focus-visible:outline-1 focus-visible:outline-offset-4"
                    >
                      {entry.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
