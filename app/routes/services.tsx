import { Button } from "@ponti-studios/ui/primitives";
import { motion, useReducedMotion } from "framer-motion";
import { HelpCircle } from "lucide-react";
import { Link } from "react-router";
import { DeliverableList } from "~/components/DeliverableList";
import { RevealGroup, RevealItem } from "~/components/Reveal";
import { StepCard, StepGrid } from "~/components/StepGrid";
import { BOOK_CALL_URL, servicePillars } from "~/data/studio";
import { t } from "~/translations";

const copy = t.services;

export function meta(): Array<{ title?: string; name?: string; content?: string }> {
  return [{ title: copy.meta.title }, { name: "description", content: copy.meta.description }];
}

function ServicesHeroHeadline() {
  const reduceMotion = useReducedMotion();
  return (
    <h1 className="heading-hero text-foreground max-w-4xl">
      <span className="block">{copy.hero.title}</span>
      <motion.span
        className="text-accent block font-serif italic"
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
      {/* Hero */}
      <section className="section pt-16 pb-10 md:pt-24">
        <ServicesHeroHeadline />

        <div className="mt-8 flex flex-wrap items-center gap-6">
          <Button asChild size="lg" className="press rounded-full px-6">
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
      <section className="section gap-10">
        <RevealGroup className="flex flex-col gap-12">
          {servicePillars.map((pillar) => (
            <RevealItem key={pillar.name} className="border-border flex flex-col gap-6">
              <h3 className="heading-display-sm text-accent">{pillar.name}</h3>
              <StepGrid className="bg-border">
                {pillar.services.map((service, index) => (
                  <StepCard
                    key={service.slug}
                    id={service.slug}
                    index={index + 1}
                    title={service.name}
                    className="bg-card"
                  >
                    <DeliverableList items={service.deliverables} />
                  </StepCard>
                ))}
              </StepGrid>
            </RevealItem>
          ))}
        </RevealGroup>
      </section>

      {/* Process — dark panel, always dark regardless of system theme */}
      <section className="section">
        <div className="rounded-[28px] bg-[#171714] px-6 py-14 text-white sm:px-12 md:py-20">
          <div className="mb-10 grid gap-3 sm:grid-cols-2 sm:items-end">
            <h2 className="text-3xl leading-[.98] tracking-tighter sm:text-4xl">
              {copy.process.title}
            </h2>
          </div>
          <StepGrid className="bg-[#373731]">
            {t.common.contactSteps.map((step, index) => (
              <StepCard
                key={step.title}
                index={index + 1}
                title={step.title}
                className="bg-[#1e1e1a]"
                indexClassName="text-[#aaa79f]"
              >
                <span className="text-sm leading-relaxed text-[#d8d5cd]">{step.description}</span>
              </StepCard>
            ))}
          </StepGrid>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="section-compact border-border border-t border-b px-4 py-20 text-center sm:px-6 md:py-28">
        <h2 className="heading-cta text-foreground mx-auto mb-5 max-w-3xl">{copy.cta.title}</h2>
        <p className="text-muted-foreground mx-auto mb-7 max-w-xl text-lg leading-relaxed">
          {copy.cta.body}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-6">
          <Button asChild size="lg" className="press rounded-full px-6">
            <a href={BOOK_CALL_URL} target="_blank" rel="noreferrer">
              {t.common.bookCall}
            </a>
          </Button>
          <p className="text-muted-foreground text-sm">{t.common.replyWithin}</p>
        </div>
      </section>

      <section className="flex items-center justify-between px-4 py-6 sm:px-6">
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
