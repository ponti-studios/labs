import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router";
import { caseLogos, type CaseSnapshot } from "~/data/studio";

const caseSummaries: Record<string, string> = {
  prolog:
    "Showrunners were buried in script submissions. AI sorts the details; people handle the uncertain calls.",
  streamyard:
    "New streamers struggled to find guests. Better matching and introductions helped them keep going.",
  lumina:
    "Learners struggled to find and finish courses. Rebuilt discovery, checkout, and grading around the full learning journey.",
  revrock:
    "Musicians planned tours without knowing where the audience or money was. Built routing and revenue planning around real demand.",
  whistle:
    "Dance teachers needed video that showed movement clearly. Built live classes for full-body instruction and uneven networks.",
  kensho:
    "Financial research data arrived too slowly. Rebuilt the pipeline to stream market data in near real time.",
  humana:
    "Care teams worked from fragmented, stale records. Connected care tools and brought claims data up to date.",
  mimecast:
    "White-label identity rollouts were blocked by one-size-fits-all software. Built flexible themes and clearer delivery ownership.",
  "help-refugees":
    "Volunteer applications needed careful screening at scale. Built intake checks so invalid submissions stopped before operations.",
  "thomson-reuters":
    "Global teams waited on slow deployment and monitoring tools. Brought both into one faster, dependable platform.",
  glow: "Ad teams spent too much time making repetitive campaign changes. Automated campaign optimisation across Facebook Ads.",
};

/** A column row that says what was broken and what changed. */
export function CaseRow({ snapshot }: { snapshot: CaseSnapshot }) {
  const logo = caseLogos[snapshot.slug];

  return (
    <Link
      to={`/work/${snapshot.slug}`}
      prefetch="intent"
      data-testid={`case-row-${snapshot.slug}`}
      className="sf-case-row group focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--studio-brass)]"
    >
      {logo && (
        <span className="sf-case-logo">
          <img src={logo} alt="" />
        </span>
      )}
      <div className="sf-case-row-copy">
        <h3>{snapshot.client}</h3>
        <p>{caseSummaries[snapshot.slug] ?? snapshot.description}</p>
      </div>
      <ArrowUpRight aria-hidden="true" className="sf-case-arrow" />
    </Link>
  );
}
