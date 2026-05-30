"use client";

import * as React from "react";

import { cn } from "../../lib/utils";
import { Button, type ButtonProps } from "../ui/button";

export interface CenteredStateAction {
  label: React.ReactNode;
  href?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  variant?: ButtonProps["variant"];
}

export interface CenteredStateProps extends Omit<React.ComponentProps<"main">, "title"> {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: readonly CenteredStateAction[];
}

export function CenteredState({
  eyebrow,
  title,
  description,
  actions,
  className,
  ...props
}: CenteredStateProps) {
  return (
    <main
      className={cn(
        "flex min-h-screen items-center justify-center px-6 text-foreground",
        className,
      )}
      {...props}
    >
      <div className="max-w-md text-center">
        {eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-4">{title}</h1>
        {description && (
          <p className="mt-4 text-base leading-7 text-muted-foreground">{description}</p>
        )}
        {actions && actions.length > 0 && (
          <div className="mt-8 flex items-center justify-center gap-3">
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
    </main>
  );
}
