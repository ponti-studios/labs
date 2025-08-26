"use client";

import CountUpTo from "~/components/count-up/count-up-to";
import type { CovidDataRecord } from "~/types/covid";

interface StatsOverviewProps {
	data: CovidDataRecord[];
	countryCode: string;
}

interface StatCardProps {
	title: string;
	value: number | null | undefined;
	icon: string;
	color: string;
	change?: number | null | undefined;
}

function StatCard({ title, value, icon, color, change }: StatCardProps) {
	const formatValue = (val: number) => {
		if (val >= 1000000) {
			return `${(val / 1000000).toFixed(1)}M`;
		}
		if (val >= 1000) {
			return `${(val / 1000).toFixed(1)}K`;
		}
		return val.toLocaleString();
	};

	return (
		<div
			className="bg-white rounded-lg shadow-md p-6 border-l-4"
			style={{ borderLeftColor: color }}
		>
			<div className="flex items-center justify-between">
				<div>
					<p className="text-sm font-medium text-gray-600">{title}</p>
					<p className="text-2xl font-bold text-gray-900">
						{value !== null && value !== undefined ? (
							<CountUpTo value={value} />
						) : (
							"N/A"
						)}
					</p>
					{change !== undefined && change !== null && (
						<p
							className={`text-sm mt-1 ${change >= 0 ? "text-red-600" : "text-green-600"}`}
						>
							{change >= 0 ? "+" : ""}
							{formatValue(change)}
						</p>
					)}
				</div>
				<div className="text-3xl" style={{ color }}>
					{icon}
				</div>
			</div>
		</div>
	);
}

export function StatsOverview({ data }: StatsOverviewProps) {
	// Get the latest data entry - now data should contain only the latest record
	const latestData = data && data.length > 0 ? data[0] : null;

	if (!latestData) {
		return (
			<div className="bg-white rounded-lg shadow-md p-6">
				<p className="text-gray-500">No data available for this location.</p>
			</div>
		);
	}

	const stats = [
		{
			title: "Total Cases",
			value: latestData.totalCases,
			icon: "🦠",
			color: "#3b82f6",
			change: latestData.newCasesSmoothed, // Use smoothed data for more stable daily changes
		},
		{
			title: "Total Deaths",
			value: latestData.totalDeaths,
			icon: "💀",
			color: "#ef4444",
			change: latestData.newDeathsSmoothed, // Use smoothed data
		},
		{
			title: "Vaccinated",
			value: latestData.peopleFullyVaccinated,
			icon: "💉",
			color: "#10b981",
			change: latestData.newVaccinationsSmoothed, // Use smoothed data
		},
		{
			title: "Cases per Million",
			value: latestData.totalCasesPerMillion,
			icon: "📊",
			color: "#f59e0b",
		},
	];

	return (
		<div className="space-y-4">
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
				{stats.map((stat) => (
					<StatCard key={stat.title} {...stat} />
				))}
			</div>
			{latestData.date && (
				<div className="text-sm text-gray-500 text-center">
					<p>Data as of {new Date(latestData.date).toLocaleDateString()}</p>
					{latestData.vaccinationDataDate &&
						latestData.vaccinationDataDate !== latestData.date && (
							<p className="text-xs mt-1">
								Vaccination data as of{" "}
								{new Date(latestData.vaccinationDataDate).toLocaleDateString()}
							</p>
						)}
				</div>
			)}
		</div>
	);
}
