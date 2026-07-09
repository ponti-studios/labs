import { Button } from "@pontistudios/ui";
import { BOOK_CALL_URL, CONTACT_EMAIL, formatMinPrice, sortByMinPrice } from "~/data/studio";
import { t } from "~/translations";

export function meta(): Array<{
  title?: string;
  name?: string;
  content?: string;
}> {
  return [
    { title: t.pricing.meta.title },
    { name: "description", content: t.pricing.meta.description },
  ];
}

const g = t.pricing.groups;

type PricingGroupRow = { service: string; unit: string; minPrice: number };
type PricingGroup = { name: string; description: string; pushesUp: readonly string[]; keepsDown: readonly string[]; rows: PricingGroupRow[] };

const unsortedPricingGroups: PricingGroup[] = [
  {
    ...g.advisory,
    rows: [
      { ...g.advisory.rows.technicalConsulting, minPrice: 5_000 },
      { ...g.advisory.rows.strategyWorkshop, minPrice: 5_000 },
    ],
  },
  {
    ...g.visualProduction,
    rows: [{ ...g.visualProduction.rows.visualProduction, minPrice: 5_000 }],
  },
  {
    ...g.ongoingPartnership,
    rows: [
      { ...g.ongoingPartnership.rows.fractionalProductManagement, minPrice: 8_000 },
      { ...g.ongoingPartnership.rows.contentStrategy, minPrice: 8_000 },
    ],
  },
  {
    ...g.designAndBrand,
    rows: [
      { ...g.designAndBrand.rows.copyMessaging, minPrice: 15_000 },
      { ...g.designAndBrand.rows.productDesign, minPrice: 25_000 },
      { ...g.designAndBrand.rows.brandIdentity, minPrice: 35_000 },
    ],
  },
  {
    ...g.productBuild,
    rows: [
      { ...g.productBuild.rows.engineering, minPrice: 80_000 },
      { ...g.productBuild.rows.modernization, minPrice: 100_000 },
    ],
  },
];

const pricingGroups = unsortedPricingGroups
  .map((group) => ({ ...group, rows: sortByMinPrice(group.rows) }))
  .sort((a, b) => a.rows[0].minPrice - b.rows[0].minPrice);

export default function Pricing() {
  return (
    <div className="flex w-full flex-col">
      <section className="border-border/60 flex flex-col gap-6 border-b py-16 sm:py-20">
        <span className="ui-eyebrow">{t.pricing.eyebrow}</span>
        <h1 className="display-2 text-foreground max-w-3xl">{t.pricing.title}</h1>
        <p className="body-1 text-muted-foreground max-w-2xl">{t.pricing.intro}</p>
      </section>

      <section className="border-border/60 flex flex-col gap-4 border-b py-16">
        <h2 className="heading-2 text-foreground">{t.pricing.thinking.title}</h2>
        <p className="body-2 text-muted-foreground max-w-2xl">{t.pricing.thinking.paragraph1}</p>
        <p className="body-2 text-muted-foreground max-w-2xl">{t.pricing.thinking.paragraph2}</p>
      </section>

      <section className="border-border/60 flex flex-col gap-8 border-b py-16">
        <h2 className="heading-2 text-foreground">{t.pricing.engagementTypes.title}</h2>
        <div className="grid gap-8 sm:grid-cols-2">
          {t.pricing.engagementTypes.items.map((type) => (
            <div key={type.name} className="flex flex-col gap-1.5">
              <h3 className="subheading-3 text-foreground">{type.name}</h3>
              <p className="body-3 text-muted-foreground">{type.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-border/60 flex flex-col gap-8 border-b py-16">
        <h2 className="heading-2 text-foreground">{t.pricing.byService.title}</h2>
        <div className="flex flex-col gap-14">
          {pricingGroups.map((group) => (
            <div key={group.name} className="flex flex-col gap-6">
              <div className="flex flex-col gap-1.5">
                <h3 className="heading-3 text-foreground">{group.name}</h3>
                <p className="body-3 text-muted-foreground">{group.description}</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[420px] border-collapse text-left">
                  <thead>
                    <tr className="border-border/60 border-b">
                      <th className="ui-data-label py-2 pr-4 font-normal">
                        {t.pricing.byService.service}
                      </th>
                      <th className="ui-data-label py-2 pr-4 font-normal">
                        {t.pricing.byService.startingAt}
                      </th>
                      <th className="ui-data-label py-2 font-normal">{t.pricing.byService.unit}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.rows.map((row) => (
                      <tr key={row.service} className="border-border/40 border-b last:border-0">
                        <td className="body-2 text-foreground py-2.5 pr-4">{row.service}</td>
                        <td className="body-2 text-foreground py-2.5 pr-4">
                          {formatMinPrice(row.minPrice)}
                        </td>
                        <td className="body-2 text-muted-foreground py-2.5">{row.unit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <span className="ui-eyebrow">{t.pricing.byService.pushesUp}</span>
                  <ul className="flex flex-col gap-1.5">
                    {group.pushesUp.map((item) => (
                      <li key={item} className="ui-dash-list-item">
                        <span className="ui-dash-marker">—</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="ui-eyebrow">{t.pricing.byService.keepsDown}</span>
                  <ul className="flex flex-col gap-1.5">
                    {group.keepsDown.map((item) => (
                      <li key={item} className="ui-dash-list-item">
                        <span className="ui-dash-marker">—</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="border-border/60 grid gap-10 border-b py-16 sm:grid-cols-2">
        <div className="flex flex-col gap-3">
          <h2 className="heading-3 text-foreground">{t.pricing.alwaysIncluded.title}</h2>
          <ul className="flex flex-col gap-1.5">
            {t.pricing.alwaysIncluded.items.map((item) => (
              <li key={item} className="ui-dash-list-item">
                <span className="ui-dash-marker">—</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col gap-3">
          <h2 className="heading-3 text-foreground">{t.pricing.notIncluded.title}</h2>
          <ul className="flex flex-col gap-1.5">
            {t.pricing.notIncluded.items.map((item) => (
              <li key={item} className="ui-dash-list-item">
                <span className="ui-dash-marker">—</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-border/60 flex flex-col gap-6 border-b py-16">
        <h2 className="heading-2 text-foreground">{t.pricing.quoteVariables.title}</h2>
        <p className="body-2 text-muted-foreground max-w-2xl">{t.pricing.quoteVariables.intro}</p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-left">
            <thead>
              <tr className="border-border/60 border-b">
                <th className="ui-data-label py-2 pr-4 font-normal">
                  {t.pricing.quoteVariables.columns.variable}
                </th>
                <th className="ui-data-label py-2 pr-4 font-normal">
                  {t.pricing.quoteVariables.columns.lower}
                </th>
                <th className="ui-data-label py-2 font-normal">
                  {t.pricing.quoteVariables.columns.higher}
                </th>
              </tr>
            </thead>
            <tbody>
              {t.pricing.quoteVariables.rows.map((row) => (
                <tr key={row.variable} className="border-border/40 border-b last:border-0">
                  <td className="body-2 text-foreground py-2.5 pr-4">{row.variable}</td>
                  <td className="body-3 text-muted-foreground py-2.5 pr-4">{row.lower}</td>
                  <td className="body-3 text-muted-foreground py-2.5">{row.higher}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="border-border/60 flex flex-col gap-8 border-b py-16">
        <h2 className="heading-2 text-foreground">{t.pricing.whyWeCostMore.title}</h2>
        <p className="body-2 text-muted-foreground max-w-2xl">{t.pricing.whyWeCostMore.intro}</p>
        <div className="grid gap-8 sm:grid-cols-2">
          {t.pricing.whyWeCostMore.items.map((item) => (
            <div key={item.name} className="flex flex-col gap-1.5">
              <h3 className="subheading-3 text-foreground">{item.name}</h3>
              <p className="body-3 text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-border/60 flex flex-col gap-8 border-b py-16">
        <h2 className="heading-2 text-foreground">{t.pricing.faqs.title}</h2>
        <div className="flex flex-col gap-8">
          {t.pricing.faqs.items.map((faq) => (
            <div key={faq.question} className="flex flex-col gap-1.5">
              <h3 className="subheading-3 text-foreground">{faq.question}</h3>
              <p className="body-3 text-muted-foreground">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-border/60 flex flex-col gap-8 border-b py-16">
        <h2 className="heading-2 text-foreground">{t.pricing.gettingStarted.title}</h2>
        <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {t.common.contactSteps.map((step, index) => (
            <li key={step.title} className="flex flex-col gap-1.5">
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
