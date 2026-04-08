import { useQuery } from '@tanstack/react-query';
import type { LoaderFunctionArgs, MetaFunction } from 'react-router';
import { useLoaderData } from 'react-router';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { CoronaLayout } from '~/components/CoronaLayout';

interface VaccinationEffectiveness {
  overall: number;
  againstHospitalization: number;
  againstDeath: number;
  breakthroughRate: number;
}

interface VaccinationResponse {
  country: string;
  error?: string;
  effectiveness?: VaccinationEffectiveness;
  timeline?: Array<{
    date: string;
    fullyVaccinatedPerHundred: number;
    newCasesSmoothed: number;
    newDeathsSmoothed: number;
  }>;
  milestones?: Array<{
    threshold: number;
    label: string;
    dateReached: string | null;
  }>;
  vaccinationStats?: {
    fullyVaccinatedPerHundred: number;
    totalVaccinations: number;
    dailyVaccinations: number;
  };
}

export const meta: MetaFunction<typeof loader> = ({ params }) => {
  const countryCode = params.countryCode || 'OWID_WRL';

  let countryName = 'World';
  if (countryCode !== 'OWID_WRL') {
    countryName = countryCode;
  }

  return [
    { title: `Vaccination Effectiveness - ${countryName} | Ponti Studios` },
    {
      name: 'description',
      content: `Vaccination effectiveness analysis for ${countryName}.`,
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

export default function VaccinationEffectivenessPage() {
  const { countryCode } = useLoaderData() as Awaited<ReturnType<typeof loader>>;

  const { data, isLoading, isError } = useQuery<VaccinationResponse>({
    queryKey: ['vaccination-effectiveness', countryCode],
    queryFn: () => {
      const params = new URLSearchParams();
      params.append('country', countryCode);

      return fetch(`/api/covid/analytics/vaccination-effectiveness?${params}`).then((res) =>
        res.json()
      );
    },
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });

  return (
    <CoronaLayout countryCode={countryCode}>
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="font-serif text-3xl md:text-4xl font-light text-stone-900 mb-4">
            Vaccination Effectiveness
          </h1>
          <p className="text-lg text-stone-600 font-light">
            Comprehensive analysis of vaccination impact and effectiveness metrics
          </p>
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
            Failed to load vaccination effectiveness data. Please try again.
          </div>
        )}

        {/* API Error State */}
        {data?.error && (
          <div className="bg-amber-50/50 border border-amber-200 text-amber-700 px-6 py-4 rounded-2xl">
            {data.error}
          </div>
        )}

        {/* Results */}
        {data?.effectiveness && (
          <div className="space-y-8">
            {/* Effectiveness Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-6 border border-stone-200/50 hover:bg-white/50 transition-all duration-300">
                <h3 className="font-serif text-lg font-medium text-stone-800 mb-2">
                  Overall Effectiveness
                </h3>
                <p className="text-3xl font-light text-olive-600">
                  {data.effectiveness.overall?.toFixed(1) || '0.0'}%
                </p>
              </div>
              <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-6 border border-stone-200/50 hover:bg-white/50 transition-all duration-300">
                <h3 className="font-serif text-lg font-medium text-stone-800 mb-2">
                  Against Hospitalization
                </h3>
                <p className="text-3xl font-light text-green-600">
                  {data.effectiveness.againstHospitalization?.toFixed(1) || '0.0'}%
                </p>
              </div>
              <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-6 border border-stone-200/50 hover:bg-white/50 transition-all duration-300">
                <h3 className="font-serif text-lg font-medium text-stone-800 mb-2">
                  Against Death
                </h3>
                <p className="text-3xl font-light text-purple-600">
                  {data.effectiveness.againstDeath?.toFixed(1) || '0.0'}%
                </p>
              </div>
              <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-6 border border-stone-200/50 hover:bg-white/50 transition-all duration-300">
                <h3 className="font-serif text-lg font-medium text-stone-800 mb-2">
                  Breakthrough Rate
                </h3>
                <p className="text-3xl font-light text-amber-600">
                  {data.effectiveness.breakthroughRate?.toFixed(1) || '0.0'}%
                </p>
              </div>
            </div>

            {/* Vaccination Progress */}
            <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-6 border border-stone-200/50">
              <h2 className="font-serif text-xl font-medium mb-6 text-stone-800">
                Vaccination Progress
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="text-center">
                  <p className="text-stone-600 font-light mb-2">Fully Vaccinated</p>
                  <p className="text-2xl font-light text-stone-800">
                    {data.vaccinationStats?.fullyVaccinatedPerHundred?.toFixed(1) || '0.0'}%
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-stone-600 font-light mb-2">Total Vaccinations</p>
                  <p className="text-2xl font-light text-stone-800">
                    {data.vaccinationStats?.totalVaccinations?.toLocaleString() || '0'}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-stone-600 font-light mb-2">Daily Vaccinations</p>
                  <p className="text-2xl font-light text-stone-800">
                    {data.vaccinationStats?.dailyVaccinations?.toLocaleString() || '0'}
                  </p>
                </div>
              </div>
            </div>

            {/* Timeline Chart */}
            {data.timeline && data.timeline.length > 0 && (
              <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-6 border border-stone-200/50">
                <h2 className="font-serif text-xl font-medium mb-6 text-stone-800">
                  Vaccination vs Cases Timeline
                </h2>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.timeline}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#d6d3d1" />
                      <XAxis
                        dataKey="date"
                        tick={{ fill: '#57534e' }}
                        axisLine={{ stroke: '#a8a29e' }}
                        tickFormatter={(value) => new Date(value).toLocaleDateString()}
                      />
                      <YAxis tick={{ fill: '#57534e' }} axisLine={{ stroke: '#a8a29e' }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: '1px solid #d6d3d1',
                          borderRadius: '12px',
                          color: '#1c1917',
                        }}
                        labelFormatter={(value) => new Date(value).toLocaleDateString()}
                      />
                      <Line
                        type="monotone"
                        dataKey="fullyVaccinatedPerHundred"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        name="Vaccination Rate (%)"
                      />
                      <Line
                        type="monotone"
                        dataKey="newCasesSmoothed"
                        stroke="#ef4444"
                        strokeWidth={2}
                        name="New Cases (7-day avg)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Milestones */}
            <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-6 border border-stone-200/50">
              <h2 className="font-serif text-xl font-medium mb-6 text-stone-800">
                Vaccination Milestones
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.milestones?.map((milestone) => (
                  <div
                    key={milestone.threshold}
                    className="bg-white/30 border border-stone-200/50 rounded-xl p-4"
                  >
                    <h3 className="font-medium text-stone-800 mb-2">{milestone.label}</h3>
                    <p className="text-stone-600 font-light">
                      {milestone.dateReached
                        ? new Date(milestone.dateReached).toLocaleDateString()
                        : 'Not reached'}
                    </p>
                  </div>
                )) || (
                  <p className="text-stone-600 font-light col-span-full text-center">
                    No milestone data available
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </CoronaLayout>
  );
}
