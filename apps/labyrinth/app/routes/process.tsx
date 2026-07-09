import { Button } from "@pontistudios/ui";
import { BOOK_CALL_URL, CONTACT_EMAIL } from "~/data/studio";
import { t } from "~/translations";

export function meta(): Array<{
  title?: string;
  name?: string;
  content?: string;
}> {
  return [
    { title: t.process.meta.title },
    { name: "description", content: t.process.meta.description },
  ];
}

export default function Process() {
  return (
    <div className="flex w-full flex-col">
      <section className="border-border/60 flex flex-col gap-6 border-b py-16 sm:py-20">
        <span className="ui-eyebrow">{t.process.eyebrow}</span>
        <h1 className="display-2 text-foreground max-w-3xl">{t.process.title}</h1>
      </section>

      <section className="border-border/60 flex flex-col gap-8 border-b py-16">
        <h2 className="heading-2 text-foreground">{t.process.engagementModels.title}</h2>
        <div className="grid gap-8 sm:grid-cols-2">
          {t.process.engagementModels.items.map((model) => (
            <div key={model.name} className="flex flex-col gap-1.5">
              <h3 className="subheading-3 text-foreground">{model.name}</h3>
              <p className="body-3 text-muted-foreground">{model.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-border/60 flex flex-col gap-10 border-b py-16">
        <h2 className="heading-2 text-foreground">{t.process.steps.title}</h2>
        <ol className="flex flex-col gap-8">
          {t.process.steps.items.map((step) => (
            <li key={step.step} className="grid gap-2 sm:grid-cols-[auto_1fr] sm:items-baseline sm:gap-6">
              <span className="mono text-muted-foreground">
                {step.step} · {step.duration}
              </span>
              <div className="flex flex-col gap-1">
                <h3 className="subheading-2 text-foreground">{step.title}</h3>
                <p className="body-2 text-muted-foreground max-w-2xl">{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="border-border/60 grid gap-10 border-b py-16 sm:grid-cols-2">
        <div className="flex flex-col gap-6">
          <h2 className="heading-3 text-foreground">{t.process.whatWeNeed.title}</h2>
          <ol className="flex flex-col gap-4">
            {t.process.whatWeNeed.items.map((item, index) => (
              <li key={item.title} className="flex flex-col gap-0.5">
                <span className="ui-eyebrow">{String(index + 1).padStart(2, "0")}</span>
                <h3 className="subheading-3 text-foreground">{item.title}</h3>
                <p className="body-3 text-muted-foreground">{item.description}</p>
              </li>
            ))}
          </ol>
        </div>
        <div className="flex flex-col gap-6">
          <h2 className="heading-3 text-foreground">{t.process.whatYouGet.title}</h2>
          <ol className="flex flex-col gap-4">
            {t.process.whatYouGet.items.map((item, index) => (
              <li key={item.title} className="flex flex-col gap-0.5">
                <span className="ui-eyebrow">{String(index + 1).padStart(2, "0")}</span>
                <h3 className="subheading-3 text-foreground">{item.title}</h3>
                <p className="body-3 text-muted-foreground">{item.description}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="flex flex-col gap-6 py-16">
        <h2 className="heading-2 text-foreground">{t.common.readyTitle}</h2>
        <div className="flex flex-wrap items-center gap-4">
          <Button asChild size="lg">
            <a href={BOOK_CALL_URL} target="_blank" rel="noreferrer">
              {t.common.bookCall}
            </a>
          </Button>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="body-2 text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
          >
            {CONTACT_EMAIL}
          </a>
        </div>
      </section>
    </div>
  );
}
