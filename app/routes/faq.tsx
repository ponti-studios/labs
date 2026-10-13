import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@ponti-studios/ui/data-display";
import { Link } from "react-router";
import { BOOK_CALL_URL } from "~/data/studio";
import { pageMeta } from "~/lib/seo";
import { t } from "~/translations";

const copy = t.faq;

export function meta() {
  return pageMeta({
    title: copy.meta.title,
    description: copy.meta.description,
    path: "/faq",
  });
}

export default function Faq() {
  return (
    <div className="sf-faq-page">
      <section className="sf-wrap sf-faq-hero">
        <h1 className="sf-h1">{copy.title}</h1>
        <p className="sf-copy">{copy.meta.description}</p>
      </section>

      <section className="sf-wrap sf-faq-list" aria-label="Frequently asked questions">
        <Accordion type="single" collapsible>
          {copy.items.map((faq) => (
            <AccordionItem key={faq.question} value={faq.question} className="sf-faq-item">
              <AccordionTrigger className="sf-faq-trigger">{faq.question}</AccordionTrigger>
              <AccordionContent className="sf-faq-content">
                <p>{faq.answer}</p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <section className="sf-dark sf-faq-cta">
        <div className="sf-wrap sf-faq-cta-inner">
          <div>
            <h2 className="sf-h2">{t.services.cta.title}</h2>
            <p>{t.services.cta.body}</p>
          </div>
          <div className="sf-faq-actions">
            <a className="sf-button" href={BOOK_CALL_URL}>
              {t.common.bookCall}
            </a>
            <Link to="/services" prefetch="intent" className="sf-faq-services-link">
              {t.common.seeServices}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
