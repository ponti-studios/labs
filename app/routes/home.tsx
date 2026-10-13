import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@ponti-studios/ui/data-display";
import { ArrowRight, Coffee, PawPrint, Scissors, Store, Utensils, Wrench } from "lucide-react";
import { Link } from "react-router";

import { AsciiField } from "~/components/AsciiField";
import { localBusinessExamples } from "~/data/local-business-examples";
import { BOOK_CALL_URL } from "~/data/studio";
import { pageMeta } from "~/lib/seo";

export function meta() {
  return pageMeta({ title: "Ponti Studios — Computational intelligence", description: "A studio for AI systems, automation, and the software around them. For startups, for enterprises, and for the business down the road.", path: "/" });
}

const services = ["Build", "Infrastructure", "Design", "Delivery", "Leadership", "Due Diligence", "Diagnosis", "Strategy"];
const cases = [
  ["Thomson Reuters", "One place for global teams to deploy and monitor their software.", "The main API went from 13.8 seconds to 0.5."],
  ["Prolog", "AI that reviews submissions for showrunner teams.", "About 95% of the details it pulls out are accurate."],
  ["StreamYard", "Guest matching that helps new streamers keep going.", "New creators were 64% more likely to still be streaming after 90 days."],
  ["Glow Digital", "Campaign optimisation and automation for advertising teams.", "Facebook Ads requests cut by 90%."],
];
const businessIcons = {
  utensils: Utensils,
  scissors: Scissors,
  wrench: Wrench,
  store: Store,
  coffee: Coffee,
  paw: PawPrint,
} as const;

export default function Home() {
  return <>
    <section className="sf-wrap sf-hero sf-dark sf-hero-galaxy">
      <AsciiField className="text-background opacity-25 sm:opacity-35" />
      <h1 className="sf-h1">Computational intelligence for real-world problems.</h1>
      <p className="sf-copy">From S&amp;P 500s to Bodegas</p>
    </section>
    <section id="do" className="sf-problem-solutions">
      <div className="sf-wrap sf-problem-solutions-content">
        <div className="sf-local-examples">
          <h2 id="local-business-title" className="sf-h2 sf-local-title">
            You got problems.<br className="sf-mobile-break" /> I solve them.
          </h2>
          <div className="sf-services">{services.map((name, i) => <div className="sf-service" key={name}><small>0{i + 1}</small>{name}</div>)}</div>
          <h3>Common problems. Clear solutions.</h3>
          <Accordion type="single" collapsible defaultValue={["restaurants"]} className="sf-business-accordion">
            {localBusinessExamples.map((business) => {
              const Icon = businessIcons[business.icon];
              return (
                <AccordionItem key={business.slug} value={business.slug} className="sf-business-item">
                  <AccordionTrigger className="sf-business-trigger">
                    <span className="sf-business-trigger-label">
                      <Icon aria-hidden="true" className="sf-business-icon" strokeWidth={1.7} />
                      <span>{business.name}</span>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="sf-business-content">
                    <div className="sf-problem-list">
                      {business.problems.map((item) => (
                        <article className="sf-problem-solution" key={item.problem}>
                          <p className="sf-problem">{item.problem}</p>
                          <p className="sf-solution"><span aria-hidden="true">→</span>{item.solution}</p>
                        </article>
                      ))}
                    </div>
                    {business.automationPage && (
                      <Link to={business.automationPage} prefetch="intent" className="sf-business-more">
                        See fixed prices <ArrowRight aria-hidden="true" className="size-4" />
                      </Link>
                    )}
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
          <a href="mailto:cj@ponti.io?subject=Free%20missed-enquiries%20check&body=Hi%20Charles%2C%0A%0AI%27d%20like%20a%20free%20missed-enquiries%20check.%0A%0ABusiness%20name%3A%0AWhat%20I%27d%20like%20to%20improve%3A%0A" className="sf-button sf-local-cta">
            Book a free missed-enquiries check
          </a>
        </div>
      </div>
    </section>
    <section id="work" className="sf-wrap sf-section"><p className="sf-label">Work</p><h2 className="sf-h2">Selected work.</h2>
      <div className="sf-work-grid">{cases.map(([client, desc, result]) => <article className="sf-work-card" key={client}><h3>{client}</h3><p>{desc}</p><strong>{result}</strong></article>)}</div>
    </section>
    <section className="sf-dark sf-section"><div className="sf-wrap"><p className="sf-label">How local automations work</p><h2 className="sf-h2">Pick one. I build it. It keeps running.</h2><div className="sf-steps">{[["Pick one.","Choose a single automation from the list for your kind of business. The price is on the page, so there is nothing to guess."],["I build it around you.","I set it up with your menu, prices, tone and tools, then we check it against a plain done-list together."],["It keeps running.","A small monthly fee, from £79 per automation, covers AI usage, messaging fees, hosting and small tweaks."]].map(([title,body],i)=><article className="sf-step" key={title}><span className="sf-meta">0{i+1}</span><h3>{title}</h3><p>{body}</p></article>)}</div></div></section>
    <section className="sf-wrap sf-section"><p className="sf-label">Every local automation includes</p><h2 className="sf-h2">No surprises on the invoice.</h2><div className="sf-assurances">{[["A fixed price","Agreed before I start. It doesn't change because the job turned out bigger."],["A plain done-list","One outcome in ordinary English, so you know exactly when it's finished."],["Two weeks of fixes","If something isn't right after launch, I put it right at no extra cost."],["An off switch","You can pause it any time, and you're always the one who decides what it says."]].map(([title,body])=><article className="sf-assurance" key={title}><h3>{title}</h3><p>{body}</p></article>)}</div></section>
    <section id="book" className="sf-dark sf-cta sf-cta-galaxy">
      <AsciiField className="text-background opacity-25 sm:opacity-35" />
      <div className="sf-wrap"><p className="sf-label">Have a problem worth solving?</p><h2 className="sf-h2">Book a call.</h2><p className="sf-copy">Tell me what you're trying to get done, whether that's a product, a pipeline or a missed-enquiries problem, and I'll tell you honestly how I'd approach it.</p><a className="sf-button" href={BOOK_CALL_URL} target="_blank" rel="noreferrer">Book a call</a></div>
    </section>
    <footer className="sf-wrap sf-footer">Ponti Studios · Bermondsey, London SE1 <span style={{float:"right"}}> <a href="mailto:cj@ponti.io" style={{color:"inherit"}}>cj@ponti.io</a></span></footer>
  </>;
}
