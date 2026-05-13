"use client";

import * as React from "react";

import { cn } from "../../lib/utils";
import { Button, type ButtonProps } from "../ui/button";
import { Eyebrow, SectionHeading } from "./section";

export interface ActionPanelAction {
  label: React.ReactNode;
  href?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  variant?: ButtonProps["variant"];
}

export interface ActionPanelProps extends Omit<React.ComponentProps<"div">, "title"> {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  note?: React.ReactNode;
  steps?: readonly React.ReactNode[];
  actions?: readonly ActionPanelAction[];
  contentClassName?: string;
  actionsClassName?: string;
}

export function ActionPanel({
  eyebrow,
  title,
  description,
  note,
  steps,
  actions,
  className,
  contentClassName,
  actionsClassName,
  ...props
}: ActionPanelProps) {
  return (
    <div className={cn("border border-border p-8 md:p-12", className)} {...props}>
      <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
        <div className={contentClassName}>
          {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
          <SectionHeading className="max-w-3xl">{title}</SectionHeading>
          {description && (
            <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">
              {description}
            </p>
          )}
          {note && (
            <p className="mt-3 text-xs uppercase tracking-[0.18em] text-muted-foreground">{note}</p>
          )}
          {steps && steps.length > 0 && (
            <div className="mt-6 space-y-2">
              {steps.map((step, index) => (
                <div key={index} className="flex gap-3 text-sm text-muted-foreground">
                  <span className="shrink-0 font-semibold tabular-nums text-foreground">
                    {index + 1}.
                  </span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        {actions && actions.length > 0 && (
          <div className={cn("flex flex-col gap-4 sm:flex-row lg:justify-end", actionsClassName)}>
            {actions.map((action, index) =>
              action.href ? (
                <Button key={index} asChild variant={action.variant ?? "outline"}>
                  <a href={action.href}>{action.label}</a>
                </Button>
              ) : (
                <Button
                  key={index}
                  type="button"
                  variant={action.variant ?? "outline"}
                  onClick={action.onClick}
                >
                  {action.label}
                </Button>
              ),
            )}
          </div>
        )}
      </div>
    </div>
  );
}
