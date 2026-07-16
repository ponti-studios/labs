import { Button } from "@pontistudios/ui";
import { motion, useReducedMotion } from "framer-motion";
import { HelpCircle } from "lucide-react";
import { Link } from "react-router";
import { BOOK_CALL_URL, servicePillars } from "~/data/studio";
import { t } from "~/translations";

const copy = t.services;

export function meta(): Array<{ title?: string; name?: string; content?: string }> {
  return [{ title: copy.meta.title }, { name: "description", content: copy.meta.description }];
}

function ServicesHeroHeadline() {
  const reduceMotion = useReducedMotion();
  return (
    <h1 className="display-1 text-foreground flex max-w-4xl flex-wrap items-baseline gap-x-3 gap-y-1">
      <span>{copy.hero.title}</span>
      <motion.span
        className="text-accent"
        initial={reduceMotion ? false : { opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.35, ease: "easeOut" }}
      >
        {copy.hero.punch}
      </motion.span>
    </h1>
  );
}

export default function Services() {
  return (
    <div className="flex w-full flex-col">
      <section className="border-border/60 flex flex-col gap-6 border-b px-6 py-20">
        <ServicesHeroHeadline />

        <div className="flex flex-wrap items-center gap-6 pt-2">
          <Button asChild>
            <a href={BOOK_CALL_URL} target="_blank" rel="noreferrer">
              {t.common.bookCall}
            </a>
          </Button>
          <Link
            to="/work"
            prefetch="intent"
            className="body-2 text-foreground underline-offset-4 hover:underline"
          >
            {copy.hero.seeWork}
          </Link>
        </div>
      </section>

      {/* Services — editorial catalog, same for every visitor */}
      <section className="border-border/60 flex flex-col gap-12 border-b px-6 py-20">
        <div className="flex flex-col gap-3">
          <h2 className="heading-2 text-foreground">{copy.services.title}</h2>
          <p className="body-2 text-muted-foreground max-w-2xl">{copy.services.intro}</p>
        </div>

        <div className="flex flex-col gap-16">
          {servicePillars.map((pillar) => (
            <div key={pillar.name} className="flex flex-col gap-8">
              <h3 className="heading-3 text-accent">{pillar.name}</h3>
              <div className="flex flex-col gap-10">
                {pillar.services.map((service) => (
                  <article
                    key={service.slug}
                    id={service.slug}
                    className="grid gap-4 sm:grid-cols-[minmax(0,14rem)_1fr] sm:gap-10"
                  >
                    <h4 className="subheading-2 text-foreground">{service.name}</h4>
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
                  </article>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Process — quiet, linear, same for everyone */}
      <section className="border-border/60 flex flex-col gap-10 border-b px-6 py-20">
        <div className="flex flex-col gap-3">
          <h2 className="heading-2 text-foreground">{copy.process.title}</h2>
          <p className="body-2 text-muted-foreground max-w-2xl">{copy.process.intro}</p>
        </div>
        <ol className="flex flex-col gap-8">
          {t.common.contactSteps.map((step, index) => (
            <li key={step.title} className="grid gap-2 sm:grid-cols-[minmax(0,4rem)_1fr] sm:gap-8">
              <span className="body-2 text-muted-foreground tabular-nums">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="flex flex-col gap-1">
                <span className="subheading-3 text-foreground">{step.title}</span>
                <span className="body-2 text-muted-foreground">{step.description}</span>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Closing CTA */}
      <section className="border-border/60 flex flex-col gap-6 border-b px-6 py-20">
        <h2 className="display-2 text-foreground max-w-3xl">{copy.cta.title}</h2>
        <p className="body-1 text-muted-foreground max-w-xl">{copy.cta.body}</p>
        <div className="flex flex-wrap items-center gap-6 pt-2">
          <Button asChild>
            <a href={BOOK_CALL_URL} target="_blank" rel="noreferrer">
              {t.common.bookCall}
            </a>
          </Button>
          <p className="body-3 text-muted-foreground">{t.common.replyWithin}</p>
        </div>
      </section>

      <section className="flex items-center justify-between px-6 py-6 sm:px-10">
        <p className="body-2 text-muted-foreground">{copy.faqLink}</p>
        <Link
          to="/faq"
          prefetch="intent"
          className="body-2 text-foreground hover:text-muted-foreground flex items-center gap-2"
        >
          <HelpCircle className="size-4" aria-hidden="true" />
          {t.faq.eyebrow}
        </Link>
      </section>
    </div>
  );
}
