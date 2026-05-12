"use client";

import { SERVICES } from "./data";

export function JumpLinks() {
  return (
    <div className="sticky top-18.25 z-40 border-b border-border bg-background">
      <div className="container overflow-x-auto">
        <div className="flex whitespace-nowrap text-xs uppercase tracking-[0.18em]">
          {SERVICES.map((service) => (
            <a
              key={service.id}
              href={`#${service.id}`}
              className="border-r border-border px-4 py-4 text-muted-foreground transition-colors first:pl-0 hover:text-foreground"
            >
              {service.title}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
