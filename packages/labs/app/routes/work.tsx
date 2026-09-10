import { RevealGroup, RevealItem } from "~/components/Reveal";
import { ProjectCard } from "~/components/projects/project-card";
import { CLIENT_CARDS } from "~/lib/client-cards";
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
        <RevealGroup className="grid grid-cols-1 place-items-center gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {CLIENT_CARDS.map((card) => (
            <RevealItem key={card.id}>
              <ProjectCard {...card} data-testid={`work-client-${card.id}`} />
            </RevealItem>
          ))}
        </RevealGroup>
      </section>
    </div>
  );
}