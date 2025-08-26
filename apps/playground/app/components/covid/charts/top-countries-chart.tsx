"use client";

import {
	Bar,
	BarChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import type { CovidDataRecord } from "~/types/covid";

interface TopCountriesChartProps {
	data: CovidDataRecord[];
	metric: keyof CovidDataRecord;
	title: string;
	color?: string;
	limit?: number;
	height?: number;
}

export function TopCountriesChart({
	data,
	metric,
	title,
	color = "#ef4444",
	limit = 10,
	height = 400,
}: TopCountriesChartProps) {
	// Get latest data for each country and find top countries by metric
	const countryLatestData = new Map<string, CovidDataRecord>();

	// Build map of latest data per country
	for (const record of data) {
		if (
			record.location &&
			record[metric] !== null &&
			record[metric] !== undefined
		) {
			const existing = countryLatestData.get(record.location);
			if (
				!existing ||
				(record.date && existing.date && record.date > existing.date)
			) {
				countryLatestData.set(record.location, record);
			}
		}
	}

	// Convert to array and get top countries
	const chartData = Array.from(countryLatestData.values())
		.filter((record) => record[metric] !== null && record[metric] !== undefined)
		.sort((a, b) => (b[metric] as number) - (a[metric] as number))
		.slice(0, limit)
		.map((record) => ({
			country: record.location,
			value: record[metric] as number,
		}));

	// Check if we have enough data points
	if (chartData.length === 0) {
		return (
			<div className="bg-white rounded-lg shadow-md p-6">
				<h3 className="text-lg font-semibold mb-4 text-gray-800">{title}</h3>
				<div className="flex items-center justify-center h-64 text-gray-500">
					<div className="text-center">
						<div className="text-4xl mb-2">📊</div>
						<p>No data available for comparison</p>
						<p className="text-sm mt-1">
							No countries have data for {title.toLowerCase()}
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
						<p>Limited data for comparison</p>
						<p className="text-sm mt-1">
							Only {chartData.length} countries have data for this metric
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

	return (
		<div className="bg-white rounded-lg shadow-md p-6">
			<h3 className="text-lg font-semibold mb-4 text-gray-800">{title}</h3>
			<ResponsiveContainer width="100%" height={height}>
				<BarChart data={chartData} layout="horizontal">
					<XAxis
						type="number"
						tickFormatter={formatValue}
						tick={{ fontSize: 12 }}
					/>
					<YAxis
						type="category"
						dataKey="country"
						tick={{ fontSize: 12 }}
						width={100}
					/>
					<Tooltip
						formatter={(value: number) => [formatValue(value), title]}
						contentStyle={{
							backgroundColor: "rgba(255, 255, 255, 0.95)",
							border: "1px solid #e5e7eb",
							borderRadius: "8px",
						}}
					/>
					<Bar dataKey="value" fill={color} />
				</BarChart>
			</ResponsiveContainer>
		</div>
	);
}
