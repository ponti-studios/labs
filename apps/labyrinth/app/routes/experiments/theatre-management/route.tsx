import { useReducer, useMemo } from "react";
import { Link } from "react-router";
import { ArrowLeft, TrendingUp, DollarSign, PieChart, Tickets } from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Slider,
  Stepper,
} from "@pontistudios/ui";
import { cn } from "~/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type FilmSlateType = "BLOCKBUSTER_HEAVY" | "BALANCED_SLATE" | "INDIE_HOLDOVER";

// ─── Action Types ────────────────────────────────────────────────────────────

type TheaterAction =
  | { type: "SET_SCREENS"; payload: number }
  | { type: "SET_ATTENDANCE"; payload: number }
  | { type: "SET_TICKET_PRICE"; payload: number }
  | { type: "SET_CONCESSION_PPC"; payload: number }
  | { type: "SET_SLATE"; payload: FilmSlateType };

// ─── Reducer ───────────────────────────────────────────────────────────────────

interface TheaterConfig {
  screens: number;
  weeklyAttendance: number;
  ticketPrice: number;
  concessionPerCap: number;
  filmSlate: FilmSlateType;
}

function clamp(v: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, v));
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
    case "SET_SLATE":
      return { ...state, filmSlate: action.payload };
  }
}

const INITIAL_CONFIG: TheaterConfig = {
  screens: 10,
  weeklyAttendance: 3_150,
  ticketPrice: 13,
  concessionPerCap: 7,
  filmSlate: "BALANCED_SLATE",
};

const FILM_SLATE: Record<
  FilmSlateType,
  { label: string; emoji: string; studioCut: number; description: string }
> = {
  BLOCKBUSTER_HEAVY: {
    label: "Blockbuster Heavy",
    emoji: "🍿",
    studioCut: 0.6,
    description: "Disney/Marvel summer & holiday peak",
  },
  BALANCED_SLATE: {
    label: "Balanced Slate",
    emoji: "🎭",
    studioCut: 0.53,
    description: "Mixed mid-tier: horror, comedies, holdovers",
  },
  INDIE_HOLDOVER: {
    label: "Indie / Holdover",
    emoji: "🎨",
    studioCut: 0.45,
    description: "Late-stage runs and arthouse programming",
  },
};

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
  return (
    <div className="border-primary bg-primary text-primary-foreground flex flex-col justify-between rounded-xl border p-5">
      <div className="flex items-center justify-between">
        <span className="ui-data-label text-primary-foreground/60">Profit &amp; Revenue</span>
        <DollarSign className="text-primary-foreground/40 size-4" />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div>
          <div className="font-['Geist'] text-2xl font-semibold tracking-tight tabular-nums">
            {formatCurrency(d.monthlyProfit)}
          </div>
          <div className="mt-1 flex items-center gap-1.5">
            <span className={cn("size-1.5 rounded-full", healthDot)} />
            <span className={cn("text-xs font-medium", healthTextColor)}>{healthLabel}</span>
            <span
              className={cn(
                "inline-flex items-center gap-0.5 text-xs font-medium",
                d.margin > 0 ? "text-success" : "text-destructive-foreground",
              )}
            >
              {(d.margin * 100).toFixed(1)}% margin
            </span>
          </div>
        </div>
        <div>
          <div className="font-['Geist'] text-xl font-semibold tracking-tight tabular-nums">
            {formatCompact(d.grossRevenue)}
          </div>
          <div className="mt-1 flex items-center gap-1.5">
            <TrendingUp className="text-primary-foreground/50 size-3" />
            <span className="text-primary-foreground/50 text-xs">
              {fmt(d.monthlyVisitors)} visitors
            </span>
          </div>
        </div>
      </div>
      <div className="border-primary-foreground/15 mt-3 border-t pt-2">
        <p className="text-primary-foreground/50 text-[11px]">Monthly Profit · Gross Revenue</p>
      </div>
    </div>
  );
}

function RevenueMixCard({ d }: { d: ReturnType<typeof useCalculator> }) {
  return (
    <div className="border-border bg-card flex flex-col justify-between rounded-xl border p-5">
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
    </div>
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
    <div className="border-border bg-card flex flex-col justify-between rounded-xl border p-5">
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

      {/* Capacity bar */}
      <div className="mt-3 space-y-1.5">
        <div className="bg-muted flex h-2 overflow-hidden rounded-full">
          <div
            className={cn("transition-all duration-300", cv.bar)}
            style={{ width: `${d.capacityPct}%` }}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Film Slate Selector ───────────────────────────────────────────────────────

function FilmSlateSelector({
  filmSlate,
  onSelect,
}: {
  filmSlate: FilmSlateType;
  onSelect: (slate: FilmSlateType) => void;
}) {
  return (
    <div className="space-y-3">
      <label className="text-emphasis-medium text-sm font-medium">Film Slate</label>
      <div className="grid grid-cols-3 gap-2">
        {(Object.keys(FILM_SLATE) as FilmSlateType[]).map((key) => {
          const s = FILM_SLATE[key];
          const active = filmSlate === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelect(key)}
              className={cn(
                "rounded-lg border px-3 py-3 text-left",
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-emphasis-medium hover:border-emphasis-subtle",
              )}
            >
              <div className="text-xs font-semibold">
                {s.emoji} {s.label}
              </div>
              <div
                className={cn(
                  "mt-1 text-[11px]",
                  active ? "text-primary-foreground/50" : "text-muted-foreground",
                )}
              >
                {Math.round(s.studioCut * 100)}% studio
              </div>
            </button>
          );
        })}
      </div>
      <p className="text-muted-foreground text-xs">{FILM_SLATE[filmSlate].description}</p>
    </div>
  );
}

// ─── P&L Statement ─────────────────────────────────────────────────────────────

function PLStatement({
  d,
  slate,
  healthLabel,
  healthDot,
  healthTextColor,
}: {
  d: ReturnType<typeof useCalculator>;
  slate: (typeof FILM_SLATE)[FilmSlateType];
  healthLabel: string;
  healthDot: string;
  healthTextColor: string;
}) {
  return (
    <div className="border-border bg-card rounded-xl border">
      <div className="border-border flex items-center justify-between border-b px-5 py-4">
        <h2 className="text-foreground text-sm font-semibold">Monthly P&L</h2>
        <span className="text-muted-foreground font-mono text-[10px]">
          {new Date().toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
          })}
        </span>
      </div>

      <div className="divide-border divide-y px-5">
        {/* Revenue */}
        <div className="py-3">
          <div className="ui-eyebrow mb-2">Revenue</div>
          <BreakdownRow
            label="Ticket Revenue (gross)"
            value={formatCurrency(d.grossTicketRevenue)}
          />
          <BreakdownRow
            label={`Studio Cut (−${Math.round(slate.studioCut * 100)}%)`}
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
      </div>
    </div>
  );
}

// ─── Calculator Hook ───────────────────────────────────────────────────────────

function useCalculator(
  weeklyAttendance: number,
  ticketPrice: number,
  concessionPerCap: number,
  slate: (typeof FILM_SLATE)[FilmSlateType],
  maxCapacity: number,
) {
  return useMemo(() => {
    const monthlyVisitors = Math.round((weeklyAttendance * 30) / 7);
    const weekendDailyAvg = Math.round((weeklyAttendance * 0.75) / 3);
    const weekdayDailyAvg = Math.round((weeklyAttendance * 0.25) / 4);
    const overCapacity = weeklyAttendance > maxCapacity;
    const capacityPct = Math.round((weeklyAttendance / maxCapacity) * 100);

    const grossTicketRevenue = monthlyVisitors * ticketPrice;
    const studioCutAmount = grossTicketRevenue * slate.studioCut;
    const theaterTicketRevenue = grossTicketRevenue - studioCutAmount;
    const concessionProfit = monthlyVisitors * concessionPerCap * CONCESSION_MARGIN;
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
  }, [weeklyAttendance, ticketPrice, concessionPerCap, slate, maxCapacity]);
}

// ─── Route Component ──────────────────────────────────────────────────────────

export default function TheaterEconomics() {
  const [config, dispatch] = useReducer(theaterReducer, INITIAL_CONFIG);

  const maxCapacity = config.screens * SCREEN_CAPACITY;
  const slate = FILM_SLATE[config.filmSlate];
  const d = useCalculator(
    config.weeklyAttendance,
    config.ticketPrice,
    config.concessionPerCap,
    slate,
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
        <WeeklyTrafficCard weeklyAttendance={config.weeklyAttendance} d={d} />
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

                <FilmSlateSelector
                  filmSlate={config.filmSlate}
                  onSelect={(s) => dispatch({ type: "SET_SLATE", payload: s })}
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
            slate={slate}
            healthLabel={health.label}
            healthDot={hs.dot}
            healthTextColor={hs.text}
          />
        </div>
      </div>
    </div>
  );
}
