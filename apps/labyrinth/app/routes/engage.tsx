import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Button,
} from "@pontistudios/ui";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { HelpCircle } from "lucide-react";
import { Link, useSearchParams } from "react-router";
import { engageProblems, findEngageProblem } from "~/data/engage";
import { BOOK_CALL_URL, caseSnapshots, servicePillars } from "~/data/studio";
import { t } from "~/translations";

/** A hard cut, not a dissolve — the scene changes because a new choice was made, not to soften the change. */
const cut = { duration: 0.12, ease: "linear" as const };

function joinNaturally(items: readonly string[]): string {
  const lower = items.map((item) => item.charAt(0).toLowerCase() + item.slice(1));
  if (lower.length === 0) return "";
  if (lower.length === 1) return lower[0];
  return `${lower.slice(0, -1).join(", ")}, and ${lower[lower.length - 1]}`;
}

export function meta(): Array<{ title?: string; name?: string; content?: string }> {
  return [
    { title: "Engage | Ponti Studios" },
    {
      name: "description",
      content: "Tell me what you're solving. I'll show you the closest thing I've already built.",
    },
  ];
}

export default function Engage() {
  const reduceMotion = useReducedMotion();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeProblem = findEngageProblem(searchParams.get("problem"));
  const proof = caseSnapshots.find((snapshot) => snapshot.slug === activeProblem.proofSlug);
  const heroOutcome = proof?.outcomes[activeProblem.proofOutcomeIndex ?? 0];
  const sceneTransition = reduceMotion ? { duration: 0 } : cut;

  const selectProblem = (id: string) => {
    setSearchParams({ problem: id }, { preventScrollReset: true, replace: true });
  };

  return (
    <div className="flex w-full flex-col">
      {/* Scene one — the question. Locked frame, nothing moves. */}
      <section className="border-border/60 flex min-h-[70vh] flex-col justify-center gap-10 border-b px-6 py-24 sm:px-10">
        <h1 className="display-1 text-foreground max-w-4xl">What are you trying to solve?</h1>
        <div className="flex flex-col gap-1" role="group" aria-label="Choose a business problem">
          {engageProblems.map((problem) => {
            const isActive = problem.id === activeProblem.id;
            return (
              <button
                key={problem.id}
                type="button"
                aria-pressed={isActive}
                onClick={() => selectProblem(problem.id)}
                className={[
                  "focus-visible:outline-ring cursor-pointer py-1.5 text-left text-3xl leading-tight font-medium outline-none transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 sm:text-4xl",
                  isActive ? "text-accent" : "text-muted-foreground/50 hover:text-foreground",
                ].join(" ")}
              >
                {problem.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Scene two — the answer. Written for this exact problem, never reused. */}
      <section className="border-border/60 flex min-h-[60vh] flex-col justify-center border-b px-6 py-24 sm:px-10">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activeProblem.id}
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={sceneTransition}
            className="flex max-w-3xl flex-col gap-6"
          >
            <p className="heading-2 text-accent">{activeProblem.answerEyebrow}</p>
            <p className="body-2 text-muted-foreground max-w-xl">{activeProblem.description}</p>
            <p className="display-2 text-foreground">
              {activeProblem.answerBody} That means {joinNaturally(activeProblem.deliverables)}.
            </p>
            <div className="flex flex-wrap items-center gap-6 pt-2">
              <Button asChild size="lg">
                <a href={BOOK_CALL_URL} target="_blank" rel="noreferrer">
                  {activeProblem.cta}
                </a>
              </Button>
              <Link
                to="/work"
                className="body-2 text-foreground underline-offset-4 hover:underline"
              >
                See more work
              </Link>
            </div>
            <p className="footnote text-muted-foreground pt-4">
              Or, if you'd rather just{" "}
              <a
                href={BOOK_CALL_URL}
                target="_blank"
                rel="noreferrer"
                className="text-foreground underline-offset-4 hover:underline"
              >
                borrow the whole studio
              </a>{" "}
              for a while — product, design, and engineering leadership embedded in your team until
              the work is done.
            </p>
          </motion.div>
        </AnimatePresence>
      </section>

      {/* Scene three — the proof. A single fact, rendered like a pull quote, not a stat tile. */}
      {proof && heroOutcome ? (
        <section className="border-border/60 flex min-h-[60vh] flex-col justify-center border-b px-6 py-24 sm:px-10">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={activeProblem.id}
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={sceneTransition}
              className="flex max-w-3xl flex-col gap-4"
            >
              <p className="body-2 text-muted-foreground">Closest thing I've already built</p>
              <p className="display-1 text-accent">{heroOutcome.value}</p>
              <p className="heading-3 text-foreground">
                {heroOutcome.label} — {proof.client}, {proof.industry}
              </p>
              <p className="body-1 text-muted-foreground max-w-xl">{proof.whatWeDid}</p>
              <Link
                to={`/work/${proof.slug}`}
                className="body-2 text-foreground w-fit underline-offset-4 hover:underline"
              >
                Read the full case study →
              </Link>
            </motion.div>
          </AnimatePresence>
        </section>
      ) : null}

      {/* Below the fold — quiet, secondary, for people who'd rather browse than be routed. */}
      <section className="border-border/60 flex flex-col gap-6 border-b py-16">
        <div className="flex flex-col gap-2 px-6 sm:px-10">
          <h2 className="heading-2 text-foreground">{t.services.overview.title}</h2>
        </div>
        <div className="flex flex-col gap-10 px-6 sm:px-10">
          {servicePillars.map((pillar) => (
            <div key={pillar.name} className="flex flex-col gap-3">
              <h3 className="heading-4 text-foreground">{pillar.name}</h3>
              <Accordion type="multiple">
                {pillar.services.map((service) => (
                  <AccordionItem key={service.slug} value={service.slug} id={service.slug}>
                    <AccordionTrigger className="text-left">
                      <span className="subheading-3 text-foreground">{service.name}</span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="flex flex-col gap-2">
                        {service.deliverables.map((item) => (
                          <li key={item.label} className="ui-dash-list-item">
                            <span className="ui-dash-marker">—</span>
                            <span className="body-2 text-muted-foreground">
                              <span className="text-foreground font-medium">{item.label}:</span>{" "}
                              {item.description}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>
      </section>

      <section className="flex items-center justify-between px-6 py-6 sm:px-10">
        <p className="body-2 text-muted-foreground">{t.faq.title}</p>
        <Link
          to="/faq"
          className="body-2 text-foreground hover:text-muted-foreground flex items-center gap-2"
        >
          <HelpCircle className="size-4" aria-hidden="true" />
          {t.faq.eyebrow}
        </Link>
      </section>
    </div>
  );
}
