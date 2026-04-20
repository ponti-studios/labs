"use client";

interface WorkItem {
  name: string;
  type: string;
  blurb: string;
}

interface WorkSectionProps {
  label: string;
  title: string;
  subtitle: string;
  items: WorkItem[];
}

export function WorkSection({ label, title, subtitle, items }: WorkSectionProps) {
  return (
    <section id="work" className="bg-background">
      <div className="container py-20 md:py-28">
        <div className="mb-12 grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              {label}
            </span>
            <h2 className="mt-3 text-3xl font-normal uppercase tracking-[-0.04em]">{title}</h2>
          </div>
          <p className="max-w-2xl text-base leading-7 text-muted-foreground">{subtitle}</p>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {items.map((item) => (
            <div
              key={item.name}
              className="rounded-none border border-border bg-muted p-7 transition-all hover:border-foreground group"
            >
              <div className="flex items-center justify-between mb-12">
                <span className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  {item.type}
                </span>
                <span className="text-muted-foreground transition-transform group-hover:translate-x-1">
                  →
                </span>
              </div>
              <div className="text-2xl font-normal uppercase tracking-[-0.03em] mb-4">
                {item.name}
              </div>
              <p className="text-sm leading-7 text-muted-foreground">{item.blurb}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
