import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@ponti-studios/ui/data-display";
import { Button } from "@ponti-studios/ui/primitives";
import { Link } from "react-router";
import { RevealGroup, RevealItem } from "~/components/Reveal";
import { BOOK_CALL_URL } from "~/data/studio";
import { t } from "~/translations";

const copy = t.faq;

export function meta(): Array<{
  title?: string;
  name?: string;
  content?: string;
}> {
  return [{ title: copy.meta.title }, { name: "description", content: copy.meta.description }];
}

export default function Faq() {
  return (
    <div className="page-bleed">
      {/* Hero */}
      <section className="section pt-16 pb-10 md:pt-24">
        <h1 className="heading-hero text-foreground max-w-4xl">{copy.title}</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl text-lg leading-relaxed">
          {copy.meta.description}
        </p>
      </section>

      {/* Q&A — editorial disclosure list */}
      <section className="section">
        <RevealGroup as="div" className="max-w-3xl">
          <Accordion type="single" collapsible>
            {copy.items.map((faq) => (
              <RevealItem key={faq.question}>
                <AccordionItem
                  value={faq.question}
                  className="border-border mb-0 overflow-hidden rounded-none border-0 border-t last:border-b"
                >
                  <AccordionTrigger className="press text-foreground [&_svg]:text-accent gap-6 px-0 py-6 text-left text-lg font-semibold tracking-tight sm:text-xl">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="px-0">
                    <p className="text-muted-foreground max-w-2xl pb-6 text-base leading-relaxed">
                      {faq.answer}
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </RevealItem>
            ))}
          </Accordion>
        </RevealGroup>
      </section>

      {/* Close */}
      <section className="section-compact border-b-0 px-4 py-20 text-center sm:px-6 md:py-28">
        <h2 className="heading-cta text-foreground mx-auto mb-5 max-w-3xl">
          {t.services.cta.title}
        </h2>
        <p className="text-muted-foreground mx-auto mb-7 max-w-xl text-lg leading-relaxed">
          {t.services.cta.body}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-6">
          <Button asChild size="lg" className="press rounded-full px-6">
            <a href={BOOK_CALL_URL} target="_blank" rel="noreferrer">
              {t.common.bookCall}
            </a>
          </Button>
          <Link
            to="/services"
            prefetch="intent"
            className="text-foreground text-sm underline-offset-4 hover:underline"
          >
            {t.home.services.cta}
          </Link>
        </div>
      </section>
    </div>
  );
}
