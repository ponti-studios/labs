import { Button, ParticleBackground } from "@pontistudios/ui";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, Blocks, BriefcaseBusiness, Check, Lightbulb, RefreshCcw } from "lucide-react";
import { useState } from "react";
import { BOOK_CALL_URL } from "~/data/studio";
import { t } from "~/translations";

const engagementModes: ReadonlyArray<{
  icon: LucideIcon;
  mode: string;
  pulse: string;
  headline: string;
  bestFor: string;
  output: string;
  cadence: string;
  cta: string;
  deliverables: ReadonlyArray<string>;
}> = [
  {
    icon: BriefcaseBusiness,
    mode: "Build mode",
    pulse: "Scope locked",
    headline: "Ship the thing.",
    bestFor: "A product, redesign, modernization, or launch-critical system needs to exist.",
    output: "Production-ready build",
    cadence: "Milestone demos",
    cta: "Book a build call",
    deliverables: ["Scoped roadmap", "Working product", "Launch support"],
  },
  {
    icon: RefreshCcw,
    mode: "Loop mode",
    pulse: "Always moving",
    headline: "Keep the machine in motion.",
    bestFor: "You need a senior partner improving product, content, and delivery every week.",
    output: "Continuous momentum",
    cadence: "Weekly operating loop",
    cta: "Book a retainer call",
    deliverables: ["Priority queue", "Weekly shipping rhythm", "Decision support"],
  },
  {
    icon: Lightbulb,
    mode: "Decision mode",
    pulse: "Sharp answer",
    headline: "Get unstuck fast.",
    bestFor: "An expensive product, technical, or positioning decision needs a clear answer.",
    output: "Written recommendation",
    cadence: "Focused review",
    cta: "Book an advisory call",
    deliverables: ["Audit findings", "Tradeoff map", "Action plan"],
  },
  {
    icon: Blocks,
    mode: "Embedded mode",
    pulse: "Full stack",
    headline: "Borrow the whole studio.",
    bestFor: "You need product, design, and engineering capacity without hiring a team yet.",
    output: "Temporary product team",
    cadence: "Embedded execution",
    cta: "Book a team call",
    deliverables: ["Product leadership", "Design direction", "Engineering delivery"],
  },
];

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
  const [activeModeIndex, setActiveModeIndex] = useState(0);
  const activeMode = engagementModes[activeModeIndex];
  const activeModel = t.process.engagementModels.items[activeModeIndex];

  return (
    <div className="relative flex w-full flex-col px-4 sm:px-6">
      <ParticleBackground
        className="opacity-70"
        particleDensity={3600}
        maxLinkDistance={120}
        velocity={0.12}
        palette={{ particle: "212,165,116", link: "212,165,116" }}
      />

      <section className="border-border/60 relative flex flex-col gap-8 border-b py-16">
        <div className="grid gap-4 lg:grid-cols-[0.65fr_1fr] lg:items-end">
          <div className="flex flex-col gap-2">
            <span className="ui-eyebrow">Engagement shape</span>
            <h2 className="heading-2 text-foreground">{t.process.engagementModels.title}</h2>
          </div>
          <p className="body-2 text-muted-foreground max-w-2xl lg:justify-self-end">
            Pick the operating mode that matches the pressure in the room. Some projects need a
            launch partner. Some need a decision, a rhythm, or a whole temporary team.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-[0.78fr_1.22fr]">
          <div className="border-border/60 bg-card/70 shadow-low flex flex-col gap-6 rounded-lg border p-5 backdrop-blur">
            <div className="flex items-start justify-between gap-4">
              <span className="ui-eyebrow">Mode selector</span>
            </div>

            <div className="grid gap-2" role="group" aria-label="Choose an engagement mode">
              {engagementModes.map((mode, index) => {
                const Icon = mode.icon;
                const isActive = index === activeModeIndex;

                return (
                  <button
                    key={mode.mode}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => setActiveModeIndex(index)}
                    className={[
                      "focus-visible:outline-ring grid min-h-16 cursor-pointer gap-3 rounded-md border p-3 text-left outline-none transition-colors focus-visible:outline-2 focus-visible:outline-offset-2",
                      "sm:grid-cols-[auto_1fr_auto] sm:items-center",
                      isActive
                        ? "border-foreground bg-background text-foreground"
                        : "border-border/60 bg-background/50 text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                    ].join(" ")}
                  >
                    <div className="flex items-center gap-3">
                      <span className="mono">{String(index + 1).padStart(2, "0")}</span>
                      <span className="border-border/60 bg-card flex size-9 items-center justify-center rounded-md border">
                        <Icon className="size-4" aria-hidden="true" />
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="subheading-3 text-foreground">{mode.mode}</span>
                      <span className="body-4">{mode.pulse}</span>
                    </div>
                    <ArrowRight
                      className={[
                        "hidden size-4 sm:block",
                        isActive ? "text-foreground" : "text-muted-foreground",
                      ].join(" ")}
                      aria-hidden="true"
                    />
                  </button>
                );
              })}
            </div>
          </div>

          <div
            key={activeMode.mode}
            className="border-border/60 bg-card/70 shadow-low grid gap-5 rounded-lg border p-5 backdrop-blur lg:grid-cols-[1fr_0.78fr]"
            aria-live="polite"
          >
            <div className="flex flex-col justify-between gap-8">
              <div className="flex flex-col gap-4">
                <h3 className="heading-2 text-foreground">{activeMode.headline}</h3>
                <p className="body-2 text-muted-foreground">{activeMode.bestFor}</p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button asChild size="lg">
                  <a href={BOOK_CALL_URL} target="_blank" rel="noreferrer">
                    {activeMode.cta}
                  </a>
                </Button>
              </div>
            </div>

            <div className="grid gap-3">
              <div className="border-border/60 bg-background/50 rounded-md border p-4">
                <span className="ui-eyebrow">Signal</span>
                <dl className="mt-4 grid gap-3">
                  {[
                    ["Output", activeMode.output],
                    ["Cadence", activeMode.cadence],
                    ["Shape", activeModel.name],
                  ].map(([label, value]) => (
                    <div key={label} className="flex items-center justify-between gap-4">
                      <dt className="body-4 text-muted-foreground">{label}</dt>
                      <dd className="subheading-3 text-foreground text-right">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div className="border-border/60 bg-background/50 rounded-md border p-4">
                <span className="ui-eyebrow">Included</span>
                <ul className="mt-4 grid gap-3">
                  {activeMode.deliverables.map((deliverable) => (
                    <li key={deliverable} className="flex items-center gap-2">
                      <Check className="text-success size-4 shrink-0" aria-hidden="true" />
                      <span className="body-3 text-foreground">{deliverable}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-border/60 relative grid gap-10 border-b py-16 lg:grid-cols-[0.35fr_0.65fr]">
        <div className="flex flex-col gap-3 lg:sticky lg:top-24 lg:self-start">
          <span className="ui-eyebrow">Operating cadence</span>
          <h2 className="heading-2 text-foreground">{t.process.steps.title}</h2>
          <p className="body-2 text-muted-foreground">
            Every phase has a job. We do not advance because a calendar says so; we advance when the
            decision, artifact, or shipped increment is real.
          </p>
        </div>
        <ol className="flex flex-col">
          {t.process.steps.items.map((step, index) => (
            <li
              key={step.step}
              className={[
                "border-border/60 grid gap-4 border-t py-6 sm:grid-cols-[auto_1fr]",
                index === t.process.steps.items.length - 1 ? "border-b" : "",
              ].join(" ")}
            >
              <div className="sm:w-36">
                <span className="mono text-foreground">{step.step}</span>
              </div>
              <div className="grid gap-3 lg:grid-cols-[0.35fr_0.65fr]">
                <h3 className="heading-4 text-foreground">{step.title}</h3>
                <p className="body-2 text-muted-foreground max-w-2xl">{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
