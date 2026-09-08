import { useMemo, useState } from "react";
import { RevealGroup, RevealItem } from "~/components/Reveal";
import { ProjectCard } from "~/components/projects/project-card";
import { caseSnapshots } from "~/data/studio";
import { CLIENT_CARDS } from "~/lib/client-cards";
import { cn } from "~/lib/utils";
import { t } from "~/translations";

const copy = t.work;

export function meta(): Array<{
  title?: string;
  name?: string;
  content?: string;
}> {
  return [{ title: copy.meta.title }, { name: "description", content: copy.meta.description }];
}

const INDUSTRIES = Array.from(new Set(caseSnapshots.map((snapshot) => snapshot.industry)));

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "press min-h-9 rounded-full border px-4 text-sm font-medium tracking-tight whitespace-nowrap transition-colors",
        active
          ? "border-accent bg-accent text-accent-foreground"
          : "border-border text-muted-foreground hover:border-accent hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

/** Full client roster as the same credit-card grid used on the home page — every case study is one click away. */
export default function Work() {
  const [industry, setIndustry] = useState<string | null>(null);
  const visibleCards = useMemo(
    () => (industry ? CLIENT_CARDS.filter((card) => card.status === industry) : CLIENT_CARDS),
    [industry],
  );

  return (
    <div className="page-shell">
      <section className="layout-stack">
        <h1 className="heading-hero text-foreground max-w-4xl">{copy.hero.title}</h1>
        <p className="text-muted-foreground max-w-2xl text-lg leading-relaxed">
          {copy.hero.subtitle}
        </p>
      </section>

      <section className="layout-stack">
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
          <FilterChip active={industry === null} onClick={() => setIndustry(null)}>
            {copy.filterAllLabel}
          </FilterChip>
          {INDUSTRIES.map((entry) => (
            <FilterChip
              key={entry}
              active={industry === entry}
              onClick={() => setIndustry((current) => (current === entry ? null : entry))}
            >
              {entry}
            </FilterChip>
          ))}
        </div>

        <RevealGroup className="grid grid-cols-1 place-items-center gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visibleCards.map((card) => (
            <RevealItem key={card.id}>
              <ProjectCard {...card} data-testid={`work-client-${card.id}`} />
            </RevealItem>
          ))}
        </RevealGroup>
      </section>
    </div>
  );
}
