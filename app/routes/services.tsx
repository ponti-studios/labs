import { Button } from "@ponti-studios/ui/primitives";
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
    <div className="page-bleed">
      <section className="section section-hero">
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
            className="text-foreground text-sm underline-offset-4 hover:underline"
          >
            {copy.hero.seeWork}
          </Link>
        </div>
      </section>

      {/* Services — editorial catalog, same for every visitor */}
      <section className="section gap-12">
        <div className="flex flex-col gap-3">
          <h2 className="text-foreground text-xl font-semibold tracking-tight">
            {copy.services.title}
          </h2>
          <p className="text-muted-foreground max-w-2xl text-sm">{copy.services.intro}</p>
        </div>

        <div className="flex flex-col gap-16">
          {servicePillars.map((pillar) => (
            <div key={pillar.name} className="flex flex-col gap-8">
              <h3 className="text-accent text-lg font-semibold tracking-tight">{pillar.name}</h3>
              <div className="flex flex-col gap-10">
                {pillar.services.map((service) => (
                  <article
                    key={service.slug}
                    id={service.slug}
                    className="grid gap-4 sm:grid-cols-[minmax(0,14rem)_1fr] sm:gap-10"
                  >
                    <h4 className="subtext-xl text-foreground font-semibold tracking-tight">
                      {service.name}
                    </h4>
                    <ul className="flex flex-col gap-2">
                      {service.deliverables.map((item) => (
                        <li key={item.label} className="ui-dash-list-item">
                          <span className="ui-dash-marker">—</span>
                          <span className="text-muted-foreground text-sm">
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
      <section className="section gap-10">
        <div className="flex flex-col gap-3">
          <h2 className="text-foreground text-xl font-semibold tracking-tight">
            {copy.process.title}
          </h2>
          <p className="text-muted-foreground max-w-2xl text-sm">{copy.process.intro}</p>
        </div>
        <ol className="flex flex-col gap-8">
          {t.common.contactSteps.map((step, index) => (
            <li key={step.title} className="grid gap-2 sm:grid-cols-[minmax(0,4rem)_1fr] sm:gap-8">
              <span className="text-muted-foreground text-sm tabular-nums">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="flex flex-col gap-1">
                <span className="subtext-lg text-foreground font-semibold tracking-tight">
                  {step.title}
                </span>
                <span className="text-muted-foreground text-sm">{step.description}</span>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Closing CTA */}
      <section className="section section-hero">
        <h2 className="display-2 text-foreground max-w-3xl">{copy.cta.title}</h2>
        <p className="text-muted-foreground max-w-xl text-base">{copy.cta.body}</p>
        <div className="flex flex-wrap items-center gap-6 pt-2">
          <Button asChild>
            <a href={BOOK_CALL_URL} target="_blank" rel="noreferrer">
              {t.common.bookCall}
            </a>
          </Button>
          <p className="text-muted-foreground text-sm">{t.common.replyWithin}</p>
        </div>
      </section>

      <section className="flex items-center justify-between px-6 py-6 sm:px-10">
        <Link
          to="/faq"
          prefetch="intent"
          className="text-foreground hover:text-muted-foreground flex items-center gap-2 text-sm"
        >
          <HelpCircle className="size-4" aria-hidden="true" />
          {t.faq.eyebrow}
        </Link>
      </section>
    </div>
  );
}
