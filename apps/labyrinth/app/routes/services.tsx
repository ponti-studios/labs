import { useEffect, useState } from "react";
import { useLocation } from "react-router";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Button,
} from "@pontistudios/ui";
import { ContactCta } from "~/components/studio/contact-cta";
import { BOOK_CALL_URL, caseSnapshots, servicePillars, trustNames } from "~/data/studio";
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

const hero = t.services.hero;
const overview = t.services.overview;
const engagementTypes = t.services.engagementTypes;
const proof = t.services.proof;
const scope = t.services.scope;
const faqs = t.services.faqs;

const ALL_SERVICE_SLUGS = servicePillars.flatMap((pillar) =>
  pillar.services.map((service) => service.slug),
);

function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="ui-eyebrow">{eyebrow}</span>
      <h2 className="heading-2 text-foreground">{title}</h2>
    </div>
  );
}

export default function Services() {
  const location = useLocation();
  const [openServices, setOpenServices] = useState<string[]>([]);

  useEffect(() => {
    const slug = location.hash.replace(/^#/, "");
    if (slug && ALL_SERVICE_SLUGS.includes(slug)) {
      setOpenServices((prev) => (prev.includes(slug) ? prev : [...prev, slug]));
    }
  }, [location.hash]);

  return (
    <div className="flex w-full flex-col">
      {/* 1. Hero */}
      <section className="border-border/60 flex flex-col gap-6 border-b py-16">
        <span className="ui-eyebrow">{hero.eyebrow}</span>
        <h1 className="display-2 text-foreground max-w-3xl">{hero.title}</h1>
        <p className="body-1 text-muted-foreground max-w-2xl">
          {hero.introPillarsPrefix}{" "}
          <strong className="text-foreground">{t.common.pillars.product}</strong>{" "}
          {hero.introPillarsAnd}{" "}
          <strong className="text-foreground">{t.common.pillars.content}</strong>.{" "}
          {hero.introPillarsSuffix}
        </p>
        <p className="body-2 text-muted-foreground max-w-2xl">{hero.introScope}</p>
        <p className="body-2 text-foreground max-w-2xl">{hero.proofLine}</p>
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <Button asChild size="lg">
            <a href={BOOK_CALL_URL} target="_blank" rel="noreferrer">
              {t.common.bookCall}
            </a>
          </Button>
          <Button asChild variant="outline" size="lg">
            <a href="#services-overview">{hero.seeServices}</a>
          </Button>
          <a
            href="#engagement"
            className="body-2 text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
          >
            {hero.seeEngagement}
          </a>
        </div>
      </section>

      {/* 2. Trust strip */}
      <section className="border-border/60 flex flex-col gap-4 border-b py-12">
        <span className="ui-eyebrow">{t.services.trust.eyebrow}</span>
        <ul className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
          {trustNames.map((name) => (
            <li key={name} className="body-2 text-foreground">
              {name}
            </li>
          ))}
        </ul>
      </section>

      {/* 3. Services — scan, expand only for includes */}
      <section id="services-overview" className="border-border/60 flex flex-col gap-6 border-b py-16">
        <div className="flex flex-col gap-2">
          <SectionHeading eyebrow={overview.eyebrow} title={overview.title} />
          <p className="body-2 text-muted-foreground max-w-2xl">{overview.intro}</p>
        </div>
        <div className="flex flex-col gap-10">
          {servicePillars.map((pillar) => (
            <div key={pillar.name} className="flex flex-col gap-3">
              <h3 className="heading-4 text-foreground">{pillar.name}</h3>
              <Accordion
                type="multiple"
                value={openServices.filter((slug) =>
                  pillar.services.some((service) => service.slug === slug),
                )}
                onValueChange={(value) => {
                  const pillarSlugs = pillar.services.map((service) => service.slug);
                  setOpenServices((prev) => [
                    ...prev.filter((slug) => !pillarSlugs.includes(slug)),
                    ...value,
                  ]);
                }}
              >
                {pillar.services.map((service) => (
                  <AccordionItem key={service.slug} value={service.slug} id={service.slug}>
                    <AccordionTrigger className="text-left">
                      <span className="subheading-3 text-foreground">{service.name}</span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="flex flex-col gap-2">
                        {service.deliverables.map((item) => (
                          <li key={item.label} className="ui-dash-list-item">
                            <span className="ui-dash-marker">—</span>
                            <span className="body-2 text-muted-foreground">
                              <span className="text-foreground font-medium">{item.label}:</span>{" "}
                              {item.description}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Engagement types — how the work is structured */}
      <section id="engagement" className="border-border/60 flex flex-col gap-4 border-b py-16">
        <div className="flex flex-col gap-2">
          <h2 className="heading-2 text-foreground">{engagementTypes.title}</h2>
          <p className="body-2 text-muted-foreground max-w-2xl">{engagementTypes.intro}</p>
        </div>
        <div className="grid gap-8 sm:grid-cols-2">
          {engagementTypes.items.map((type) => (
            <div key={type.name} className="flex flex-col gap-2">
              <h3 className="subheading-3 text-foreground">{type.name}</h3>
              <p className="body-3 text-muted-foreground">{type.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Proof */}
      <section className="border-border/60 flex flex-col gap-6 border-b py-16">
        <div className="flex flex-col gap-2">
          <SectionHeading eyebrow={proof.eyebrow} title={proof.title} />
          <p className="body-2 text-muted-foreground max-w-2xl">{proof.intro}</p>
        </div>
        <div className="flex flex-col gap-8">
          {caseSnapshots.map((snapshot) => (
            <article
              key={snapshot.slug}
              className="border-border/40 grid gap-4 border-b pb-8 last:border-0 last:pb-0 sm:grid-cols-[minmax(0,12rem)_1fr]"
            >
              <div className="flex flex-col gap-1">
                <h3 className="heading-4 text-foreground">{snapshot.client}</h3>
                <p className="body-4 text-muted-foreground">{snapshot.industry}</p>
              </div>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <span className="ui-eyebrow">{proof.problemLabel}</span>
                  <p className="body-2 text-muted-foreground">{snapshot.problem}</p>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="ui-eyebrow">{proof.whatWeDidLabel}</span>
                  <p className="body-2 text-muted-foreground">{snapshot.whatWeDid}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="ui-eyebrow">{proof.outcomeLabel}</span>
                  <ul className="flex flex-col gap-1">
                    {snapshot.outcomes.map((outcome) => (
                      <li key={outcome} className="ui-dash-list-item">
                        <span className="ui-dash-marker">—</span>
                        <span className="body-2 text-foreground">{outcome}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <p className="body-4 text-muted-foreground">
                  <span className="ui-eyebrow mr-2">{proof.servicesLabel}</span>
                  {snapshot.services.join(" · ")}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Scope clarity — not a price list */}
      <section className="border-border/60 grid gap-6 border-b py-16 sm:grid-cols-2">
        <div className="flex flex-col gap-3">
          <h2 className="heading-3 text-foreground">{scope.alwaysIncluded.title}</h2>
          <ul className="flex flex-col gap-2">
            {scope.alwaysIncluded.items.map((item) => (
              <li key={item} className="ui-dash-list-item">
                <span className="ui-dash-marker">—</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col gap-3">
          <h2 className="heading-3 text-foreground">{scope.notIncluded.title}</h2>
          <ul className="flex flex-col gap-2">
            {scope.notIncluded.items.map((item) => (
              <li key={item} className="ui-dash-list-item">
                <span className="ui-dash-marker">—</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-border/60 flex flex-col gap-4 border-b py-16">
        <h2 className="heading-2 text-foreground">{faqs.title}</h2>
        <div className="flex flex-col gap-8">
          {faqs.items.map((faq) => (
            <div key={faq.question} className="flex flex-col gap-2">
              <h3 className="subheading-3 text-foreground">{faq.question}</h3>
              <p className="body-3 text-muted-foreground">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>

      <ContactCta title={t.services.gettingStarted.title} bordered={false} />
    </div>
  );
}
