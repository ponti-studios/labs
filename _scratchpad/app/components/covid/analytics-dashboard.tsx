'use client';

import { useQuery } from '@tanstack/react-query';
import type { CovidDataRecord } from '~/types/covid';
import { StatsOverview } from './charts/stats-overview';
import { TimeSeriesChart } from './charts/time-series-chart';
import { TopCountriesChart } from './charts/top-countries-chart';
import { VaccinationProgress } from './charts/vaccination-progress';

interface CovidAnalyticsDashboardProps {
  countryCode: string;
}

interface ApiResponse {
  data: CovidDataRecord[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters: {
    country: string | null;
    startDate: string | null;
    endDate: string | null;
  };
}

export function CovidAnalyticsDashboard({ countryCode }: CovidAnalyticsDashboardProps) {
  // Fetch latest stats for the selected country
  const {
    data: statsResponse,
    isLoading: isLoadingStats,
    isError: isErrorStats,
    error: errorStats,
  } = useQuery<ApiResponse>({
    queryKey: ['covid-stats', countryCode],
    queryFn: () => {
      const params = new URLSearchParams();
      params.append('type', 'stats');
      // Always pass the country code - API will handle OWID_WRL for world data
      params.append('country', countryCode);

      return fetch(`/api/covid/analytics/dashboard?${params}`).then((res) => res.json());
    },
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });

  // Fetch time series data for the selected country
  const {
    data: timeSeriesResponse,
    isLoading: isLoadingTimeSeries,
    isError: isErrorTimeSeries,
  } = useQuery<ApiResponse>({
    queryKey: ['covid-timeseries', countryCode],
    queryFn: () => {
      const params = new URLSearchParams();
      params.append('type', 'timeseries');
      // Always pass the country code - API will handle OWID_WRL for world data
      params.append('country', countryCode);
      params.append('limit', '2000'); // Get more data for time series

      return fetch(`/api/covid/analytics/dashboard?${params}`).then((res) => res.json());
    },
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });

  // Fetch latest data for all countries (for comparisons)
  const {
    data: globalComparisonResponse,
    isLoading: isLoadingGlobalComparison,
    isError: isErrorGlobalComparison,
  } = useQuery<ApiResponse>({
    queryKey: ['covid-global-latest'],
    queryFn: () => {
      const params = new URLSearchParams();
      params.append('type', 'latest');
      params.append('limit', '200'); // Get top countries

      return fetch(`/api/covid/analytics/dashboard?${params}`).then((res) => res.json());
    },
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
    enabled: countryCode !== 'OWID_WRL', // Only fetch if we're looking at a specific country
  });

  const isLoading =
    isLoadingStats ||
    isLoadingTimeSeries ||
    (countryCode !== 'OWID_WRL' && isLoadingGlobalComparison);
  const isError = isErrorStats || isErrorTimeSeries || isErrorGlobalComparison;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
        <span className="ml-3 text-gray-600">Loading COVID data...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-red-800 font-semibold">Error Loading Data</h3>
        <p className="text-red-600 mt-2">
          {errorStats instanceof Error ? errorStats.message : 'Failed to load COVID data'}
        </p>
      </div>
    );
  }

  const statsData = statsResponse?.data?.[0] || null;
  const timeSeriesData = timeSeriesResponse?.data || [];
  const globalComparisonData = globalComparisonResponse?.data || [];
  const displayData = timeSeriesData;

  if (!displayData || displayData.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h3 className="text-yellow-800 font-semibold">No Data Available</h3>
        <p className="text-yellow-600 mt-2">
          No COVID data is currently available for the selected filters.
        </p>
      </div>
    );
  }

  const countryName = countryCode === 'OWID_WRL' ? 'World' : statsData?.location || 'Unknown';

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4">
      {/* Stats Overview */}
      <StatsOverview data={statsData ? [statsData] : []} countryCode={countryCode} />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cases Timeline */}
        <TimeSeriesChart
          data={displayData}
          metric="totalCases"
          title="Total Cases Over Time"
          color="#3b82f6"
        />

        {/* Deaths Timeline */}
        <TimeSeriesChart
          data={displayData}
          metric="totalDeaths"
          title="Total Deaths Over Time"
          color="#ef4444"
        />

        {/* New Cases Timeline - Use smoothed data */}
        <TimeSeriesChart
          data={displayData}
          metric="newCasesSmoothed"
          title="New Cases (7-day average)"
          color="#f59e0b"
        />

        {/* Vaccination Progress */}
        <VaccinationProgress data={displayData} title="Vaccination Progress (%)" />
      </div>

      {/* Global Comparisons - Only show for specific countries */}
      {countryCode !== 'OWID_WRL' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">Global Comparisons</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TopCountriesChart
              data={globalComparisonData}
              metric="totalCasesPerMillion"
              title="Top Countries by Cases per Million"
              color="#3b82f6"
              limit={15}
            />

            <TopCountriesChart
              data={globalComparisonData}
              metric="totalDeathsPerMillion"
              title="Top Countries by Deaths per Million"
              color="#ef4444"
              limit={15}
            />

            <TopCountriesChart
              data={globalComparisonData}
              metric="peopleFullyVaccinatedPerHundred"
              title="Top Countries by Vaccination Rate"
              color="#10b981"
              limit={15}
            />

            <TopCountriesChart
              data={globalComparisonData}
              metric="stringencyIndex"
              title="Current Government Response Stringency"
              color="#8b5cf6"
              limit={15}
            />
          </div>
        </div>
      )}

      {/* Additional Metrics */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* New Deaths Timeline - Use smoothed data */}
          <TimeSeriesChart
            data={displayData}
            metric="newDeathsSmoothed"
            title="New Deaths (7-day average)"
            color="#dc2626"
          />

          {/* Reproduction Rate - Available for most countries */}
          <TimeSeriesChart
            data={displayData}
            metric="reproductionRate"
            title="Reproduction Rate (R)"
            color="#8b5cf6"
          />

          {/* Conditionally show based on data availability */}
          {displayData.some((record) => record.newVaccinationsSmoothed !== null) ? (
            <TimeSeriesChart
              data={displayData}
              metric="newVaccinationsSmoothed"
              title="New Vaccinations (7-day average)"
              color="#059669"
            />
          ) : (
            <TimeSeriesChart
              data={displayData}
              metric="totalDeathsPerMillion"
              title="Total Deaths per Million"
              color="#f59e0b"
            />
          )}

          {/* Show test positivity if available, otherwise show ICU patients */}
          {displayData.some((record) => record.positiveRate !== null) ? (
            <TimeSeriesChart
              data={displayData}
              metric="positiveRate"
              title="Test Positivity Rate"
              color="#f59e0b"
            />
          ) : displayData.some((record) => record.icuPatientsPerMillion !== null) ? (
            <TimeSeriesChart
              data={displayData}
              metric="icuPatientsPerMillion"
              title="ICU Patients per Million"
              color="#ef4444"
            />
          ) : (
            <TimeSeriesChart
              data={displayData}
              metric="totalCasesPerMillion"
              title="Total Cases per Million"
              color="#3b82f6"
            />
          )}
        </div>
      </div>
    </div>
  );
}
