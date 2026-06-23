import { useState } from "react";
import { Link } from "react-router";
import { ArrowLeft } from "lucide-react";
import { Button, Slider } from "@pontistudios/ui";

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
const FIXED_LABOR_BASE = 20_000; // core management, projectionists, security
const VARIABLE_LABOR_PER_PATRON = 2.22; // ushers, concession cashiers (per monthly visitor)
const CONCESSION_MARGIN = 0.7;
const MULTIPLEX_WEEKLY_CAPACITY = 10_000; // conventional 8–10 screen multiplex warning threshold

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(n);
}

function fmt(n: number) {
  return n.toLocaleString();
}

function getHealthStatus(monthlyProfit: number, grossRevenue: number) {
  if (grossRevenue === 0) return { label: "NO DATA", className: "text-[#a0703a]" };
  const margin = monthlyProfit / grossRevenue;
  if (margin > 0.15) return { label: "THRIVING", className: "text-[#4a5c3c]" };
  if (margin > 0.05) return { label: "HEALTHY", className: "text-[#4a5c3c]" };
  if (margin > -0.05) return { label: "BREAKING EVEN", className: "text-[#a0703a]" };
  return { label: "LOSING MONEY", className: "text-[#8c1c1c]" };
}

// ─── CostRow ──────────────────────────────────────────────────────────────────

function CostRow({
  label,
  value,
  note,
  bold,
  large,
  color = "text-[#5c3d2e]",
  valueColor = "text-[#5c3d2e]",
  prefix = "",
  suffix = "",
}: {
  label: string;
  value: number;
  note?: string;
  bold?: boolean;
  large?: boolean;
  color?: string;
  valueColor?: string;
  prefix?: string;
  suffix?: string;
}) {
  return (
    <div className={large ? "text-sm" : ""}>
      <div className={`flex items-baseline gap-4 ${bold ? "font-bold" : ""}`}>
        <span className={`min-w-0 shrink ${color}`}>{label}</span>
        <span className={`ml-auto shrink-0 tabular-nums ${valueColor}`}>
          {prefix}
          {formatCurrency(value)}
          {suffix}
        </span>
      </div>
      {note && <div className="text-[10px] text-[#a0703a] mt-0.5">{note}</div>}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function TheaterEconomics() {
  const [weeklyAttendance, setWeeklyAttendance] = useState(3_150);
  const [ticketPrice, setTicketPrice] = useState(13);
  const [concessionPerCap, setConcessionPerCap] = useState(7);
  const [filmSlate, setFilmSlate] = useState<FilmSlateType>("BALANCED_SLATE");

  // Attendance
  const monthlyVisitors = Math.round((weeklyAttendance * 30) / 7);
  const weekendDailyAvg = Math.round((weeklyAttendance * 0.75) / 3); // Fri–Sun
  const weekdayDailyAvg = Math.round((weeklyAttendance * 0.25) / 4); // Mon–Thu
  const overCapacity = weeklyAttendance > MULTIPLEX_WEEKLY_CAPACITY;

  // Box office
  const slate = FILM_SLATE[filmSlate];
  const grossTicketRevenue = monthlyVisitors * ticketPrice;
  const studioCutAmount = grossTicketRevenue * slate.studioCut;
  const theaterTicketRevenue = grossTicketRevenue - studioCutAmount;

  // Concessions (per-cap model)
  const concessionProfit = monthlyVisitors * concessionPerCap * CONCESSION_MARGIN;

  // Revenue
  const grossRevenue = theaterTicketRevenue + concessionProfit;

  // Step-variable expenses
  const dynamicLabor = Math.round(FIXED_LABOR_BASE + monthlyVisitors * VARIABLE_LABOR_PER_PATRON);
  const totalExpenses = MONTHLY_RENT + dynamicLabor + MONTHLY_UTILITIES + MONTHLY_OTHER;
  const monthlyProfit = Math.round(grossRevenue - totalExpenses);

  // Revenue mix
  const ticketPct = grossRevenue > 0 ? Math.round((theaterTicketRevenue / grossRevenue) * 100) : 0;
  const snackPct = grossRevenue > 0 ? Math.round((concessionProfit / grossRevenue) * 100) : 0;

  const health = getHealthStatus(monthlyProfit, grossRevenue);

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-5 flex items-center gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link to="/business-tools">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-base font-semibold text-[#1a1208] leading-tight">Theater P&L</h1>
          <p className="text-xs text-[#a0703a]">
            Exhibition economics for theatrical distribution analysis
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2 items-start">
        {/* ── Controls ── */}
        <div className="rounded-lg border border-[#e8d5b5] bg-[#f5ecd7] p-5 space-y-5">
          <p className="ui-eyebrow">Scenario inputs</p>

          {/* Sliders */}
          <div className="grid grid-cols-1 gap-x-6 gap-y-4">
            <div className="space-y-2">
              <div className="flex items-baseline justify-between gap-2">
                <label className="text-xs font-medium text-[#5c3d2e]">Weekly attendance</label>
                <span className="shrink-0 text-sm font-semibold tabular-nums text-[#1a1208]">
                  {fmt(weeklyAttendance)}
                </span>
              </div>
              <Slider
                value={[weeklyAttendance]}
                onValueChange={(v) => setWeeklyAttendance(v[0] ?? 3150)}
                min={2000}
                max={15000}
                step={50}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-baseline justify-between gap-2">
                <label className="text-xs font-medium text-[#5c3d2e]">Avg ticket price</label>
                <span className="shrink-0 text-sm font-semibold tabular-nums text-[#1a1208]">
                  {formatCurrency(ticketPrice)}
                </span>
              </div>
              <Slider
                value={[ticketPrice]}
                onValueChange={(v) => setTicketPrice(v[0] ?? 13)}
                min={10}
                max={20}
                step={0.5}
              />
            </div>

            <div className="col-span-2 space-y-2">
              <div className="flex items-baseline justify-between gap-2">
                <label className="text-xs font-medium text-[#5c3d2e]">
                  Concession per cap (SPP)
                </label>
                <span className="shrink-0 text-sm font-semibold tabular-nums text-[#1a1208]">
                  {formatCurrency(concessionPerCap)}
                </span>
              </div>
              <Slider
                value={[concessionPerCap]}
                onValueChange={(v) => setConcessionPerCap(v[0] ?? 7)}
                min={4}
                max={12}
                step={0.5}
              />
              <p className="text-xs text-[#a0703a]">
                Spend per patron · conventional multiplex avg $6–$9
              </p>
            </div>
          </div>

          {/* Film Slate Selector */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-[#5c3d2e]">Film slate</p>
            <div className="grid grid-cols-3 gap-1.5">
              {(Object.keys(FILM_SLATE) as FilmSlateType[]).map((key) => {
                const s = FILM_SLATE[key];
                const active = filmSlate === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setFilmSlate(key)}
                    className={`rounded px-2 py-2 text-left transition-colors ${
                      active
                        ? "bg-[#1a1208] text-[#f5ecd7]"
                        : "bg-[#ede0cc] text-[#5c3d2e] hover:bg-[#e8d5b5]"
                    }`}
                  >
                    <div className="text-[11px] font-semibold leading-tight">
                      {s.emoji} {s.label}
                    </div>
                    <div
                      className={`text-[10px] mt-0.5 ${active ? "text-[#c8a882]" : "text-[#a0703a]"}`}
                    >
                      {Math.round(s.studioCut * 100)}% studio cut
                    </div>
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-[#a0703a]">{slate.description}</p>
          </div>

          {/* Variable costs reference */}
          <div className="pt-4 border-t border-[#e8d5b5] space-y-1.5">
            <p className="ui-eyebrow mb-2">Operating costs</p>
            <CostRow label="Rent" value={MONTHLY_RENT} suffix="/mo" />
            <CostRow
              label="Labor (step-variable)"
              value={dynamicLabor}
              suffix="/mo"
              note={`$20k base + $2.22 × ${fmt(monthlyVisitors)} visitors`}
            />
            <CostRow label="Utilities" value={MONTHLY_UTILITIES} suffix="/mo" />
            <CostRow label="Other" value={MONTHLY_OTHER} suffix="/mo" />
            <div className="pt-1.5 border-t border-[#e8d5b5]">
              <CostRow
                label="Total"
                value={totalExpenses}
                bold
                suffix="/mo"
                color="text-[#1a1208]"
              />
            </div>
          </div>
        </div>

        {/* ── Receipt ── */}
        <div className="font-mono text-xs bg-white rounded-lg border border-[#e8d5b5] px-6 py-5 shadow-[0_4px_16px_rgba(26,18,8,0.07)]">
          <div className="text-center mb-4">
            <div className="text-sm font-bold tracking-widest text-[#1a1208]">🍿 THEATER P&L</div>
            <div className="text-[10px] text-[#a0703a] tracking-[0.15em] uppercase">
              Monthly Exhibition Report
            </div>
            <div className="mt-3 border-t border-[#e8d5b5]" />
          </div>

          {/* Attendance breakdown */}
          <div className="mb-2.5 space-y-1 text-[10px]">
            <div className="flex justify-between text-[#5c3d2e]">
              <span>Weekly visitors</span>
              <span className="tabular-nums">{fmt(weeklyAttendance)}</span>
            </div>
            <div className="flex justify-between text-[#a0703a]">
              <span>Weekend avg (Fri–Sun)</span>
              <span className="tabular-nums">{fmt(weekendDailyAvg)}/day</span>
            </div>
            <div className="flex justify-between text-[#a0703a]">
              <span>Weekday avg (Mon–Thu)</span>
              <span className="tabular-nums">{fmt(weekdayDailyAvg)}/day</span>
            </div>
            {overCapacity && (
              <div className="mt-1.5 px-2 py-1.5 bg-[#8c1c1c]/8 border border-[#8c1c1c]/20 text-[#8c1c1c] rounded font-semibold">
                ⚠ Weekend attendance may exceed conventional multiplex capacity
              </div>
            )}
          </div>

          <div className="border-t border-[#e8d5b5] pt-2.5 space-y-1.5">
            <CostRow
              label="Ticket Revenue (Gross)"
              value={grossTicketRevenue}
              note={`${fmt(monthlyVisitors)} visitors × ${formatCurrency(ticketPrice)}`}
              color="text-[#5c3d2e]"
              valueColor="text-[#1a1208]"
            />
            <CostRow
              label={`Studio Cut (−${Math.round(slate.studioCut * 100)}% · ${slate.emoji} ${slate.label})`}
              value={studioCutAmount}
              color="text-[#8c1c1c]"
              valueColor="text-[#8c1c1c]"
              prefix="−"
            />
          </div>

          <div className="my-2.5 border-t border-[#e8d5b5]" />

          <div className="space-y-1.5">
            <CostRow
              label="Your Ticket Revenue"
              value={theaterTicketRevenue}
              bold
              color="text-[#1a1208]"
              valueColor="text-[#1a1208]"
            />
            <CostRow
              label="Concession Profit (70% margin)"
              value={concessionProfit}
              note={`${formatCurrency(concessionPerCap)} SPP × ${fmt(monthlyVisitors)} visitors`}
              color="text-[#5c3d2e]"
              valueColor="text-[#1a1208]"
            />
          </div>

          <div className="my-2.5 border-t border-[#e8d5b5]" />

          <CostRow
            label="GROSS REVENUE"
            value={grossRevenue}
            bold
            color="text-[#1a1208]"
            valueColor="text-[#1a1208]"
          />

          <div className="mt-2.5 space-y-1.5">
            <CostRow
              label="Rent"
              value={MONTHLY_RENT}
              color="text-[#8c1c1c]"
              valueColor="text-[#8c1c1c]"
              prefix="−"
            />
            <CostRow
              label="Labor"
              value={dynamicLabor}
              note={`$20k fixed + $2.22 × ${fmt(monthlyVisitors)} visitors`}
              color="text-[#8c1c1c]"
              valueColor="text-[#8c1c1c]"
              prefix="−"
            />
            <CostRow
              label="Utilities"
              value={MONTHLY_UTILITIES}
              color="text-[#8c1c1c]"
              valueColor="text-[#8c1c1c]"
              prefix="−"
            />
            <CostRow
              label="Other"
              value={MONTHLY_OTHER}
              color="text-[#8c1c1c]"
              valueColor="text-[#8c1c1c]"
              prefix="−"
            />
          </div>

          <div className="my-2.5 border-t-2 border-[#1a1208]" />

          <div className="flex items-baseline gap-4 text-sm font-bold">
            <span className="min-w-0 shrink text-[#1a1208]">MONTHLY PROFIT</span>
            <span
              className={`ml-auto shrink-0 tabular-nums ${monthlyProfit >= 0 ? "text-[#4a5c3c]" : "text-[#8c1c1c]"}`}
            >
              {formatCurrency(monthlyProfit)}
            </span>
          </div>

          {/* Status + Revenue Mix */}
          <div className="mt-4 pt-3 border-t border-[#e8d5b5] grid grid-cols-3 text-center gap-2">
            <div
              className={`font-bold text-[11px] flex items-center justify-center ${health.className}`}
            >
              {health.label}
            </div>
            <div>
              <div className="font-bold text-[#1a1208]">{ticketPct}%</div>
              <div className="text-[10px] text-[#a0703a]">from tickets</div>
            </div>
            <div>
              <div className="font-bold text-[#1a1208]">{snackPct}%</div>
              <div className="text-[10px] text-[#a0703a]">from snacks</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
