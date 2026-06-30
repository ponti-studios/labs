import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Slider,
  Stepper,
} from "@pontistudios/ui";
import { cn } from "~/lib/utils";
import { Clapperboard, DollarSign, PieChart, Tickets, TrendingUp } from "lucide-react";

import {
  clamp,
  FILM_CATEGORIES,
  FILM_CATEGORY_ORDER,
  MONTHLY_OTHER,
  MONTHLY_RENT,
  MONTHLY_UTILITIES,
  SEASON_OPTIONS,
  type FilmCategory,
  type ScreenAllocationMap,
  type SeasonKey,
} from "./theatre-model";
import {
  CAPACITY_STYLES,
  formatCompact,
  formatCurrency,
  fmt,
  HEALTH_STYLES,
  projectedImpactLabel,
  type useCalculator,
  utilizationVariant,
} from "./utils";

// ─── Shared Sub-components ────────────────────────────────────────────────────

export function BreakdownRow({
  label,
  value,
  negative,
  bold,
  muted,
}: {
  label: string;
  value: string;
  negative?: boolean;
  bold?: boolean;
  muted?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between py-2 text-sm",
        bold && "font-semibold",
        muted && "text-muted-foreground",
      )}
    >
      <span className={cn(bold ? "text-foreground" : "text-emphasis-medium")}>{label}</span>
      <span
        className={cn(
          "tabular-nums",
          bold ? "text-foreground" : negative ? "text-destructive" : "text-emphasis-high",
        )}
      >
        {negative && "−"}
        {value}
      </span>
    </div>
  );
}

export function StatRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-foreground tabular-nums">{children}</span>
    </div>
  );
}

export function SliderControl({
  label,
  value,
  onChange,
  min,
  max,
  step,
  format,
  hint,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
  hint?: string;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between">
        <label className="text-emphasis-medium text-sm font-medium">{label}</label>
        <span className="text-foreground font-['Geist'] text-lg font-semibold tabular-nums">
          {format(value)}
        </span>
      </div>
      <Slider
        value={[value]}
        onValueChange={(v) => onChange(v[0] ?? min)}
        min={min}
        max={max}
        step={step}
      />
      {hint && <p className="text-muted-foreground text-xs">{hint}</p>}
    </div>
  );
}

export function NumericControl({
  id,
  label,
  value,
  onChange,
  min,
  max,
  hint,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  hint?: string;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between gap-4">
        <label htmlFor={id} className="text-emphasis-medium text-sm font-medium">
          {label}
        </label>
        <span className="text-foreground font-['Geist'] text-lg font-semibold tabular-nums">
          {fmt(value)}
        </span>
      </div>
      <Input
        id={id}
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        step={100}
        value={value}
        onChange={(event) => {
          const next = Number(event.currentTarget.value);
          onChange(Number.isNaN(next) ? min : clamp(next, min, max));
        }}
      />
      {hint && <p className="text-muted-foreground text-xs">{hint}</p>}
    </div>
  );
}

// ─── KPI Cards ─────────────────────────────────────────────────────────────────

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
    <Card className="h-full min-h-[180px]">
      <CardHeader className="border-b-0 px-5 pt-5 pb-0">
        <div className="flex w-full items-center justify-between gap-2">
          <span className="ui-data-label">Profit &amp; Revenue</span>
          <DollarSign className="text-muted-foreground size-4" />
        </div>
      </CardHeader>

      <CardContent className="flex h-full flex-col justify-between px-5 pt-4 pb-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-foreground font-['Geist'] text-2xl font-semibold tracking-tight tabular-nums">
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
            <div className="text-foreground font-['Geist'] text-2xl font-semibold tracking-tight tabular-nums">
              {formatCompact(d.grossRevenue)}
            </div>
            <div className="mt-1 flex items-center gap-1.5">
              <TrendingUp className="text-muted-foreground size-3" />
              <span className="text-muted-foreground text-xs">
                {fmt(d.monthlyVisitors)} visitors
              </span>
            </div>
          </div>
        </div>

        <div className="bg-muted mt-3 flex h-2 overflow-hidden rounded-full">
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

export function RevenueMixCard({ d }: { d: ReturnType<typeof useCalculator> }) {
  return (
    <Card className="h-full min-h-[180px]">
      <CardHeader className="border-b-0 px-5 pt-5 pb-0">
        <div className="flex w-full items-center justify-between gap-2">
          <span className="ui-data-label">Revenue Mix</span>
          <PieChart className="text-muted-foreground size-4" />
        </div>
      </CardHeader>

      <CardContent className="flex h-full flex-col justify-between px-5 pt-4 pb-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-foreground font-['Geist'] text-2xl font-semibold tracking-tight tabular-nums">
              {d.ticketPct}%
            </div>
            <div className="mt-1 flex items-center gap-1.5">
              <span className="bg-foreground size-2 rounded-sm" />
              <span className="text-muted-foreground text-xs">
                Tickets · {formatCompact(d.theaterTicketRevenue)}
              </span>
            </div>
          </div>
          <div>
            <div className="text-foreground font-['Geist'] text-2xl font-semibold tracking-tight tabular-nums">
              {d.snackPct}%
            </div>
            <div className="mt-1 flex items-center gap-1.5">
              <span className="bg-emphasis-lower size-2 rounded-sm" />
              <span className="text-muted-foreground text-xs">
                Snacks · {formatCompact(d.concessionProfit)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-muted mt-3 flex h-2 overflow-hidden rounded-full">
          <div
            className="bg-foreground transition-all duration-300"
            style={{ width: `${d.ticketPct}%` }}
          />
          <div
            className="bg-emphasis-lower transition-all duration-300"
            style={{ width: `${d.snackPct}%` }}
          />
        </div>
      </CardContent>
    </Card>
  );
}

export function WeeklyTrafficCard({ d }: { d: ReturnType<typeof useCalculator> }) {
  const cv = CAPACITY_STYLES[utilizationVariant(d.utilizationPct)];

  return (
    <Card className="h-full min-h-[180px]">
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

// ─── Screen Allocation ─────────────────────────────────────────────────────────

export function ScreenAllocation({
  screens,
  allocation,
  marketBaseline,
  season,
  onScreensChange,
  onMarketChange,
  onSeasonChange,
  onAllocationChange,
}: {
  screens: number;
  allocation: ScreenAllocationMap;
  marketBaseline: number;
  season: SeasonKey;
  onScreensChange: (screens: number) => void;
  onMarketChange: (baseline: number) => void;
  onSeasonChange: (season: SeasonKey) => void;
  onAllocationChange: (category: FilmCategory, screens: number) => void;
}) {
  const allocatedScreens = FILM_CATEGORY_ORDER.reduce(
    (sum, category) => sum + allocation[category],
    0,
  );

  return (
    <Card>
      <CardHeader className="px-5 py-4">
        <div className="flex w-full items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="ui-data-label">Screen Allocation</span>
              <Clapperboard className="text-muted-foreground size-4" />
            </div>
            <p className="text-muted-foreground mt-1 text-xs">
              Roster your screens like a weekly lineup.
            </p>
          </div>
          <div className="text-right">
            <div className="text-foreground font-mono text-sm font-semibold tabular-nums">
              {allocatedScreens}/{screens}
            </div>
            <div className="text-muted-foreground text-[11px]">screens assigned</div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5 px-5 py-5">
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-baseline justify-between gap-4">
              <label className="text-emphasis-medium text-sm font-medium">Screens</label>
              <Stepper
                value={screens}
                min={4}
                max={20}
                onChange={onScreensChange}
                decreaseLabel="Decrease total screens"
                increaseLabel="Increase total screens"
              />
            </div>
            <p className="text-muted-foreground text-xs">
              The roster rebalances automatically as the house grows or shrinks.
            </p>
          </div>

          <NumericControl
            id="market-baseline"
            label="Market baseline"
            value={marketBaseline}
            onChange={onMarketChange}
            min={1_000}
            max={10_000}
            hint="Market demand before lineup strength is applied."
          />

          <div className="space-y-3">
            <div className="flex items-baseline justify-between gap-4">
              <label htmlFor="season" className="text-emphasis-medium text-sm font-medium">
                Season
              </label>
              <span className="text-muted-foreground text-xs tabular-nums">
                {SEASON_OPTIONS[season].multiplier.toFixed(2)}x
              </span>
            </div>
            <Select value={season} onValueChange={(value) => onSeasonChange(value as SeasonKey)}>
              <SelectTrigger id="season" aria-label="Season" className="w-full">
                <SelectValue placeholder="Select season" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(SEASON_OPTIONS).map(([seasonValue, option]) => (
                  <SelectItem key={seasonValue} value={seasonValue}>
                    {option.label} · {option.multiplier.toFixed(2)}x
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-muted-foreground text-xs">Simple seasonal multiplier.</p>
          </div>
        </div>

        <div className="space-y-3">
          {FILM_CATEGORY_ORDER.map((category, index) => {
            const film = FILM_CATEGORIES[category];
            const screenCount = allocation[category];

            return (
              <div
                key={category}
                className={cn(
                  "grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center",
                  index > 0 && "border-border/60 border-t pt-3",
                )}
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-foreground text-sm font-semibold">{film.label}</span>
                    <Badge variant="outline" className="text-[10px]">
                      {film.role}
                    </Badge>
                    <Badge variant="secondary" className="text-[10px]">
                      {projectedImpactLabel(film.demandMultiplier)}
                    </Badge>
                  </div>
                  <div className="text-muted-foreground mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[11px]">
                    <span>Studio {Math.round(film.studioCut * 100)}%</span>
                    <span>Concessions {Math.round(film.concessionMultiplier * 100)}%</span>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-3">
                  <Stepper
                    value={screenCount}
                    min={0}
                    max={screens}
                    onChange={(value) => onAllocationChange(category, value)}
                    decreaseLabel={`Decrease ${film.label} screens`}
                    increaseLabel={`Increase ${film.label} screens`}
                  />
                </div>
              </div>
            );
          })}

          <p className="text-muted-foreground text-xs">
            {allocatedScreens === screens
              ? "Full roster locked. Shift a screen to rebalance the slate."
              : `${screens - allocatedScreens} screens remain unassigned.`}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── P&L Statement ─────────────────────────────────────────────────────────────

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
          <div className="ui-eyebrow mb-2">Revenue</div>
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
          <div className="ui-eyebrow mb-2">Expenses</div>
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
