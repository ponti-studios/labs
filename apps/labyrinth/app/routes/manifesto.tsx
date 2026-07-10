import { t } from "~/translations";

const copy = t.manifesto;

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

export default function Manifesto() {
  return (
    <div className="flex w-full flex-col">
      {/* Hero */}
      <section className="border-border/60 flex flex-col gap-6 border-b px-6 py-20 sm:px-10 sm:py-28">
        <h1 className="display-1 text-foreground max-w-4xl">{copy.hero.title}</h1>
        <p className="body-1 text-muted-foreground max-w-2xl">{copy.hero.body}</p>
      </section>

      {/* Tenets — single-column editorial list, one idea at a time */}
      <section className="border-border/60 flex flex-col gap-12 border-b px-6 py-20 sm:px-10 sm:py-24">
        <ol className="flex flex-col gap-12">
          {copy.tenets.items.map((tenet, index) => (
            <li
              key={tenet.title}
              className="grid gap-3 sm:grid-cols-[minmax(0,4rem)_1fr] sm:gap-10"
            >
              <span className="body-2 text-muted-foreground tabular-nums">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="flex max-w-3xl flex-col gap-3">
                <h2 className="heading-3 text-foreground">{tenet.title}</h2>
                <p className="body-1 text-muted-foreground">{tenet.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Closing pull-quote */}
      <section className="flex flex-col px-6 py-20 sm:px-10 sm:py-28">
        <blockquote className="display-2 text-accent max-w-3xl">
          &ldquo;{copy.quote}&rdquo;
        </blockquote>
      </section>
    </div>
  );
}
