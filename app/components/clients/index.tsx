import { LucideArrowRightCircle } from "lucide-react";
import { memo } from "react";
import { Link } from "react-router";
import { GlyphText } from "~/components/GlyphText";
import { RevealGroup, RevealItem } from "~/components/Reveal";
import { CaseTile } from "~/components/work/case-tile";
import { caseSnapshots } from "~/data/studio";
import { t } from "~/translations";

// Editorial pick: the six outcomes that read strongest at a glance.
const FEATURED_SLUGS = ["streamyard", "thomson-reuters", "kensho", "lumina", "glow", "prolog"];

const FEATURED_CASES = FEATURED_SLUGS.flatMap((slug) => {
  const snapshot = caseSnapshots.find((entry) => entry.slug === slug);
  return snapshot ? [snapshot] : [];
});

/** Home-page proof: outcome-led case-study tiles, linking through to /work. */
export const FeaturedClients = memo(function FeaturedClients() {
  return (
    <section
      aria-labelledby="clients-title"
      className="border-border flex flex-col gap-8 border-t pt-12"
    >
      <div className="flex items-center gap-12">
        <h2 id="clients-title" className="heading-cta text-foreground max-w-3xl">
          <GlyphText text={t.home.clients.title} />
        </h2>
        <Link to="/work" prefetch="intent" aria-label={t.nav.work}>
          <LucideArrowRightCircle size={48} aria-hidden="true" />
        </Link>
      </div>
      <RevealGroup className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURED_CASES.map((snapshot) => (
          <RevealItem key={snapshot.slug} className="h-full">
            <CaseTile snapshot={snapshot} />
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  );
});
