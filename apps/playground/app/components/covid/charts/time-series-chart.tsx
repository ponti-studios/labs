"use client";

import {
	Line,
	LineChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import type { CovidDataRecord } from "~/types/covid";

interface TimeSeriesChartProps {
	data: CovidDataRecord[];
	metric: keyof CovidDataRecord;
	title: string;
	color?: string;
	height?: number;
}

export function TimeSeriesChart({
	data,
	metric,
	title,
	color = "#3b82f6",
	height = 300,
}: TimeSeriesChartProps) {
	// Transform data for the chart
	const chartData = data
		.filter(
			(item) =>
				item.date && item[metric] !== null && item[metric] !== undefined,
		)
		.map((item) => ({
			date: item.date as string,
			value: item[metric] as number,
		}))
		.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

	// Check if we have enough data points
	if (chartData.length === 0) {
		return (
			<div className="bg-white rounded-lg shadow-md p-6">
				<h3 className="text-lg font-semibold mb-4 text-gray-800">{title}</h3>
				<div className="flex items-center justify-center h-64 text-gray-500">
					<div className="text-center">
						<div className="text-4xl mb-2">📊</div>
						<p>No data available for this metric</p>
						<p className="text-sm mt-1">
							This country may not report {title.toLowerCase()}
						</p>
					</div>
				</div>
			</div>
		);
	}

	if (chartData.length < 3) {
		return (
			<div className="bg-white rounded-lg shadow-md p-6">
				<h3 className="text-lg font-semibold mb-4 text-gray-800">{title}</h3>
				<div className="flex items-center justify-center h-64 text-gray-500">
					<div className="text-center">
						<div className="text-4xl mb-2">⚠️</div>
						<p>Insufficient data for visualization</p>
						<p className="text-sm mt-1">
							Only {chartData.length} data point(s) available
						</p>
					</div>
				</div>
			</div>
		);
	}

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
						formatter={(value: number) => [formatValue(value), title]}
						contentStyle={{
							backgroundColor: "rgba(255, 255, 255, 0.95)",
							border: "1px solid #e5e7eb",
							borderRadius: "8px",
						}}
					/>
					<Line
						type="monotone"
						dataKey="value"
						stroke={color}
						strokeWidth={2}
						dot={false}
						activeDot={{ r: 4, stroke: color, strokeWidth: 2 }}
					/>
				</LineChart>
			</ResponsiveContainer>
		</div>
	);
}
