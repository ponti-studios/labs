import { Button } from "@ponti-studios/ui/primitives";
import { Link } from "react-router";
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
      <section className="section section-hero">
        <h1 className="display-1 text-foreground max-w-4xl">{copy.title}</h1>
        <p className="text-base text-muted-foreground max-w-2xl">{copy.meta.description}</p>
      </section>

      {/* Q&A — editorial stack */}
      <section className="section gap-12">
        {copy.items.map((faq) => (
          <article key={faq.question} className="flex max-w-3xl flex-col gap-3">
            <h2 className="text-lg font-semibold tracking-tight text-foreground">{faq.question}</h2>
            <p className="text-base text-muted-foreground">{faq.answer}</p>
          </article>
        ))}
      </section>

      {/* Close */}
      <section className="section section-hero border-b-0">
        <h2 className="display-2 text-foreground max-w-3xl">{t.services.cta.title}</h2>
        <p className="text-base text-muted-foreground max-w-xl">{t.services.cta.body}</p>
        <div className="flex flex-wrap items-center gap-6 pt-2">
          <Button asChild>
            <a href={BOOK_CALL_URL} target="_blank" rel="noreferrer">
              {t.common.bookCall}
            </a>
          </Button>
          <Link
            to="/services"
            prefetch="intent"
            className="text-sm text-foreground underline-offset-4 hover:underline"
          >
            {t.home.services.cta}
          </Link>
        </div>
      </section>
    </div>
  );
}
