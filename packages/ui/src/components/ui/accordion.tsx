"use client";

import * as AccordionPrimitive from "@radix-ui/react-accordion";
import * as React from "react";

import { cn } from "@/lib/utils";

function Accordion({ ...props }: React.ComponentProps<typeof AccordionPrimitive.Root>) {
  return <AccordionPrimitive.Root data-slot="accordion" {...props} />;
}

function AccordionItem({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn("border-b border-border last:border-b-0", className)}
      {...props}
    />
  );
}

function AccordionTrigger({
  className,
  children,
  index,
  badge,
  aside,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger> & {
  index?: number;
  badge?: React.ReactNode;
  aside?: React.ReactNode;
}) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "group focus-visible:border-ring focus-visible:ring-ring/50 [&[data-state=open]_[data-slot=accordion-title]]:text-foreground [&[data-state=open]_[data-slot=accordion-toggle]]:rotate-45 flex w-full items-center justify-between gap-4 rounded-md py-5 text-left outline-none transition-all focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50",
          className,
        )}
        {...props}
      >
        <div className="flex min-w-0 items-center gap-6 md:gap-8">
          {typeof index === "number" && (
            <span className="w-6 shrink-0 text-xs tabular-nums text-muted-foreground/50 transition-colors group-hover:text-muted-foreground">
              {String(index + 1).padStart(2, "0")}
            </span>
          )}
          <span
            data-slot="accordion-title"
            className="text-base uppercase tracking-[-0.02em] text-foreground/70 transition-colors duration-200 group-hover:text-foreground"
          >
            {children}
          </span>
          {badge}
        </div>

        <div className="flex shrink-0 items-center gap-5 md:gap-8">
          {aside}
          <span
            data-slot="accordion-toggle"
            className="shrink-0 text-xl leading-none text-muted-foreground/50 transition-all duration-200 group-hover:text-muted-foreground"
            aria-hidden="true"
          >
            +
          </span>
        </div>
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

function AccordionContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      className="grid overflow-hidden text-sm transition-[grid-template-rows,opacity] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] data-[state=closed]:grid-rows-[0fr] data-[state=closed]:opacity-0 data-[state=open]:grid-rows-[1fr] data-[state=open]:opacity-100"
      {...props}
    >
      <div className={cn("min-h-0 pb-6 pl-14", className)}>{children}</div>
    </AccordionPrimitive.Content>
  );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
