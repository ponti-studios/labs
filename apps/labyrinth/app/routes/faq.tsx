import { HelpCircle } from "lucide-react";
import { t } from "~/translations";

export function meta(): Array<{
  title?: string;
  name?: string;
  content?: string;
}> {
  return [{ title: t.faq.meta.title }, { name: "description", content: t.faq.meta.description }];
}

export default function Faq() {
  return (
    <div className="flex w-full flex-col">
      <section className="border-border/60 flex flex-col gap-6 border-b py-16">
        <span className="ui-eyebrow flex items-center gap-2">
          <HelpCircle className="size-4" aria-hidden="true" />
          {t.faq.eyebrow}
        </span>
        <h1 className="display-2 text-foreground max-w-3xl">{t.faq.title}</h1>
      </section>

      <section className="flex flex-col gap-8 py-16">
        {t.faq.items.map((faq) => (
          <div key={faq.question} className="flex flex-col gap-2">
            <h2 className="subheading-3 text-foreground">{faq.question}</h2>
            <p className="body-3 text-muted-foreground">{faq.answer}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
