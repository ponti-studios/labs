import { useState, type JSX, type ChangeEvent } from 'react';
import {
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
  { label: 't3.medium',  description: '2 vCPU · 4 GB',  onDemandRate: 0.0416, reservedUpfront: 215,  reservedRate: 0.016,  vcpu: 2 },
  { label: 'm5.large',   description: '2 vCPU · 8 GB',  onDemandRate: 0.096,  reservedUpfront: 500,  reservedRate: 0.04,   vcpu: 2 },
  { label: 'c5.xlarge',  description: '4 vCPU · 8 GB',  onDemandRate: 0.17,   reservedUpfront: 876,  reservedRate: 0.068,  vcpu: 4 },
  { label: 'r5.2xlarge', description: '8 vCPU · 64 GB', onDemandRate: 0.504,  reservedUpfront: 2620, reservedRate: 0.201,  vcpu: 8 },
];

const REQUEST_VOLUMES = [1_000, 5_000, 10_000, 25_000, 50_000, 100_000, 250_000, 500_000];

const HOURS_PER_YEAR = 730 * 12;
const MS_PER_DAY = 86_400_000;

// ─── Algorithm ────────────────────────────────────────────────────────────────

interface Cell {
  recommendation: 'reserved' | 'on-demand' | 'overloaded';
  onDemandTotal: number;
  reservedTotal: number;
  avgUtilisation: number;
  isCrossover: boolean;
}

function computeCell(preset: Preset, reqPerDay: number, computeMs: number, peakMultiplier: number): Cell {
  const avgUtilisation = (reqPerDay * computeMs) / (preset.vcpu * MS_PER_DAY);
  const peakUtilisation = avgUtilisation * peakMultiplier;

  if (peakUtilisation > 1) {
    return { recommendation: 'overloaded', onDemandTotal: 0, reservedTotal: 0, avgUtilisation: avgUtilisation * 100, isCrossover: false };
  }

  const reservedTotal = preset.reservedUpfront + preset.reservedRate * HOURS_PER_YEAR;
  const onDemandTotal = preset.onDemandRate * HOURS_PER_YEAR * avgUtilisation;
  const recommendation = reservedTotal < onDemandTotal ? 'reserved' : 'on-demand';

  return { recommendation, onDemandTotal, reservedTotal, avgUtilisation: avgUtilisation * 100, isCrossover: false };
}

function buildMatrix(computeMs: number, peakMultiplier: number) {
  return PRESETS.map((preset) => {
    const cells = REQUEST_VOLUMES.map((vol) => computeCell(preset, vol, computeMs, peakMultiplier));

    // Mark the crossover — first volume where recommendation flips to reserved
    for (let i = 1; i < cells.length; i++) {
      if (
        cells[i - 1].recommendation === 'on-demand' &&
        cells[i].recommendation === 'reserved'
      ) {
        cells[i].isCrossover = true;
        break;
      }
    }

    return { preset, cells };
  });
}

function fmt(n: number) {
  return n >= 1_000_000
    ? `${(n / 1_000_000).toFixed(1)}M`
    : n >= 1_000
    ? `${(n / 1_000).toFixed(0)}k`
    : String(n);
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CloudPricingComparison(): JSX.Element {
  const [computeMs, setComputeMs] = useState('200');
  const [peakMultiplier, setPeakMultiplier] = useState('3');

  const matrix = buildMatrix(Number(computeMs), Number(peakMultiplier));

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h2 className="text-xl font-semibold">On-Demand vs. Reserved Instances</h2>
        <p className="text-muted-foreground">
          Reserved instances require an upfront commitment but cost less per hour. On-demand
          scales with actual usage at a higher rate. The table below shows which is cheaper
          across a range of traffic volumes — find your expected load and read across.
        </p>
        <i className="text-xs text-muted-foreground">Based on a Goldman Sachs take-home challenge</i>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Workload shape</CardTitle>
          <p className="text-sm text-muted-foreground">
            These two values define how your traffic translates into CPU load.
          </p>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="computeMs">Compute time per request (ms)</Label>
            <Input
              id="computeMs"
              type="number"
              min={1}
              value={computeMs}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setComputeMs(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Average CPU time to handle one request. Typical API: 50–500ms.
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
              How many times busier your peak is vs. your average. Used to check if the
              instance can handle spikes without being overloaded.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cost comparison by traffic volume</CardTitle>
          <p className="text-sm text-muted-foreground">
            Annual cost across request volumes (req/day). Grey = instance can't handle peak load at this volume.
          </p>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="py-2 pr-4 text-left font-medium text-muted-foreground whitespace-nowrap">
                  Instance
                </th>
                {REQUEST_VOLUMES.map((vol) => (
                  <th key={vol} className="px-3 py-2 text-center font-medium text-muted-foreground whitespace-nowrap">
                    {fmt(vol)}/day
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrix.map(({ preset, cells }) => (
                <tr key={preset.label} className="border-b border-border last:border-0">
                  <td className="py-3 pr-4 whitespace-nowrap">
                    <p className="font-mono font-medium">{preset.label}</p>
                    <p className="text-xs text-muted-foreground">{preset.description}</p>
                  </td>
                  {cells.map((cell, i) => (
                    <td key={i} className="px-3 py-3 text-center">
                      {cell.recommendation === 'overloaded' ? (
                        <span className="inline-flex flex-col items-center gap-0.5">
                          <span className="text-xs text-muted-foreground">—</span>
                          <span className="text-[10px] text-muted-foreground">too small</span>
                        </span>
                      ) : (
                        <span className={`inline-flex flex-col items-center gap-0.5 rounded-md px-2 py-1 ${
                          cell.isCrossover
                            ? 'ring-2 ring-foreground'
                            : ''
                        } ${
                          cell.recommendation === 'reserved'
                            ? 'bg-green-50 text-green-700'
                            : 'bg-blue-50 text-blue-700'
                        }`}>
                          <span className="text-xs font-medium">
                            {cell.recommendation === 'reserved' ? 'reserved' : 'on-demand'}
                          </span>
                          <span className="text-[10px] opacity-70">
                            ${Math.min(cell.onDemandTotal, cell.reservedTotal).toFixed(0)}/yr
                          </span>
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-4 flex items-center gap-6 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 rounded bg-green-100" />
              Reserved is cheaper
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 rounded bg-blue-100" />
              On-demand is cheaper
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 rounded border-2 border-foreground" />
              Crossover point
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
