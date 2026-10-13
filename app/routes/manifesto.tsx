import { Link } from "react-router";

import { BOOK_CALL_URL } from "~/data/studio";
import { pageMeta } from "~/lib/seo";
import { t } from "~/translations";

const copy = t.manifesto;

export function meta() {
  return pageMeta({
    title: copy.meta.title,
    description: copy.meta.description,
    path: "/manifesto",
  });
}

export default function Manifesto() {
  return (
    <main className="storefront-main sf-manifesto">
      <section className="sf-wrap sf-manifesto-hero">
        <h1 className="sf-h1">{copy.hero.title}</h1>
      </section>

      <section className="sf-wrap sf-manifesto-principles" aria-label="Principles">
        {copy.tenets.items.map((tenet) => (
          <article className="sf-manifesto-row" key={tenet.title}>
            <h2>{tenet.title}</h2>
            <p>{tenet.description}</p>
          </article>
        ))}
      </section>

      <section className="sf-manifesto-quote-wrap">
        <blockquote className="sf-wrap sf-manifesto-quote">
          <span aria-hidden="true">“</span>
          <p>{copy.quote}</p>
        </blockquote>
      </section>

      <section className="sf-wrap sf-manifesto-cta">
        <h2 className="sf-h2">Have a problem worth solving?</h2>
        <a className="sf-button btn-keycap" href={BOOK_CALL_URL}>Book a call</a>
        <Link className="sf-manifesto-services" to="/services">See what I can help with</Link>
      </section>
    </main>
  );
}
