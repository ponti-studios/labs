import { Link } from "react-router";

import { BOOK_CALL_URL } from "~/data/studio";
import { pageMeta } from "~/lib/seo";
import { t } from "~/translations";

const copy = t.playgroundEssays;

export function meta() {
  return pageMeta({
    title: copy.meta.title,
    description: copy.meta.description,
    path: "/playground/essays",
  });
}

export default function PlaygroundEssays() {
  return (
    <main className="storefront-main sf-essays">
      <section className="sf-wrap sf-essays-hero">
        <h1 className="sf-h1">{copy.hero.title}</h1>
        <p className="sf-copy">{copy.hero.dek}</p>
        <nav className="sf-essays-index" aria-label="Jump to an essay">
          {copy.entries.map((entry, index) => (
            <a key={entry.slug} href={`#${entry.slug}`}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              {entry.title}
            </a>
          ))}
        </nav>
      </section>

      <section className="sf-wrap sf-essays-list" aria-label="Essays">
        {copy.entries.map((entry, index) => (
          <article className="sf-essay-row" id={entry.slug} key={entry.slug}>
            <div className="sf-essay-heading">
              <span className="sf-meta">{String(index + 1).padStart(2, "0")}</span>
              <h2>{entry.title}</h2>
              <p className="sf-essay-meta">{entry.medium}</p>
            </div>
            <div className="sf-essay-body">
              {entry.paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 40)}>{paragraph}</p>
              ))}
              <Link to={entry.specimen} prefetch="intent" className="sf-essay-link">
                Open the experiment <span aria-hidden="true">↗</span>
              </Link>
            </div>
          </article>
        ))}
      </section>

      <section className="sf-wrap sf-essays-footer">
        <h2 className="sf-h2">Ideas are better when they move.</h2>
        <div>
          <Link to="/projects" className="sf-essay-link">Explore the Lab <span aria-hidden="true">↗</span></Link>
          <a href={BOOK_CALL_URL} className="sf-button btn-keycap">Book a call</a>
        </div>
      </section>
    </main>
  );
}
