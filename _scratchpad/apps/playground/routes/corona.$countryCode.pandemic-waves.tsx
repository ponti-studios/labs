import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import type { LoaderFunctionArgs, MetaFunction } from 'react-router';
import { useLoaderData } from 'react-router';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { CoronaLayout } from '~/components/CoronaLayout';

interface WaveData {
  wave: number;
  startDate: string;
  endDate: string;
  peakDate: string;
  peakValue: number;
  totalCases: number;
  duration: number;
  avgDailyGrowth: number;
}

interface WaveAnalysisResponse {
  country: string;
  metric: string;
  waves: WaveData[];
  totalDataPoints: number;
}

export const meta: MetaFunction<typeof loader> = ({ params }) => {
  const countryCode = params.countryCode || 'OWID_WRL';

  let countryName = 'World';
  if (countryCode !== 'OWID_WRL') {
    countryName = countryCode;
  }

  return [
    { title: `Pandemic Waves - ${countryName} | Ponti Studios` },
    {
      name: 'description',
      content: `Pandemic wave analysis for ${countryName}. View wave patterns, peak dates, and duration.`,
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

export default function PandemicWavesPage() {
  const { countryCode } = useLoaderData() as Awaited<ReturnType<typeof loader>>;
  const [metric, setMetric] = useState<string>('newCasesSmoothed');

  const { data, isLoading, isError } = useQuery<WaveAnalysisResponse>({
    queryKey: ['pandemic-waves', countryCode, metric],
    queryFn: () => {
      const params = new URLSearchParams();
      params.append('country', countryCode);
      params.append('metric', metric);

      return fetch(`/api/covid/analytics/pandemic-waves?${params}`).then((res) => res.json());
    },
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });

  return (
    <CoronaLayout countryCode={countryCode}>
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="font-serif text-3xl md:text-4xl font-light text-stone-900 mb-4">
            Pandemic Waves Analysis
          </h1>
          <p className="text-lg text-stone-600 font-light">
            Detailed analysis of pandemic wave patterns and intensity
          </p>
        </div>

        {/* Metric Selection */}
        <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-6 border border-stone-200/50">
          <label htmlFor="metric-select" className="block text-sm font-medium text-stone-700 mb-3">
            Select Metric for Wave Analysis
          </label>
          <select
            id="metric-select"
            value={metric}
            onChange={(e) => setMetric(e.target.value)}
            className="w-full bg-white/60 border border-stone-300 text-stone-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-olive-500 focus:border-transparent"
          >
            <option value="newCasesSmoothed">New Cases (Smoothed)</option>
            <option value="newDeathsSmoothed">New Deaths (Smoothed)</option>
            <option value="newCases">New Cases (Raw)</option>
            <option value="newDeaths">New Deaths (Raw)</option>
          </select>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-olive-500" />
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="bg-red-50/50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl">
            Failed to load pandemic waves data. Please try again.
          </div>
        )}

        {/* Wave Analysis Results */}
        {data?.waves && (
          <div className="space-y-8">
            {/* Wave Chart */}
            <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-6 border border-stone-200/50">
              <h2 className="font-serif text-xl font-medium mb-6 text-stone-800">
                Wave Intensity Comparison
              </h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.waves}>
                    <XAxis
                      dataKey="wave"
                      tick={{ fill: '#57534e' }}
                      axisLine={{ stroke: '#a8a29e' }}
                      tickFormatter={(value) => `Wave ${value}`}
                    />
                    <YAxis tick={{ fill: '#57534e' }} axisLine={{ stroke: '#a8a29e' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #d6d3d1',
                        borderRadius: '12px',
                        color: '#1c1917',
                      }}
                      labelFormatter={(value) => `Wave ${value}`}
                    />
                    <Bar
                      dataKey="peakValue"
                      fill="#8b5cf6"
                      radius={[4, 4, 0, 0]}
                      name="Peak Value"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Wave Details Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {data.waves.map((wave) => (
                <div
                  key={wave.wave}
                  className="bg-white/40 backdrop-blur-sm rounded-2xl p-6 border border-stone-200/50 hover:bg-white/50 transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-serif text-lg font-medium text-stone-800">
                      Wave {wave.wave}
                    </h3>
                    <span className="bg-olive-100 text-olive-700 px-3 py-1 rounded-full text-sm font-medium">
                      {wave.duration} days
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-stone-600 font-light">Peak Value</p>
                      <p className="text-xl font-light text-stone-800">
                        {wave.peakValue.toLocaleString()}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-stone-600 font-light">Peak Date</p>
                      <p className="text-stone-700">
                        {new Date(wave.peakDate).toLocaleDateString()}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-stone-600 font-light">Total Cases</p>
                      <p className="text-stone-700">{wave.totalCases.toLocaleString()}</p>
                    </div>

                    <div>
                      <p className="text-sm text-stone-600 font-light">Avg Daily Growth</p>
                      <p className="text-stone-700">{wave.avgDailyGrowth.toFixed(2)}%</p>
                    </div>

                    <div className="pt-2 border-t border-stone-200/50">
                      <p className="text-sm text-stone-600 font-light">Duration</p>
                      <p className="text-stone-700">
                        {new Date(wave.startDate).toLocaleDateString()} →{' '}
                        {new Date(wave.endDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary Statistics */}
            <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-6 border border-stone-200/50">
              <h2 className="font-serif text-xl font-medium mb-6 text-stone-800">
                Wave Analysis Summary
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-stone-600 font-light mb-2">Total Waves Detected</p>
                  <p className="text-3xl font-light text-stone-800">{data.waves.length}</p>
                </div>
                <div className="text-center">
                  <p className="text-stone-600 font-light mb-2">Highest Peak</p>
                  <p className="text-3xl font-light text-stone-800">
                    {Math.max(...data.waves.map((w) => w.peakValue)).toLocaleString()}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-stone-600 font-light mb-2">Data Points Analyzed</p>
                  <p className="text-3xl font-light text-stone-800">
                    {data.totalDataPoints.toLocaleString()}
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
