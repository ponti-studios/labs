import { Card, CardContent, CardHeader } from "@pontistudios/ui/primitives";
import { PieChart } from "lucide-react";
import { formatCompact, useCalculator } from "../utils";

export function RevenueMixCard({ d }: { d: ReturnType<typeof useCalculator> }) {
  return (
    <Card className="h-full min-h-[180px]">
      <CardHeader className="border-b-0 px-5 pt-5 pb-0">
        <div className="flex w-full items-center justify-between gap-2">
          <span className="ui-data-label">Revenue Mix</span>
          <PieChart className="text-secondary size-4" />
        </div>
      </CardHeader>

      <CardContent className="flex h-full flex-col justify-between px-5 pt-4 pb-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-primary font-['Geist'] text-2xl font-semibold tracking-tight tabular-nums">
              {d.ticketPct}%
            </div>
            <div className="mt-1 flex items-center gap-1.5">
              <span className="bg-accent size-2 rounded-sm" />
              <span className="text-secondary text-xs">
                Tickets · {formatCompact(d.theaterTicketRevenue)}
              </span>
            </div>
          </div>
          <div>
            <div className="text-primary font-['Geist'] text-2xl font-semibold tracking-tight tabular-nums">
              {d.snackPct}%
            </div>
            <div className="mt-1 flex items-center gap-1.5">
              <span className="bg-border-subtle size-2 rounded-sm" />
              <span className="text-secondary text-xs">
                Snacks · {formatCompact(d.concessionProfit)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-inset mt-3 flex h-2 overflow-hidden rounded-full">
          <div
            className="bg-accent transition-all duration-300"
            style={{ width: `${d.ticketPct}%` }}
          />
          <div
            className="bg-border-subtle transition-all duration-300"
            style={{ width: `${d.snackPct}%` }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
