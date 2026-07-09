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
      <section className="border-border/60 flex flex-col gap-8 border-b py-16">
        <h2 className="heading-2 text-foreground">{t.manifesto.tenets.title}</h2>
        <div className="grid gap-8 sm:grid-cols-2">
          {t.manifesto.tenets.items.map((tenet) => (
            <div key={tenet.title} className="flex flex-col gap-2">
              <h3 className="subheading-2 text-foreground">{tenet.title}</h3>
              <p className="body-3 text-muted-foreground">{tenet.description}</p>
            </div>
          ))}
        </div>
      </section>

      <blockquote className="body-1 text-foreground py-16 text-center italic opacity-5">
        &ldquo;{t.manifesto.quote}&rdquo;
      </blockquote>
    </div>
  );
}
