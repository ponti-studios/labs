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
} from '@pontistudios/ui';

// ─── Presets ──────────────────────────────────────────────────────────────────

interface Preset {
  label: string;
  description: string;
  onDemandRate: number;
  reservedUpfront: number;
  reservedRate: number;
  vcpu: number;
}

const PRESETS: Preset[] = [
  {
    label: 't3.medium',
    description: '2 vCPU · 4 GB',
    onDemandRate: 0.0416,
    reservedUpfront: 215,
    reservedRate: 0.016,
    vcpu: 2,
  },
  {
    label: 'm5.large',
    description: '2 vCPU · 8 GB',
    onDemandRate: 0.096,
    reservedUpfront: 500,
    reservedRate: 0.04,
    vcpu: 2,
  },
  {
    label: 'c5.xlarge',
    description: '4 vCPU · 8 GB',
    onDemandRate: 0.17,
    reservedUpfront: 876,
    reservedRate: 0.068,
    vcpu: 4,
  },
  {
    label: 'r5.2xlarge',
    description: '8 vCPU · 64 GB',
    onDemandRate: 0.504,
    reservedUpfront: 2620,
    reservedRate: 0.201,
    vcpu: 8,
  },
];

const HOURS_PER_MONTH = 730;
const MONTHS = 12;
const TOTAL_HOURS = HOURS_PER_MONTH * MONTHS;
const MS_PER_HOUR = 3_600_000;

// ─── Algorithm ────────────────────────────────────────────────────────────────

interface Result {
  avgUtilisation: number;
  peakUtilisation: number;
  reservedTotal: number;
  onDemandTotal: number;
  breakEvenUtilisation: number;
  recommendation: 'reserved' | 'on-demand';
  savings: number;
}

function calculate(
  preset: Preset,
  requestsPerDay: number,
  computeTimeMs: number,
  peakMultiplier: number,
): Result {
  // Total CPU-ms needed per day on average
  const cpuMsPerDay = requestsPerDay * computeTimeMs;
  // Convert to fraction of one vCPU used continuously over a day
  const msPerDay = 86_400_000;
  const avgUtilisation = Math.min((cpuMsPerDay / (preset.vcpu * msPerDay)) * 100, 100);
  // Peak: multiply average request rate by peak multiplier
  const peakUtilisation = Math.min(avgUtilisation * peakMultiplier, 100);

  // Reserved: commit to the peak capacity, pay upfront + hourly at reserved rate
  const reservedTotal = preset.reservedUpfront + preset.reservedRate * TOTAL_HOURS;

  // On-demand: pay only for average utilisation (can scale down during quiet periods)
  const onDemandTotal =
    preset.onDemandRate * TOTAL_HOURS * (avgUtilisation / 100);

  const breakEvenUtilisation =
    ((preset.reservedUpfront + preset.reservedRate * TOTAL_HOURS) /
      (preset.onDemandRate * TOTAL_HOURS)) *
    100;

  const recommendation = reservedTotal < onDemandTotal ? 'reserved' : 'on-demand';
  const savings = Math.abs(reservedTotal - onDemandTotal);

  return {
    avgUtilisation,
    peakUtilisation,
    reservedTotal,
    onDemandTotal,
    breakEvenUtilisation,
    recommendation,
    savings,
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CloudPricingComparison(): JSX.Element {
  const [preset, setPreset] = useState<Preset>(PRESETS[1]);
  const [requestsPerDay, setRequestsPerDay] = useState('50000');
  const [computeTimeMs, setComputeTimeMs] = useState('200');
  const [peakMultiplier, setPeakMultiplier] = useState('3');
  const [result, setResult] = useState<Result | null>(null);
  const [running, setRunning] = useState(false);

  const run = () => {
    setRunning(true);
    setResult(null);
    setTimeout(() => {
      setResult(
        calculate(
          preset,
          Number(requestsPerDay),
          Number(computeTimeMs),
          Number(peakMultiplier),
        ),
      );
      setRunning(false);
    }, 300);
  };

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h2 className="text-xl font-semibold">On-Demand vs. Reserved Instances</h2>
        <p className="text-muted-foreground">
          Reserved instances cost less per hour but require an upfront commitment. On-demand
          charges more per hour but scales with actual usage. Enter your traffic profile to
          find out which is cheaper over a year.
        </p>
        <i className="text-xs text-muted-foreground">Based on a Goldman Sachs take-home challenge</i>
      </header>

      {/* Instance type */}
      <Card>
        <CardHeader>
          <CardTitle>Instance type</CardTitle>
          <p className="text-sm text-muted-foreground">
            Approximate AWS rates · 1-year partial upfront reserved term.
          </p>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => { setPreset(p); setResult(null); }}
                className={`flex flex-col items-start rounded-lg border px-3 py-2 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground ${
                  preset.label === p.label ? 'border-foreground bg-accent' : 'border-border'
                }`}
              >
                <span className="font-mono font-medium">{p.label}</span>
                <span className="text-xs text-muted-foreground">{p.description}</span>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">On-demand</p>
              <p className="font-mono font-medium">${preset.onDemandRate}/hr</p>
            </div>
            <div>
              <p className="text-muted-foreground">Reserved upfront</p>
              <p className="font-mono font-medium">${preset.reservedUpfront}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Reserved hourly</p>
              <p className="font-mono font-medium">${preset.reservedRate}/hr</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Traffic profile */}
      <Card>
        <CardHeader>
          <CardTitle>Traffic profile</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="requestsPerDay">Requests per day</Label>
              <Input
                id="requestsPerDay"
                type="number"
                min={1}
                value={requestsPerDay}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setRequestsPerDay(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Average daily request volume.</p>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="computeTimeMs">Compute time per request (ms)</Label>
              <Input
                id="computeTimeMs"
                type="number"
                min={1}
                value={computeTimeMs}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setComputeTimeMs(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Average CPU time to handle one request.
              </p>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="peakMultiplier">Peak multiplier</Label>
              <Input
                id="peakMultiplier"
                type="number"
                min={1}
                step={0.5}
                value={peakMultiplier}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setPeakMultiplier(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                How many times busier your peak is vs. average. e.g. 3 = traffic triples at peak.
              </p>
            </div>
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
          {/* Derived utilisation */}
          <Card>
            <CardHeader>
              <CardTitle>Derived load</CardTitle>
              <p className="text-sm text-muted-foreground">
                Calculated from your traffic profile against the selected instance's vCPU capacity.
              </p>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-3 text-sm">
              <div>
                <p className="text-muted-foreground">Average utilisation</p>
                <p className="text-2xl font-semibold font-mono">
                  {result.avgUtilisation.toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground mt-1">of {preset.vcpu} vCPUs</p>
              </div>
              <div>
                <p className="text-muted-foreground">Peak utilisation</p>
                <p className="text-2xl font-semibold font-mono">
                  {result.peakUtilisation.toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground mt-1">{peakMultiplier}× average</p>
              </div>
              <div>
                <p className="text-muted-foreground">Break-even threshold</p>
                <p className="text-2xl font-semibold font-mono">
                  {result.breakEvenUtilisation.toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground mt-1">reserved wins above this</p>
              </div>
            </CardContent>
          </Card>

          {/* Cost comparison */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <Card>
              <CardContent className="pt-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                  On-demand / yr
                </p>
                <p className="text-2xl font-semibold font-mono">
                  ${result.onDemandTotal.toFixed(0)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">scales with avg load</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                  Reserved / yr
                </p>
                <p className="text-2xl font-semibold font-mono">
                  ${result.reservedTotal.toFixed(0)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  incl. ${preset.reservedUpfront} upfront
                </p>
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
                  saves ${result.savings.toFixed(0)} vs the alternative
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Utilisation bar */}
          <Card>
            <CardHeader>
              <CardTitle>Load vs. break-even</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="relative h-8 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-foreground z-10"
                  style={{ left: `${Math.min(result.breakEvenUtilisation, 100)}%` }}
                />
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    result.recommendation === 'reserved' ? 'bg-green-400' : 'bg-blue-400'
                  }`}
                  style={{ width: `${Math.min(result.avgUtilisation, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0%</span>
                <span>100%</span>
              </div>
              <p className="text-sm">
                Average load{' '}
                <span className="font-semibold font-mono">
                  {result.avgUtilisation.toFixed(1)}%
                </span>{' '}
                {result.avgUtilisation >= result.breakEvenUtilisation ? (
                  <span className="text-green-600">
                    is above the {result.breakEvenUtilisation.toFixed(1)}% break-even —{' '}
                    reserved wins
                  </span>
                ) : (
                  <span className="text-blue-600">
                    is below the {result.breakEvenUtilisation.toFixed(1)}% break-even —{' '}
                    on-demand wins
                  </span>
                )}
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
