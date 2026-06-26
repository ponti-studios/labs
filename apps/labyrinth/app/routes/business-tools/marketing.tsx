import { useState, useMemo } from "react";
import { Link } from "react-router";
import {
  ArrowLeft,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  DollarSign,
  Clapperboard,
  Popcorn,
} from "lucide-react";
import { Badge, Button, Slider } from "@pontistudios/ui";
import { cn } from "~/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type FilmSlateType = "BLOCKBUSTER_HEAVY" | "BALANCED_SLATE" | "INDIE_HOLDOVER";

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
const MULTIPLEX_WEEKLY_CAPACITY = 10_000;

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
  if (grossRevenue === 0)
    return {
      label: "No data",
      color: "text-neutral-400",
      bg: "bg-neutral-100",
      dot: "bg-neutral-300",
    };
  const margin = monthlyProfit / grossRevenue;
  if (margin > 0.15)
    return {
      label: "Thriving",
      color: "text-emerald-700",
      bg: "bg-emerald-50",
      dot: "bg-emerald-500",
    };
  if (margin > 0.05)
    return {
      label: "Healthy",
      color: "text-emerald-700",
      bg: "bg-emerald-50",
      dot: "bg-emerald-500",
    };
  if (margin > -0.05)
    return { label: "Break even", color: "text-amber-700", bg: "bg-amber-50", dot: "bg-amber-500" };
  return { label: "Losing money", color: "text-red-700", bg: "bg-red-50", dot: "bg-red-500" };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function MetricCard({
  label,
  value,
  subtitle,
  icon: Icon,
  trend,
  accent = false,
}: {
  label: string;
  value: string;
  subtitle?: string;
  icon: React.ElementType;
  trend?: { value: string; positive: boolean };
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        "group relative flex flex-col justify-between rounded-xl border p-5 transition-colors",
        accent
          ? "border-neutral-900 bg-neutral-900 text-white"
          : "border-neutral-200 bg-white hover:border-neutral-300",
      )}
    >
      <div className="flex items-center justify-between">
        <span
          className={cn(
            "text-xs font-medium tracking-wide uppercase",
            accent ? "text-neutral-400" : "text-neutral-500",
          )}
        >
          {label}
        </span>
        <Icon className={cn("size-4", accent ? "text-neutral-500" : "text-neutral-400")} />
      </div>
      <div className="mt-3">
        <div
          className={cn(
            "font-['Geist'] text-2xl font-semibold tracking-tight tabular-nums",
            accent ? "text-white" : "text-neutral-900",
          )}
        >
          {value}
        </div>
        <div className="mt-1 flex items-center gap-2">
          {trend && (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 text-xs font-medium",
                trend.positive
                  ? accent
                    ? "text-emerald-400"
                    : "text-emerald-600"
                  : accent
                    ? "text-red-400"
                    : "text-red-600",
              )}
            >
              {trend.positive ? (
                <ArrowUpRight className="size-3" />
              ) : (
                <ArrowDownRight className="size-3" />
              )}
              {trend.value}
            </span>
          )}
          {subtitle && (
            <span className={cn("text-xs", accent ? "text-neutral-400" : "text-neutral-500")}>
              {subtitle}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

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
        muted && "text-neutral-500",
      )}
    >
      <span className={cn(bold ? "text-neutral-900" : "text-neutral-600")}>{label}</span>
      <span
        className={cn(
          "tabular-nums",
          bold ? "text-neutral-900" : negative ? "text-red-600" : "text-neutral-700",
        )}
      >
        {negative && "−"}
        {value}
      </span>
    </div>
  );
}

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
        <label className="text-sm font-medium text-neutral-700">{label}</label>
        <span className="font-['Geist'] text-lg font-semibold text-neutral-900 tabular-nums">
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
      {hint && <p className="text-xs text-neutral-400">{hint}</p>}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function TheaterEconomics() {
  const [weeklyAttendance, setWeeklyAttendance] = useState(3_150);
  const [ticketPrice, setTicketPrice] = useState(13);
  const [concessionPerCap, setConcessionPerCap] = useState(7);
  const [filmSlate, setFilmSlate] = useState<FilmSlateType>("BALANCED_SLATE");

  const slate = FILM_SLATE[filmSlate];

  const d = useMemo(() => {
    const monthlyVisitors = Math.round((weeklyAttendance * 30) / 7);
    const weekendDailyAvg = Math.round((weeklyAttendance * 0.75) / 3);
    const weekdayDailyAvg = Math.round((weeklyAttendance * 0.25) / 4);
    const overCapacity = weeklyAttendance > MULTIPLEX_WEEKLY_CAPACITY;

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
  }, [weeklyAttendance, ticketPrice, concessionPerCap, slate]);

  const health = getHealthStatus(d.monthlyProfit, d.grossRevenue);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-16 md:px-6">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header className="mb-8 flex items-center gap-3">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="text-neutral-500 hover:text-neutral-900"
        >
          <Link to="/">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div className="h-4 w-px bg-neutral-200" />
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold tracking-tight text-neutral-900">Theater P&L</h1>
            <Badge variant="secondary" className="text-[10px]">
              Beta
            </Badge>
          </div>
          <p className="text-xs text-neutral-500">
            Exhibition economics for theatrical distribution analysis
          </p>
        </div>
      </header>

      {/* ── KPI Grid ────────────────────────────────────────────────────── */}
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard
          label="Monthly Profit"
          value={formatCurrency(d.monthlyProfit)}
          icon={DollarSign}
          accent
          trend={{
            value: `${(d.margin * 100).toFixed(1)}% margin`,
            positive: d.margin > 0,
          }}
        />
        <MetricCard
          label="Gross Revenue"
          value={formatCompact(d.grossRevenue)}
          icon={TrendingUp}
          subtitle={`${fmt(d.monthlyVisitors)} visitors`}
        />
        <MetricCard
          label="Ticket Share"
          value={`${d.ticketPct}%`}
          icon={Clapperboard}
          subtitle={formatCompact(d.theaterTicketRevenue)}
        />
        <MetricCard
          label="Concession Share"
          value={`${d.snackPct}%`}
          icon={Popcorn}
          subtitle={formatCompact(d.concessionProfit)}
        />
      </div>

      {/* ── Health Banner ───────────────────────────────────────────────── */}
      {d.grossRevenue > 0 && (
        <div
          className={cn(
            "mb-6 flex items-center justify-between rounded-lg border px-4 py-3",
            health.bg,
            d.monthlyProfit >= 0 ? "border-emerald-200" : "border-red-200",
          )}
        >
          <div className="flex items-center gap-2.5">
            <span className={cn("size-2 rounded-full", health.dot)} />
            <span className={cn("text-sm font-medium", health.color)}>{health.label}</span>
            <span className="text-xs text-neutral-500">
              — {d.overCapacity ? "Weekend capacity may be exceeded" : "Operating within capacity"}
            </span>
          </div>
          <span className="hidden text-xs text-neutral-500 sm:block">
            {fmt(d.weekendDailyAvg)}/day weekends · {fmt(d.weekdayDailyAvg)}/day weekdays
          </span>
        </div>
      )}

      {/* ── Main Grid: Controls + P&L Statement ────────────────────────── */}
      <div className="grid items-start gap-6 lg:grid-cols-[1fr_380px]">
        {/* ── Left: Controls ────────────────────────────────────────────── */}
        <div className="space-y-6">
          {/* Scenario Inputs */}
          <div className="rounded-xl border border-neutral-200 bg-white">
            <div className="border-b border-neutral-100 px-5 py-4">
              <h2 className="text-sm font-semibold text-neutral-900">Scenario Inputs</h2>
              <p className="mt-0.5 text-xs text-neutral-500">
                Adjust attendance, pricing, and film mix to model outcomes
              </p>
            </div>
            <div className="space-y-6 p-5">
              <SliderControl
                label="Weekly Attendance"
                value={weeklyAttendance}
                onChange={setWeeklyAttendance}
                min={2000}
                max={15000}
                step={50}
                format={fmt}
              />
              <SliderControl
                label="Average Ticket Price"
                value={ticketPrice}
                onChange={setTicketPrice}
                min={10}
                max={20}
                step={0.5}
                format={formatCurrency}
              />
              <SliderControl
                label="Concession Per Cap (SPP)"
                value={concessionPerCap}
                onChange={setConcessionPerCap}
                min={4}
                max={12}
                step={0.5}
                format={formatCurrency}
                hint="Spend per patron — conventional multiplex avg $6–$9"
              />

              {/* Film Slate Selector */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-neutral-700">Film Slate</label>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.keys(FILM_SLATE) as FilmSlateType[]).map((key) => {
                    const s = FILM_SLATE[key];
                    const active = filmSlate === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setFilmSlate(key)}
                        className={cn(
                          "rounded-lg border px-3 py-3 text-left transition-all",
                          active
                            ? "border-neutral-900 bg-neutral-900 text-white shadow-sm"
                            : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300",
                        )}
                      >
                        <div className="text-xs font-semibold">
                          {s.emoji} {s.label}
                        </div>
                        <div
                          className={cn(
                            "mt-1 text-[11px]",
                            active ? "text-neutral-400" : "text-neutral-500",
                          )}
                        >
                          {Math.round(s.studioCut * 100)}% studio
                        </div>
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-neutral-400">{slate.description}</p>
              </div>
            </div>
          </div>

          {/* Operating Costs */}
          <div className="rounded-xl border border-neutral-200 bg-white">
            <div className="border-b border-neutral-100 px-5 py-4">
              <h2 className="text-sm font-semibold text-neutral-900">Operating Costs</h2>
              <p className="mt-0.5 text-xs text-neutral-500">Fixed and variable monthly expenses</p>
            </div>
            <div className="divide-y divide-neutral-100 px-5">
              <BreakdownRow label="Rent" value={formatCurrency(MONTHLY_RENT)} muted />
              <BreakdownRow label="Labor" value={formatCurrency(d.dynamicLabor)} muted />
              <BreakdownRow label="Utilities" value={formatCurrency(MONTHLY_UTILITIES)} muted />
              <BreakdownRow label="Other" value={formatCurrency(MONTHLY_OTHER)} muted />
              <BreakdownRow
                label="Total Monthly Expenses"
                value={formatCurrency(d.totalExpenses)}
                bold
              />
            </div>
            <div className="border-t border-neutral-100 px-5 py-3">
              <p className="text-xs text-neutral-400">
                Labor = $20k base + $2.22 × {fmt(d.monthlyVisitors)} visitors
              </p>
            </div>
          </div>
        </div>

        {/* ── Right: P&L Statement ──────────────────────────────────────── */}
        <div className="space-y-6">
          <div className="rounded-xl border border-neutral-200 bg-white">
            <div className="border-b border-neutral-100 px-5 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-neutral-900">Monthly P&L</h2>
                <span className="font-mono text-[10px] text-neutral-400">
                  {new Date().toLocaleDateString("en-US", {
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
            <div className="divide-y divide-neutral-100 px-5">
              {/* Revenue */}
              <div className="py-3">
                <div className="mb-2 text-[11px] font-medium tracking-wider text-neutral-400 uppercase">
                  Revenue
                </div>
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
                <BreakdownRow
                  label="Concession Profit"
                  value={formatCurrency(d.concessionProfit)}
                />
              </div>

              {/* Gross */}
              <div className="py-3">
                <BreakdownRow label="Gross Revenue" value={formatCurrency(d.grossRevenue)} bold />
              </div>

              {/* Expenses */}
              <div className="py-3">
                <div className="mb-2 text-[11px] font-medium tracking-wider text-neutral-400 uppercase">
                  Expenses
                </div>
                <BreakdownRow label="Rent" value={formatCurrency(MONTHLY_RENT)} negative />
                <BreakdownRow label="Labor" value={formatCurrency(d.dynamicLabor)} negative />
                <BreakdownRow
                  label="Utilities"
                  value={formatCurrency(MONTHLY_UTILITIES)}
                  negative
                />
                <BreakdownRow label="Other" value={formatCurrency(MONTHLY_OTHER)} negative />
              </div>

              {/* Net */}
              <div className="border-t-2 border-neutral-900 py-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-neutral-900">Monthly Profit</span>
                  <span
                    className={cn(
                      "font-['Geist'] text-xl font-bold tabular-nums",
                      d.monthlyProfit >= 0 ? "text-emerald-600" : "text-red-600",
                    )}
                  >
                    {formatCurrency(d.monthlyProfit)}
                  </span>
                </div>
                <div className="mt-1.5 flex items-center gap-2">
                  <span className={cn("size-1.5 rounded-full", health.dot)} />
                  <span className={cn("text-xs font-medium", health.color)}>{health.label}</span>
                  <span className="text-xs text-neutral-400">
                    · {(d.margin * 100).toFixed(1)}% margin
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Revenue Mix */}
          <div className="rounded-xl border border-neutral-200 bg-white p-5">
            <h3 className="text-xs font-medium tracking-wider text-neutral-400 uppercase">
              Revenue Mix
            </h3>
            <div className="mt-3 flex h-2.5 overflow-hidden rounded-full bg-neutral-100">
              <div
                className="bg-neutral-900 transition-all duration-300"
                style={{ width: `${d.ticketPct}%` }}
              />
              <div
                className="bg-neutral-400 transition-all duration-300"
                style={{ width: `${d.snackPct}%` }}
              />
            </div>
            <div className="mt-2.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                <span className="size-2 rounded-sm bg-neutral-900" />
                <span className="text-neutral-600">Tickets · {d.ticketPct}%</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="size-2 rounded-sm bg-neutral-400" />
                <span className="text-neutral-600">Snacks · {d.snackPct}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
