"use client";

import * as React from "react";

import { cn } from "../../lib/utils";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";

export interface AccordionListItem {
  id: string;
  title: React.ReactNode;
  content?: React.ReactNode;
  badge?: React.ReactNode;
  aside?: React.ReactNode;
}

export interface AccordionListProps extends Omit<
  React.ComponentProps<typeof Accordion>,
  "defaultValue" | "onValueChange" | "type" | "value"
> {
  items: readonly AccordionListItem[];
  showIndex?: boolean;
  contentClassName?: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  renderContent?: (item: AccordionListItem, index: number) => React.ReactNode;
}

export function AccordionList({
  items,
  showIndex = true,
  contentClassName,
  renderContent,
  value,
  onValueChange,
  defaultValue,
  ...props
}: AccordionListProps) {
  const [internalValue, setInternalValue] = React.useState<string | undefined>(defaultValue);
  const currentValue = value ?? internalValue;

  return (
    <Accordion
      type="single"
      collapsible
      value={currentValue}
      onValueChange={(nextValue) => {
        setInternalValue(nextValue || undefined);
        onValueChange?.(nextValue);
      }}
      {...props}
    >
      {items.map((item, index) => (
        <AccordionItem key={item.id} value={item.id}>
          <AccordionTrigger
            index={showIndex ? index : undefined}
            badge={item.badge}
            aside={item.aside}
          >
            {item.title}
          </AccordionTrigger>
          <AccordionContent className={contentClassName}>
            {renderContent ? renderContent(item, index) : item.content}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

export interface MetricAccordionListItem {
  id: string;
  title: React.ReactNode;
  badge?: React.ReactNode;
  metric: React.ReactNode;
  metricLabel: React.ReactNode;
  description: React.ReactNode;
}

export interface MetricAccordionListColumns {
  item: React.ReactNode;
  type: React.ReactNode;
  result: React.ReactNode;
}

export interface MetricAccordionListProps extends Omit<
  React.ComponentProps<"div">,
  "children" | "onChange"
> {
  items: readonly MetricAccordionListItem[];
  columns?: MetricAccordionListColumns;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}

export function MetricAccordionList({
  items,
  columns,
  value,
  defaultValue,
  onValueChange,
  className,
  ...props
}: MetricAccordionListProps) {
  const accordionItems = items.map((item) => ({
    id: item.id,
    title: item.title,
    badge: item.badge ? (
      <span className="hidden text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground/50 sm:block">
        {item.badge}
      </span>
    ) : undefined,
    aside: (
      <span className="hidden text-right md:block">
        <span className="block text-lg font-normal tabular-nums">{item.metric}</span>
        <span className="block text-[0.6rem] uppercase tracking-[0.2em] text-muted-foreground/50">
          {item.metricLabel}
        </span>
      </span>
    ),
  }));

  return (
    <div className={cn("mt-16", className)} {...props}>
      {columns && (
        <div className="hidden border-b border-border px-6 pb-3 md:grid md:grid-cols-[minmax(0,1fr)_auto_auto_auto] md:items-end">
          <span className="text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground/50">
            {columns.item}
          </span>
          <span className="text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground/50">
            {columns.type}
          </span>
          <span className="text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground/50">
            {columns.result}
          </span>
          <span />
        </div>
      )}
      <AccordionList
        items={accordionItems}
        value={value}
        defaultValue={defaultValue}
        onValueChange={onValueChange}
        renderContent={(item) => {
          const source = items.find((candidate) => candidate.id === item.id);
          if (!source) return null;

          return (
            <>
              <p className="mb-1 text-sm font-medium tabular-nums md:hidden">
                {source.metric}{" "}
                <span className="text-xs font-normal uppercase tracking-[0.16em] text-muted-foreground">
                  {source.metricLabel}
                </span>
              </p>
              <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
                {source.description}
              </p>
            </>
          );
        }}
      />
    </div>
  );
}
