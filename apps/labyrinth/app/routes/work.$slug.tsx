import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { useLoaderData } from "react-router";
import { caseSnapshots } from "~/data/studio";
import { t } from "~/translations";

export async function loader({ params }: LoaderFunctionArgs) {
  const snapshot = caseSnapshots.find((entry) => entry.slug === params.slug);
  if (!snapshot) throw new Response("Not Found", { status: 404 });
  return { snapshot };
}

export const meta: MetaFunction = ({ params }) => {
  const snapshot = caseSnapshots.find((entry) => entry.slug === params.slug);
  if (!snapshot) return [{ title: "Case study | Ponti Studios" }];
  return [
    { title: `${snapshot.client} | Ponti Studios` },
    { name: "description", content: snapshot.problem },
  ];
};

export default function WorkSlug() {
  const { snapshot } = useLoaderData<typeof loader>();
  const copy = t.services.proof;

  return (
    <div className="flex w-full flex-col">
      <section className="border-border/60 flex flex-col gap-6 border-b py-16">
        <h1 className="display-2 text-foreground max-w-3xl">{snapshot.client}</h1>
        <p className="body-2 text-muted-foreground">
          {snapshot.industry} · {snapshot.role} · {snapshot.timeline}
        </p>
        <p className="body-1 text-foreground max-w-2xl">{snapshot.problem}</p>
      </section>

      <section className="border-border/60 flex flex-col gap-4 border-b py-16">
        <h2 className="heading-2 text-foreground">Approach</h2>
        <ol className="flex flex-col gap-3">
          {snapshot.approach.map((step, index) => (
            <li key={step} className="flex items-start gap-3">
              <span className="text-muted-foreground shrink-0 text-xs font-medium tabular-nums">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="body-2 text-foreground">{step}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="border-border/60 flex flex-col gap-6 border-b py-16">
        <h2 className="heading-2 text-foreground">{copy.outcomeLabel}</h2>
        <dl className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          {snapshot.outcomes.map((outcome) => (
            <div key={outcome.label} className="flex flex-col gap-1">
              <dt className="ui-data-value">{outcome.value}</dt>
              <dd className="ui-data-label">{outcome.label}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="flex flex-col gap-2 py-16">
        <span className="text-muted-foreground text-xs font-medium">{copy.servicesLabel}</span>
        <p className="body-2 text-foreground">{snapshot.services.join(" · ")}</p>
      </section>
    </div>
  );
}
