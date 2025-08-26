"use client";

import {
	Legend,
	Line,
	LineChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import type { CovidDataRecord } from "~/types/covid";

interface CombinedDataItem {
	date: string;
	[key: string]: number | string; // For dynamic metric keys
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

export function ComparativeChart({
	data,
	metrics,
	title,
	height = 400,
}: ComparativeChartProps) {
	// Combine data for all metrics
	const combinedData = new Map<string, CombinedDataItem>();

	for (const { key, name } of metrics) {
		const metricData = data
			.filter(
				(item) => item.date && item[key] !== null && item[key] !== undefined,
			)
			.map((item) => ({
				date: item.date as string,
				value: item[key] as number,
			}))
			.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

		for (const { date, value } of metricData) {
			if (!combinedData.has(date)) {
				combinedData.set(date, { date });
			}
			const entry = combinedData.get(date);
			if (entry) {
				entry[name] = value;
			}
		}
	}

	const chartData = Array.from(combinedData.values()).sort(
		(a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
	);

	const formatValue = (value: number) => {
		if (value >= 1000000) {
			return `${(value / 1000000).toFixed(1)}M`;
		}
		if (value >= 1000) {
			return `${(value / 1000).toFixed(1)}K`;
		}
		return value.toLocaleString();
	};

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString("en-US", {
			month: "short",
			year: "numeric",
		});
	};

	return (
		<div className="bg-white rounded-lg shadow-md p-6">
			<h3 className="text-lg font-semibold mb-4 text-gray-800">{title}</h3>
			<ResponsiveContainer width="100%" height={height}>
				<LineChart data={chartData}>
					<XAxis
						dataKey="date"
						tickFormatter={formatDate}
						tick={{ fontSize: 12 }}
						interval="preserveStartEnd"
					/>
					<YAxis
						tickFormatter={formatValue}
						tick={{ fontSize: 12 }}
						width={60}
					/>
					<Tooltip
						labelFormatter={(label) => formatDate(label as string)}
						formatter={(value: number, name: string) => [
							formatValue(value),
							name,
						]}
						contentStyle={{
							backgroundColor: "rgba(255, 255, 255, 0.95)",
							border: "1px solid #e5e7eb",
							borderRadius: "8px",
						}}
					/>
					<Legend />
					{metrics.map(({ name, color }) => (
						<Line
							key={name}
							type="monotone"
							dataKey={name}
							stroke={color}
							strokeWidth={2}
							dot={false}
							activeDot={{ r: 4, stroke: color, strokeWidth: 2 }}
						/>
					))}
				</LineChart>
			</ResponsiveContainer>
		</div>
	);
}
