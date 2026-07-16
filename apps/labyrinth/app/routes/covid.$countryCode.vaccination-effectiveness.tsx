import { useQuery } from "@tanstack/react-query";
import { Spinner } from "@ponti-studios/ui/feedback";
import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { useLoaderData } from "react-router";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface VaccinationEffectiveness {
  overall: number;
  againstHospitalization: number;
  againstDeath: number;
  breakthroughRate: number;
}

interface VaccinationResponse {
  country: string;
  error?: string;
  effectiveness?: VaccinationEffectiveness;
  timeline?: Array<{
    date: string;
    fullyVaccinatedPerHundred: number;
    newCasesSmoothed: number;
    newDeathsSmoothed: number;
  }>;
  milestones?: Array<{
    threshold: number;
    label: string;
    dateReached: string | null;
  }>;
  vaccinationStats?: {
    fullyVaccinatedPerHundred: number;
    totalVaccinations: number;
    dailyVaccinations: number;
  };
}

export const meta: MetaFunction<typeof loader> = ({ params }) => {
  const countryCode = params.countryCode || "OWID_WRL";
  const countryName = countryCode !== "OWID_WRL" ? countryCode : "World";
  return [
    { title: `Vaccination Impact — ${countryName} | Ponti Studios` },
    { name: "description", content: `Vaccination effectiveness analysis for ${countryName}.` },
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

export default function VaccinationEffectivenessPage() {
  const { countryCode } = useLoaderData() as Awaited<ReturnType<typeof loader>>;

  const { data, isLoading, isError } = useQuery<VaccinationResponse>({
    queryKey: ["vaccination-effectiveness", countryCode],
    queryFn: () => {
      const params = new URLSearchParams();
      params.append("country", countryCode);
      return fetch(`/api/covid/analytics/vaccination-effectiveness?${params}`).then((res) =>
        res.json(),
      );
    },
    staleTime: 1000 * 60 * 60,
  });

  return (
    <div className="space-y-6">
      {isLoading && <Spinner />}

      {isError && (
        <p className="text-secondary py-4 text-sm">
          Failed to load vaccination data. Please try again.
        </p>
      )}

      {data?.error && <p className="text-secondary py-4 text-sm">{data.error}</p>}

      {data?.effectiveness && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              { label: "Overall Effectiveness", value: data.effectiveness.overall },
              {
                label: "Against Hospitalization",
                value: data.effectiveness.againstHospitalization,
              },
              { label: "Against Death", value: data.effectiveness.againstDeath },
              { label: "Breakthrough Rate", value: data.effectiveness.breakthroughRate },
            ].map(({ label, value }) => (
              <div key={label} className="ui-flat-card">
                <p className="ui-data-label mb-2">{label}</p>
                <p className="ui-data-value">{value?.toFixed(1) ?? "—"}%</p>
              </div>
            ))}
          </div>

          {data.vaccinationStats && (
            <div className="ui-flat-card">
              <p className="ui-data-label mb-4">Vaccination Progress</p>
              <div className="grid grid-cols-3 gap-4">
                {[
                  {
                    label: "Fully Vaccinated",
                    value: `${data.vaccinationStats.fullyVaccinatedPerHundred?.toFixed(1) ?? "—"}%`,
                  },
                  {
                    label: "Total Vaccinations",
                    value: data.vaccinationStats.totalVaccinations?.toLocaleString() ?? "—",
                  },
                  {
                    label: "Daily Vaccinations",
                    value: data.vaccinationStats.dailyVaccinations?.toLocaleString() ?? "—",
                  },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-secondary mb-1 text-xs">{label}</p>
                    <p className="ui-data-value">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.timeline && data.timeline.length > 0 && (
            <div className="ui-flat-card">
              <p className="ui-data-label mb-3">Vaccination vs Cases</p>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={data.timeline} margin={{ top: 0, right: 8, bottom: 0, left: 0 }}>
                  <CartesianGrid
                    strokeDasharray="4 4"
                    stroke="var(--color-surface-inset)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="date"
                    tick={tickStyle}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) =>
                      new Date(v).toLocaleDateString("en-US", {
                        month: "short",
                        year: "numeric",
                      })
                    }
                  />
                  <YAxis tick={tickStyle} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    cursor={{ stroke: "var(--color-border-default)", strokeWidth: 1 }}
                    labelFormatter={(v) => new Date(v).toLocaleDateString()}
                  />
                  <Line
                    type="monotone"
                    dataKey="fullyVaccinatedPerHundred"
                    stroke="#3b82f6"
                    strokeWidth={1.5}
                    dot={false}
                    name="Vaccination Rate (%)"
                  />
                  <Line
                    type="monotone"
                    dataKey="newCasesSmoothed"
                    stroke="#ef4444"
                    strokeWidth={1.5}
                    dot={false}
                    name="New Cases (7-day avg)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {data.milestones && data.milestones.length > 0 && (
            <div className="ui-flat-card">
              <p className="ui-data-label mb-3">Milestones</p>
              <div className="divide-border divide-y">
                {data.milestones.map((milestone) => (
                  <div
                    key={milestone.threshold}
                    className="flex items-center justify-between py-2.5"
                  >
                    <p className="text-primary text-sm">{milestone.label}</p>
                    <p className="text-secondary text-sm tabular-nums">
                      {milestone.dateReached
                        ? new Date(milestone.dateReached).toLocaleDateString()
                        : "—"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
