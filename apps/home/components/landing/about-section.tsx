"use client";

interface AboutSectionProps {
  label: string;
  title: string;
  description: string;
  antiposition?: string;
}

export function AboutSection({ label, title, description, antiposition }: AboutSectionProps) {
  return (
    <section id="about" className="bg-background border-t border-border">
      <div className="container py-20 md:py-28">
        <div className="flex flex-col gap-10">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              {label}
            </span>
            <h2 className="mt-3 text-3xl font-normal uppercase tracking-[-0.04em]">{title}</h2>
          </div>
          <div className="space-y-5 text-base leading-8 text-muted-foreground max-w-2xl">
            <p>{description}</p>
            {antiposition && (
              <p className="text-foreground font-medium border-l-2 border-foreground pl-4">
                {antiposition}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
