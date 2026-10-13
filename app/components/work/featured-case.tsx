import { LucideArrowRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { caseLogos, caseShot, type CaseSnapshot } from "~/data/studio";

/**
 * Home-page case: a large product shot with the strongest result as its
 * caption. Until a screenshot exists at `caseShot(slug)`, a quiet placeholder
 * stands in, so the layout never depends on the asset.
 */
export function FeaturedCase({ snapshot, ai = false }: { snapshot: CaseSnapshot; ai?: boolean }) {
  const [lead] = snapshot.outcomes;
  const logo = caseLogos[snapshot.slug];
  const imgRef = useRef<HTMLImageElement>(null);
  const [missing, setMissing] = useState(false);

  // An image that failed before hydration never fires onError on the client.
  useEffect(() => {
    const img = imgRef.current;
    if (img?.complete && img.naturalWidth === 0) setMissing(true);
  }, []);

  return (
    <Link
      to={`/work/${snapshot.slug}`}
      prefetch="intent"
      data-testid={`featured-case-${snapshot.slug}`}
      className="group focus-visible:ring-foreground flex flex-col gap-4 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
    >
      <div className="border-border bg-card group-hover:border-foreground relative aspect-[4/3] overflow-hidden rounded-sm border transition-colors duration-200 sm:aspect-[16/10]">
        {missing ? (
          <div className="text-muted-foreground absolute inset-0 flex flex-col items-center justify-center gap-3">
            {logo && (
              <img src={logo} alt="" className="size-12 object-contain opacity-60 grayscale" />
            )}
            <span className="font-mono text-xs">{snapshot.client}</span>
          </div>
        ) : (
          <img
            ref={imgRef}
            src={caseShot(snapshot.slug)}
            alt={`${snapshot.client} product screenshot`}
            loading="lazy"
            onError={() => setMissing(true)}
            className="absolute inset-0 size-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.02]"
          />
        )}
        {ai && (
          <span className="border-border bg-background text-foreground absolute top-3 left-3 rounded-full border px-2 py-0.5 font-mono text-xs">
            AI
          </span>
        )}
      </div>

      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h3 className="text-foreground text-xl font-semibold tracking-tight">
            {snapshot.client}
          </h3>
          {lead && (
            <p className="text-muted-foreground text-base leading-snug text-balance">
              <span className="text-foreground font-medium tabular-nums">{lead.value}</span>{" "}
              {lead.label}
            </p>
          )}
        </div>
        <LucideArrowRight
          aria-hidden="true"
          className="text-muted-foreground group-hover:text-foreground mt-1 size-5 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5"
        />
      </div>
    </Link>
  );
}
