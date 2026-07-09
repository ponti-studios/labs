import { Button } from "@pontistudios/ui";
import { BOOK_CALL_URL, CONTACT_EMAIL, formatMinPrice, servicePillars } from "~/data/studio";
import { t } from "~/translations";

export function meta(): Array<{
  title?: string;
  name?: string;
  content?: string;
}> {
  return [
    { title: t.services.meta.title },
    { name: "description", content: t.services.meta.description },
  ];
}

const p = t.services.pricing;

export default function Services() {
  return (
    <div className="flex w-full flex-col">
      <section className="border-border/60 flex flex-col gap-6 border-b py-16">
        <span className="ui-eyebrow">{t.services.eyebrow}</span>
        <h1 className="display-2 text-foreground max-w-3xl">{t.services.title}</h1>
        <p className="body-1 text-muted-foreground max-w-2xl">
          {t.services.introPillarsPrefix}{" "}
          <strong className="text-foreground">{t.common.pillars.product}</strong>{" "}
          {t.services.introPillarsAnd}{" "}
          <strong className="text-foreground">{t.common.pillars.content}</strong>.{" "}
          {t.services.introPillarsSuffix}
        </p>
        <p className="body-2 text-muted-foreground max-w-2xl">{t.services.introRanges}</p>
      </section>

      {servicePillars.map((pillar) => (
        <section key={pillar.name} className="border-border/60 border-b py-16">
          <h2 className="heading-2 text-foreground mb-4">{pillar.name}</h2>
          <div className="flex flex-col gap-6">
            {pillar.services.map((service) => (
              <div
                key={service.slug}
                id={service.slug}
                className="grid gap-6 sm:grid-cols-[1fr_1fr]"
              >
                <div className="flex flex-col gap-3">
                  <h3 className="heading-3 text-foreground">{service.name}</h3>
                  <p className="body-2 text-muted-foreground">{service.problem}</p>
                  <p className="body-2 text-muted-foreground">{service.description}</p>
                </div>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <span className="ui-eyebrow">{t.services.whatYouGet}</span>
                    <ul className="flex flex-col gap-2">
                      {service.deliverables.map((item) => (
                        <li key={item} className="ui-dash-list-item">
                          <span className="ui-dash-marker">—</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="ui-eyebrow">{t.services.bestFor}</span>
                    <p className="body-3 text-muted-foreground">{service.bestFor}</p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="ui-eyebrow">{t.services.investment}</span>
                    <p className="body-2 text-foreground">
                      {t.common.startingAt} {formatMinPrice(service.minPrice)} · {service.unit}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}

      <section className="border-border/60 flex flex-col gap-6 border-b py-16">
        <span className="ui-eyebrow">{p.eyebrow}</span>
        <h2 className="display-2 text-foreground max-w-3xl">{p.title}</h2>
        <p className="body-1 text-muted-foreground max-w-2xl">{p.intro}</p>
      </section>

      <section className="border-border/60 flex flex-col gap-4 border-b py-16">
        <h2 className="heading-2 text-foreground">{p.thinking.title}</h2>
        <p className="body-2 text-muted-foreground max-w-2xl">{p.thinking.paragraph1}</p>
        <p className="body-2 text-muted-foreground max-w-2xl">{p.thinking.paragraph2}</p>
      </section>

      <section className="border-border/60 flex flex-col gap-4 border-b py-16">
        <h2 className="heading-2 text-foreground">{p.engagementTypes.title}</h2>
        <div className="grid gap-8 sm:grid-cols-2">
          {p.engagementTypes.items.map((type) => (
            <div key={type.name} className="flex flex-col gap-2">
              <h3 className="subheading-3 text-foreground">{type.name}</h3>
              <p className="body-3 text-muted-foreground">{type.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-border/60 grid gap-6 border-b py-16 sm:grid-cols-2">
        <div className="flex flex-col gap-3">
          <h2 className="heading-3 text-foreground">{p.alwaysIncluded.title}</h2>
          <ul className="flex flex-col gap-2">
            {p.alwaysIncluded.items.map((item) => (
              <li key={item} className="ui-dash-list-item">
                <span className="ui-dash-marker">—</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col gap-3">
          <h2 className="heading-3 text-foreground">{p.notIncluded.title}</h2>
          <ul className="flex flex-col gap-2">
            {p.notIncluded.items.map((item) => (
              <li key={item} className="ui-dash-list-item">
                <span className="ui-dash-marker">—</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-border/60 flex flex-col gap-4 border-b py-16">
        <h2 className="heading-2 text-foreground">{p.quoteVariables.title}</h2>
        <p className="body-2 text-muted-foreground max-w-2xl">{p.quoteVariables.intro}</p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-left">
            <thead>
              <tr className="border-border/60 border-b">
                <th className="ui-data-label py-2 pr-4 font-normal">
                  {p.quoteVariables.columns.variable}
                </th>
                <th className="ui-data-label py-2 pr-4 font-normal">
                  {p.quoteVariables.columns.lower}
                </th>
                <th className="ui-data-label py-2 font-normal">
                  {p.quoteVariables.columns.higher}
                </th>
              </tr>
            </thead>
            <tbody>
              {p.quoteVariables.rows.map((row) => (
                <tr key={row.variable} className="border-border/40 border-b last:border-0">
                  <td className="body-2 text-foreground py-3 pr-4">{row.variable}</td>
                  <td className="body-3 text-muted-foreground py-3 pr-4">{row.lower}</td>
                  <td className="body-3 text-muted-foreground py-3">{row.higher}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="border-border/60 flex flex-col gap-4 border-b py-16">
        <h2 className="heading-2 text-foreground">{p.whyWeCostMore.title}</h2>
        <p className="body-2 text-muted-foreground max-w-2xl">{p.whyWeCostMore.intro}</p>
        <div className="grid gap-8 sm:grid-cols-2">
          {p.whyWeCostMore.items.map((item) => (
            <div key={item.name} className="flex flex-col gap-2">
              <h3 className="subheading-3 text-foreground">{item.name}</h3>
              <p className="body-3 text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-border/60 flex flex-col gap-4 border-b py-16">
        <h2 className="heading-2 text-foreground">{p.faqs.title}</h2>
        <div className="flex flex-col gap-8">
          {p.faqs.items.map((faq) => (
            <div key={faq.question} className="flex flex-col gap-2">
              <h3 className="subheading-3 text-foreground">{faq.question}</h3>
              <p className="body-3 text-muted-foreground">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-border/60 flex flex-col gap-4 border-b py-16">
        <h2 className="heading-2 text-foreground">{p.gettingStarted.title}</h2>
        <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {t.common.contactSteps.map((step, index) => (
            <li key={step.title} className="flex flex-col gap-2">
              <span className="ui-eyebrow">{String(index + 1).padStart(2, "0")}</span>
              <h3 className="subheading-3 text-foreground">{step.title}</h3>
              <p className="body-3 text-muted-foreground">{step.description}</p>
            </li>
          ))}
        </ol>
        <p className="body-4 text-muted-foreground">{t.common.replyWithin}</p>
      </section>

      <section className="flex flex-col gap-6 py-16">
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
