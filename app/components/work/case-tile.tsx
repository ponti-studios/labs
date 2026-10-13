import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router";
import { caseLogos, type CaseSnapshot } from "~/data/studio";
import { cn } from "~/lib/utils";

/**
 * Featured case: company and category, clearest outcome, and context.
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
        "sf-case-card group focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--sf-brass)]",
        className,
      )}
    >
      <div className="sf-case-top">
        <div className="sf-case-identity">
          {logo && (
            <span className="sf-case-logo">
              <img src={logo} alt="" />
            </span>
          )}
          <div className="min-w-0">
            <h3>{snapshot.client}</h3>
          </div>
        </div>
        <ArrowUpRight aria-hidden="true" className="sf-case-arrow" />
      </div>

      <p className="sf-case-description">{snapshot.description}</p>

      {lead && (
        <p className="sf-case-outcome">
          <strong>{lead.value}</strong>
          <span>{lead.label}</span>
        </p>
      )}
      <div className="sf-case-footer">
        <span>{snapshot.timeline}</span>
        <span className="sf-case-read">
          Read the case <span aria-hidden="true">→</span>
        </span>
      </div>
    </Link>
  );
}
