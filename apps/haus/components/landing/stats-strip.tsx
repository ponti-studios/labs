"use client";

import { useTranslations } from "@/i18n/client";
import { AnimatedStat } from "@pontistudios/ui";

export function StatsStrip() {
  const t = useTranslations("Studio");
  const stats = t.raw("stats") as {
    clients: { value: string; label: string };
    arr: { value: string; label: string };
    reduction: { value: string; label: string };
  };

  return (
    <section className="border-y border-border py-20 md:py-28">
      <div className="container">
        <div className="grid grid-cols-3 divide-x divide-border">
          <AnimatedStat {...stats.clients} index={0} />
          <AnimatedStat {...stats.arr} index={1} />
          <AnimatedStat {...stats.reduction} index={2} />
        </div>
      </div>
    </section>
  );
}
