import { useState, type JSX } from 'react';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Slider,
} from '@pontistudios/ui';

// ─── Presets ──────────────────────────────────────────────────────────────────

interface Preset {
  label: string;
  description: string;
  onDemandRate: number;
  reservedUpfront: number;
  reservedRate: number;
}

const PRESETS: Preset[] = [
  {
    label: 't3.medium',
    description: '2 vCPU · 4 GB',
    onDemandRate: 0.0416,
    reservedUpfront: 215,
    reservedRate: 0.016,
  },
  {
    label: 'm5.large',
    description: '2 vCPU · 8 GB',
    onDemandRate: 0.096,
    reservedUpfront: 500,
    reservedRate: 0.04,
  },
  {
    label: 'c5.xlarge',
    description: '4 vCPU · 8 GB',
    onDemandRate: 0.17,
    reservedUpfront: 876,
    reservedRate: 0.068,
  },
  {
    label: 'r5.2xlarge',
    description: '8 vCPU · 64 GB',
    onDemandRate: 0.504,
    reservedUpfront: 2620,
    reservedRate: 0.201,
  },
];

const HOURS_PER_MONTH = 730;
const MONTHS = 12;
const TOTAL_HOURS = HOURS_PER_MONTH * MONTHS;

// ─── Algorithm ────────────────────────────────────────────────────────────────

interface Result {
  reservedTotal: number;
  onDemandTotal: number;
  effectiveUtilisation: number;
  recommendation: 'reserved' | 'on-demand';
  savings: number;
  breakEvenUtilisation: number;
}

function calculate(preset: Preset, avgUtilisation: number, spikiness: number): Result {
  // Spikiness widens the gap between average and the peak you must reserve for.
  // At spikiness=0, effective utilisation = avgUtilisation.
  // At spikiness=100, peaks are 2× average, so you're sizing for 2× but only
  // using avgUtilisation on average — effective utilisation halves toward avg/2.
  const spikeFactor = 1 + spikiness / 100;
  const effectiveUtilisation = avgUtilisation / spikeFactor;

  // Reserved: pay upfront + hourly rate at full capacity (you commit to the peak)
  const reservedTotal = preset.reservedUpfront + preset.reservedRate * TOTAL_HOURS;

  // On-demand: pay only for what you actually use (effective utilisation)
  const onDemandTotal = preset.onDemandRate * TOTAL_HOURS * (effectiveUtilisation / 100);

  // Break-even: the utilisation at which both options cost the same
  // onDemandRate × TOTAL_HOURS × u = reservedUpfront + reservedRate × TOTAL_HOURS
  const breakEvenUtilisation =
    ((preset.reservedUpfront + preset.reservedRate * TOTAL_HOURS) /
      (preset.onDemandRate * TOTAL_HOURS)) *
    100;

  const recommendation = reservedTotal < onDemandTotal ? 'reserved' : 'on-demand';
  const savings = Math.abs(reservedTotal - onDemandTotal);

  return {
    reservedTotal,
    onDemandTotal,
    effectiveUtilisation,
    recommendation,
    savings,
    breakEvenUtilisation,
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CloudPricingComparison(): JSX.Element {
  const [preset, setPreset] = useState<Preset>(PRESETS[1]);
  const [utilisation, setUtilisation] = useState(70);
  const [spikiness, setSpikiness] = useState(20);

  const result = calculate(preset, utilisation, spikiness);

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h2 className="text-xl font-semibold">On-Demand vs. Reserved Instances</h2>
        <p className="text-muted-foreground">
          Reserved instances cost less per hour but require an upfront commitment. On-demand
          charges more per hour but only for what you use. The right choice depends on how
          consistently you use the instance — and how spiky your traffic is.
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
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => setPreset(p)}
                className={`flex flex-col items-start rounded-lg border px-3 py-2 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground ${
                  preset.label === p.label
                    ? 'border-foreground bg-accent'
                    : 'border-border'
                }`}
              >
                <span className="font-mono font-medium">{p.label}</span>
                <span className="text-xs text-muted-foreground">{p.description}</span>
                <span className="mt-1 text-xs text-muted-foreground font-mono">
                  ${p.onDemandRate}/hr on-demand
                </span>
              </button>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">On-demand rate</p>
              <p className="font-mono font-medium">${preset.onDemandRate}/hr</p>
            </div>
            <div>
              <p className="text-muted-foreground">Reserved upfront</p>
              <p className="font-mono font-medium">${preset.reservedUpfront}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Reserved hourly rate</p>
              <p className="font-mono font-medium">${preset.reservedRate}/hr</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sliders */}
      <Card>
        <CardHeader>
          <CardTitle>Usage pattern</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Average utilisation</label>
              <span className="font-mono text-sm font-semibold">{utilisation}%</span>
            </div>
            <Slider
              min={1}
              max={100}
              step={1}
              value={[utilisation]}
              onValueChange={([v]) => setUtilisation(v)}
            />
            <p className="text-xs text-muted-foreground">
              What fraction of the instance's capacity your traffic uses on average.
              100% = always fully loaded. 30% ≈ typical web workload.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Spikiness</label>
              <span className="font-mono text-sm font-semibold">{spikiness}%</span>
            </div>
            <Slider
              min={0}
              max={100}
              step={1}
              value={[spikiness]}
              onValueChange={([v]) => setSpikiness(v)}
            />
            <p className="text-xs text-muted-foreground">
              How much traffic varies around the average. Low = steady stream.
              High = quiet most of the time with sudden bursts — you must reserve
              for peaks but only use that capacity occasionally.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Card>
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                On-demand / yr
              </p>
              <p className="text-2xl font-semibold font-mono">
                ${result.onDemandTotal.toFixed(0)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                at {result.effectiveUtilisation.toFixed(0)}% effective use
              </p>
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

          <Card>
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                Break-even utilisation
              </p>
              <p className="text-2xl font-semibold font-mono">
                {result.breakEvenUtilisation.toFixed(0)}%
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                reserved wins above this
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
            <CardTitle>Utilisation vs. break-even</CardTitle>
            <p className="text-sm text-muted-foreground">
              Your effective utilisation after accounting for spikiness, compared to the
              break-even threshold.
            </p>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="relative h-8 w-full rounded-full bg-muted overflow-hidden">
              {/* Break-even marker */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-foreground z-10"
                style={{ left: `${Math.min(result.breakEvenUtilisation, 100)}%` }}
              />
              {/* Effective utilisation bar */}
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  result.recommendation === 'reserved' ? 'bg-green-400' : 'bg-blue-400'
                }`}
                style={{ width: `${Math.min(result.effectiveUtilisation, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0%</span>
              <span
                className="absolute font-medium text-foreground"
                style={{ left: `calc(${Math.min(result.breakEvenUtilisation, 100)}% - 1rem)` }}
              >
                {result.breakEvenUtilisation.toFixed(0)}% ← break-even
              </span>
              <span>100%</span>
            </div>
            <p className="text-sm mt-1">
              Effective utilisation:{' '}
              <span className="font-semibold font-mono">
                {result.effectiveUtilisation.toFixed(0)}%
              </span>{' '}
              {result.effectiveUtilisation >= result.breakEvenUtilisation ? (
                <span className="text-green-600">— above break-even, reserved wins</span>
              ) : (
                <span className="text-blue-600">— below break-even, on-demand wins</span>
              )}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
