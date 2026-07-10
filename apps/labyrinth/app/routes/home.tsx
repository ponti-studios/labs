import { Button, ParticleBackground } from "@pontistudios/ui";
import { Check, X } from "lucide-react";
import { Link } from "react-router";
import { BOOK_CALL_URL } from "~/data/studio";
import { t } from "~/translations";

export function meta(): Array<{
  title?: string;
  name?: string;
  content?: string;
}> {
  return [{ title: t.home.meta.title }, { name: "description", content: t.home.meta.description }];
}

function SectionHeading({ title }: { title: string }) {
  return <h2 className="heading-2 text-foreground">{title}</h2>;
}

/** A single-line pointer to the page that actually owns this content — never a second copy of it. */
function Teaser({
  title,
  intro,
  cta,
  to,
}: {
  title: string;
  intro: string;
  cta: string;
  to: string;
}) {
  return (
    <div className="flex flex-col gap-3">
      <SectionHeading title={title} />
      <p className="body-2 text-muted-foreground max-w-xl">{intro}</p>
      <Link to={to} className="body-2 text-foreground w-fit underline-offset-4 hover:underline">
        {cta}
      </Link>
    </div>
  );
}

export default function Home() {
  return (
    <div className="relative flex w-full flex-col">
      <ParticleBackground />

      {/* Hero */}
      <section className="border-border/60 flex flex-col gap-6 border-b py-16">
        <h1 className="display-2 text-foreground max-w-3xl">{t.home.hero.title}</h1>
        <p className="body-1 text-muted-foreground max-w-xl italic">{t.home.hero.disclaimer}</p>
        <div className="flex flex-wrap gap-3 pt-2">
          <Button asChild size="lg">
            <a href={BOOK_CALL_URL} target="_blank" rel="noreferrer">
              {t.common.bookCall}
            </a>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/engage">{t.home.hero.seeServices}</Link>
          </Button>
        </div>
      </section>

      {/* Fit */}
      <section className="border-border/60 flex flex-col gap-6 border-b py-16">
        <div className="flex flex-col gap-2">
          <SectionHeading title={t.home.fit.title} />
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

      {/* What I do — full catalog lives on /engage, not here */}
      <section className="border-border/60 border-b py-16">
        <Teaser
          title={t.home.services.title}
          intro={t.home.services.intro}
          cta={t.home.services.cta}
          to="/engage"
        />
      </section>

      {/* Selected work — full case studies live on /work, not here */}
      <section className="border-border/60 border-b py-16">
        <Teaser
          title={t.home.work.title}
          intro={t.home.work.intro}
          cta={t.home.work.cta}
          to="/work"
        />
      </section>

      {/* How I think — full tenets live on /manifesto, not here */}
      <section className="border-border/60 border-b py-16">
        <Teaser
          title={t.home.principles.title}
          intro={t.home.principles.intro}
          cta={t.home.principles.cta}
          to="/manifesto"
        />
      </section>

      {/* Lab */}
      <section className="flex flex-col gap-4 py-16">
        <SectionHeading title={t.home.lab.title} />
        <p className="body-2 text-muted-foreground max-w-xl">{t.home.lab.description}</p>
        <div className="grid gap-8 sm:grid-cols-2">
          {t.home.lab.categories.map((cat) => (
            <div key={cat.name} className="space-y-4">
              <h3 className="heading-4 text-foreground">{cat.name}</h3>
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
