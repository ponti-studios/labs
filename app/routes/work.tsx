import { RevealGroup, RevealItem } from "~/components/Reveal";
import { CaseRow } from "~/components/work/case-row";
import { BOOK_CALL_URL, FEATURED_CASE_SLUGS, caseSnapshots } from "~/data/studio";
import { pageMeta } from "~/lib/seo";
import { t } from "~/translations";

const copy = t.work;

const orderedCases = FEATURED_CASE_SLUGS.flatMap((slug) => {
  const snapshot = caseSnapshots.find((s) => s.slug === slug);
  return snapshot ? [snapshot] : [];
}).concat(
  caseSnapshots.filter((s) => !(FEATURED_CASE_SLUGS as readonly string[]).includes(s.slug)),
);

export function meta() {
  return pageMeta({
    title: copy.meta.title,
    description: copy.meta.description,
    path: "/work",
  });
}

export default function Work() {
  return (
    <div className="sf-work-page">
      <section className="sf-wrap sf-work-hero">
        <h1 className="sf-h1">{copy.hero.title}</h1>
        <p className="sf-copy">{copy.hero.subtitle}</p>
      </section>

      <section className="sf-wrap sf-work-list" aria-label="Selected case studies">
        <RevealGroup className="sf-case-list">
          {orderedCases.map((snapshot) => (
            <RevealItem key={snapshot.slug}>
              <CaseRow snapshot={snapshot} />
            </RevealItem>
          ))}
        </RevealGroup>
      </section>

      <section className="sf-dark sf-work-cta">
        <div className="sf-wrap sf-work-cta-inner">
          <h2 className="sf-h2">Have a problem worth solving?</h2>
          <a className="sf-button" href={BOOK_CALL_URL}>
            Book a call
          </a>
        </div>
      </section>
    </div>
  );
}
