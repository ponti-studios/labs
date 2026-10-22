import { useState } from "react";
import { Link, useParams } from "react-router";
import { ArrowRight, Check, Plus } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@ponti-studios/ui/data-display";
import { Button } from "@ponti-studios/ui/primitives";
import { AsciiField } from "~/components/AsciiField";
import { currency, localBusinesses } from "~/data/local-automations";
import { pageMeta } from "~/lib/seo";

export function meta({ params }: { params: { industry?: string } }) {
  const business = localBusinesses.find((entry) => entry.slug === params.industry);
  return pageMeta({
    title: business ? `${business.name} · Ponti Studios` : "Local business · Ponti Studios",
    description:
      business?.intro ?? "Fixed-price AI automations for local businesses in Bermondsey, London.",
    path: `/local-business/${params.industry ?? "restaurants"}`,
  });
}

export default function LocalBusinessPage() {
  const { industry } = useParams();
  const business = localBusinesses.find((entry) => entry.slug === industry) ?? localBusinesses[0]!;
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const chosen = business.automations.filter((automation) => selected.has(automation.name));
  const subtotal = chosen.reduce((total, automation) => total + automation.price, 0);
  const discount = chosen.length >= 3 ? Math.round(subtotal * 0.15) : 0;
  const total = subtotal - discount;
  const selectedNames = chosen
    .map((automation) => `${automation.name} (${currency(automation.price)})`)
    .join(", ");
  const subject = encodeURIComponent(`Local automation enquiry — ${business.name}`);
  const body = encodeURIComponent(
    `Hi Charles,\n\nI'd like to talk about automations for my business.${selectedNames ? `\n\nI'm interested in: ${selectedNames}.\nEstimated build: ${currency(total)}${chosen.length >= 3 ? " (includes 15% bundle discount)" : ""}.\nOngoing service: from £79/month per automation.` : ""}\n\nBusiness name:\nWhat I'd like to improve:\n`,
  );
  const enquiryHref = `mailto:cj@ponti.io?subject=${subject}&body=${body}`;

  function toggle(name: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  return (
    <main className="storefront-main">
      <section className="sf-hero sf-dark sf-hero-galaxy">
        <AsciiField className="text-background opacity-25 sm:opacity-35" />
        <div className="sf-wrap relative z-10">
          <p className="mb-6 font-studio-display text-studio-large text-[var(--studio-gold)] sm:text-3xl">
            {business.name}
          </p>
          <h1 className="sf-h1">{business.headline}</h1>
          <p className="sf-copy mt-5 text-[var(--studio-warm)]">{business.intro}</p>
          <div className="sf-actions items-center max-sm:flex-col max-sm:items-stretch">
            <a
              className="sf-button !gap-2 !bg-[var(--studio-paper)] !text-[var(--studio-ink)] hover:!bg-[var(--studio-warm)]"
              href={enquiryHref}
            >
              Book a free check <ArrowRight aria-hidden="true" className="size-4" />
            </a>
            <a
              className="inline-flex min-h-12 items-center gap-2 px-2 text-sm text-[var(--studio-paper)] underline-offset-4 hover:text-[var(--studio-gold)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--studio-gold)] max-sm:justify-center"
              href="#automations"
            >
              See what can be automated <ArrowRight aria-hidden="true" className="size-4" />
            </a>
          </div>
        </div>
      </section>

      <section
        className="bg-[var(--studio-warm)] py-12 md:py-[72px]"
        aria-labelledby="local-business-problems-title"
      >
        <div className="sf-wrap grid items-start gap-6 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] md:gap-[clamp(32px,6vw,88px)]">
          <h2 id="local-business-problems-title" className="sf-h2">
            {business.problemHeadline}
          </h2>
          <ul className="m-0 list-none p-0">
            {business.problems.map((problem, index) => (
              <li
                key={problem}
                className={`border-t border-[var(--studio-line)] py-[18px] text-studio-lead leading-[1.4] ${index === business.problems.length - 1 ? "border-b" : ""}`}
              >
                {problem}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="automations" className="sf-wrap scroll-mt-6 py-14 md:py-[88px]">
        <div className="mb-5 flex flex-col gap-3 md:mb-7 md:flex-row md:items-end md:justify-between md:gap-8">
          <h2 className="sf-h2">Pick what would help.</h2>
          <p className="mb-1 max-w-[34ch] leading-snug text-[var(--studio-muted)]">
            Build prices are fixed before work starts. Choose three and save 15%.
          </p>
        </div>

        <Accordion type="single" collapsible className="border-t border-[var(--studio-line)]">
          {business.automations.map((automation) => {
            const isSelected = selected.has(automation.name);
            return (
              <AccordionItem
                key={automation.name}
                value={automation.name}
                className="sf-service-item"
              >
                <AccordionTrigger className="sf-service-trigger">
                  <span className="sf-service-name">{automation.name}</span>
                  <span className="ml-auto flex-none px-2 font-studio-mono text-studio-small tracking-wide whitespace-nowrap max-sm:px-1 max-sm:text-studio-micro">
                    {currency(automation.price)}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="!pb-[22px]">
                  <p className="mb-[22px] max-w-[66ch] text-base leading-snug text-[var(--studio-muted)] sm:ml-12">
                    {automation.description}
                  </p>
                  <div className="flex flex-col gap-4 border-t border-[var(--studio-line)] pt-4 sm:ml-12 sm:flex-row sm:items-center sm:justify-between sm:gap-5">
                    <span className="text-studio-tiny text-[var(--studio-muted)]">
                      One-time build · then from £79/month to keep it running
                    </span>
                    <Button
                      type="button"
                      variant={isSelected ? "outline" : "default"}
                      className="!min-h-11 !gap-2 !rounded-none !border !border-[var(--studio-line)] !bg-transparent !px-4 !font-studio-mono !text-studio-tiny-label !tracking-wider !text-[var(--studio-ink)] !uppercase hover:!border-[var(--studio-ink)] hover:!bg-[var(--studio-ink)] hover:!text-[var(--studio-paper)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--studio-brass)]"
                      aria-pressed={isSelected}
                      onClick={() => toggle(automation.name)}
                    >
                      {isSelected ? (
                        <Check aria-hidden="true" className="size-4" />
                      ) : (
                        <Plus aria-hidden="true" className="size-4" />
                      )}
                      {isSelected ? "Added" : "Add to my list"}
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>

        {chosen.length > 0 ? (
          <aside
            className="mt-7 grid gap-5 bg-[var(--studio-warm)] p-[18px] sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-6 sm:p-6"
            aria-live="polite"
          >
            <div>
              <h3 className="font-studio-display text-studio-title leading-[1.15]">
                Your list · {chosen.length} {chosen.length === 1 ? "automation" : "automations"}
              </h3>
              <p className="mt-2 text-sm">{chosen.map((item) => item.name).join(" · ")}</p>
              <small className="mt-2 block text-xs leading-snug text-[var(--studio-muted)]">
                {chosen.length >= 3
                  ? `15% bundle discount · ${currency(discount)} saved.`
                  : "Choose three or more for 15% off the build price."}{" "}
                Ongoing service is from £79/month per automation.
              </small>
            </div>
            <div className="flex items-center justify-between gap-5 sm:justify-end">
              <strong className="font-studio-display text-studio-display-small leading-none font-normal whitespace-nowrap">
                {currency(total)}
              </strong>
              <a className="sf-button" href={enquiryHref}>
                Ask about this list
              </a>
            </div>
          </aside>
        ) : null}
      </section>

      <section className="border-y border-[var(--studio-line)] py-10 md:py-12">
        <div className="sf-wrap grid items-center gap-6 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] md:gap-[clamp(32px,6vw,88px)]">
          <h2 className="sf-h2">One good result can cover the cost.</h2>
          <p className="m-0 max-w-[52ch] text-studio-lead leading-snug text-[var(--studio-muted)]">
            {business.payback}
          </p>
        </div>
      </section>

      <section className="sf-wrap grid gap-6 py-14 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] md:gap-[clamp(32px,6vw,88px)] md:py-20">
        <div>
          <h2 className="sf-h2">Clear before we start.</h2>
          <p className="leading-snug text-[var(--studio-muted)]">{business.doneTitle}</p>
        </div>
        <ul className="m-0 list-none p-0">
          {business.done.map((item) => (
            <li
              key={item}
              className="flex gap-3.5 border-t border-[var(--studio-line)] py-[15px] leading-snug last:border-b"
            >
              <Check aria-hidden="true" className="mt-1 size-4 flex-none text-[var(--studio-brass)]" />
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section id="book" className="sf-dark sf-hero-galaxy relative py-14 md:py-20">
        <AsciiField className="text-background opacity-25 sm:opacity-35" />
        <div className="sf-wrap relative z-10">
          <h2 className="sf-h2 max-w-[860px] text-[clamp(42px,6vw,76px)]">
            Not sure which one fits?
          </h2>
          <p className="my-[18px] mb-[26px] max-w-[60ch] text-lg leading-snug text-[var(--studio-warm)]">
            {business.checkCopy}
          </p>
          <a
            className="sf-button !gap-2 !bg-[var(--studio-paper)] !text-[var(--studio-ink)] hover:!bg-[var(--studio-warm)]"
            href={enquiryHref}
          >
            Book a free check <ArrowRight aria-hidden="true" className="size-4" />
          </a>
        </div>
      </section>

      <footer className="sf-wrap sf-footer flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
        <span>Ponti Studios · Bermondsey, London SE1</span>
        <a
          className="text-inherit no-underline hover:text-[var(--studio-ink)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--studio-brass)]"
          href="mailto:cj@ponti.io"
        >
          cj@ponti.io
        </a>
        <nav className="flex flex-wrap gap-4" aria-label="Other business types">
          {localBusinesses
            .filter((entry) => entry.slug !== business.slug)
            .map((entry) => (
              <Link
                className="text-inherit no-underline hover:text-[var(--studio-ink)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--studio-brass)]"
                key={entry.slug}
                to={`/local-business/${entry.slug}`}
              >
                {entry.shortName}
              </Link>
            ))}
        </nav>
      </footer>
    </main>
  );
}
