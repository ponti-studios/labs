import { useQuery } from '@tanstack/react-query';
import type { LoaderFunctionArgs, MetaFunction } from 'react-router';
import { useLoaderData } from 'react-router';
import {
  Bar,
  BarChart,
  CartesianGrid,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { CoronaLayout } from '~/components/CoronaLayout';

interface SeasonalPattern {
  month: number;
  monthName: string;
  averageCases: number;
  averageDeaths: number;
  caseVariance: number;
  deathVariance: number;
}

interface SeasonalAnalysis {
  seasonalityStrength: number;
  peakMonth: number;
  troughMonth: number;
  patterns: SeasonalPattern[];
}

interface SeasonalResponse {
  country: string;
  analysis: SeasonalAnalysis;
  insights: Array<{
    pattern: string;
    description: string;
    strength: number;
  }>;
  dataQuality: {
    totalDataPoints: number;
    monthsWithData: number;
    averageDataPointsPerMonth: number;
  };
}

export const meta: MetaFunction<typeof loader> = ({ params }) => {
  const countryCode = params.countryCode || 'OWID_WRL';

  let countryName = 'World';
  if (countryCode !== 'OWID_WRL') {
    countryName = countryCode;
  }

  return [
    { title: `Seasonal Patterns - ${countryName} | Ponti Studios` },
    {
      name: 'description',
      content: `Seasonal pattern analysis for ${countryName}.`,
    },
  ];
};

export async function loader({ params }: LoaderFunctionArgs) {
  const { countryCode } = params;

  if (!countryCode) {
    throw new Response('Country code is required', { status: 400 });
  }

  return { countryCode };
}

export default function SeasonalPatternsPage() {
  const { countryCode } = useLoaderData() as Awaited<ReturnType<typeof loader>>;

  const { data, isLoading, isError } = useQuery<SeasonalResponse>({
    queryKey: ['seasonal-patterns', countryCode],
    queryFn: () => {
      const params = new URLSearchParams();
      params.append('country', countryCode);

      return fetch(`/api/covid/analytics/seasonal-patterns?${params}`).then((res) => res.json());
    },
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });

  return (
    <CoronaLayout countryCode={countryCode}>
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="font-serif text-4xl text-stone-800 mb-4">Seasonal Patterns Analysis</h1>
          <p className="font-light text-stone-600 text-lg max-w-2xl mx-auto">
            Discover seasonal trends and cyclical patterns in COVID-19 data
          </p>
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
                Failed to load seasonal patterns data. Please try again.
              </p>
            </div>
          </div>
        )}

        {/* Results */}
        {data && (
          <div className="space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-xl border border-stone-200/50 p-8 hover:bg-white/70 transition-all duration-300">
                <h3 className="font-serif text-xl text-stone-800 mb-3">Seasonality Strength</h3>
                <p className="text-4xl font-light text-amber-700 mb-2">
                  {(data.analysis.seasonalityStrength * 100).toFixed(1)}%
                </p>
                <p className="text-stone-600 text-sm font-light">
                  Variation coefficient across months
                </p>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-xl border border-stone-200/50 p-8 hover:bg-white/70 transition-all duration-300">
                <h3 className="font-serif text-xl text-stone-800 mb-3">Peak Month</h3>
                <p className="text-4xl font-light text-orange-600 mb-2">
                  {data.analysis.patterns[data.analysis.peakMonth - 1]?.monthName || 'N/A'}
                </p>
                <p className="text-stone-600 text-sm font-light">Highest average cases</p>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-xl border border-stone-200/50 p-8 hover:bg-white/70 transition-all duration-300">
                <h3 className="font-serif text-xl text-stone-800 mb-3">Trough Month</h3>
                <p className="text-4xl font-light text-emerald-600 mb-2">
                  {data.analysis.patterns[data.analysis.troughMonth - 1]?.monthName || 'N/A'}
                </p>
                <p className="text-stone-600 text-sm font-light">Lowest average cases</p>
              </div>
            </div>

            {/* Monthly Patterns Chart */}
            <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-xl border border-stone-200/50 p-8">
              <h2 className="font-serif text-2xl text-stone-800 mb-6">Monthly Case Patterns</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.analysis.patterns}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#d6d3d1" />
                    <XAxis
                      dataKey="monthName"
                      tick={{ fill: '#57534e', fontSize: 12 }}
                      axisLine={{ stroke: '#a8a29e' }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis
                      tick={{ fill: '#57534e', fontSize: 12 }}
                      axisLine={{ stroke: '#a8a29e' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #d6d3d1',
                        borderRadius: '12px',
                        color: '#57534e',
                        backdropFilter: 'blur(8px)',
                      }}
                    />
                    <Bar
                      dataKey="averageCases"
                      fill="#d97706"
                      radius={[8, 8, 0, 0]}
                      name="Average Cases"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Seasonal Radar Chart */}
            <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-xl border border-stone-200/50 p-8">
              <h2 className="font-serif text-2xl text-stone-800 mb-6">Seasonal Pattern Radar</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={data.analysis.patterns}>
                    <PolarGrid stroke="#d6d3d1" />
                    <PolarAngleAxis dataKey="monthName" tick={{ fill: '#57534e', fontSize: 12 }} />
                    <PolarRadiusAxis
                      tick={{ fill: '#57534e', fontSize: 10 }}
                      domain={[0, 'dataMax']}
                    />
                    <Radar
                      name="Average Cases"
                      dataKey="averageCases"
                      stroke="#d97706"
                      fill="#d97706"
                      fillOpacity={0.2}
                      strokeWidth={3}
                    />
                    <Radar
                      name="Average Deaths"
                      dataKey="averageDeaths"
                      stroke="#dc2626"
                      fill="#dc2626"
                      fillOpacity={0.2}
                      strokeWidth={3}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #d6d3d1',
                        borderRadius: '12px',
                        color: '#57534e',
                        backdropFilter: 'blur(8px)',
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Pattern Insights */}
            {data.insights.length > 0 && (
              <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-xl border border-stone-200/50 p-8">
                <h2 className="font-serif text-2xl text-stone-800 mb-6">Pattern Insights</h2>
                <div className="space-y-6">
                  {data.insights.map((insight) => (
                    <div
                      key={insight.pattern}
                      className="border-l-4 border-amber-600 pl-6 py-4 bg-amber-50/50 rounded-r-2xl"
                    >
                      <h3 className="font-serif text-lg text-stone-800 mb-2">{insight.pattern}</h3>
                      <p className="text-stone-600 font-light mb-2">{insight.description}</p>
                      <p className="text-amber-700 text-sm font-medium">
                        Strength: {insight.strength}%
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Monthly Details Table */}
            <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-xl border border-stone-200/50 p-8">
              <h2 className="font-serif text-2xl text-stone-800 mb-6">Monthly Statistics</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs uppercase bg-stone-100 text-stone-600 font-medium">
                    <tr>
                      <th className="px-6 py-4">Month</th>
                      <th className="px-6 py-4">Avg Cases</th>
                      <th className="px-6 py-4">Avg Deaths</th>
                      <th className="px-6 py-4">Case Variance</th>
                      <th className="px-6 py-4">Death Variance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.analysis.patterns.map((pattern) => (
                      <tr
                        key={pattern.month}
                        className="bg-white/50 border-b border-stone-200 hover:bg-white/70 transition-colors"
                      >
                        <td className="px-6 py-4 font-medium text-stone-800">
                          {pattern.monthName}
                        </td>
                        <td className="px-6 py-4 text-stone-600">
                          {pattern.averageCases.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-stone-600">
                          {pattern.averageDeaths.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-stone-600">
                          {pattern.caseVariance.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-stone-600">
                          {pattern.deathVariance.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Data Quality Info */}
            <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-xl border border-stone-200/50 p-8">
              <h2 className="font-serif text-2xl text-stone-800 mb-6">Data Quality</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-stone-600 font-light mb-2">Total Data Points</p>
                  <p className="text-3xl font-light text-stone-800">
                    {data.dataQuality.totalDataPoints.toLocaleString()}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-stone-600 font-light mb-2">Months with Data</p>
                  <p className="text-3xl font-light text-stone-800">
                    {data.dataQuality.monthsWithData} / 12
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-stone-600 font-light mb-2">Avg Points per Month</p>
                  <p className="text-3xl font-light text-stone-800">
                    {data.dataQuality.averageDataPointsPerMonth}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </CoronaLayout>
  );
}
