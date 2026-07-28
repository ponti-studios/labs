import type { LoaderFunctionArgs } from "react-router";
import {
  getCovidStats,
  getCovidTimeSeries,
  getGlobalCovidData,
} from "~/lib/covid-actions";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const countryCode = url.searchParams.get("country");

  if (!countryCode) {
    throw new Response("Country code is required", { status: 400 });
  }

  try {
    const [statsResponse, timeSeriesResponse, globalComparisonResponse] = await Promise.all([
      getCovidStats(countryCode),
      getCovidTimeSeries(countryCode, 500),
      countryCode !== "OWID_WRL" ? getGlobalCovidData() : Promise.resolve({ data: [] }),
    ]);

    return {
      countryCode,
      statsData: statsResponse.data?.[0] || null,
      timeSeriesData: timeSeriesResponse.data || [],
      globalComparisonData: globalComparisonResponse.data || [],
    };
  } catch {
    throw new Response("Failed to fetch COVID data", { status: 500 });
  }
}
