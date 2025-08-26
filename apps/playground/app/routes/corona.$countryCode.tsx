import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { useLoaderData } from "react-router";
import { CoronaLayout } from "~/components/CoronaLayout";
import { StatsOverview } from "~/components/covid/charts/stats-overview";
import { TimeSeriesChart } from "~/components/covid/charts/time-series-chart";
import { TopCountriesChart } from "~/components/covid/charts/top-countries-chart";
import { VaccinationProgress } from "~/components/covid/charts/vaccination-progress";
import type { CovidData } from "~/db/schema";
import {
	getAvailableCountries,
	getCovidStats,
	getCovidTimeSeries,
	getGlobalCovidData,
} from "~/lib/covid-actions";

export const meta: MetaFunction<typeof loader> = ({ params }) => {
	const countryCode = params.countryCode || "OWID_WRL";

	let countryName = "World";
	if (countryCode !== "OWID_WRL") {
		countryName = countryCode;
	}

	return [
		{ title: `COVID-19 Dashboard - ${countryName} | Ponti Studios` },
		{
			name: "description",
			content: `Comprehensive COVID-19 analytics and statistics for ${countryName}. View cases, deaths, vaccinations, and trends over time.`,
		},
		{
			name: "keywords",
			content: `covid-19,coronavirus,dashboard,statistics,${countryName},analytics`,
		},
		{ property: "og:title", content: `COVID-19 Dashboard - ${countryName}` },
		{
			property: "og:description",
			content: `Comprehensive COVID-19 analytics for ${countryName}`,
		},
		{ property: "og:type", content: "website" },
	];
};

export async function loader({ params }: LoaderFunctionArgs) {
	const { countryCode } = params;

	if (!countryCode) {
		throw new Response("Country code is required", { status: 400 });
	}

	// Validate country code exists
	try {
		const availableCountries = await getAvailableCountries();
		if (
			!availableCountries.includes(countryCode) &&
			countryCode !== "OWID_WRL"
		) {
			throw new Response("Country not found", { status: 404 });
		}
	} catch (error) {
		console.error("Error validating country code:", error);
		// If validation fails, still continue but the dashboard will handle the error
	}

	// Fetch all data in parallel for better performance
	try {
		const [statsResponse, timeSeriesResponse, globalComparisonResponse] =
			await Promise.all([
				getCovidStats(countryCode),
				getCovidTimeSeries(countryCode, 500), // Reduced limit to manage size
				countryCode !== "OWID_WRL"
					? getGlobalCovidData()
					: Promise.resolve({ data: [] }),
			]);

		const statsData = statsResponse.data?.[0] || null;
		const timeSeriesData = timeSeriesResponse.data || [];
		const globalComparisonData = globalComparisonResponse.data || [];

		return {
			countryCode,
			statsData,
			timeSeriesData,
			globalComparisonData,
		};
	} catch (error) {
		console.error("Error fetching COVID data:", error);
		throw new Response("Failed to fetch COVID data", { status: 500 });
	}
}

export default function CoronaDashboardPage() {
	const { countryCode, statsData, timeSeriesData, globalComparisonData } =
		useLoaderData() as Awaited<ReturnType<typeof loader>>;

	if (!timeSeriesData || timeSeriesData.length === 0) {
		return (
			<CoronaLayout countryCode={countryCode}>
				<div className="bg-amber-50/50 border border-amber-200 rounded-2xl p-8 text-center">
					<h3 className="font-serif text-xl font-medium text-amber-800 mb-3">
						No Data Available
					</h3>
					<p className="text-amber-700 font-light">
						No COVID data is currently available for the selected country.
					</p>
				</div>
			</CoronaLayout>
		);
	}

	return (
		<CoronaLayout countryCode={countryCode}>
			<div className="space-y-8">
				{/* Stats Overview */}
				<div className="bg-white/40 backdrop-blur-sm rounded-2xl p-6 border border-stone-200/50">
					<StatsOverview
						data={statsData ? [statsData] : []}
						countryCode={countryCode}
					/>
				</div>

				{/* Charts Grid */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					{/* Cases Timeline */}
					<div className="bg-white/40 backdrop-blur-sm rounded-2xl p-6 border border-stone-200/50 hover:bg-white/50 transition-all duration-300">
						<h3 className="font-serif text-lg font-medium text-stone-800 mb-4">
							Total Cases Over Time
						</h3>
						<TimeSeriesChart
							data={timeSeriesData}
							metric="totalCases"
							title=""
							color="#3b82f6"
						/>
					</div>

					{/* Deaths Timeline */}
					<div className="bg-white/40 backdrop-blur-sm rounded-2xl p-6 border border-stone-200/50 hover:bg-white/50 transition-all duration-300">
						<h3 className="font-serif text-lg font-medium text-stone-800 mb-4">
							Total Deaths Over Time
						</h3>
						<TimeSeriesChart
							data={timeSeriesData}
							metric="totalDeaths"
							title=""
							color="#ef4444"
						/>
					</div>

					{/* New Cases Timeline */}
					<div className="bg-white/40 backdrop-blur-sm rounded-2xl p-6 border border-stone-200/50 hover:bg-white/50 transition-all duration-300">
						<h3 className="font-serif text-lg font-medium text-stone-800 mb-4">
							New Cases (7-day average)
						</h3>
						<TimeSeriesChart
							data={timeSeriesData}
							metric="newCasesSmoothed"
							title=""
							color="#f59e0b"
						/>
					</div>

					{/* Vaccination Progress */}
					<div className="bg-white/40 backdrop-blur-sm rounded-2xl p-6 border border-stone-200/50 hover:bg-white/50 transition-all duration-300">
						<h3 className="font-serif text-lg font-medium text-stone-800 mb-4">
							Vaccination Progress (%)
						</h3>
						<VaccinationProgress data={timeSeriesData} title="" />
					</div>
				</div>

				{/* Global Comparisons - Only show for specific countries */}
				{countryCode !== "OWID_WRL" && globalComparisonData.length > 0 && (
					<div className="space-y-6">
						<h2 className="font-serif text-2xl font-light text-stone-800 border-b border-stone-200 pb-4">
							Global Comparisons
						</h2>

						<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
							<div className="bg-white/40 backdrop-blur-sm rounded-2xl p-6 border border-stone-200/50 hover:bg-white/50 transition-all duration-300">
								<TopCountriesChart
									data={globalComparisonData}
									metric="totalCasesPerMillion"
									title="Top Countries by Cases per Million"
									color="#3b82f6"
									limit={15}
								/>
							</div>

							<div className="bg-white/40 backdrop-blur-sm rounded-2xl p-6 border border-stone-200/50 hover:bg-white/50 transition-all duration-300">
								<TopCountriesChart
									data={globalComparisonData}
									metric="totalDeathsPerMillion"
									title="Top Countries by Deaths per Million"
									color="#ef4444"
									limit={15}
								/>
							</div>

							<div className="bg-white/40 backdrop-blur-sm rounded-2xl p-6 border border-stone-200/50 hover:bg-white/50 transition-all duration-300">
								<TopCountriesChart
									data={globalComparisonData}
									metric="peopleFullyVaccinatedPerHundred"
									title="Top Countries by Vaccination Rate"
									color="#10b981"
									limit={15}
								/>
							</div>

							<div className="bg-white/40 backdrop-blur-sm rounded-2xl p-6 border border-stone-200/50 hover:bg-white/50 transition-all duration-300">
								<TopCountriesChart
									data={globalComparisonData}
									metric="stringencyIndex"
									title="Current Government Response Stringency"
									color="#8b5cf6"
									limit={15}
								/>
							</div>
						</div>
					</div>
				)}

				{/* Additional Metrics */}
				<div className="space-y-6">
					<h2 className="font-serif text-2xl font-light text-stone-800 border-b border-stone-200 pb-4">
						Additional Metrics
					</h2>
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
						{/* New Deaths Timeline */}
						<div className="bg-white/40 backdrop-blur-sm rounded-2xl p-6 border border-stone-200/50 hover:bg-white/50 transition-all duration-300">
							<h3 className="font-serif text-lg font-medium text-stone-800 mb-4">
								New Deaths (7-day average)
							</h3>
							<TimeSeriesChart
								data={timeSeriesData}
								metric="newDeathsSmoothed"
								title=""
								color="#dc2626"
							/>
						</div>

						{/* Reproduction Rate */}
						<div className="bg-white/40 backdrop-blur-sm rounded-2xl p-6 border border-stone-200/50 hover:bg-white/50 transition-all duration-300">
							<h3 className="font-serif text-lg font-medium text-stone-800 mb-4">
								Reproduction Rate (R)
							</h3>
							<TimeSeriesChart
								data={timeSeriesData}
								metric="reproductionRate"
								title=""
								color="#8b5cf6"
							/>
						</div>

						{/* Conditionally show based on data availability */}
						{timeSeriesData.some(
							(record: CovidData) => record.newVaccinationsSmoothed !== null,
						) ? (
							<div className="bg-white/40 backdrop-blur-sm rounded-2xl p-6 border border-stone-200/50 hover:bg-white/50 transition-all duration-300">
								<h3 className="font-serif text-lg font-medium text-stone-800 mb-4">
									New Vaccinations (7-day average)
								</h3>
								<TimeSeriesChart
									data={timeSeriesData}
									metric="newVaccinationsSmoothed"
									title=""
									color="#059669"
								/>
							</div>
						) : (
							<div className="bg-white/40 backdrop-blur-sm rounded-2xl p-6 border border-stone-200/50 hover:bg-white/50 transition-all duration-300">
								<h3 className="font-serif text-lg font-medium text-stone-800 mb-4">
									Total Deaths per Million
								</h3>
								<TimeSeriesChart
									data={timeSeriesData}
									metric="totalDeathsPerMillion"
									title=""
									color="#f59e0b"
								/>
							</div>
						)}

						{/* Show test positivity if available, otherwise show ICU patients */}
						{timeSeriesData.some(
							(record: CovidData) => record.positiveRate !== null,
						) ? (
							<div className="bg-white/40 backdrop-blur-sm rounded-2xl p-6 border border-stone-200/50 hover:bg-white/50 transition-all duration-300">
								<h3 className="font-serif text-lg font-medium text-stone-800 mb-4">
									Test Positivity Rate
								</h3>
								<TimeSeriesChart
									data={timeSeriesData}
									metric="positiveRate"
									title=""
									color="#f59e0b"
								/>
							</div>
						) : timeSeriesData.some(
								(record: CovidData) => record.icuPatientsPerMillion !== null,
							) ? (
							<div className="bg-white/40 backdrop-blur-sm rounded-2xl p-6 border border-stone-200/50 hover:bg-white/50 transition-all duration-300">
								<h3 className="font-serif text-lg font-medium text-stone-800 mb-4">
									ICU Patients per Million
								</h3>
								<TimeSeriesChart
									data={timeSeriesData}
									metric="icuPatientsPerMillion"
									title=""
									color="#ef4444"
								/>
							</div>
						) : (
							<div className="bg-white/40 backdrop-blur-sm rounded-2xl p-6 border border-stone-200/50 hover:bg-white/50 transition-all duration-300">
								<h3 className="font-serif text-lg font-medium text-stone-800 mb-4">
									Total Cases per Million
								</h3>
								<TimeSeriesChart
									data={timeSeriesData}
									metric="totalCasesPerMillion"
									title=""
									color="#8b5cf6"
								/>
							</div>
						)}
					</div>
				</div>
			</div>
		</CoronaLayout>
	);
}
