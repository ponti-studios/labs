import { SelectContent, SelectItem, SelectTrigger, SelectValue } from "@ponti-studios/ui/forms";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Suspense, useState } from "react";
import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { useLoaderData } from "react-router";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Select } from "@ponti-studios/ui/forms";
import { TabErrorBoundary } from "~/components/covid/TabErrorBoundary";
import CovidLoading from "~/components/covid/CovidLoading";

const metricLabels: Record<string, string> = {
  new_cases_smoothed: "New Cases (Smoothed)",
  new_deaths_smoothed: "New Deaths (Smoothed)",
  new_cases: "New Cases (Raw)",
  new_deaths: "New Deaths (Raw)",
};

interface WaveData {
  wave: number;
  start_date: string;
  end_date: string;
  peak_date: string;
  peak_value: number;
  total_cases: number;
  duration: number;
  avg_daily_growth: number;
}

interface WaveAnalysisResponse {
  country: string;
  metric: string;
  waves: WaveData[];
  totalDataPoints: number;
}

export const meta: MetaFunction<typeof loader> = ({ params }) => {
  const countryCode = params.countryCode || "OWID_WRL";
  const countryName = countryCode !== "OWID_WRL" ? countryCode : "World";
  return [
    { title: `Pandemic Waves — ${countryName} | Ponti Studios` },
    { name: "description", content: `Pandemic wave analysis for ${countryName}.` },
  ];
};

export async function loader({ params }: LoaderFunctionArgs) {
  const { countryCode } = params;
  if (!countryCode) throw new Response("Country code is required", { status: 400 });
  return { countryCode };
}

const tooltipStyle = {
  backgroundColor: "var(--color-card)",
  border: "1px solid var(--color-border)",
  borderRadius: "2px",
  fontSize: "12px",
  color: "var(--color-muted-foreground)",
  padding: "6px 10px",
  boxShadow: "none",
};

const tickStyle = { fill: "var(--color-muted-foreground)", fontSize: 11 };

function WavesContent({ countryCode, metric }: { countryCode: string; metric: string }) {
  const { data } = useSuspenseQuery<WaveAnalysisResponse>({
    queryKey: ["pandemic-waves", countryCode, metric],
    queryFn: () => {
      const params = new URLSearchParams();
      params.append("country", countryCode);
      params.append("metric", metric);
      return fetch(`/api/covid/analytics/pandemic-waves?${params}`).then((res) => res.json());
    },
    staleTime: 1000 * 60 * 60,
  });

  if (!data.waves) {
    return (
      <p className="text-muted-foreground py-4 text-sm">No wave data available for this metric.</p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="ui-flat-card">
        <p className="ui-data-label mb-3">Wave Intensity</p>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data.waves} margin={{ top: 0, right: 8, bottom: 0, left: 0 }}>
            <XAxis
              dataKey="wave"
              tick={tickStyle}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `Wave ${v}`}
            />
            <YAxis tick={tickStyle} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={tooltipStyle}
              cursor={{ fill: "var(--color-muted)" }}
              labelFormatter={(v) => `Wave ${v}`}
            />
            <Bar dataKey="peak_value" fill="#8b5cf6" radius={[2, 2, 0, 0]} name="Peak Value" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {data.waves.map((wave) => (
          <div key={wave.wave} className="ui-flat-card">
            <div className="mb-3 flex items-center justify-between">
              <p className="ui-data-label">Wave {wave.wave}</p>
              <span className="text-muted-foreground text-xs">{wave.duration} days</span>
            </div>
            <p className="ui-data-value mb-3">{wave.peak_value.toLocaleString()}</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              <div>
                <p className="text-muted-foreground text-xs">Peak Date</p>
                <p className="text-foreground text-xs">
                  {new Date(wave.peak_date).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Total Cases</p>
                <p className="text-foreground text-xs tabular-nums">
                  {wave.total_cases.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Avg Growth</p>
                <p className="text-foreground text-xs">{wave.avg_daily_growth.toFixed(2)}%</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Period</p>
                <p className="text-foreground text-xs">
                  {new Date(wave.start_date).toLocaleDateString()} –{" "}
                  {new Date(wave.end_date).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="ui-flat-card">
        <p className="ui-data-label mb-4">Summary</p>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-muted-foreground mb-1 text-xs">Total Waves</p>
            <p className="ui-data-value">{data.waves.length}</p>
          </div>
          <div>
            <p className="text-muted-foreground mb-1 text-xs">Highest Peak</p>
            <p className="ui-data-value">
              {Math.max(...data.waves.map((w) => w.peak_value)).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground mb-1 text-xs">Data Points</p>
            <p className="ui-data-value">{data.totalDataPoints.toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PandemicWavesPage() {
  const { countryCode } = useLoaderData() as Awaited<ReturnType<typeof loader>>;
  const [metric, setMetric] = useState<string>("new_cases_smoothed");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <label className="ui-data-label">Metric</label>
        <Select value={metric} onValueChange={setMetric}>
          <SelectTrigger className="border-border bg-card text-foreground h-7 w-52 rounded text-xs">
            <SelectValue>{(v: string | null) => metricLabels[v ?? ""] ?? v ?? ""}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="new_cases_smoothed">New Cases (Smoothed)</SelectItem>
            <SelectItem value="new_deaths_smoothed">New Deaths (Smoothed)</SelectItem>
            <SelectItem value="new_cases">New Cases (Raw)</SelectItem>
            <SelectItem value="new_deaths">New Deaths (Raw)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <TabErrorBoundary>
        <Suspense fallback={<CovidLoading />}>
          <WavesContent countryCode={countryCode} metric={metric} />
        </Suspense>
      </TabErrorBoundary>
    </div>
  );
}
