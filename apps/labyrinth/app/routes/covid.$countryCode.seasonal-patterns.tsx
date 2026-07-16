import { useQuery } from "@tanstack/react-query";
import { Spinner } from "@pontistudios/ui/feedback";
import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { useLoaderData } from "react-router";
import {
  Bar,
  BarChart,
  CartesianGrid,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface SeasonalPattern {
  month: number;
  monthName: string;
  averageCases: number;
  averageDeaths: number;
  caseVariance: number;
  deathVariance: number;
}

interface SeasonalAnalysis {
  seasonalityStrength: number;
  peakMonth: number;
  troughMonth: number;
  patterns: SeasonalPattern[];
}

interface SeasonalResponse {
  country: string;
  analysis: SeasonalAnalysis;
  insights: Array<{
    pattern: string;
    description: string;
    strength: number;
  }>;
  dataQuality: {
    totalDataPoints: number;
    monthsWithData: number;
    averageDataPointsPerMonth: number;
  };
}

export const meta: MetaFunction<typeof loader> = ({ params }) => {
  const countryCode = params.countryCode || "OWID_WRL";
  const countryName = countryCode !== "OWID_WRL" ? countryCode : "World";
  return [
    { title: `Seasonal Patterns — ${countryName} | Ponti Studios` },
    { name: "description", content: `Seasonal pattern analysis for ${countryName}.` },
  ];
};

export async function loader({ params }: LoaderFunctionArgs) {
  const { countryCode } = params;
  if (!countryCode) throw new Response("Country code is required", { status: 400 });
  return { countryCode };
}

const tooltipStyle = {
  backgroundColor: "var(--color-surface-panel)",
  border: "1px solid var(--color-border-default)",
  borderRadius: "2px",
  fontSize: "12px",
  color: "var(--color-text-secondary)",
  padding: "6px 10px",
  boxShadow: "none",
};

const tickStyle = { fill: "var(--color-text-tertiary)", fontSize: 11 };

export default function SeasonalPatternsPage() {
  const { countryCode } = useLoaderData() as Awaited<ReturnType<typeof loader>>;

  const { data, isLoading, isError } = useQuery<SeasonalResponse>({
    queryKey: ["seasonal-patterns", countryCode],
    queryFn: () => {
      const params = new URLSearchParams();
      params.append("country", countryCode);
      return fetch(`/api/covid/analytics/seasonal-patterns?${params}`).then((res) => res.json());
    },
    staleTime: 1000 * 60 * 60,
  });

  return (
    <div className="space-y-6">
      {isLoading && <Spinner />}

      {isError && (
        <p className="text-secondary py-4 text-sm">
          Failed to load seasonal data. Please try again.
        </p>
      )}

      {data && (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-3">
            {[
              {
                label: "Seasonality Strength",
                value: `${(data.analysis.seasonalityStrength * 100).toFixed(1)}%`,
              },
              {
                label: "Peak Month",
                value: data.analysis.patterns[data.analysis.peakMonth - 1]?.monthName ?? "—",
              },
              {
                label: "Trough Month",
                value: data.analysis.patterns[data.analysis.troughMonth - 1]?.monthName ?? "—",
              },
            ].map(({ label, value }) => (
              <div key={label} className="ui-flat-card">
                <p className="ui-data-label mb-2">{label}</p>
                <p className="ui-data-value">{value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="ui-flat-card">
              <p className="ui-data-label mb-3">Monthly Case Patterns</p>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart
                  data={data.analysis.patterns}
                  margin={{ top: 0, right: 8, bottom: 24, left: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="4 4"
                    stroke="var(--color-surface-inset)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="monthName"
                    tick={tickStyle}
                    axisLine={false}
                    tickLine={false}
                    angle={-45}
                    textAnchor="end"
                    height={48}
                  />
                  <YAxis tick={tickStyle} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    cursor={{ fill: "var(--color-surface-inset)" }}
                  />
                  <Bar
                    dataKey="averageCases"
                    fill="#d97706"
                    radius={[2, 2, 0, 0]}
                    name="Average Cases"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="ui-flat-card">
              <p className="ui-data-label mb-3">Seasonal Radar</p>
              <ResponsiveContainer width="100%" height={240}>
                <RadarChart data={data.analysis.patterns}>
                  <PolarGrid stroke="var(--color-border-default)" />
                  <PolarAngleAxis dataKey="monthName" tick={tickStyle} />
                  <PolarRadiusAxis
                    tick={{ fill: "var(--color-text-tertiary)", fontSize: 10 }}
                    domain={[0, "dataMax"]}
                  />
                  <Radar
                    name="Avg Cases"
                    dataKey="averageCases"
                    stroke="#d97706"
                    fill="#d97706"
                    fillOpacity={0.15}
                    strokeWidth={1.5}
                  />
                  <Radar
                    name="Avg Deaths"
                    dataKey="averageDeaths"
                    stroke="#dc2626"
                    fill="#dc2626"
                    fillOpacity={0.15}
                    strokeWidth={1.5}
                  />
                  <Tooltip contentStyle={tooltipStyle} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {data.insights.length > 0 && (
            <div className="ui-flat-card">
              <p className="ui-data-label mb-3">Insights</p>
              <div className="space-y-3">
                {data.insights.map((insight) => (
                  <div key={insight.pattern} className="border-default border-l-2 py-0.5 pl-4">
                    <p className="text-primary text-sm font-medium">{insight.pattern}</p>
                    <p className="text-secondary mt-0.5 text-xs">{insight.description}</p>
                    <p className="text-secondary mt-1 text-xs">{insight.strength}% strength</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="ui-flat-card overflow-hidden p-0">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-default bg-inset border-b">
                  <th className="ui-data-label px-4 py-2.5 text-left">Month</th>
                  <th className="ui-data-label px-4 py-2.5 text-right">Avg Cases</th>
                  <th className="ui-data-label px-4 py-2.5 text-right">Avg Deaths</th>
                  <th className="ui-data-label px-4 py-2.5 text-right">Case Variance</th>
                  <th className="ui-data-label px-4 py-2.5 text-right">Death Variance</th>
                </tr>
              </thead>
              <tbody>
                {data.analysis.patterns.map((pattern) => (
                  <tr key={pattern.month} className="border-default border-b last:border-0">
                    <td className="text-primary px-4 py-2.5 font-medium">{pattern.monthName}</td>
                    <td className="text-secondary px-4 py-2.5 text-right tabular-nums">
                      {pattern.averageCases.toLocaleString()}
                    </td>
                    <td className="text-secondary px-4 py-2.5 text-right tabular-nums">
                      {pattern.averageDeaths.toLocaleString()}
                    </td>
                    <td className="text-secondary px-4 py-2.5 text-right tabular-nums">
                      {pattern.caseVariance.toLocaleString()}
                    </td>
                    <td className="text-secondary px-4 py-2.5 text-right tabular-nums">
                      {pattern.deathVariance.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-secondary text-xs">
            {data.dataQuality.totalDataPoints.toLocaleString()} data points ·{" "}
            {data.dataQuality.monthsWithData}/12 months · avg{" "}
            {data.dataQuality.averageDataPointsPerMonth} pts/month
          </p>
        </div>
      )}
    </div>
  );
}
