import { Link } from "react-router";
import { ListRowMedia } from "~/components/ListRowMedia";
import { caseLogos, caseSnapshots } from "~/data/studio";
import { t } from "~/translations";

const copy = t.work;

export function meta(): Array<{
  title?: string;
  name?: string;
  content?: string;
}> {
  return [{ title: copy.meta.title }, { name: "description", content: copy.meta.description }];
}

/** Index only. Each row is a pointer into a case study — not a preview of it. */
export default function Work() {
  return (
    <div className="page-shell">
      <section className="layout-stack">
        <h1 className="display-1 text-primary max-w-4xl">{copy.hero.title}</h1>
      </section>

      <section className="layout-stack">
        <div className="border-subtle divide-border-subtle divide-y border-b">
          {caseSnapshots.map((snapshot) => (
            <div
              key={snapshot.slug}
              className="list-row group"
            >
              <Link
                to={`/work/${snapshot.slug}`}
                prefetch="intent"
                className="hover:bg-inset/20 focus-visible:outline-ring flex min-w-0 flex-1 flex-row items-start gap-4 transition-colors outline-none focus-visible:outline-2 focus-visible:outline-offset-2 md:gap-6"
              >
                {caseLogos[snapshot.slug] ? (
                  <ListRowMedia
                    fallback={snapshot.client.slice(0, 2).toUpperCase()}
                    src={caseLogos[snapshot.slug]}
                    variant="square"
                  />
                ) : null}
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="body-4 text-secondary uppercase tracking-wide">
                    {snapshot.industry}
                  </span>
                  <h3 className="heading-2 text-primary group-hover:text-accent transition-colors motion-reduce:transition-none">
                    {snapshot.client}
                  </h3>
                  <p className="body-2 text-secondary max-w-2xl">{snapshot.description}</p>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
