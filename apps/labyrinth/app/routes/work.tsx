import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { caseSnapshots } from "~/data/studio";
import { t } from "~/translations";

const copy = t.work;
const workLogos: Record<string, string> = {
  lumina: "/work/lumina.webp",
  revrock: "/work/revrock.webp",
  prolog: "/work/prolog.webp",
  streamyard: "/work/streamyard.webp",
  whistle: "/work/whistle.webp",
  kensho: "/work/kensho.webp",
  humana: "/work/humana.svg",
  mimecast: "/work/mimecast.svg",
  "help-refugees": "/work/help-refugees.webp",
  "thomson-reuters": "/work/thomson-reuters.webp",
  glow: "/work/glow.webp",
};

type WorkLogoProps = {
  client: string;
  src: string;
};

function WorkLogo({ client, src }: WorkLogoProps) {
  const [status, setStatus] = useState<"loading" | "loaded" | "error">("loading");
  const imageRef = useRef<HTMLImageElement>(null);
  const fallback = client.slice(0, 2).toUpperCase();

  useEffect(() => {
    const image = imageRef.current;

    if (!image?.complete) return;

    setStatus(image.naturalWidth > 0 ? "loaded" : "error");
  }, [src]);

  return (
    <span
      className="border-border/60 bg-logo-artboard group-hover:bg-logo-artboard relative isolate flex h-14 w-32 shrink-0 items-center justify-center overflow-hidden rounded-lg border p-2 shadow-sm transition-colors duration-150"
      aria-hidden="true"
    >
      <span
        className={`text-muted-foreground pointer-events-none absolute inset-0 flex items-center justify-center gap-1.5 transition-opacity duration-150 ${
          status === "loading" ? "opacity-100" : "opacity-0"
        }`}
      >
        <span className="bg-muted h-1.5 w-1.5 rounded-full" />
        <span className="bg-muted h-1.5 w-8 rounded-full" />
        <span className="bg-muted h-1.5 w-3 rounded-full" />
      </span>

      {status === "error" ? (
        <span className="text-muted-foreground subheading-3 relative tracking-wide">
          {fallback}
        </span>
      ) : (
        <img
          ref={imageRef}
          src={src}
          alt=""
          width={256}
          height={256}
          loading="lazy"
          decoding="async"
          onLoad={() => setStatus("loaded")}
          onError={() => setStatus("error")}
          className={`relative max-h-10 max-w-full object-contain transition-opacity duration-150 ${status === "loaded" ? "opacity-100" : "opacity-0"}`}
        />
      )}
    </span>
  );
}

export function meta(): Array<{
  title?: string;
  name?: string;
  content?: string;
}> {
  return [{ title: copy.meta.title }, { name: "description", content: copy.meta.description }];
}

/** Index only. Each row is a pointer into a case study — not a preview of it. */
export default function Work() {
  return (
    <div className="relative mx-auto flex w-full flex-col gap-16 py-20">
      <section className="flex flex-col gap-4">
        <h1 className="display-1 text-foreground max-w-4xl">{copy.hero.title}</h1>
      </section>

      <section className="flex flex-col gap-4">
        <div className="border-border/40 divide-border/40 divide-y border-b">
          {caseSnapshots.map((snapshot) => (
            <div
              key={snapshot.slug}
              className="group flex flex-col gap-3 px-2 py-5 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
            >
              <Link
                to={`/work/${snapshot.slug}`}
                prefetch="intent"
                className="hover:bg-muted/20 focus-visible:outline-ring flex min-w-0 flex-1 flex-row items-center gap-3 transition-colors outline-none focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                {workLogos[snapshot.slug] ? (
                  <WorkLogo client={snapshot.client} src={workLogos[snapshot.slug]} />
                ) : null}
                <div className="flex min-w-0 flex-col gap-1">
                  <span className="body-4 text-muted-foreground">{snapshot.industry}</span>
                  <h3 className="heading-3 text-foreground group-hover:text-accent transition-colors">
                    {snapshot.client}
                  </h3>
                  <p className="body-3 text-muted-foreground max-w-2xl">{snapshot.description}</p>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
