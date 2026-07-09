import { Link } from "react-router";
import { caseSnapshots } from "~/data/studio";
import { t } from "~/translations";

const copy = t.services.proof;

type SelectedWorkProps = {
  /** When true, adds a bottom border (default). Set false on final page sections. */
  bordered?: boolean;
};

export function SelectedWork({ bordered = true }: SelectedWorkProps) {
  return (
    <section
      className={["flex flex-col gap-6 py-16", bordered ? "border-border/60 border-b" : ""]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex flex-col gap-2">
        <span className="ui-eyebrow">{copy.eyebrow}</span>
        <h2 className="heading-2 text-foreground">{copy.title}</h2>
        <p className="body-2 text-muted-foreground max-w-2xl">{copy.intro}</p>
      </div>
      <div className="flex flex-col gap-8">
        {caseSnapshots.map((snapshot) => (
          <article
            key={snapshot.slug}
            className="border-border/40 grid gap-4 border-b pb-8 last:border-0 last:pb-0 sm:grid-cols-[minmax(0,12rem)_1fr]"
          >
            <div className="flex flex-col gap-1">
              <h3 className="heading-4 text-foreground">{snapshot.client}</h3>
              <p className="body-4 text-muted-foreground">{snapshot.industry}</p>
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <span className="ui-eyebrow">{copy.problemLabel}</span>
                <p className="body-2 text-muted-foreground">{snapshot.problem}</p>
              </div>
              <div className="flex flex-col gap-1">
                <span className="ui-eyebrow">{copy.whatWeDidLabel}</span>
                <p className="body-2 text-muted-foreground">{snapshot.whatWeDid}</p>
              </div>
              <div className="flex flex-col gap-2">
                <span className="ui-eyebrow">{copy.outcomeLabel}</span>
                <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {snapshot.outcomes.map((outcome) => (
                    <div key={outcome.label} className="flex flex-col gap-0.5">
                      <dt className="ui-data-value">{outcome.value}</dt>
                      <dd className="ui-data-label">{outcome.label}</dd>
                    </div>
                  ))}
                </dl>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="body-4 text-muted-foreground">
                  <span className="ui-eyebrow mr-2">{copy.servicesLabel}</span>
                  {snapshot.services.join(" · ")}
                </p>
                <Link
                  to={`/work/${snapshot.slug}`}
                  className="body-4 text-foreground underline-offset-4 hover:underline"
                >
                  {copy.readCaseStudy}
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
