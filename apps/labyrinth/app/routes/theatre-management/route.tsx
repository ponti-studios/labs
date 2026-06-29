import { useReducer, useMemo } from "react";
import { Link } from "react-router";
import { ArrowLeft, TrendingUp, DollarSign, PieChart, Tickets } from "lucide-react";
import { Badge, Button, Card, CardContent, CardHeader, Slider, Stepper } from "@pontistudios/ui";
import { cn } from "~/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type FilmCategory = "TENTPOLE" | "WIDE_RELEASE" | "HORROR" | "FAMILY" | "INDIE_HOLDOVER";

type ScreenAllocation = Record<FilmCategory, number>;

// ─── Action Types ────────────────────────────────────────────────────────────

type TheaterAction =
  | { type: "SET_SCREENS"; payload: number }
  | { type: "SET_ATTENDANCE"; payload: number }
  | { type: "SET_TICKET_PRICE"; payload: number }
  | { type: "SET_CONCESSION_PPC"; payload: number }
  | { type: "SET_SCREEN_ALLOCATION"; category: FilmCategory; screens: number };

// ─── Reducer ───────────────────────────────────────────────────────────────────

interface TheaterConfig {
  screens: number;
  weeklyAttendance: number;
  ticketPrice: number;
  concessionPerCap: number;
  screenAllocation: ScreenAllocation;
}

function clamp(v: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, v));
}

function getAllocatedScreens(allocation: ScreenAllocation) {
  return FILM_CATEGORY_ORDER.reduce((sum, category) => sum + allocation[category], 0);
}

function fitAllocationToScreens(allocation: ScreenAllocation, screens: number): ScreenAllocation {
  const next = { ...allocation };
  let overflow = getAllocatedScreens(next) - screens;

  for (const category of [...FILM_CATEGORY_ORDER].reverse()) {
    if (overflow <= 0) break;
    const reduction = Math.min(next[category], overflow);
    next[category] -= reduction;
    overflow -= reduction;
  }

  return next;
}

function getLineupMetrics(allocation: ScreenAllocation) {
  const allocatedScreens = getAllocatedScreens(allocation);

  if (allocatedScreens === 0) {
    return {
      allocatedScreens,
      studioCut: 0.53,
      demandMultiplier: 0,
      concessionMultiplier: 0,
    };
  }

  return FILM_CATEGORY_ORDER.reduce(
    (metrics, category) => {
      const screens = allocation[category];
      const weight = screens / allocatedScreens;
      const film = FILM_CATEGORIES[category];

      return {
        allocatedScreens,
        studioCut: metrics.studioCut + film.studioCut * weight,
        demandMultiplier: metrics.demandMultiplier + film.demandMultiplier * weight,
        concessionMultiplier: metrics.concessionMultiplier + film.concessionMultiplier * weight,
      };
    },
    {
      allocatedScreens,
      studioCut: 0,
      demandMultiplier: 0,
      concessionMultiplier: 0,
    },
  );
}

function theaterReducer(state: TheaterConfig, action: TheaterAction): TheaterConfig {
  switch (action.type) {
    case "SET_SCREENS": {
      const screens = clamp(action.payload, 4, 20);
      const maxCapacity = screens * SCREEN_CAPACITY;
      return {
        ...state,
        screens,
        weeklyAttendance: Math.min(state.weeklyAttendance, maxCapacity),
        screenAllocation: fitAllocationToScreens(state.screenAllocation, screens),
      };
    }
    case "SET_ATTENDANCE": {
      const maxCapacity = state.screens * SCREEN_CAPACITY;
      return { ...state, weeklyAttendance: Math.min(action.payload, maxCapacity) };
    }
    case "SET_TICKET_PRICE":
      return { ...state, ticketPrice: clamp(action.payload, 10, 20) };
    case "SET_CONCESSION_PPC":
      return { ...state, concessionPerCap: clamp(action.payload, 4, 12) };
    case "SET_SCREEN_ALLOCATION": {
      const usedByOtherScreens =
        getAllocatedScreens(state.screenAllocation) - state.screenAllocation[action.category];
      const screens = clamp(action.screens, 0, state.screens - usedByOtherScreens);

      return {
        ...state,
        screenAllocation: {
          ...state.screenAllocation,
          [action.category]: screens,
        },
      };
    }
  }
}

const INITIAL_CONFIG: TheaterConfig = {
  screens: 10,
  weeklyAttendance: 3_150,
  ticketPrice: 13,
  concessionPerCap: 7,
  screenAllocation: {
    TENTPOLE: 3,
    WIDE_RELEASE: 2,
    HORROR: 2,
    FAMILY: 1,
    INDIE_HOLDOVER: 2,
  },
};

const FILM_CATEGORIES: Record<
  FilmCategory,
  {
    label: string;
    role: string;
    studioCut: number;
    demandMultiplier: number;
    concessionMultiplier: number;
  }
> = {
  TENTPOLE: {
    label: "Tentpole",
    role: "Traffic driver",
    studioCut: 0.62,
    demandMultiplier: 1.18,
    concessionMultiplier: 1.02,
  },
  WIDE_RELEASE: {
    label: "Wide Release",
    role: "Stable floor",
    studioCut: 0.53,
    demandMultiplier: 1,
    concessionMultiplier: 1,
  },
  HORROR: {
    label: "Horror / Genre",
    role: "Margin play",
    studioCut: 0.48,
    demandMultiplier: 0.92,
    concessionMultiplier: 1.12,
  },
  FAMILY: {
    label: "Family Matinee",
    role: "Concessions boost",
    studioCut: 0.5,
    demandMultiplier: 0.88,
    concessionMultiplier: 1.22,
  },
  INDIE_HOLDOVER: {
    label: "Indie / Holdover",
    role: "Terms advantage",
    studioCut: 0.45,
    demandMultiplier: 0.72,
    concessionMultiplier: 0.86,
  },
};

const FILM_CATEGORY_ORDER = Object.keys(FILM_CATEGORIES) as FilmCategory[];

// ─── Industry Constants ───────────────────────────────────────────────────────

const MONTHLY_RENT = 25_000;
const MONTHLY_UTILITIES = 8_000;
const MONTHLY_OTHER = 5_000;
const FIXED_LABOR_BASE = 20_000;
const VARIABLE_LABOR_PER_PATRON = 2.22;
const CONCESSION_MARGIN = 0.7;

const SCREEN_CAPACITY = 1_000; // weekly capacity per screen

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

function fmt(n: number) {
  return n.toLocaleString();
}

function formatCompact(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}k`;
  return formatCurrency(n);
}

function getHealthStatus(monthlyProfit: number, grossRevenue: number) {
  if (grossRevenue === 0) return { label: "No data", variant: "muted" as const };
  const margin = monthlyProfit / grossRevenue;
  if (margin > 0.05) return { label: "Healthy", variant: "success" as const };
  if (margin > -0.05) return { label: "Break even", variant: "warning" as const };
  return { label: "Losing money", variant: "destructive" as const };
}

function capacityVariant(pct: number) {
  if (pct > 90) return "destructive" as const;
  if (pct > 70) return "warning" as const;
  return "success" as const;
}

const CAPACITY_STYLES = {
  success: { bar: "bg-success", text: "text-success" },
  warning: { bar: "bg-warning", text: "text-warning" },
  destructive: { bar: "bg-destructive", text: "text-destructive" },
} as const;

const HEALTH_STYLES = {
  success: { text: "text-success", dot: "bg-success" },
  warning: { text: "text-warning", dot: "bg-warning" },
  destructive: { text: "text-destructive", dot: "bg-destructive" },
  muted: { text: "text-muted-foreground", dot: "bg-muted-foreground" },
} as const;

// ─── Shared Sub-components ────────────────────────────────────────────────────

function BreakdownRow({
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

function StatRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-foreground tabular-nums">{children}</span>
    </div>
  );
}

// ─── Slider Control ───────────────────────────────────────────────────────────

function SliderControl({
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

// ─── KPI Cards ─────────────────────────────────────────────────────────────────

function ProfitRevenueCard({
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
      <CardContent className="flex h-full flex-col justify-between p-5">
        <div className="flex items-center justify-between">
          <span className="ui-data-label">Profit &amp; Revenue</span>
          <DollarSign className="text-muted-foreground size-4" />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4">
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

function RevenueMixCard({ d }: { d: ReturnType<typeof useCalculator> }) {
  return (
    <Card className="h-full min-h-[180px]">
      <CardContent className="flex h-full flex-col justify-between p-5">
        <div className="flex items-center justify-between">
          <span className="ui-data-label">Revenue Mix</span>
          <PieChart className="text-muted-foreground size-4" />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4">
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

function WeeklyTrafficCard({
  weeklyAttendance,
  d,
}: {
  weeklyAttendance: number;
  d: ReturnType<typeof useCalculator>;
}) {
  const cv = CAPACITY_STYLES[capacityVariant(d.capacityPct)];

  return (
    <Card className="h-full min-h-[180px]">
      <CardContent className="flex h-full flex-col justify-between p-5">
        <div className="flex items-center justify-between">
          <span className="ui-data-label">Weekly Traffic</span>
          <Tickets className="text-muted-foreground size-4" />
        </div>

        <div className="mt-4">
          <div className="text-foreground font-['Geist'] text-2xl font-semibold tracking-tight tabular-nums">
            {fmt(weeklyAttendance)}
          </div>
          <div className="mt-3 space-y-1.5">
            <StatRow label="Per weekend">{fmt(d.weekendDailyAvg)}</StatRow>
            <StatRow label="Per weekday">{fmt(d.weekdayDailyAvg)}</StatRow>
          </div>
        </div>

        <div className="mt-3 space-y-1.5">
          <div className="bg-muted flex h-2 overflow-hidden rounded-full">
            <div
              className={cn("transition-all duration-300", cv.bar)}
              style={{ width: `${d.capacityPct}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Screen Allocation ─────────────────────────────────────────────────────────

function ScreenAllocation({
  screens,
  allocation,
  onChange,
}: {
  screens: number;
  allocation: ScreenAllocation;
  onChange: (category: FilmCategory, screens: number) => void;
}) {
  const allocatedScreens = getAllocatedScreens(allocation);
  const availableScreens = screens - allocatedScreens;
  const allocationPct = screens > 0 ? Math.round((allocatedScreens / screens) * 100) : 0;

  return (
    <div className="space-y-3">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h3 className="text-emphasis-medium text-sm font-medium">Screen Allocation</h3>
          <p className="text-muted-foreground text-xs">Set the lineup across your auditorium.</p>
        </div>
        <div className="text-right">
          <div className="text-foreground font-mono text-sm font-semibold tabular-nums">
            {allocatedScreens}/{screens}
          </div>
          <div className="text-muted-foreground text-[11px]">screens assigned</div>
        </div>
      </div>

      <div className="bg-muted flex h-2 overflow-hidden rounded-full">
        <div
          className={cn(
            "transition-all duration-300",
            allocatedScreens === screens ? "bg-success" : "bg-warning",
          )}
          style={{ width: `${allocationPct}%` }}
        />
      </div>

      <div className="divide-border overflow-hidden rounded-md border">
        {FILM_CATEGORY_ORDER.map((category) => {
          const film = FILM_CATEGORIES[category];
          const screenCount = allocation[category];
          const maxScreens = screenCount + availableScreens;

          return (
            <div
              key={category}
              className={cn(
                "grid gap-3 px-3 py-3 sm:grid-cols-[1fr_auto] sm:items-center",
                screenCount > 0 ? "bg-primary/5" : "bg-background",
              )}
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-foreground text-sm font-semibold">{film.label}</span>
                  <Badge variant="outline" className="text-[10px]">
                    {film.role}
                  </Badge>
                </div>
                <div className="text-muted-foreground mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[11px]">
                  <span>Studio {Math.round(film.studioCut * 100)}%</span>
                  <span>Demand {(film.demandMultiplier * 100).toFixed(0)}%</span>
                  <span>Concessions {(film.concessionMultiplier * 100).toFixed(0)}%</span>
                </div>
              </div>
              <div className="flex items-center justify-between gap-3 sm:justify-end">
                <span className="text-muted-foreground text-xs">
                  {screenCount === 1 ? "1 screen" : `${screenCount} screens`}
                </span>
                <Stepper
                  value={screenCount}
                  min={0}
                  max={maxScreens}
                  onChange={(value) => onChange(category, value)}
                />
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-muted-foreground text-xs">
        {availableScreens === 0
          ? "Lineup is full. Move screens between categories to change your strategy."
          : `${availableScreens} ${availableScreens === 1 ? "screen is" : "screens are"} still unassigned.`}
      </p>
    </div>
  );
}

// ─── P&L Statement ─────────────────────────────────────────────────────────────

function PLStatement({
  d,
  lineupMetrics,
  healthLabel,
  healthDot,
  healthTextColor,
}: {
  d: ReturnType<typeof useCalculator>;
  lineupMetrics: ReturnType<typeof getLineupMetrics>;
  healthLabel: string;
  healthDot: string;
  healthTextColor: string;
}) {
  return (
    <Card>
      <CardHeader className="px-5 py-4">
        <h2 className="text-foreground text-sm font-semibold">Monthly P&L</h2>
        <span className="text-muted-foreground font-mono text-[10px]">
          {new Date().toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
          })}
        </span>
      </CardHeader>

      <CardContent className="divide-border divide-y px-5 py-0">
        {/* Revenue */}
        <div className="py-3">
          <div className="ui-eyebrow mb-2">Revenue</div>
          <BreakdownRow
            label="Ticket Revenue (gross)"
            value={formatCurrency(d.grossTicketRevenue)}
          />
          <BreakdownRow
            label={`Studio Cut (−${Math.round(lineupMetrics.studioCut * 100)}%)`}
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

        {/* Gross */}
        <div className="py-3">
          <BreakdownRow label="Gross Revenue" value={formatCurrency(d.grossRevenue)} bold />
        </div>

        {/* Expenses */}
        <div className="py-3">
          <div className="ui-eyebrow mb-2">Expenses</div>
          <BreakdownRow label="Rent" value={formatCurrency(MONTHLY_RENT)} negative />
          <BreakdownRow label="Labor" value={formatCurrency(d.dynamicLabor)} negative />
          <BreakdownRow label="Utilities" value={formatCurrency(MONTHLY_UTILITIES)} negative />
          <BreakdownRow label="Other" value={formatCurrency(MONTHLY_OTHER)} negative />
        </div>

        {/* Net */}
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

// ─── Calculator Hook ───────────────────────────────────────────────────────────

function useCalculator(
  weeklyAttendance: number,
  ticketPrice: number,
  concessionPerCap: number,
  lineupMetrics: ReturnType<typeof getLineupMetrics>,
  maxCapacity: number,
) {
  return useMemo(() => {
    const programmedCapacity = lineupMetrics.allocatedScreens * SCREEN_CAPACITY;
    const activeCapacity = Math.max(programmedCapacity, 1);
    const effectiveWeeklyAttendance = Math.min(
      Math.round(weeklyAttendance * lineupMetrics.demandMultiplier),
      activeCapacity,
    );
    const monthlyVisitors = Math.round((effectiveWeeklyAttendance * 30) / 7);
    const weekendDailyAvg = Math.round((effectiveWeeklyAttendance * 0.75) / 3);
    const weekdayDailyAvg = Math.round((effectiveWeeklyAttendance * 0.25) / 4);
    const overCapacity = effectiveWeeklyAttendance > activeCapacity;
    const capacityPct = Math.round((effectiveWeeklyAttendance / maxCapacity) * 100);

    const grossTicketRevenue = monthlyVisitors * ticketPrice;
    const studioCutAmount = grossTicketRevenue * lineupMetrics.studioCut;
    const theaterTicketRevenue = grossTicketRevenue - studioCutAmount;
    const concessionProfit =
      monthlyVisitors * concessionPerCap * lineupMetrics.concessionMultiplier * CONCESSION_MARGIN;
    const grossRevenue = theaterTicketRevenue + concessionProfit;

    const dynamicLabor = Math.round(FIXED_LABOR_BASE + monthlyVisitors * VARIABLE_LABOR_PER_PATRON);
    const totalExpenses = MONTHLY_RENT + dynamicLabor + MONTHLY_UTILITIES + MONTHLY_OTHER;
    const monthlyProfit = Math.round(grossRevenue - totalExpenses);

    const ticketPct =
      grossRevenue > 0 ? Math.round((theaterTicketRevenue / grossRevenue) * 100) : 0;
    const snackPct = grossRevenue > 0 ? Math.round((concessionProfit / grossRevenue) * 100) : 0;

    const margin = grossRevenue > 0 ? monthlyProfit / grossRevenue : 0;

    return {
      monthlyVisitors,
      effectiveWeeklyAttendance,
      weekendDailyAvg,
      weekdayDailyAvg,
      overCapacity,
      capacityPct,
      grossTicketRevenue,
      studioCutAmount,
      theaterTicketRevenue,
      concessionProfit,
      grossRevenue,
      dynamicLabor,
      totalExpenses,
      monthlyProfit,
      ticketPct,
      snackPct,
      margin,
    };
  }, [weeklyAttendance, ticketPrice, concessionPerCap, lineupMetrics, maxCapacity]);
}

// ─── Route Component ──────────────────────────────────────────────────────────

export default function TheaterEconomics() {
  const [config, dispatch] = useReducer(theaterReducer, INITIAL_CONFIG);

  const maxCapacity = config.screens * SCREEN_CAPACITY;
  const lineupMetrics = getLineupMetrics(config.screenAllocation);
  const d = useCalculator(
    config.weeklyAttendance,
    config.ticketPrice,
    config.concessionPerCap,
    lineupMetrics,
    maxCapacity,
  );
  const health = getHealthStatus(d.monthlyProfit, d.grossRevenue);
  const hs = HEALTH_STYLES[health.variant];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-16 md:px-6">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header className="mb-8 flex items-center gap-3">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground"
        >
          <Link to="/">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div className="bg-border h-4 w-px" />
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-foreground text-lg font-semibold tracking-tight">Theater P&L</h1>
            <Badge variant="secondary" className="text-[10px]">
              Beta
            </Badge>
          </div>
          <p className="text-muted-foreground text-xs">
            Exhibition economics for theatrical distribution analysis
          </p>
        </div>
      </header>

      {/* ── KPI Cards ───────────────────────────────────────────────────── */}
      <div className="mb-6 grid gap-3 md:grid-cols-3">
        <ProfitRevenueCard
          d={d}
          healthLabel={health.label}
          healthDot={hs.dot}
          healthTextColor={hs.text}
        />
        <RevenueMixCard d={d} />
        <WeeklyTrafficCard weeklyAttendance={d.effectiveWeeklyAttendance} d={d} />
      </div>

      {/* ── Main Grid: Controls + P&L Statement ────────────────────────── */}
      <div className="grid items-start gap-6 lg:grid-cols-[1fr_380px]">
        {/* ── Left: Controls ────────────────────────────────────────────── */}
        <div className="space-y-6">
          <Card>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <label className="text-emphasis-medium text-sm font-medium">Screens</label>
                      <p className="text-muted-foreground text-xs">
                        1 screen = ~{SCREEN_CAPACITY.toLocaleString()} visitors / week
                      </p>
                    </div>
                    <Stepper
                      value={config.screens}
                      min={4}
                      max={20}
                      onChange={(v) => dispatch({ type: "SET_SCREENS", payload: v })}
                    />
                  </div>
                </div>

                <SliderControl
                  label="Weekly Attendance"
                  value={config.weeklyAttendance}
                  onChange={(v) => dispatch({ type: "SET_ATTENDANCE", payload: v })}
                  min={2000}
                  max={maxCapacity}
                  step={50}
                  format={fmt}
                />
                <SliderControl
                  label="Average Ticket Price"
                  value={config.ticketPrice}
                  onChange={(v) => dispatch({ type: "SET_TICKET_PRICE", payload: v })}
                  min={10}
                  max={20}
                  step={0.5}
                  format={formatCurrency}
                />
                <SliderControl
                  label="Concession Per Cap (SPP)"
                  value={config.concessionPerCap}
                  onChange={(v) => dispatch({ type: "SET_CONCESSION_PPC", payload: v })}
                  min={4}
                  max={12}
                  step={0.5}
                  format={formatCurrency}
                  hint="Spend per patron — conventional multiplex avg $6–$9"
                />

                <ScreenAllocation
                  screens={config.screens}
                  allocation={config.screenAllocation}
                  onChange={(category, screens) =>
                    dispatch({ type: "SET_SCREEN_ALLOCATION", category, screens })
                  }
                />
              </div>

              <div className="border-border mt-6 border-t pt-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground font-semibold">Total Monthly Expenses</span>
                  <span className="text-foreground font-['Geist'] text-lg font-semibold tabular-nums">
                    {formatCurrency(d.totalExpenses)}
                  </span>
                </div>
                <p className="text-muted-foreground mt-1.5 text-xs">
                  Labor = $20k base + $2.22 × {fmt(d.monthlyVisitors)} visitors
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Right: P&L Statement ──────────────────────────────────────── */}
        <div className="space-y-6">
          <PLStatement
            d={d}
            lineupMetrics={lineupMetrics}
            healthLabel={health.label}
            healthDot={hs.dot}
            healthTextColor={hs.text}
          />
        </div>
      </div>
    </div>
  );
}
