import { Button } from "@pontistudios/ui";
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

/** Points at the page that owns this content — never a second copy of it. */
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
    <div className="flex flex-col gap-4">
      <h2 className="heading-2 text-foreground">{title}</h2>
      <p className="body-1 text-muted-foreground max-w-2xl">{intro}</p>
      <Link to={to} className="body-2 text-foreground w-fit underline-offset-4 hover:underline">
        {cta}
      </Link>
    </div>
  );
}

export default function Home() {
  return (
    <div className="flex w-full flex-col">
      {/* Hero */}
      <section className="border-border/60 flex flex-col gap-6 border-b px-6 py-20 sm:px-10 sm:py-28">
        <h1 className="display-1 text-foreground max-w-4xl">{t.home.hero.title}</h1>
        <p className="body-1 text-muted-foreground max-w-2xl">{t.home.hero.disclaimer}</p>
        <div className="flex flex-wrap items-center gap-6 pt-2">
          <Button asChild size="lg">
            <a href={BOOK_CALL_URL} target="_blank" rel="noreferrer">
              {t.common.bookCall}
            </a>
          </Button>
          <Link
            to="/engage"
            className="body-2 text-foreground underline-offset-4 hover:underline"
          >
            {t.home.hero.seeServices}
          </Link>
        </div>
        <p className="body-2 text-muted-foreground max-w-2xl pt-2">{t.home.hero.credibility}</p>
      </section>

      {/* Fit — the filter, editorial two-column */}
      <section className="border-border/60 flex flex-col gap-10 border-b px-6 py-20 sm:px-10 sm:py-24">
        <div className="flex flex-col gap-3">
          <h2 className="heading-2 text-foreground">{t.home.fit.title}</h2>
          <p className="body-2 text-muted-foreground max-w-2xl">{t.home.fit.intro}</p>
        </div>
        <div className="grid gap-12 sm:grid-cols-2 sm:gap-16">
          <div className="flex flex-col gap-4">
            <h3 className="heading-4 text-accent">{t.home.fit.goodLabel}</h3>
            <ul className="flex flex-col gap-3">
              {t.home.fit.good.map((item) => (
                <li key={item} className="ui-dash-list-item">
                  <span className="ui-dash-marker">—</span>
                  <span className="body-2 text-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col gap-4">
            <h3 className="heading-4 text-muted-foreground">{t.home.fit.notLabel}</h3>
            <ul className="flex flex-col gap-3">
              {t.home.fit.notRight.map((item) => (
                <li key={item} className="ui-dash-list-item">
                  <span className="ui-dash-marker">—</span>
                  <span className="body-2 text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Teasers — full catalog / work / manifesto live on their own routes */}
      <section className="border-border/60 border-b px-6 py-16 sm:px-10 sm:py-20">
        <Teaser
          title={t.home.services.title}
          intro={t.home.services.intro}
          cta={t.home.services.cta}
          to="/engage"
        />
      </section>

      <section className="border-border/60 border-b px-6 py-16 sm:px-10 sm:py-20">
        <Teaser
          title={t.home.work.title}
          intro={t.home.work.intro}
          cta={t.home.work.cta}
          to="/work"
        />
      </section>

      <section className="border-border/60 border-b px-6 py-16 sm:px-10 sm:py-20">
        <Teaser
          title={t.home.principles.title}
          intro={t.home.principles.intro}
          cta={t.home.principles.cta}
          to="/manifesto"
        />
      </section>

      {/* Lab — personal side projects, quieter closing band */}
      <section className="flex flex-col gap-10 px-6 py-20 sm:px-10 sm:py-24">
        <div className="flex flex-col gap-3">
          <h2 className="heading-2 text-foreground">{t.home.lab.title}</h2>
          <p className="body-2 text-muted-foreground max-w-2xl">{t.home.lab.description}</p>
        </div>
        <div className="grid gap-12 sm:grid-cols-2 sm:gap-16">
          {t.home.lab.categories.map((cat) => (
            <div key={cat.name} className="flex flex-col gap-4">
              <h3 className="heading-4 text-accent">{cat.name}</h3>
              <ul className="flex flex-col gap-2">
                {cat.entries.map((entry) => (
                  <li key={entry.path}>
                    <a
                      href={entry.path}
                      title={
                        "source" in entry ? `${t.home.lab.sourcePrefix} ${entry.source}` : undefined
                      }
                      className="body-2 text-foreground hover:text-muted-foreground underline-offset-4 hover:underline focus-visible:outline-ring rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4"
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
