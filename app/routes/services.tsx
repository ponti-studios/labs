import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@ponti-studios/ui/data-display";
import {
  ArrowRight,
  ClipboardCheck,
  Code2,
  Compass,
  Database,
  ListChecks,
  Paintbrush,
  ScanSearch,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import { Link, useLocation } from "react-router";
import { DeliverableList } from "~/components/DeliverableList";
import { RevealGroup, RevealItem } from "~/components/Reveal";
import { BOOK_CALL_URL, servicePillars } from "~/data/studio";
import { pageMeta } from "~/lib/seo";
import { t } from "~/translations";

const copy = t.services;

const serviceSummaries: Record<string, string> = {
  engineering: "Turn a product idea or stalled roadmap into a working, tested app.",
  modernization: "Replace fragile foundations without stopping the business.",
  "product-design": "Make the key user journeys easier to understand and finish.",
  "fractional-product-management": "Give the team clear priorities and a steady delivery rhythm.",
  "fractional-cto": "Get senior technical decisions without hiring a full-time CTO.",
  "technical-due-diligence": "Know the product and engineering risks before a deal closes.",
  "technical-consulting": "Find the bottleneck or risk, then get a clear plan to fix it.",
  "product-strategy": "Decide what to build, what to buy, and what to leave alone.",
};

const serviceIcons: Record<string, LucideIcon> = {
  engineering: Code2,
  modernization: Database,
  "product-design": Paintbrush,
  "fractional-product-management": ListChecks,
  "fractional-cto": UsersRound,
  "technical-due-diligence": ClipboardCheck,
  "technical-consulting": ScanSearch,
  "product-strategy": Compass,
};

export function meta() {
  return pageMeta({
    title: copy.meta.title,
    description: copy.meta.description,
    path: "/services",
  });
}

export default function Services() {
  const location = useLocation();
  const activeService = location.hash.slice(1);

  return (
    <div className="sf-services-page">
      <section className="sf-wrap sf-services-hero">
        <h1 className="sf-h1">{copy.hero.title}</h1>
        <p className="sf-copy">{copy.hero.subtitle}</p>
      </section>

      <section className="sf-wrap sf-services-catalog" aria-label="Services">
        {servicePillars.map((pillar) => (
          <section key={pillar.name} className="sf-service-group">
            <h2 className="sf-h2">{pillar.name}</h2>
            <Accordion
              type="single"
              collapsible
              defaultValue={
                pillar.services.some((service) => service.slug === activeService)
                  ? [activeService]
                  : !activeService && pillar.name === t.common.pillars.product
                    ? ["engineering"]
                    : undefined
              }
              className="sf-service-list"
            >
              {pillar.services.map((service) => {
                const Icon = serviceIcons[service.slug];
                return (
                  <AccordionItem
                    key={service.slug}
                    id={service.slug}
                    value={service.slug}
                    className="sf-service-item"
                  >
                    <AccordionTrigger className="sf-service-trigger">
                      <span className="sf-service-trigger-copy">
                        <span className="sf-service-title-line">
                          <Icon aria-hidden="true" className="sf-service-icon" strokeWidth={1.7} />
                          <span className="sf-service-name">{service.name}</span>
                        </span>
                        <span className="sf-service-summary">{serviceSummaries[service.slug]}</span>
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="sf-service-content">
                      <DeliverableList items={service.deliverables} />
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </section>
        ))}
      </section>

      <section className="sf-dark sf-services-process">
        <div className="sf-wrap">
          <h2 className="sf-h2">{copy.process.title}</h2>
          <RevealGroup className="sf-process-list">
            {t.common.contactSteps.map((step) => (
              <RevealItem key={step.title} className="sf-process-row">
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      <section className="sf-wrap sf-services-cta">
        <div>
          <h2 className="sf-h2">{copy.cta.title}</h2>
          <p>{copy.cta.body}</p>
        </div>
        <div className="sf-services-actions">
          <a className="sf-button" href={BOOK_CALL_URL}>
            {t.common.bookCall}
          </a>
          <Link to="/faq" prefetch="intent" className="sf-services-faq">
            {t.faq.eyebrow} <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
