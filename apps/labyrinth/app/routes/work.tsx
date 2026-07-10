import { Link } from "react-router";
import { caseSnapshots } from "~/data/studio";
import { t } from "~/translations";

const copy = t.work;

export function meta(): Array<{
  title?: string;
  name?: string;
  content?: string;
}> {
  return [{ title: copy.meta.title }, { name: "description", content: copy.meta.description }];
}

/**
 * Index only. Each row is a pointer into a case study — not a preview of it.
 * Uses listHook (short) so the case study can keep full outcome copy.
 */
export default function Work() {
  return (
    <div className="flex w-full flex-col">
      <section className="border-border/60 flex flex-col gap-6 border-b px-6 py-20 sm:px-10 sm:py-28">
        <h1 className="display-1 text-foreground max-w-4xl">{copy.hero.title}</h1>
        <p className="body-1 text-muted-foreground max-w-2xl">{copy.hero.body}</p>
      </section>

      <section className="px-6 py-8 sm:px-10 sm:py-10">
        <ul className="flex flex-col">
          {caseSnapshots.map((snapshot) => {
            const { listHook } = snapshot;
            return (
              <li key={snapshot.slug}>
                <Link
                  to={`/work/${snapshot.slug}`}
                  className="group border-border/60 focus-visible:outline-ring grid grid-cols-1 gap-3 border-b py-7 transition-colors outline-none focus-visible:outline-2 focus-visible:outline-offset-4 sm:grid-cols-[minmax(0,1fr)_minmax(10rem,auto)] sm:items-end sm:gap-10 sm:py-8"
                >
                  {/* Identity */}
                  <div className="flex min-w-0 flex-col gap-1">
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                      <span className="heading-3 text-foreground group-hover:text-accent transition-colors">
                        {snapshot.client}
                      </span>
                      <span className="body-3 text-muted-foreground tabular-nums">
                        {snapshot.timeline}
                      </span>
                    </div>
                    <span className="body-3 text-muted-foreground">{snapshot.industry}</span>
                  </div>

                  {/* Hook — number leads, gloss trails */}
                  <div className="flex flex-col gap-0.5 sm:items-end sm:text-right">
                    <span className="heading-3 text-accent tracking-tight tabular-nums">
                      {listHook.value}
                    </span>
                    <span className="body-3 text-muted-foreground">{listHook.label}</span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
