import { Button } from "@ponti-studios/ui/primitives";
import { LucideArrowDown, LucideArrowRight, LucideCheck } from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router";
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
    <div className="page-shell flex flex-col gap-16 sm:gap-24">
      <section className="layout-stack grid gap-10 py-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)] lg:items-end lg:py-16">
        <div className="flex flex-col items-start gap-6">
          <p className="heading-display-sm text-muted-foreground">{business.eyebrow}</p>
          <h1 className="heading-hero text-foreground max-w-5xl">{business.headline}</h1>
          <p className="text-muted-foreground max-w-2xl text-lg leading-relaxed">
            {business.intro}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <a
              href={enquiryHref}
              className="btn-keycap bg-primary text-primary-foreground inline-flex min-h-12 items-center justify-center px-6 font-mono text-sm font-bold tracking-wide uppercase"
            >
              Book a free check
            </a>
            <a
              href="#automations"
              className="text-foreground inline-flex min-h-12 items-center gap-2 px-3 text-sm underline underline-offset-4"
            >
              See the five <LucideArrowDown className="size-4" aria-hidden="true" />
            </a>
          </div>
        </div>
        <div
          className="border-border bg-card flex flex-col gap-5 border p-5 sm:p-7"
          aria-label="Example customer conversation"
        >
          <div className="flex items-center justify-between gap-4">
            <p className="text-muted-foreground font-mono text-xs tracking-wider uppercase">
              Example · WhatsApp · 21:47
            </p>
            <span className="bg-foreground size-2 rounded-full" aria-label="Conversation handled" />
          </div>
          <div className="border-border bg-background max-w-[90%] self-start border px-4 py-3">
            Hi, any chance of a table for six on Saturday?
          </div>
          <div className="bg-foreground text-background max-w-[90%] self-end px-4 py-3">
            Yes, we have 7:30 or 8:15. Which suits you? I can hold one now.
          </div>
          <div className="border-border bg-background max-w-[90%] self-start border px-4 py-3">
            7:30 please. Name's Priya.
          </div>
          <div className="bg-foreground text-background max-w-[90%] self-end px-4 py-3">
            Held for Priya: six at 7:30, Saturday. See you then.
          </div>
          <p className="border-border text-muted-foreground border-t pt-4 font-mono text-xs tracking-wider uppercase">
            Answered while the team was busy
          </p>
        </div>
      </section>

      <section className="layout-stack grid gap-8 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)]">
        <div>
          <p className="heading-display-sm text-muted-foreground">What's slipping through</p>
          <h2 className="heading-cta text-foreground mt-4 max-w-2xl">{business.problemHeadline}</h2>
        </div>
        <ol className="border-border flex flex-col border-b">
          {business.problems.map((problem, index) => (
            <li
              key={problem}
              className="border-border grid grid-cols-[3rem_1fr] gap-4 border-t py-5 sm:grid-cols-[4rem_1fr] sm:py-6"
            >
              <span className="text-muted-foreground font-mono text-sm">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="text-foreground text-lg leading-snug sm:text-xl">{problem}</span>
            </li>
          ))}
        </ol>
      </section>

      <section id="automations" className="layout-stack scroll-mt-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="heading-display-sm text-muted-foreground">
              Five automations · fixed prices
            </p>
            <h2 className="heading-cta text-foreground mt-3">Pick what would help.</h2>
          </div>
          <p className="text-muted-foreground max-w-sm text-sm">
            Build price is agreed before work starts. Ongoing service starts at £79 a month for each
            automation.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {business.automations.map((automation, index) => {
            const isSelected = selected.has(automation.name);
            return (
              <article
                key={automation.name}
                className={`border-border flex min-h-72 flex-col border p-5 sm:p-6 ${isSelected ? "bg-muted" : "bg-card"}`}
              >
                <div className="text-muted-foreground flex items-center justify-between gap-3 font-mono text-xs tracking-wider uppercase">
                  <span>{String(index + 1).padStart(2, "0")} · Fixed price</span>
                  {isSelected && (
                    <span className="text-foreground flex items-center gap-1">
                      <LucideCheck aria-hidden="true" className="size-4" /> In your list
                    </span>
                  )}
                </div>
                <h3 className="mt-6 text-2xl">{automation.name}</h3>
                <p className="text-muted-foreground mt-3 leading-relaxed">
                  {automation.description}
                </p>
                <div className="mt-auto pt-8">
                  <p className="text-foreground text-3xl font-semibold">
                    {currency(automation.price)}
                  </p>
                  <p className="text-muted-foreground mt-1 text-sm">
                    Then from £79 a month to keep it running
                  </p>
                  <Button
                    type="button"
                    variant={isSelected ? "outline" : "default"}
                    className="press mt-5 min-h-11 w-full rounded-sm"
                    aria-pressed={isSelected}
                    onClick={() => toggle(automation.name)}
                  >
                    {isSelected ? "Remove from my list" : "Add to my list"}
                  </Button>
                </div>
              </article>
            );
          })}
          <article className="bg-foreground text-background flex min-h-72 flex-col p-5 sm:p-6">
            <p className="text-background/70 font-mono text-xs tracking-wider uppercase">
              Best value · Bundle
            </p>
            <h3 className="mt-6 text-2xl">Any three</h3>
            <p className="text-background/80 mt-3 leading-relaxed">
              Pick any three automations and I'll build them together, with 15% off the total.
            </p>
            <div className="mt-auto flex items-end justify-between gap-3 pt-8">
              <div>
                <p className="text-3xl font-semibold">15% off</p>
                <p className="text-background/70 mt-1 text-sm">Monthly fee stays per automation</p>
              </div>
              <a
                href={chosen.length >= 3 ? enquiryHref : "#automations"}
                aria-label={
                  chosen.length >= 3
                    ? "Ask about the selected bundle"
                    : "Choose three automations to build a bundle"
                }
                className="border-background/40 hover:bg-background hover:text-foreground inline-flex min-h-11 items-center gap-2 border px-4 font-mono text-xs tracking-wide uppercase"
              >
                {chosen.length >= 3 ? "Build my bundle" : "Choose three first"}{" "}
                <LucideArrowRight className="size-4" aria-hidden="true" />
              </a>
            </div>
          </article>
        </div>

        {chosen.length > 0 && (
          <aside
            className="border-border bg-muted mt-2 grid gap-4 border p-5 sm:grid-cols-[1fr_auto] sm:items-center sm:p-6"
            aria-live="polite"
          >
            <div>
              <h3 className="text-lg">
                Your list · {chosen.length} {chosen.length === 1 ? "automation" : "automations"}
              </h3>
              <p className="text-muted-foreground mt-1">
                {chosen.map((item) => item.name).join(" · ")}
              </p>
              <p className="text-muted-foreground mt-2 text-sm">
                {chosen.length >= 3
                  ? `15% bundle discount · ${currency(discount)} saved`
                  : "Choose three or more for 15% off the build price."}{" "}
                Ongoing service is from £79/month per automation.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4 sm:justify-end">
              <span className="text-foreground text-xl font-semibold">{currency(total)}</span>
              <a
                href={enquiryHref}
                className="btn-keycap bg-primary text-primary-foreground inline-flex min-h-11 items-center justify-center px-5 font-mono text-xs font-bold tracking-wide uppercase"
              >
                Ask about this list
              </a>
            </div>
          </aside>
        )}
      </section>

      <section className="border-border bg-muted layout-stack grid gap-6 border p-6 sm:p-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-center">
        <div>
          <p className="heading-display-sm text-muted-foreground">A practical starting point</p>
          <h2 className="text-foreground mt-3 text-3xl">One good result can cover the cost.</h2>
        </div>
        <p className="text-foreground text-lg leading-relaxed">{business.payback}</p>
      </section>

      <section className="layout-stack grid gap-8 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)]">
        <div>
          <p className="heading-display-sm text-muted-foreground">What "done" looks like</p>
          <h2 className="text-foreground mt-3 text-3xl">Clear before we start.</h2>
          <p className="text-muted-foreground mt-3">{business.doneTitle}</p>
        </div>
        <ul className="border-border flex flex-col border-b">
          {business.done.map((item) => (
            <li key={item} className="border-border flex gap-4 border-t py-4">
              <LucideCheck className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      <section
        id="book"
        className="bg-foreground text-background layout-stack flex flex-col items-start gap-5 px-6 py-12 sm:px-10 sm:py-16"
      >
        <p className="text-background/70 font-mono text-xs tracking-wider uppercase">
          Not sure which one fits?
        </p>
        <h2 className="heading-cta max-w-3xl">Book a free missed-enquiries check.</h2>
        <p className="text-background/80 max-w-2xl text-lg leading-relaxed">{business.checkCopy}</p>
        <a
          href={enquiryHref}
          className="btn-keycap bg-background text-foreground inline-flex min-h-12 items-center justify-center px-6 font-mono text-sm font-bold tracking-wide uppercase"
        >
          Book a free check
        </a>
      </section>

      <footer className="border-border text-muted-foreground layout-stack flex flex-wrap justify-between gap-3 border-t py-6 font-mono text-xs tracking-wider uppercase">
        <span>Ponti Studios · Bermondsey, London SE1</span>
        <a href="mailto:hello@ponti.io" className="underline underline-offset-4">
          hello@ponti.io
        </a>
        <div className="flex gap-4">
          {localBusinesses
            .filter((entry) => entry.slug !== business.slug)
            .map((entry) => (
              <Link
                key={entry.slug}
                to={`/local-business/${entry.slug}`}
                className="hover:text-foreground"
              >
                {entry.shortName}
              </Link>
            ))}
        </div>
      </footer>
    </div>
  );
}
