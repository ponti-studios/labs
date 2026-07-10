import { Link } from "react-router";
import { caseSnapshots } from "~/data/studio";
import { t } from "~/translations";

const copy = t.work;

export function meta(): Array<{
  title?: string;
  name?: string;
  content?: string;
}> {
  return [
    { title: copy.meta.title },
    { name: "description", content: copy.meta.description },
  ];
}

/**
 * Index only. Each row is a pointer into a case study — not a preview of it.
 * Problem, approach, full outcomes, and services live on /work/:slug.
 */
export default function Work() {
  return (
    <div className="flex w-full flex-col">
      <section className="border-border/60 flex flex-col gap-6 border-b px-6 py-20 sm:px-10 sm:py-28">
        <h1 className="display-1 text-foreground max-w-4xl">{copy.hero.title}</h1>
        <p className="body-1 text-muted-foreground max-w-2xl">{copy.hero.body}</p>
      </section>

      <section className="flex flex-col px-6 py-10 sm:px-10 sm:py-12">
        <ul className="flex flex-col">
          {caseSnapshots.map((snapshot) => {
            const hook = snapshot.outcomes[0];
            return (
              <li key={snapshot.slug} className="border-border/60 border-b last:border-b-0">
                <Link
                  to={`/work/${snapshot.slug}`}
                  className="group focus-visible:outline-ring grid gap-2 py-6 outline-none focus-visible:outline-2 focus-visible:outline-offset-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,12rem)_auto] sm:items-baseline sm:gap-8 sm:py-7"
                >
                  <span className="heading-3 text-foreground group-hover:text-accent transition-colors">
                    {snapshot.client}
                  </span>
                  <span className="body-3 text-muted-foreground">
                    {snapshot.industry}
                    <span className="text-muted-foreground/50 mx-2" aria-hidden="true">
                      ·
                    </span>
                    {snapshot.timeline}
                  </span>
                  {hook ? (
                    <span className="body-2 text-accent sm:text-right">
                      {hook.value}
                      <span className="text-muted-foreground ml-2 font-normal">{hook.label}</span>
                    </span>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
