import { Card, CardContent, CardHeader } from "@ponti-studios/ui/primitives";
import { cn } from "~/lib/utils";
import { Tickets } from "lucide-react";
import { CAPACITY_STYLES, fmt, useCalculator, utilizationVariant } from "../utils";
import { StatRow } from "./StatRow";

export function WeeklyTrafficCard({ d }: { d: ReturnType<typeof useCalculator> }) {
  const cv = CAPACITY_STYLES[utilizationVariant(d.utilizationPct)];

  return (
    <Card className="h-full">
      <CardHeader className="border-b-0 px-5 pt-5 pb-0">
        <div className="flex w-full items-center justify-between gap-2">
          <span className="ui-data-label">Weekly Attendance</span>
          <Tickets className="text-muted-foreground size-4" />
        </div>
      </CardHeader>

      <CardContent className="flex h-full flex-col justify-between px-5 pt-4 pb-5">
        <div>
          <div className="text-foreground font-['Geist'] text-2xl font-semibold tracking-tight tabular-nums">
            {fmt(d.weeklyAttendance)}
          </div>
          <div className="mt-3 space-y-1.5">
            <StatRow label="Utilization">{d.utilizationPct}%</StatRow>
            <StatRow label="Per weekend">{fmt(d.weekendDailyAvg)}</StatRow>
            <StatRow label="Per weekday">{fmt(d.weekdayDailyAvg)}</StatRow>
          </div>
        </div>

        <div className="mt-3 space-y-1.5">
          <div className="bg-muted flex h-2 overflow-hidden rounded-full">
            <div
              className={cn("transition-all duration-300", cv.bar)}
              style={{ width: `${d.utilizationPct}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
