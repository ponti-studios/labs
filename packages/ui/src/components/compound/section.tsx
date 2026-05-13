"use client";

import * as React from "react";

import { cn } from "../../lib/utils";

export interface SectionShellProps extends React.ComponentProps<"section"> {
  innerClassName?: string;
}

export function SectionShell({ className, innerClassName, children, ...props }: SectionShellProps) {
  return (
    <section className={className} {...props}>
      <div className={cn("container py-20 md:py-28", innerClassName)}>{children}</div>
    </section>
  );
}

export function Eyebrow({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

export function SectionHeading({ className, ...props }: React.ComponentProps<"h2">) {
  return (
    <h2
      className={cn("mt-3 text-3xl font-medium text-foreground md:text-4xl", className)}
      {...props}
    />
  );
}

export interface SectionHeaderProps extends Omit<React.ComponentProps<"div">, "title"> {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  titleClassName?: string;
  descriptionClassName?: string;
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  className,
  titleClassName,
  descriptionClassName,
  ...props
}: SectionHeaderProps) {
  return (
    <div className={className} {...props}>
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <SectionHeading className={titleClassName}>{title}</SectionHeading>
      {description && (
        <p
          className={cn(
            "mt-5 max-w-2xl text-base leading-8 text-muted-foreground",
            descriptionClassName,
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}

export function PlainCard({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("border border-border p-7", className)} {...props} />;
}
