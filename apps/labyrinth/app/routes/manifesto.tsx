import { t } from "~/translations";

export function meta(): Array<{
  title?: string;
  name?: string;
  content?: string;
}> {
  return [
    { title: t.manifesto.meta.title },
    { name: "description", content: t.manifesto.meta.description },
  ];
}

export default function Manifesto() {
  return (
    <div className="flex w-full flex-col">
      <section className="border-border/60 flex flex-col gap-6 border-b py-16 sm:py-20">
        <h1 className="display-2 text-foreground max-w-3xl">{t.manifesto.title}</h1>
        <p className="body-1 text-muted-foreground max-w-2xl">{t.manifesto.intro}</p>
      </section>

      <section className="border-border/60 flex flex-col gap-10 border-b py-16">
        <h2 className="heading-2 text-foreground">{t.manifesto.believe.title}</h2>
        <div className="grid gap-8 sm:grid-cols-2">
          {t.manifesto.believe.items.map((belief) => (
            <div key={belief.title} className="flex flex-col gap-1.5">
              <h3 className="subheading-2 text-foreground">{belief.title}</h3>
              <p className="body-3 text-muted-foreground">{belief.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-border/60 flex flex-col gap-10 border-b py-16">
        <div className="flex flex-col gap-2">
          <h2 className="heading-2 text-foreground">{t.manifesto.build.title}</h2>
          <p className="body-2 text-muted-foreground italic">{t.manifesto.build.subtitle}</p>
        </div>
        <div className="grid gap-8 sm:grid-cols-2">
          {t.manifesto.build.principles.map((principle) => (
            <div key={principle.name} className="flex flex-col gap-1.5">
              <h3 className="subheading-2 text-foreground">
                {principle.name} <span className="text-muted-foreground">({principle.jp})</span>
              </h3>
              <p className="body-3 text-muted-foreground">{principle.description}</p>
            </div>
          ))}
        </div>
        <p className="body-2 text-muted-foreground italic">{t.manifesto.build.footer}</p>
      </section>

      <section className="border-border/60 flex flex-col gap-8 border-b py-16">
        <h2 className="heading-2 text-foreground">{t.manifesto.values.title}</h2>
        <div className="grid gap-8 sm:grid-cols-3">
          {t.manifesto.values.items.map((value) => (
            <div key={value.name} className="flex flex-col gap-1.5">
              <h3 className="subheading-3 text-foreground">{value.name}</h3>
              <p className="body-3 text-muted-foreground">{value.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-border/60 flex flex-col gap-8 border-b py-16">
        <h2 className="heading-2 text-foreground">{t.manifesto.think.title}</h2>
        <div className="grid gap-8 sm:grid-cols-2">
          {t.manifesto.think.items.map((item) => (
            <div key={item.name} className="flex flex-col gap-1.5">
              <h3 className="subheading-3 text-foreground">{item.name}</h3>
              <p className="body-3 text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-border/60 flex flex-col gap-4 border-b py-16">
        <h2 className="heading-2 text-foreground">{t.manifesto.refuse.title}</h2>
        <ul className="flex flex-col gap-2">
          {t.manifesto.refuse.items.map((item) => (
            <li key={item} className="ui-dash-list-item">
              <span className="ui-dash-marker">—</span>
              {item}
            </li>
          ))}
        </ul>
      </section>

      <blockquote className="border-border/60 body-1 text-foreground border-b py-16 italic">
        &ldquo;{t.manifesto.quote}&rdquo;
      </blockquote>

      <section className="flex flex-col gap-8 py-16">
        <div className="flex flex-col gap-2">
          <h2 className="heading-2 text-foreground">{t.manifesto.founders.title}</h2>
          <p className="body-2 text-muted-foreground max-w-2xl">{t.manifesto.founders.subtitle}</p>
        </div>
        <div className="grid gap-8 sm:grid-cols-2">
          {t.manifesto.founders.principles.map((principle) => (
            <div key={principle.title} className="flex flex-col gap-1.5">
              <h3 className="subheading-3 text-foreground">{principle.title}</h3>
              <p className="body-3 text-muted-foreground">{principle.description}</p>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-1.5">
          <h3 className="subheading-3 text-foreground">{t.manifesto.founders.industriesTitle}</h3>
          {t.manifesto.founders.industries.map((industry) => (
            <p key={industry.name} className="body-3 text-muted-foreground">
              <strong className="text-foreground">{industry.name}</strong> — {industry.description}
            </p>
          ))}
        </div>
      </section>
    </div>
  );
}
