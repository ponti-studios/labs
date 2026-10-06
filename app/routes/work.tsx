import { RevealGroup, RevealItem } from "~/components/Reveal";
import { CaseTile } from "~/components/work/case-tile";
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

export default function Work() {
  return (
    <div className="page-shell">
      <section className="layout-stack">
        <h1 className="heading-hero text-foreground max-w-4xl">{copy.hero.title}</h1>
        <p className="text-muted-foreground max-w-2xl text-lg leading-relaxed">
          {copy.hero.subtitle}
        </p>
      </section>

      <section className="layout-stack">
        <RevealGroup className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {caseSnapshots.map((snapshot) => (
            <RevealItem key={snapshot.slug} className="h-full">
              <CaseTile snapshot={snapshot} />
            </RevealItem>
          ))}
        </RevealGroup>
      </section>
    </div>
  );
}
