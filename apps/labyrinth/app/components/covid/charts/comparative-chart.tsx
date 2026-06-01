"use client";

import { Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { CovidDataRecord } from "~/types/covid";

interface CombinedDataItem {
  date: string;
  [key: string]: number | string;
}

interface ComparativeChartProps {
  data: CovidDataRecord[];
  metrics: Array<{
    key: keyof CovidDataRecord;
    name: string;
    color: string;
  }>;
  title: string;
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
  backgroundColor: "var(--color-card)",
  border: "1px solid var(--color-border)",
  borderRadius: "2px",
  fontSize: "12px",
  color: "var(--color-emphasis-medium)",
  padding: "6px 10px",
  boxShadow: "none",
};

const tickStyle = { fill: "var(--color-emphasis-low)", fontSize: 11 };

export function ComparativeChart({ data, metrics, title, height = 280 }: ComparativeChartProps) {
  const formatValue = (value: number) => {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
    return value.toLocaleString();
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", year: "numeric" });

  const combinedData = new Map<string, CombinedDataItem>();
  for (const { key, name } of metrics) {
    const metricData = data
      .map((item) => ({ date: item.date, value: toNumber(item[key]) }))
      .filter(
        (item): item is { date: string; value: number } =>
          item.date != null && item.value !== null,
      )
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    for (const { date, value } of metricData) {
      if (!combinedData.has(date)) combinedData.set(date, { date });
      const entry = combinedData.get(date);
      if (entry) entry[name] = value;
    }
  }

  const chartData = Array.from(combinedData.values()).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  return (
    <div className="ui-flat-card">
      {title && <p className="ui-data-label mb-3">{title}</p>}
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={chartData} margin={{ top: 0, right: 8, bottom: 0, left: 0 }}>
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            tick={tickStyle}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tickFormatter={formatValue}
            tick={tickStyle}
            axisLine={false}
            tickLine={false}
            width={50}
          />
          <Tooltip
            labelFormatter={(label) => formatDate(label as string)}
            formatter={(value, name) => [formatValue(toNumber(value) ?? 0), String(name)]}
            contentStyle={tooltipStyle}
            cursor={{ stroke: "var(--color-border)", strokeWidth: 1 }}
          />
          <Legend iconType="plainline" wrapperStyle={{ fontSize: "11px", color: "var(--color-emphasis-low)" }} />
          {metrics.map(({ name, color }) => (
            <Line
              key={name}
              type="monotone"
              dataKey={name}
              stroke={color}
              strokeWidth={1.5}
              dot={false}
              activeDot={{ r: 3, stroke: color, strokeWidth: 1.5, fill: "var(--color-card)" }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
