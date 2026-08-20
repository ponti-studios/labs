import { cn } from "@ponti-studios/ui/utilities";
import { Link } from "react-router";
import { ListRowMedia } from "~/components/ListRowMedia";
import styles from "~/components/list-row.module.css";
import { RevealGroup, RevealItem } from "~/components/Reveal";
import { caseLogos, caseSnapshots } from "~/data/studio";
import { t } from "~/translations";

const copy = t.work;

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
    <div className="page-shell">
      <section className="layout-stack">
        <h1 className="heading-hero text-foreground max-w-4xl">{copy.hero.title}</h1>
      </section>

      <section className="layout-stack">
        <RevealGroup className="border-border divide-border-border divide-y border-b">
          {caseSnapshots.map((snapshot) => (
            <RevealItem key={snapshot.slug} className="list-row group">
              <Link
                to={`/work/${snapshot.slug}`}
                prefetch="intent"
                className="press hover:bg-muted/20 flex min-w-0 flex-1 flex-row items-start gap-4 transition-colors outline-none md:gap-6"
              >
                {caseLogos[snapshot.slug] ? (
                  <ListRowMedia
                    fallback={snapshot.client.slice(0, 2).toUpperCase()}
                    src={caseLogos[snapshot.slug]}
                    variant="square"
                  />
                ) : null}
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="text-muted-foreground text-xs tracking-wide uppercase">
                    {snapshot.industry}
                  </span>
                  <h3
                    className={cn({
                      [styles.title]: true,
                      "text-foreground": true,
                      "group-hover:text-accent": true,
                    })}
                  >
                    {snapshot.client}
                  </h3>
                  <p className="text-muted-foreground max-w-2xl text-sm">{snapshot.description}</p>
                </div>
              </Link>
            </RevealItem>
          ))}
        </RevealGroup>
      </section>
    </div>
  );
}
