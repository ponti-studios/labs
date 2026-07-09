import { Link } from "react-router";
import { Button } from "@pontistudios/ui";
import { BOOK_CALL_URL, CONTACT_EMAIL, formatMinPrice, servicePillars } from "~/data/studio";
import { t } from "~/translations";

export function meta(): Array<{
  title?: string;
  name?: string;
  content?: string;
}> {
  return [
    { title: t.services.meta.title },
    { name: "description", content: t.services.meta.description },
  ];
}

export default function Services() {
  return (
    <div className="flex w-full flex-col">
      <section className="border-border/60 flex flex-col gap-6 border-b py-16 sm:py-20">
        <span className="ui-eyebrow">{t.services.eyebrow}</span>
        <h1 className="display-2 text-foreground max-w-3xl">{t.services.title}</h1>
        <p className="body-1 text-muted-foreground max-w-2xl">
          {t.services.introPillarsPrefix} <strong className="text-foreground">{t.common.pillars.product}</strong>{" "}
          {t.services.introPillarsAnd} <strong className="text-foreground">{t.common.pillars.content}</strong>.{" "}
          {t.services.introPillarsSuffix}
        </p>
        <p className="body-2 text-muted-foreground max-w-2xl">
          {t.services.introRanges}{" "}
          <Link to="/pricing" className="text-foreground underline-offset-4 hover:underline">
            {t.services.pricingLink}
          </Link>
          .
        </p>
      </section>

      {servicePillars.map((pillar) => (
        <section key={pillar.name} className="border-border/60 border-b py-16">
          <h2 className="heading-2 text-foreground mb-10">{pillar.name}</h2>
          <div className="flex flex-col gap-14">
            {pillar.services.map((service) => (
              <div key={service.slug} id={service.slug} className="grid gap-6 sm:grid-cols-[1fr_1fr]">
                <div className="flex flex-col gap-3">
                  <h3 className="heading-3 text-foreground">{service.name}</h3>
                  <p className="body-2 text-muted-foreground">{service.problem}</p>
                  <p className="body-2 text-muted-foreground">{service.description}</p>
                </div>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <span className="ui-eyebrow">{t.services.whatYouGet}</span>
                    <ul className="flex flex-col gap-1.5">
                      {service.deliverables.map((item) => (
                        <li key={item} className="ui-dash-list-item">
                          <span className="ui-dash-marker">—</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="ui-eyebrow">{t.services.bestFor}</span>
                    <p className="body-3 text-muted-foreground">{service.bestFor}</p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="ui-eyebrow">{t.services.investment}</span>
                    <p className="body-2 text-foreground">
                      {t.common.startingAt} {formatMinPrice(service.minPrice)} · {service.unit}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}

      <section className="flex flex-col gap-6 py-16">
        <h2 className="heading-2 text-foreground">{t.services.readyTitle}</h2>
        <div className="flex flex-wrap items-center gap-4">
          <Button asChild size="lg">
            <a href={BOOK_CALL_URL} target="_blank" rel="noreferrer">
              {t.common.bookCall}
            </a>
          </Button>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="body-2 text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
          >
            {CONTACT_EMAIL}
          </a>
        </div>
      </section>
    </div>
  );
}
