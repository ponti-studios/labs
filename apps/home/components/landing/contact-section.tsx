"use client";

import Link from "next/link";

interface ContactSectionProps {
  label: string;
  title: string;
  subtitle: string;
  promise?: string;
  email: string;
  bookCall: string;
}

export function ContactSection({ label, title, subtitle, promise, email, bookCall }: ContactSectionProps) {
  return (
    <section id="contact" className="border-t border-border bg-muted">
      <div className="container py-20 md:py-28">
        <div className="rounded-none border border-border bg-background p-8 md:p-12">
          <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                {label}
              </span>
              <h2 className="mt-3 max-w-3xl text-3xl font-normal uppercase tracking-[-0.04em]">
                {title}
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">{subtitle}</p>
              {promise && (
                <p className="mt-3 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  {promise}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-4 sm:flex-row lg:justify-end">
              <Link
                href={`mailto:${email}`}
                className="rounded-none bg-foreground px-6 py-3 text-center text-sm font-semibold uppercase tracking-wider text-background hover:opacity-90"
              >
                {email}
              </Link>
              <Link
                href="https://cal.com/ponti-studios"
                className="rounded-none border border-foreground px-6 py-3 text-center text-sm font-semibold uppercase tracking-wider hover:bg-foreground hover:text-background transition-colors"
              >
                {bookCall}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
