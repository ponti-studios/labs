import { Link } from "react-router";
import { VerticalCarousel } from "~/components/vertical-carousel";
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
    <div className="relative flex w-full flex-col px-6">
      <h1 className="display-1 text-foreground top-0 left-0 max-w-4xl">{copy.hero.title}</h1>

      <section className="pt-2">
        <VerticalCarousel
          items={caseSnapshots}
          keyExtractor={(snapshot) => snapshot.slug}
          ariaLabel={t.work.hero.title}
          renderItem={(snapshot) => {
            const { listHook } = snapshot;
            return (
              <Link
                to={`/work/${snapshot.slug}`}
                className="group border-border/60 focus-visible:outline-ring flex h-full flex-col justify-between gap-6 rounded-lg border p-6 transition-colors outline-none focus-visible:outline-2 focus-visible:outline-offset-4"
              >
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

                <div className="flex flex-col gap-0.5">
                  <span className="heading-3 text-accent tracking-tight tabular-nums">
                    {listHook.value}
                  </span>
                  <span className="body-3 text-muted-foreground">{listHook.label}</span>
                </div>
              </Link>
            );
          }}
        />
      </section>
    </div>
  );
}
