"use client";

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { CovidDataRecord } from "~/types/covid";

interface VaccinationProgressProps {
  data: CovidDataRecord[];
  title?: string;
  height?: number;
}

function toNumber(value: unknown): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

const tooltipStyle = {
  backgroundColor: "var(--color-surface-panel)",
  border: "1px solid var(--color-border-border)",
  borderRadius: "2px",
  fontSize: "12px",
  color: "var(--color-text-muted-foreground)",
  padding: "6px 10px",
  boxShadow: "none",
};

const tickStyle = { fill: "var(--color-text-muted-foreground)", fontSize: 11 };

const legendItems = [
  { key: "partial", label: "Partial", color: "#60a5fa" },
  { key: "full", label: "Full", color: "#34d399" },
  { key: "boosters", label: "Boosters", color: "#fbbf24" },
];

export function VaccinationProgress({
  data,
  title = "Vaccination Progress",
  height = 220,
}: VaccinationProgressProps) {
  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", year: "numeric" });

  const combinedData = data
    .filter((item) => item.date)
    .sort((a, b) => new Date(a.date as string).getTime() - new Date(b.date as string).getTime())
    .map((item) => ({
      date: item.date as string,
      partial: toNumber(item.peopleVaccinatedPerHundred),
      full: toNumber(item.peopleFullyVaccinatedPerHundred),
      boosters: toNumber(item.totalBoostersPerHundred),
    }));

  if (combinedData.length < 3) return null;

  return (
    <div className="ui-flat-card">
      {title && <p className="ui-data-label mb-3">{title}</p>}
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={combinedData} margin={{ top: 0, right: 8, bottom: 0, left: 0 }}>
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            tick={tickStyle}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={tickStyle}
            axisLine={false}
            tickLine={false}
            width={32}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip
            labelFormatter={(label) => formatDate(label as string)}
            formatter={(value, name) => [
              toNumber(value) !== null ? `${(toNumber(value) ?? 0).toFixed(1)}%` : "N/A",
              name === "partial"
                ? "Partially Vaccinated"
                : name === "full"
                  ? "Fully Vaccinated"
                  : "Boosters",
            ]}
            contentStyle={tooltipStyle}
            cursor={{ stroke: "var(--color-border-border)", strokeWidth: 1 }}
          />
          <Area type="monotone" dataKey="boosters" stroke="#fbbf24" strokeWidth={1.5} fill="none" />
          <Area type="monotone" dataKey="full" stroke="#34d399" strokeWidth={1.5} fill="none" />
          <Area type="monotone" dataKey="partial" stroke="#60a5fa" strokeWidth={1.5} fill="none" />
        </AreaChart>
      </ResponsiveContainer>
      <div className="mt-3 flex gap-4">
        {legendItems.map(({ key, label, color }) => (
          <div key={key} className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-muted-foreground text-xs">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
