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
      <section className="content-stack">
        <h1 className="display-1 text-foreground max-w-4xl">{copy.hero.title}</h1>
      </section>

      <section className="content-stack">
        <div className="border-border/40 divide-border/40 divide-y border-b">
          {caseSnapshots.map((snapshot) => (
            <div
              key={snapshot.slug}
              className="content-list-row group flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
            >
              <Link
                to={`/work/${snapshot.slug}`}
                prefetch="intent"
                className="hover:bg-muted/20 focus-visible:outline-ring flex min-w-0 flex-1 flex-row items-center gap-3 transition-colors outline-none focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                {caseLogos[snapshot.slug] ? (
                  <ListRowMedia
                    fallback={snapshot.client.slice(0, 2).toUpperCase()}
                    src={caseLogos[snapshot.slug]}
                    variant="square"
                  />
                ) : null}
                <div className="flex min-w-0 flex-col gap-1">
                  <span className="body-4 text-muted-foreground">{snapshot.industry}</span>
                  <h3 className="heading-3 text-foreground group-hover:text-accent transition-colors">
                    {snapshot.client}
                  </h3>
                  <p className="body-3 text-muted-foreground max-w-2xl">{snapshot.description}</p>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
