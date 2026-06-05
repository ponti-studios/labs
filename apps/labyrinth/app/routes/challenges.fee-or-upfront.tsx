import { useState, type JSX, type ChangeEvent } from 'react';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@pontistudios/ui';

// ─── Types ────────────────────────────────────────────────────────────────────

interface MonthRow {
  month: number;
  hours: number;
  onDemandMonthly: number;
  reservedMonthly: number;
  onDemandCumulative: number;
  reservedCumulative: number;
  isBreakEven: boolean;
}

interface Result {
  rows: MonthRow[];
  totalOnDemand: number;
  totalReserved: number;
  breakEvenMonth: number | null;
  savings: number;
  recommendation: 'reserved' | 'on-demand';
}

// ─── Presets ──────────────────────────────────────────────────────────────────

interface Preset {
  label: string;
  description: string;
  onDemandRate: string;
  reservedUpfront: string;
  reservedRate: string;
}

const PRESETS: Preset[] = [
  {
    label: 't3.medium',
    description: '2 vCPU · 4 GB',
    onDemandRate: '0.0416',
    reservedUpfront: '215',
    reservedRate: '0.0160',
  },
  {
    label: 'm5.large',
    description: '2 vCPU · 8 GB',
    onDemandRate: '0.0960',
    reservedUpfront: '500',
    reservedRate: '0.0400',
  },
  {
    label: 'c5.xlarge',
    description: '4 vCPU · 8 GB',
    onDemandRate: '0.1700',
    reservedUpfront: '876',
    reservedRate: '0.0680',
  },
  {
    label: 'r5.2xlarge',
    description: '8 vCPU · 64 GB',
    onDemandRate: '0.5040',
    reservedUpfront: '2620',
    reservedRate: '0.2010',
  },
];

const DEFAULT_MONTHLY_HOURS = '720, 720, 720, 720, 720, 720, 720, 720, 720, 720, 720, 720';

// ─── Algorithm ────────────────────────────────────────────────────────────────

function parseHours(raw: string): number[] {
  return raw
    .split(',')
    .map((s) => Number(s.trim()))
    .filter((n) => !Number.isNaN(n) && n >= 0);
}

function calculate(
  onDemandRate: number,
  reservedUpfront: number,
  reservedRate: number,
  monthlyHours: number[],
): Result {
  let onDemandCumulative = 0;
  let reservedCumulative = reservedUpfront;
  let breakEvenMonth: number | null = null;
  let prevOnDemand = 0;
  let prevReserved = reservedUpfront;

  const rows: MonthRow[] = monthlyHours.map((hours, i) => {
    const onDemandMonthly = hours * onDemandRate;
    const reservedMonthly = hours * reservedRate;

    onDemandCumulative += onDemandMonthly;
    reservedCumulative += reservedMonthly;

    const crossedThisMonth =
      breakEvenMonth === null &&
      prevReserved > prevOnDemand &&
      reservedCumulative <= onDemandCumulative;

    if (crossedThisMonth) {
      breakEvenMonth = i + 1;
    }

    prevOnDemand = onDemandCumulative;
    prevReserved = reservedCumulative;

    return {
      month: i + 1,
      hours,
      onDemandMonthly,
      reservedMonthly,
      onDemandCumulative,
      reservedCumulative,
      isBreakEven: crossedThisMonth,
    };
  });

  const totalOnDemand = onDemandCumulative;
  const totalReserved = reservedCumulative;
  const savings = Math.abs(totalOnDemand - totalReserved);
  const recommendation = totalReserved < totalOnDemand ? 'reserved' : 'on-demand';

  return { rows, totalOnDemand, totalReserved, breakEvenMonth, savings, recommendation };
}

// ─── Component ────────────────────────────────────────────────────────────────

const RUN_DELAY_MS = 300;

export default function CloudPricingComparison(): JSX.Element {
  const [onDemandRate, setOnDemandRate] = useState('0.0960');
  const [reservedUpfront, setReservedUpfront] = useState('500');
  const [reservedRate, setReservedRate] = useState('0.0400');
  const [hoursRaw, setHoursRaw] = useState(DEFAULT_MONTHLY_HOURS);
  const [result, setResult] = useState<Result | null>(null);
  const [running, setRunning] = useState(false);

  const applyPreset = (preset: Preset) => {
    setOnDemandRate(preset.onDemandRate);
    setReservedUpfront(preset.reservedUpfront);
    setReservedRate(preset.reservedRate);
    setResult(null);
  };

  const run = () => {
    setRunning(true);
    setResult(null);
    setTimeout(() => {
      setResult(
        calculate(
          Number(onDemandRate),
          Number(reservedUpfront),
          Number(reservedRate),
          parseHours(hoursRaw),
        ),
      );
      setRunning(false);
    }, RUN_DELAY_MS);
  };

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h2 className="text-xl font-semibold">On-Demand vs. Reserved Instances</h2>
        <p className="text-muted-foreground">
          Cloud providers charge more per hour when you make no commitment (on-demand) and less
          when you pay upfront for a reserved term. Given your expected monthly usage, find out
          which pricing model costs less over the period — and when reserved starts paying off.
        </p>
        <i className="text-xs text-muted-foreground">Based on a Goldman Sachs take-home challenge</i>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Instance presets</CardTitle>
          <p className="text-sm text-muted-foreground">
            Quick-fill with approximate AWS rates (1-year partial upfront reserved).
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => applyPreset(preset)}
                className="flex flex-col items-start rounded-lg border border-border px-3 py-2 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <span className="font-mono font-medium">{preset.label}</span>
                <span className="text-xs text-muted-foreground">{preset.description}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Configure</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="onDemandRate">On-demand rate ($/hr)</Label>
              <Input
                id="onDemandRate"
                type="number"
                min={0}
                step={0.001}
                value={onDemandRate}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setOnDemandRate(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Pay-as-you-go price per compute-hour. No commitment required.
              </p>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="reservedUpfront">Reserved upfront ($)</Label>
              <Input
                id="reservedUpfront"
                type="number"
                min={0}
                value={reservedUpfront}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setReservedUpfront(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                One-time commitment paid at the start of the reserved term.
              </p>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="reservedRate">Reserved hourly rate ($/hr)</Label>
              <Input
                id="reservedRate"
                type="number"
                min={0}
                step={0.001}
                value={reservedRate}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setReservedRate(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Discounted per-hour rate after paying the upfront commitment.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="hours">Monthly usage hours</Label>
            <Input
              id="hours"
              value={hoursRaw}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setHoursRaw(e.target.value)}
              placeholder="e.g. 720, 500, 680, 744"
            />
            <p className="text-xs text-muted-foreground">
              Comma-separated hours per month. One entry = one month. 720 hrs ≈ always-on for a month.
            </p>
          </div>

          <Button onClick={run} disabled={running} className="self-start min-w-28">
            {running ? (
              <span className="flex items-center gap-2">
                <span className="inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Calculating…
              </span>
            ) : (
              'Compare'
            )}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <div className="flex flex-col gap-4">
          {/* Summary cards */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Card>
              <CardContent className="pt-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                  Total on-demand
                </p>
                <p className="text-2xl font-semibold font-mono">
                  ${result.totalOnDemand.toFixed(2)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                  Total reserved
                </p>
                <p className="text-2xl font-semibold font-mono">
                  ${result.totalReserved.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  incl. ${reservedUpfront} upfront
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                  Break-even
                </p>
                {result.breakEvenMonth !== null ? (
                  <>
                    <p className="text-2xl font-semibold font-mono">
                      Month {result.breakEvenMonth}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      reserved cheaper from here
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-2xl font-semibold font-mono text-muted-foreground">—</p>
                    <p className="text-xs text-muted-foreground mt-1">never crosses over</p>
                  </>
                )}
              </CardContent>
            </Card>
            <Card
              className={
                result.recommendation === 'reserved'
                  ? 'border-green-400 bg-green-50'
                  : 'border-blue-400 bg-blue-50'
              }
            >
              <CardContent className="pt-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                  Recommendation
                </p>
                <Badge
                  variant="outline"
                  className={
                    result.recommendation === 'reserved'
                      ? 'border-green-500 text-green-700 text-sm px-3 py-1'
                      : 'border-blue-500 text-blue-700 text-sm px-3 py-1'
                  }
                >
                  {result.recommendation === 'reserved' ? 'Go reserved' : 'Stay on-demand'}
                </Badge>
                <p className="text-xs text-muted-foreground mt-2">
                  saves ${result.savings.toFixed(2)} over this period
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Month-by-month table */}
          <Card>
            <CardHeader>
              <CardTitle>Month-by-month breakdown</CardTitle>
              <p className="text-sm text-muted-foreground">
                Cumulative costs include the reserved upfront from month 1. The break-even row is
                where reserved becomes cheaper overall.
              </p>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Month</TableHead>
                    <TableHead>Hours</TableHead>
                    <TableHead>On-demand (monthly)</TableHead>
                    <TableHead>Reserved (monthly)</TableHead>
                    <TableHead>On-demand (cumulative)</TableHead>
                    <TableHead>Reserved (cumulative)</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {result.rows.map((row, i) => (
                    <TableRow
                      key={row.month}
                      className={row.isBreakEven ? 'bg-green-50' : undefined}
                      style={{
                        animation: 'fade-slide-in 300ms ease-out both',
                        animationDelay: `${i * 60}ms`,
                      }}
                    >
                      <TableCell className="font-mono text-muted-foreground">{row.month}</TableCell>
                      <TableCell className="font-mono">{row.hours}h</TableCell>
                      <TableCell className="font-mono">${row.onDemandMonthly.toFixed(2)}</TableCell>
                      <TableCell className="font-mono">${row.reservedMonthly.toFixed(2)}</TableCell>
                      <TableCell
                        className={`font-mono font-medium ${
                          row.onDemandCumulative > row.reservedCumulative
                            ? 'text-red-600'
                            : 'text-muted-foreground'
                        }`}
                      >
                        ${row.onDemandCumulative.toFixed(2)}
                      </TableCell>
                      <TableCell
                        className={`font-mono font-medium ${
                          row.reservedCumulative <= row.onDemandCumulative
                            ? 'text-green-600'
                            : 'text-muted-foreground'
                        }`}
                      >
                        ${row.reservedCumulative.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        {row.isBreakEven && (
                          <Badge
                            variant="outline"
                            className="border-green-400 text-green-700 whitespace-nowrap"
                          >
                            break-even
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
