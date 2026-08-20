import { useSuspenseQuery } from "@tanstack/react-query";
import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { useLoaderData } from "react-router";
import { StatsOverview } from "~/components/covid/charts/stats-overview";
import { TimeSeriesChart } from "~/components/covid/charts/time-series-chart";
import { TopCountriesChart } from "~/components/covid/charts/top-countries-chart";
import { VaccinationProgress } from "~/components/covid/charts/vaccination-progress";
import type { CovidRow } from "~/lib/public-data";

interface DashboardResponse {
  countryCode: string;
  statsData: CovidRow | null;
  timeSeriesData: CovidRow[];
  globalComparisonData: CovidRow[];
}

export const meta: MetaFunction<typeof loader> = ({ params }) => {
  const countryCode = params.countryCode || "OWID_WRL";
  const countryName = countryCode !== "OWID_WRL" ? countryCode : "World";

  return [
    { title: `COVID-19 — ${countryName} | Ponti Studios` },
    {
      name: "description",
      content: `COVID-19 analytics for ${countryName}: cases, deaths, vaccinations, and trends.`,
    },
    { name: "keywords", content: `covid-19,coronavirus,${countryName},analytics` },
    { property: "og:title", content: `COVID-19 — ${countryName}` },
    { property: "og:type", content: "website" },
  ];
};

export async function loader({ params }: LoaderFunctionArgs) {
  const { countryCode } = params;
  if (!countryCode) throw new Response("Country code is required", { status: 400 });
  return { countryCode };
}

export default function CovidPage() {
  const { countryCode } = useLoaderData() as Awaited<ReturnType<typeof loader>>;

  const { data } = useSuspenseQuery<DashboardResponse>({
    queryKey: ["covid-dashboard", countryCode],
    queryFn: () =>
      fetch(`/api/covid/dashboard?country=${countryCode}`).then((res) => {
        if (!res.ok) throw new Error("Failed to fetch dashboard data");
        return res.json();
      }),
    staleTime: 1000 * 60 * 60,
  });

  if (!data.timeSeriesData || data.timeSeriesData.length === 0) {
    return (
      <div className="ui-flat-card text-center">
        <p className="text-muted-foreground text-sm">
          No COVID data available for the selected country.
        </p>
      </div>
    );
  }

  const { statsData, timeSeriesData, globalComparisonData } = data;

  return (
    <div className="space-y-6">
      <StatsOverview data={statsData ? [statsData] : []} countryCode={countryCode} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <TimeSeriesChart
          data={timeSeriesData}
          metric="total_cases"
          title="Total Cases"
          color="#3b82f6"
        />
        <TimeSeriesChart
          data={timeSeriesData}
          metric="total_deaths"
          title="Total Deaths"
          color="#ef4444"
        />
        <TimeSeriesChart
          data={timeSeriesData}
          metric="new_cases_smoothed"
          title="New Cases (7-day avg)"
          color="#f59e0b"
        />
        <VaccinationProgress data={timeSeriesData} title="Vaccination Progress" />
      </div>

      {countryCode !== "OWID_WRL" && globalComparisonData.length > 0 && (
        <>
          <p className="ui-data-label pt-2">Global Comparisons</p>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <TopCountriesChart
              data={globalComparisonData}
              metric="total_cases_per_million"
              title="Cases per Million"
              color="#3b82f6"
              limit={15}
            />
            <TopCountriesChart
              data={globalComparisonData}
              metric="total_deaths_per_million"
              title="Deaths per Million"
              color="#ef4444"
              limit={15}
            />
            <TopCountriesChart
              data={globalComparisonData}
              metric="people_fully_vaccinated_per_hundred"
              title="Vaccination Rate"
              color="#10b981"
              limit={15}
            />
            <TopCountriesChart
              data={globalComparisonData}
              metric="stringency_index"
              title="Government Response Stringency"
              color="#8b5cf6"
              limit={15}
            />
          </div>
        </>
      )}

      <p className="ui-data-label pt-2">Additional Metrics</p>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <TimeSeriesChart
          data={timeSeriesData}
          metric="new_deaths_smoothed"
          title="New Deaths (7-day avg)"
          color="#dc2626"
        />
        <TimeSeriesChart
          data={timeSeriesData}
          metric="reproduction_rate"
          title="Reproduction Rate (R)"
          color="#8b5cf6"
        />
        {timeSeriesData.some((record) => record.new_vaccinations_smoothed !== null) ? (
          <TimeSeriesChart
            data={timeSeriesData}
            metric="new_vaccinations_smoothed"
            title="New Vaccinations (7-day avg)"
            color="#059669"
          />
        ) : (
          <TimeSeriesChart
            data={timeSeriesData}
            metric="total_deaths_per_million"
            title="Total Deaths per Million"
            color="#f59e0b"
          />
        )}
        {timeSeriesData.some((record) => record.positive_rate !== null) ? (
          <TimeSeriesChart
            data={timeSeriesData}
            metric="positive_rate"
            title="Test Positivity Rate"
            color="#f59e0b"
          />
        ) : timeSeriesData.some((record) => record.icu_patients_per_million !== null) ? (
          <TimeSeriesChart
            data={timeSeriesData}
            metric="icu_patients_per_million"
            title="ICU Patients per Million"
            color="#ef4444"
          />
        ) : (
          <TimeSeriesChart
            data={timeSeriesData}
            metric="total_cases_per_million"
            title="Total Cases per Million"
            color="#8b5cf6"
          />
        )}
      </div>
    </div>
  );
}
