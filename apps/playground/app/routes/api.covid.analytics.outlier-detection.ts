import { eq } from "drizzle-orm";
import type { LoaderFunctionArgs } from "react-router";
import { covidData, db } from "~/db";

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

export async function loader({ request }: LoaderFunctionArgs) {
	try {
		const url = new URL(request.url);
		const searchParams = url.searchParams;
		const country = searchParams.get("country") || "OWID_WRL";
		const metric = searchParams.get("metric") || "newCasesSmoothed";

		// Get time series data
		const data = await db
			.select({
				date: covidData.date,
				newCases: covidData.newCases,
				newDeaths: covidData.newDeaths,
				newCasesSmoothed: covidData.newCasesSmoothed,
				newDeathsSmoothed: covidData.newDeathsSmoothed,
				totalCases: covidData.totalCases,
				totalDeaths: covidData.totalDeaths,
				newVaccinations: covidData.newVaccinations,
				positiveRate: covidData.positiveRate,
			})
			.from(covidData)
			.where(eq(covidData.isoCode, country))
			.orderBy(covidData.date);

		if (data.length === 0) {
			return Response.json({
				country,
				error: "No data found for outlier detection",
			});
		}

		// Extract values for the specified metric
		const values = data
			.map((row) => {
				const value = row[metric as keyof typeof row] as number;
				return {
					date: row.date || "",
					value: value || 0,
				};
			})
			.filter((item) => item.value > 0);

		if (values.length < 10) {
			return Response.json({
				country,
				metric,
				error: "Insufficient data for outlier detection",
			});
		}

		// Calculate statistical measures
		const calculateStats = (vals: number[]) => {
			const mean = vals.reduce((sum, val) => sum + val, 0) / vals.length;
			const variance =
				vals.reduce((sum, val) => sum + (val - mean) ** 2, 0) / vals.length;
			const stdDev = Math.sqrt(variance);

			return { mean, stdDev };
		};

		const { mean, stdDev } = calculateStats(values.map((v) => v.value));

		// Detect outliers using Z-score method
		const outliers: Outlier[] = [];
		const dataQualityIssues: DataQualityIssue[] = [];

		for (let i = 0; i < values.length; i++) {
			const current = values[i];
			const zScore = stdDev > 0 ? Math.abs(current.value - mean) / stdDev : 0;

			// Outlier detection (Z-score > 2.5 = outlier, > 3.5 = extreme outlier)
			if (zScore > 2.5) {
				const severity = zScore > 3.5 ? "high" : zScore > 3 ? "medium" : "low";
				const type = current.value > mean ? "spike" : "drop";

				outliers.push({
					date: current.date,
					value: current.value,
					metric,
					zScore: Math.round(zScore * 100) / 100,
					type,
					severity,
					description: `${
						type === "spike" ? "Unusual spike" : "Unusual drop"
					} in ${metric} (${zScore.toFixed(1)} standard deviations from mean)`,
				});
			}

			// Data quality checks
			if (i > 0) {
				const previous = values[i - 1];
				const percentChange =
					previous.value > 0
						? Math.abs((current.value - previous.value) / previous.value) * 100
						: 0;

				// Flag sudden jumps (>500% day-over-day change)
				if (percentChange > 500) {
					dataQualityIssues.push({
						date: current.date,
						issue: "Sudden Jump",
						severity: "warning",
						description: `${percentChange.toFixed(0)}% day-over-day change in ${metric}`,
					});
				}

				// Flag impossible decreases in cumulative metrics
				if (
					(metric === "totalCases" || metric === "totalDeaths") &&
					current.value < previous.value
				) {
					dataQualityIssues.push({
						date: current.date,
						issue: "Negative Growth",
						severity: "error",
						description: `${metric} decreased from ${previous.value} to ${current.value}`,
					});
				}
			}

			// Check for zero/null values in active periods
			if (i > 30 && i < values.length - 30 && current.value === 0) {
				dataQualityIssues.push({
					date: current.date,
					issue: "Missing Data",
					severity: "warning",
					description: `Zero value for ${metric} in active reporting period`,
				});
			}
		}

		// Detect reporting artifacts (e.g., weekly patterns)
		const detectReportingArtifacts = () => {
			const artifacts = [];

			// Check for weekly reporting patterns
			const dayOfWeekValues: Record<number, number[]> = {};
			for (let i = 0; i < 7; i++) {
				dayOfWeekValues[i] = [];
			}

			for (const item of values) {
				const dayOfWeek = new Date(item.date).getDay();
				dayOfWeekValues[dayOfWeek].push(item.value);
			}

			// Calculate variance across days of week
			const dayAverages = Object.values(dayOfWeekValues).map((vals) =>
				vals.length > 0
					? vals.reduce((sum, val) => sum + val, 0) / vals.length
					: 0,
			);

			const overallAvg = dayAverages.reduce((sum, val) => sum + val, 0) / 7;
			const maxDayAvg = Math.max(...dayAverages);
			const minDayAvg = Math.min(...dayAverages);

			if (overallAvg > 0 && (maxDayAvg - minDayAvg) / overallAvg > 0.5) {
				artifacts.push({
					type: "Weekly Reporting Pattern",
					description:
						"Significant variation in reporting by day of week detected",
					strength: Math.round(((maxDayAvg - minDayAvg) / overallAvg) * 100),
				});
			}

			return artifacts;
		};

		const reportingArtifacts = detectReportingArtifacts();

		// Calculate overall data quality score
		const calculateDataQualityScore = () => {
			let score = 100;

			// Penalize for outliers
			score -= Math.min(30, outliers.length * 2);

			// Penalize for data quality issues
			score -= Math.min(
				20,
				dataQualityIssues.filter((issue) => issue.severity === "error").length *
					5,
			);
			score -= Math.min(
				15,
				dataQualityIssues.filter((issue) => issue.severity === "warning")
					.length * 2,
			);

			// Penalize for reporting artifacts
			score -= Math.min(10, reportingArtifacts.length * 5);

			return Math.max(0, score) / 100;
		};

		const dataQualityScore = calculateDataQualityScore();

		return Response.json({
			country,
			metric,
			outliers: outliers.sort((a, b) => b.zScore - a.zScore), // Sort by severity
			dataQualityIssues,
			reportingArtifacts,
			dataQualityScore: Math.round(dataQualityScore * 100) / 100,
			statistics: {
				mean: Math.round(mean * 100) / 100,
				standardDeviation: Math.round(stdDev * 100) / 100,
				totalDataPoints: values.length,
				outliersFound: outliers.length,
				qualityIssuesFound: dataQualityIssues.length,
			},
		});
	} catch (error) {
		console.error("Error in outlier detection:", error);
		return Response.json(
			{ error: "Failed to perform outlier detection" },
			{ status: 500 },
		);
	}
}
