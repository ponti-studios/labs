"use client";

interface AboutSectionProps {
  label: string;
  title: string;
  description: string;
}

export function AboutSection({ label, title, description }: AboutSectionProps) {
  return (
    <section id="about" className="bg-background">
      <div className="container py-20 md:py-28">
        <div className="flex flex-col gap-10">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              {label}
            </span>
            <h2 className="mt-3 text-xl font-normal uppercase tracking-[-0.04em]">{title}</h2>
          </div>
          <div className="space-y-5 text-base leading-8 text-muted-foreground">
            <p>{description}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
