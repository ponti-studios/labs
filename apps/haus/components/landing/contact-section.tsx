"use client";

import Link from "next/link";
import { SectionLabel, SectionHeading } from "./shared";

interface ContactSectionProps {
  label: string;
  title: string;
  subtitle: string;
  promise?: string;
  email: string;
  bookCall: string;
}

export function ContactSection({
  label,
  title,
  subtitle,
  promise,
  email,
  bookCall,
}: ContactSectionProps) {
  return (
    <section id="contact" className="border-t border-border bg-muted">
      <div className="container py-20 md:py-28">
        <div className="border border-border bg-background p-8 md:p-12">
          <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
            <div>
              <SectionLabel>{label}</SectionLabel>
              <SectionHeading className="mt-3 max-w-3xl text-3xl">{title}</SectionHeading>
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
                className="bg-foreground px-6 py-3 text-center text-sm font-semibold uppercase tracking-wider text-background transition-opacity hover:opacity-90"
              >
                {email}
              </Link>
              <Link
                href="https://cal.com/ponti-studios"
                className="border border-foreground px-6 py-3 text-center text-sm font-semibold uppercase tracking-wider transition-colors hover:bg-foreground hover:text-background"
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
