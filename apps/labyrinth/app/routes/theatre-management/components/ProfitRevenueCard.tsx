import { Card, CardContent, CardHeader } from "@ponti-studios/ui/primitives";
import { cn } from "~/lib/utils";
import { DollarSign, TrendingUp } from "lucide-react";
import { clamp } from "../theatre-model";
import { formatCurrency, formatCompact, fmt, useCalculator } from "../utils";

export function ProfitRevenueCard({
  d,
  healthLabel,
  healthDot,
  healthTextColor,
}: {
  d: ReturnType<typeof useCalculator>;
  healthLabel: string;
  healthDot: string;
  healthTextColor: string;
}) {
  const marginBarWidth = clamp(Math.abs(d.margin) * 100, 0, 100);

  return (
    <Card className="h-full">
      <CardHeader className="border-b-0 px-5 pt-5 pb-0">
        <div className="flex w-full items-center justify-between gap-2">
          <span className="ui-data-label">Profit &amp; Revenue</span>
          <DollarSign className="text-secondary size-4" />
        </div>
      </CardHeader>

      <CardContent className="flex h-full flex-col justify-between px-5 pt-4 pb-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-primary font-['Geist'] text-2xl font-semibold tracking-tight tabular-nums">
              {formatCurrency(d.monthlyProfit)}
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              <span className={cn("size-1.5 rounded-full", healthDot)} />
              <span className={cn("text-xs font-medium", healthTextColor)}>{healthLabel}</span>
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 text-xs font-medium",
                  d.margin >= 0 ? "text-success" : "text-destructive",
                )}
              >
                {(d.margin * 100).toFixed(1)}% margin
              </span>
            </div>
          </div>

          <div>
            <div className="text-primary font-['Geist'] text-2xl font-semibold tracking-tight tabular-nums">
              {formatCompact(d.grossRevenue)}
            </div>
            <div className="mt-1 flex items-center gap-1.5">
              <TrendingUp className="text-secondary size-3" />
              <span className="text-secondary text-xs">{fmt(d.monthlyVisitors)} visitors</span>
            </div>
          </div>
        </div>

        <div className="bg-inset mt-3 flex h-2 overflow-hidden rounded-full">
          <div
            className={cn(
              "transition-all duration-300",
              d.margin >= 0 ? "bg-success" : "bg-destructive",
            )}
            style={{ width: `${marginBarWidth}%` }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
