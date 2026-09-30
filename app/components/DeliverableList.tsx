import type { ReactNode } from "react";
import { cn } from "~/lib/utils";

export type DeliverableListItem = {
  label: string;
  description: ReactNode;
};

type DeliverableListProps = {
  items: readonly DeliverableListItem[];
  className?: string;
};

/** Label/description pairs — e.g. a service's deliverables — stacked as a
 * definition list instead of an inline "—Label: description" dash format. */
export function DeliverableList({ items, className }: DeliverableListProps) {
  return (
    <dl className={cn("flex flex-col gap-3", className)}>
      {items.map((item) => (
        <div key={item.label}>
          <dt className="text-foreground text-sm font-semibold tracking-tight">{item.label}</dt>
          <dd className="text-muted-foreground text-sm leading-relaxed">{item.description}</dd>
        </div>
      ))}
    </dl>
  );
}
