import { Button } from "@pontistudios/ui";
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
    <div className="flex w-full flex-col">
      {/* Hero */}
      <section className="border-border/60 flex flex-col gap-6 border-b px-6 py-20">
        <h1 className="display-1 text-foreground max-w-4xl">{copy.title}</h1>
        <p className="body-1 text-muted-foreground max-w-2xl">{copy.meta.description}</p>
      </section>

      {/* Q&A — editorial stack */}
      <section className="border-border/60 flex flex-col gap-12 border-b px-6 py-20">
        {copy.items.map((faq) => (
          <article key={faq.question} className="flex max-w-3xl flex-col gap-3">
            <h2 className="heading-3 text-foreground">{faq.question}</h2>
            <p className="body-1 text-muted-foreground">{faq.answer}</p>
          </article>
        ))}
      </section>

      {/* Close */}
      <section className="flex flex-col gap-6 px-6 py-20">
        <h2 className="display-2 text-foreground max-w-3xl">{t.services.cta.title}</h2>
        <p className="body-1 text-muted-foreground max-w-xl">{t.services.cta.body}</p>
        <div className="flex flex-wrap items-center gap-6 pt-2">
          <Button asChild size="lg">
            <a href={BOOK_CALL_URL} target="_blank" rel="noreferrer">
              {t.common.bookCall}
            </a>
          </Button>
          <Link
            to="/services"
            prefetch="intent"
            className="body-2 text-foreground underline-offset-4 hover:underline"
          >
            {t.home.services.cta}
          </Link>
        </div>
      </section>
    </div>
  );
}
