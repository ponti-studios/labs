import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { useLoaderData } from "react-router";
import { CoronaLayout } from "~/components/CoronaLayout";

interface Outlier {
	date: string;
	value: number;
	metric: string;
	zScore: number;
	type: "spike" | "drop" | "anomaly";
	severity: "low" | "medium" | "high";
	description: string;
}

interface DataQualityIssue {
	date: string;
	issue: string;
	severity: "warning" | "error";
	description: string;
}

interface OutlierResponse {
	country: string;
	metric: string;
	outliers: Outlier[];
	dataQualityIssues: DataQualityIssue[];
	reportingArtifacts: Array<{
		type: string;
		description: string;
		strength: number;
	}>;
	dataQualityScore: number;
	statistics: {
		mean: number;
		standardDeviation: number;
		totalDataPoints: number;
		outliersFound: number;
		qualityIssuesFound: number;
	};
}

export const meta: MetaFunction<typeof loader> = ({ params }) => {
	const countryCode = params.countryCode || "OWID_WRL";

	let countryName = "World";
	if (countryCode !== "OWID_WRL") {
		countryName = countryCode;
	}

	return [
		{ title: `Outlier Detection - ${countryName} | Ponti Studios` },
		{
			name: "description",
			content: `Outlier detection analysis for ${countryName}.`,
		},
	];
};

export async function loader({ params }: LoaderFunctionArgs) {
	const { countryCode } = params;

	if (!countryCode) {
		throw new Response("Country code is required", { status: 400 });
	}

	return { countryCode };
}

export default function OutlierDetectionPage() {
	const { countryCode } = useLoaderData() as Awaited<ReturnType<typeof loader>>;
	const [selectedMetric, setSelectedMetric] = useState("newCasesSmoothed");

	const metrics = [
		{ value: "newCasesSmoothed", label: "New Cases (7-day avg)" },
		{ value: "newDeathsSmoothed", label: "New Deaths (7-day avg)" },
		{ value: "newVaccinations", label: "New Vaccinations" },
		{ value: "positiveRate", label: "Test Positivity Rate" },
		{ value: "totalCases", label: "Total Cases" },
		{ value: "totalDeaths", label: "Total Deaths" },
	];

	const { data, isLoading, isError } = useQuery<OutlierResponse>({
		queryKey: ["outlier-detection", countryCode, selectedMetric],
		queryFn: () => {
			const params = new URLSearchParams();
			params.append("country", countryCode);
			params.append("metric", selectedMetric);

			return fetch(`/api/covid/analytics/outlier-detection?${params}`).then(
				(res) => res.json(),
			);
		},
		staleTime: 1000 * 60 * 60, // Cache for 1 hour
	});

	const getSeverityColor = (severity: string) => {
		switch (severity) {
			case "high":
				return "text-red-700 border-red-300 bg-red-50";
			case "medium":
				return "text-orange-700 border-orange-300 bg-orange-50";
			case "low":
				return "text-yellow-700 border-yellow-300 bg-yellow-50";
			default:
				return "text-stone-700 border-stone-300 bg-stone-50";
		}
	};

	const getQualityScoreColor = (score: number) => {
		if (score >= 0.8) return "text-emerald-600";
		if (score >= 0.6) return "text-amber-600";
		return "text-red-600";
	};

	return (
		<CoronaLayout countryCode={countryCode}>
			<div className="space-y-8">
				<div className="text-center">
					<h1 className="font-serif text-4xl text-stone-800 mb-4">
						Outlier Detection Analysis
					</h1>
					<p className="font-light text-stone-600 text-lg max-w-2xl mx-auto">
						Identify anomalies and assess data quality in COVID-19 metrics
					</p>
				</div>

				{/* Metric Selector */}
				<div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-xl border border-stone-200/50 p-8">
					<label
						htmlFor="metric-select"
						className="block text-stone-800 font-serif text-lg mb-4"
					>
						Select Metric to Analyze
					</label>
					<select
						id="metric-select"
						value={selectedMetric}
						onChange={(e) => setSelectedMetric(e.target.value)}
						className="w-full bg-white/80 border border-stone-300 text-stone-800 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-light"
					>
						{metrics.map((metric) => (
							<option key={metric.value} value={metric.value}>
								{metric.label}
							</option>
						))}
					</select>
				</div>

				{/* Loading State */}
				{isLoading && (
					<div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-xl border border-stone-200/50 p-16">
						<div className="flex justify-center items-center">
							<div className="animate-spin rounded-full h-16 w-16 border-t-2 border-amber-600" />
						</div>
					</div>
				)}

				{/* Error State */}
				{isError && (
					<div className="bg-red-50/80 backdrop-blur-sm border border-red-200 text-red-800 px-6 py-4 rounded-2xl shadow-lg">
						<div className="flex items-center space-x-3">
							<div className="flex-shrink-0">
								<svg
									className="h-5 w-5 text-red-400"
									viewBox="0 0 20 20"
									fill="currentColor"
									aria-hidden="true"
								>
									<path
										fillRule="evenodd"
										d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
										clipRule="evenodd"
									/>
								</svg>
							</div>
							<p className="font-medium">
								Failed to load outlier detection data. Please try again.
							</p>
						</div>
					</div>
				)}

				{/* Results */}
				{data && (
					<div className="space-y-8">
						{/* Overview Cards */}
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
							<div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-xl border border-stone-200/50 p-8 hover:bg-white/70 transition-all duration-300">
								<h3 className="font-serif text-xl text-stone-800 mb-3">
									Data Quality Score
								</h3>
								<p
									className={`text-4xl font-light mb-2 ${getQualityScoreColor(data.dataQualityScore)}`}
								>
									{(data.dataQualityScore * 100).toFixed(1)}%
								</p>
							</div>
							<div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-xl border border-stone-200/50 p-8 hover:bg-white/70 transition-all duration-300">
								<h3 className="font-serif text-xl text-stone-800 mb-3">
									Outliers Found
								</h3>
								<p className="text-4xl font-light text-orange-600 mb-2">
									{data.outliers.length}
								</p>
							</div>
							<div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-xl border border-stone-200/50 p-8 hover:bg-white/70 transition-all duration-300">
								<h3 className="font-serif text-xl text-stone-800 mb-3">
									Quality Issues
								</h3>
								<p className="text-4xl font-light text-red-600 mb-2">
									{data.dataQualityIssues.length}
								</p>
							</div>
							<div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-xl border border-stone-200/50 p-8 hover:bg-white/70 transition-all duration-300">
								<h3 className="font-serif text-xl text-stone-800 mb-3">
									Data Points
								</h3>
								<p className="text-4xl font-light text-blue-600 mb-2">
									{data.statistics.totalDataPoints.toLocaleString()}
								</p>
							</div>
						</div>

						{/* Statistics */}
						<div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-xl border border-stone-200/50 p-8">
							<h2 className="font-serif text-2xl text-stone-800 mb-6">
								Statistical Summary
							</h2>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
								<div className="text-center">
									<p className="text-stone-600 font-light mb-2">Mean Value</p>
									<p className="text-3xl font-light text-stone-800">
										{data.statistics.mean.toLocaleString()}
									</p>
								</div>
								<div className="text-center">
									<p className="text-stone-600 font-light mb-2">
										Standard Deviation
									</p>
									<p className="text-3xl font-light text-stone-800">
										{data.statistics.standardDeviation.toLocaleString()}
									</p>
								</div>
							</div>
						</div>

						{/* Outliers List */}
						{data.outliers.length > 0 && (
							<div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-xl border border-stone-200/50 p-8">
								<h2 className="font-serif text-2xl text-stone-800 mb-6">
									Detected Outliers
								</h2>
								<div className="space-y-4 max-h-96 overflow-y-auto">
									{data.outliers.map((outlier) => (
										<div
											key={`${outlier.date}-${outlier.metric}`}
											className={`border-2 rounded-2xl p-6 ${getSeverityColor(outlier.severity)}`}
										>
											<div className="flex justify-between items-start">
												<div>
													<h3 className="font-serif text-lg font-medium mb-2">
														{new Date(outlier.date).toLocaleDateString()} -{" "}
														{outlier.type.charAt(0).toUpperCase() +
															outlier.type.slice(1)}
													</h3>
													<p className="font-light">{outlier.description}</p>
												</div>
												<div className="text-right">
													<p className="text-2xl font-light mb-1">
														{outlier.value.toLocaleString()}
													</p>
													<p className="text-sm font-medium">
														Z-Score: {outlier.zScore}
													</p>
												</div>
											</div>
										</div>
									))}
								</div>
							</div>
						)}

						{/* Data Quality Issues */}
						{data.dataQualityIssues.length > 0 && (
							<div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-xl border border-stone-200/50 p-8">
								<h2 className="font-serif text-2xl text-stone-800 mb-6">
									Data Quality Issues
								</h2>
								<div className="space-y-4 max-h-96 overflow-y-auto">
									{data.dataQualityIssues.map((issue) => (
										<div
											key={`${issue.date}-${issue.issue}`}
											className={`border-2 rounded-2xl p-6 ${
												issue.severity === "error"
													? "border-red-300 bg-red-50 text-red-800"
													: "border-yellow-300 bg-yellow-50 text-yellow-800"
											}`}
										>
											<div className="flex justify-between items-start">
												<div>
													<h3 className="font-serif text-lg font-medium mb-2">
														{issue.issue} -{" "}
														{new Date(issue.date).toLocaleDateString()}
													</h3>
													<p className="font-light">{issue.description}</p>
												</div>
												<span
													className={`px-3 py-1 rounded-full text-xs font-medium ${
														issue.severity === "error"
															? "bg-red-100 text-red-800"
															: "bg-yellow-100 text-yellow-800"
													}`}
												>
													{issue.severity}
												</span>
											</div>
										</div>
									))}
								</div>
							</div>
						)}

						{/* Reporting Artifacts */}
						{data.reportingArtifacts.length > 0 && (
							<div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-xl border border-stone-200/50 p-8">
								<h2 className="font-serif text-2xl text-stone-800 mb-6">
									Reporting Artifacts
								</h2>
								<div className="space-y-4">
									{data.reportingArtifacts.map((artifact) => (
										<div
											key={artifact.type}
											className="border-2 border-blue-300 bg-blue-50 text-blue-800 rounded-2xl p-6"
										>
											<div className="flex justify-between items-start">
												<div>
													<h3 className="font-serif text-lg font-medium mb-2">
														{artifact.type}
													</h3>
													<p className="font-light">{artifact.description}</p>
												</div>
												<span className="text-blue-600 font-medium text-xl">
													{artifact.strength}%
												</span>
											</div>
										</div>
									))}
								</div>
							</div>
						)}

						{/* No Issues Found */}
						{data.outliers.length === 0 &&
							data.dataQualityIssues.length === 0 && (
								<div className="bg-emerald-50/80 backdrop-blur-sm border border-emerald-200 text-emerald-800 px-6 py-4 rounded-2xl shadow-lg">
									<div className="flex items-center space-x-3">
										<div className="flex-shrink-0">
											<svg
												className="h-5 w-5 text-emerald-400"
												viewBox="0 0 20 20"
												fill="currentColor"
												aria-hidden="true"
											>
												<path
													fillRule="evenodd"
													d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
													clipRule="evenodd"
												/>
											</svg>
										</div>
										<div>
											<h3 className="font-serif text-lg font-medium">
												Excellent Data Quality!
											</h3>
											<p className="font-light">
												No significant outliers or data quality issues detected
												in the selected metric.
											</p>
										</div>
									</div>
								</div>
							)}
					</div>
				)}
			</div>
		</CoronaLayout>
	);
}
