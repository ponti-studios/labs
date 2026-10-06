import { LucideArrowBigRight } from "lucide-react";
import { Link } from "react-router";
import { caseLogos, type CaseSnapshot } from "~/data/studio";
import { cn } from "~/lib/utils";

/**
 * Case-study tile: the client's strongest real outcome leads. The whole tile
 * links to the case study (which carries the full results); the arrow is a
 * symbol, not text.
 */
export function CaseTile({ snapshot, className }: { snapshot: CaseSnapshot; className?: string }) {
  const [lead] = snapshot.outcomes;
  const logo = caseLogos[snapshot.slug];

  return (
    <Link
      to={`/work/${snapshot.slug}`}
      prefetch="intent"
      data-testid={`case-tile-${snapshot.slug}`}
      className={cn(
        "group border-border bg-card hover:border-foreground focus-visible:ring-foreground flex h-full flex-col justify-between gap-12 rounded-sm border p-6 transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        {logo ? (
          <span className="border-border rounded-sm border bg-white p-1.5">
            <img src={logo} alt="" className="size-7 object-contain grayscale" />
          </span>
        ) : (
          <span />
        )}
        <span className="text-muted-foreground text-sm">{snapshot.industry}</span>
      </div>

      {lead && (
        <div className="flex flex-col gap-2">
          <b className="text-foreground text-5xl font-semibold tracking-tight tabular-nums sm:text-6xl">
            {lead.value}
          </b>
          <p className="text-muted-foreground max-w-[30ch] text-sm leading-snug">{lead.label}</p>
        </div>
      )}

      <div className="border-border flex items-end justify-between gap-4 border-t pt-4">
        <div className="min-w-0">
          <h3 className="text-foreground text-base font-semibold tracking-tight">
            {snapshot.client}
          </h3>
          <p className="text-muted-foreground line-clamp-2 min-h-[2.4rem] text-sm leading-snug">
            {snapshot.description}
          </p>
        </div>
        <span
          aria-hidden="true"
          className="text-muted-foreground group-hover:text-foreground font-mono text-xl leading-none transition-transform duration-200 group-hover:translate-x-0.5"
        >
          <LucideArrowBigRight />
        </span>
      </div>
    </Link>
  );
}
