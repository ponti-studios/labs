"use client";

interface ServiceItem {
  title: string;
  copy: string;
}

interface WorkItem {
  name: string;
  type: string;
  blurb: string;
}

interface WorkSectionProps {
  servicesLabel: string;
  servicesTitle: string;
  servicesSubtitle: string;
  servicesItems: ServiceItem[];
  whatWeMakeLabel?: string;
  whatWeMake?: string[];
  workLabel: string;
  workTitle: string;
  workSubtitle: string;
  workItems: WorkItem[];
}

export function WorkSection({
  servicesLabel,
  servicesTitle,
  servicesSubtitle,
  servicesItems,
  whatWeMakeLabel,
  whatWeMake,
  workLabel,
  workTitle,
  workSubtitle,
  workItems,
}: WorkSectionProps) {
  return (
    <section id="services" className="border-y border-border bg-muted">
      <div className="container py-20 md:py-28">
        <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              {servicesLabel}
            </span>
            <h2 className="mt-3 text-3xl font-normal uppercase tracking-[-0.04em]">
              {servicesTitle}
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-muted-foreground">{servicesSubtitle}</p>
        </div>

        {whatWeMake && whatWeMakeLabel && (
          <div className="mb-16 border-b border-border pb-12">
            <div className="mb-6 text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              {whatWeMakeLabel}
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {whatWeMake.map((item) => (
                <div
                  key={item}
                  className="flex items-center justify-between border border-border bg-background p-5"
                >
                  <span className="text-sm font-medium">{item}</span>
                  <span className="text-muted-foreground">→</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid gap-5 md:grid-cols-3">
          {servicesItems.map((service) => (
            <div
              key={service.title}
              className="rounded-none border border-border bg-background p-7"
            >
              <div className="mb-5 text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                {service.title}
              </div>
              <p className="text-lg leading-8 text-foreground">{service.copy}</p>
            </div>
          ))}
        </div>

        <div id="work" className="mt-20 border-t border-border pt-20">
          <div className="mb-12 grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                {workLabel}
              </span>
              <h2 className="mt-3 text-3xl font-normal uppercase tracking-[-0.04em]">
                {workTitle}
              </h2>
            </div>
            <p className="max-w-2xl text-base leading-7 text-muted-foreground">{workSubtitle}</p>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            {workItems.map((item) => (
              <div
                key={item.name}
                className="group rounded-none border border-border bg-muted p-7 transition-all hover:border-foreground"
              >
                <div className="mb-12 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                    {item.type}
                  </span>
                  <span className="text-muted-foreground transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </div>
                <div className="mb-4 text-2xl font-normal uppercase tracking-[-0.03em]">
                  {item.name}
                </div>
                <p className="text-sm leading-7 text-muted-foreground">{item.blurb}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
