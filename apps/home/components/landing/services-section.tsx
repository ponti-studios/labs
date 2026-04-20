"use client";

interface ServiceItem {
  title: string;
  copy: string;
}

interface ServicesSectionProps {
  label: string;
  title: string;
  subtitle: string;
  items: ServiceItem[];
  whatWeMakeLabel?: string;
  whatWeMake?: string[];
}

export function ServicesSection({
  label,
  title,
  subtitle,
  items,
  whatWeMakeLabel,
  whatWeMake,
}: ServicesSectionProps) {
  return (
    <section id="services" className="border-y border-border bg-muted">
      <div className="container py-20 md:py-28">
        <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              {label}
            </span>
            <h2 className="mt-3 text-3xl font-normal uppercase tracking-[-0.04em]">{title}</h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-muted-foreground">{subtitle}</p>
        </div>

        {whatWeMake && whatWeMakeLabel && (
          <div className="mb-16 pb-12 border-b border-border">
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground mb-6">
              {whatWeMakeLabel}
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {whatWeMake.map((item) => (
                <div
                  key={item}
                  className="border border-border bg-background p-5 flex items-center justify-between"
                >
                  <span className="text-sm font-medium">{item}</span>
                  <span className="text-muted-foreground">→</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid gap-5 md:grid-cols-3">
          {items.map((service) => (
            <div
              key={service.title}
              className="rounded-none border border-border bg-background p-7"
            >
              <div className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground mb-5">
                {service.title}
              </div>
              <p className="text-lg leading-8 text-foreground">{service.copy}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
