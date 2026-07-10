import { Card, CardContent, CardHeader } from "@pontistudios/ui";
import { cn } from "~/lib/utils";
import { MONTHLY_OTHER, MONTHLY_RENT, MONTHLY_UTILITIES } from "../theatre-model";
import { formatCurrency, useCalculator } from "../utils";
import { BreakdownRow } from "./BreakdownRow";

export function PLStatement({
  d,
  lineupMetrics,
  healthLabel,
  healthDot,
  healthTextColor,
}: {
  d: ReturnType<typeof useCalculator>;
  lineupMetrics: ReturnType<typeof useCalculator>["lineupMetrics"];
  healthLabel: string;
  healthDot: string;
  healthTextColor: string;
}) {
  return (
    <Card>
      <CardHeader className="px-5 py-4">
        <h2 className="text-foreground text-sm font-semibold">Monthly P&amp;L</h2>
        <span className="text-muted-foreground font-mono text-[10px]">
          {new Date().toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
          })}
        </span>
      </CardHeader>

      <CardContent className="divide-border divide-y px-5 py-0">
        <div className="py-3">
          <div className="text-muted-foreground mb-2 text-xs font-medium">Revenue</div>
          <BreakdownRow
            label="Ticket Revenue (gross)"
            value={formatCurrency(d.grossTicketRevenue)}
          />
          <BreakdownRow
            label={`Studio Cut (−${Math.round(lineupMetrics.studioCutRate * 100)}%)`}
            value={formatCurrency(d.studioCutAmount)}
            negative
          />
          <BreakdownRow
            label="Your Ticket Revenue"
            value={formatCurrency(d.theaterTicketRevenue)}
            bold
          />
          <BreakdownRow label="Concession Profit" value={formatCurrency(d.concessionProfit)} />
        </div>

        <div className="py-3">
          <BreakdownRow label="Gross Revenue" value={formatCurrency(d.grossRevenue)} bold />
        </div>

        <div className="py-3">
          <div className="text-muted-foreground mb-2 text-xs font-medium">Expenses</div>
          <BreakdownRow label="Rent" value={formatCurrency(MONTHLY_RENT)} negative />
          <BreakdownRow label="Labor" value={formatCurrency(d.dynamicLabor)} negative />
          <BreakdownRow label="Utilities" value={formatCurrency(MONTHLY_UTILITIES)} negative />
          <BreakdownRow label="Other" value={formatCurrency(MONTHLY_OTHER)} negative />
        </div>

        <div className="border-foreground border-t-2 py-4">
          <div className="flex items-center justify-between">
            <span className="text-foreground text-sm font-bold">Monthly Profit</span>
            <span
              className={cn(
                "font-['Geist'] text-xl font-bold tabular-nums",
                d.monthlyProfit >= 0 ? "text-success" : "text-destructive",
              )}
            >
              {formatCurrency(d.monthlyProfit)}
            </span>
          </div>
          <div className="mt-1.5 flex items-center gap-2">
            <span className={cn("size-1.5 rounded-full", healthDot)} />
            <span className={cn("text-xs font-medium", healthTextColor)}>{healthLabel}</span>
            <span className="text-muted-foreground text-xs">
              · {(d.margin * 100).toFixed(1)}% margin
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
