"use client";

import {
	Area,
	AreaChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import type { CovidDataRecord } from "~/types/covid";

interface VaccinationProgressProps {
	data: CovidDataRecord[];
	title?: string;
	height?: number;
}

export function VaccinationProgress({
	data,
	title = "Vaccination Progress",
	height = 300,
}: VaccinationProgressProps) {
	// Transform and combine vaccination data
	const sortedData = data
		.filter((item) => item.date)
		.sort(
			(a, b) =>
				new Date(a.date as string).getTime() -
				new Date(b.date as string).getTime(),
		);

	const combinedData = sortedData.map((item) => ({
		date: item.date as string,
		partiallyVaccinated: item.peopleVaccinatedPerHundred,
		fullyVaccinated: item.peopleFullyVaccinatedPerHundred,
		boosters: item.totalBoostersPerHundred,
	}));

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
				<AreaChart data={combinedData}>
					<defs>
						<linearGradient id="colorPartial" x1="0" y1="0" x2="0" y2="1">
							<stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
							<stop offset="95%" stopColor="#3b82f6" stopOpacity={0.2} />
						</linearGradient>
						<linearGradient id="colorFull" x1="0" y1="0" x2="0" y2="1">
							<stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
							<stop offset="95%" stopColor="#10b981" stopOpacity={0.2} />
						</linearGradient>
						<linearGradient id="colorBoosters" x1="0" y1="0" x2="0" y2="1">
							<stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
							<stop offset="95%" stopColor="#f59e0b" stopOpacity={0.2} />
						</linearGradient>
					</defs>
					<XAxis
						dataKey="date"
						tickFormatter={formatDate}
						tick={{ fontSize: 12 }}
						interval="preserveStartEnd"
					/>
					<YAxis
						tick={{ fontSize: 12 }}
						width={40}
						label={{ value: "%", angle: -90, position: "insideLeft" }}
					/>
					<Tooltip
						labelFormatter={(label) => formatDate(label as string)}
						formatter={(value: number, name: string) => [
							value ? `${value.toFixed(1)}%` : "N/A",
							name === "partiallyVaccinated"
								? "Partially Vaccinated"
								: name === "fullyVaccinated"
									? "Fully Vaccinated"
									: "Boosters",
						]}
						contentStyle={{
							backgroundColor: "rgba(255, 255, 255, 0.95)",
							border: "1px solid #e5e7eb",
							borderRadius: "8px",
						}}
					/>
					<Area
						type="monotone"
						dataKey="boosters"
						stackId="1"
						stroke="#f59e0b"
						fillOpacity={1}
						fill="url(#colorBoosters)"
					/>
					<Area
						type="monotone"
						dataKey="fullyVaccinated"
						stackId="1"
						stroke="#10b981"
						fillOpacity={1}
						fill="url(#colorFull)"
					/>
					<Area
						type="monotone"
						dataKey="partiallyVaccinated"
						stackId="1"
						stroke="#3b82f6"
						fillOpacity={1}
						fill="url(#colorPartial)"
					/>
				</AreaChart>
			</ResponsiveContainer>
			<div className="flex justify-center mt-4 space-x-6 text-sm">
				<div className="flex items-center">
					<div className="w-3 h-3 bg-blue-500 rounded mr-2" />
					<span>Partially Vaccinated</span>
				</div>
				<div className="flex items-center">
					<div className="w-3 h-3 bg-green-500 rounded mr-2" />
					<span>Fully Vaccinated</span>
				</div>
				<div className="flex items-center">
					<div className="w-3 h-3 bg-yellow-500 rounded mr-2" />
					<span>Boosters</span>
				</div>
			</div>
		</div>
	);
}
