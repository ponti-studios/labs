"use client";

import * as React from "react";

import { cn } from "../../lib/utils";

export interface DocumentNavLink {
  label: React.ReactNode;
  href: string;
}

export interface DocumentPageProps extends Omit<React.ComponentProps<"main">, "title"> {
  homeLabel: React.ReactNode;
  homeHref?: string;
  navLink?: DocumentNavLink;
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
}

export function DocumentPage({
  homeLabel,
  homeHref = "/",
  navLink,
  eyebrow,
  title,
  description,
  children,
  className,
  ...props
}: DocumentPageProps) {
  return (
    <main className={cn("min-h-screen text-foreground", className)} {...props}>
      <header className="border-b border-border">
        <div className="container flex items-center justify-between py-6">
          <a href={homeHref} className="text-sm font-bold uppercase tracking-tight">
            {homeLabel}
          </a>
          {navLink && (
            <a
              href={navLink.href}
              className="text-sm uppercase tracking-widest text-muted-foreground"
            >
              {navLink.label}
            </a>
          )}
        </div>
      </header>

      <article className="container max-w-4xl py-16 md:py-24">
        {eyebrow && (
          <p className="mb-4 text-sm uppercase tracking-widest text-muted-foreground">{eyebrow}</p>
        )}
        <h1 className="max-w-3xl">{title}</h1>
        {description && (
          <p className="mt-6 max-w-3xl text-lg leading-8 text-muted-foreground">{description}</p>
        )}
        {children}
      </article>
    </main>
  );
}

export interface InfoGridItem {
  id: string;
  title: React.ReactNode;
  description: React.ReactNode;
}

export interface InfoGridProps extends React.ComponentProps<"div"> {
  items: readonly InfoGridItem[];
}

export function InfoGrid({ items, className, ...props }: InfoGridProps) {
  return (
    <div className={cn("grid gap-4", className)} {...props}>
      {items.map((item) => (
        <div key={item.id} className="border border-border p-5">
          <h3>{item.title}</h3>
          <p className="mt-2 leading-7 text-muted-foreground">{item.description}</p>
        </div>
      ))}
    </div>
  );
}
