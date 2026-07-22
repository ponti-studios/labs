"use client";

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { CovidDataRecord } from "~/types/covid";

interface TopCountriesChartProps {
  data: CovidDataRecord[];
  metric: keyof CovidDataRecord;
  title: string;
  color?: string;
  limit?: number;
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
  border: "1px solid var(--color-border)",
  borderRadius: "2px",
  fontSize: "12px",
  color: "var(--color-muted-foreground)",
  padding: "6px 10px",
  boxShadow: "none",
};

export function TopCountriesChart({
  data,
  metric,
  title,
  color = "#ef4444",
  limit = 10,
  height = 320,
}: TopCountriesChartProps) {
  const formatValue = (value: number) => {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
    return value.toLocaleString();
  };

  const countryLatestData = new Map<string, CovidDataRecord>();
  for (const record of data) {
    if (record.location && toNumber(record[metric]) !== null) {
      const existing = countryLatestData.get(record.location);
      if (!existing || (record.date && existing.date && record.date > existing.date)) {
        countryLatestData.set(record.location, record);
      }
    }
  }

  const chartData = Array.from(countryLatestData.values())
    .filter((record) => toNumber(record[metric]) !== null)
    .sort((a, b) => (toNumber(b[metric]) ?? 0) - (toNumber(a[metric]) ?? 0))
    .slice(0, limit)
    .map((record) => ({ country: record.location, value: toNumber(record[metric]) ?? 0 }));

  if (chartData.length < 3) return null;

  return (
    <div className="ui-flat-card">
      {title && <p className="ui-data-label mb-3">{title}</p>}
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={chartData}
          layout="horizontal"
          margin={{ top: 0, right: 8, bottom: 0, left: 0 }}
        >
          <XAxis
            type="number"
            tickFormatter={formatValue}
            tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="country"
            tick={{ fill: "var(--color-foreground)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={90}
          />
          <Tooltip
            formatter={(value) => [formatValue(toNumber(value) ?? 0), title]}
            contentStyle={tooltipStyle}
            cursor={{ fill: "var(--color-surface-inset)" }}
          />
          <Bar dataKey="value" fill={color} radius={[0, 2, 2, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
