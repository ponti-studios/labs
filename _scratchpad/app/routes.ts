import { type RouteConfig, index, route } from '@react-router/dev/routes';

export default [
  index('routes/home.tsx'),
  route('/border-linear-gradient', 'routes/border-linear-gradient.tsx'),
  route('/svg-glass-test', 'routes/svg-glass-test.tsx'),
  route('/to-do', 'routes/to-do.tsx'),
  route('/vector-search', 'routes/VectorSearchPage.tsx'),

  // TFL cameras
  route('/api/tfl', 'routes/api.tfl.ts'),
  route('/tfl', 'routes/tfl.tsx'),

  // COVID-19 routes
  route('/corona', 'routes/corona.tsx'),
  route('/corona/:countryCode', 'routes/corona.$countryCode.tsx'),
  route('/corona/:countryCode/pandemic-waves', 'routes/corona.$countryCode.pandemic-waves.tsx'),
  route(
    '/corona/:countryCode/vaccination-effectiveness',
    'routes/corona.$countryCode.vaccination-effectiveness.tsx'
  ),
  route(
    '/corona/:countryCode/seasonal-patterns',
    'routes/corona.$countryCode.seasonal-patterns.tsx'
  ),
  route(
    '/corona/:countryCode/outlier-detection',
    'routes/corona.$countryCode.outlier-detection.tsx'
  ),

  // COVID API routes
  route('/api/covid', 'routes/api.covid.ts'),
  route('/api/covid/analytics/dashboard', 'routes/api.covid.analytics.dashboard.ts'),
  route('/api/covid/analytics/pandemic-waves', 'routes/api.covid.analytics.pandemic-waves.ts'),
  route(
    '/api/covid/analytics/outlier-detection',
    'routes/api.covid.analytics.outlier-detection.ts'
  ),
  route(
    '/api/covid/analytics/seasonal-patterns',
    'routes/api.covid.analytics.seasonal-patterns.ts'
  ),
  route(
    '/api/covid/analytics/vaccination-effectiveness',
    'routes/api.covid.analytics.vaccination-effectiveness.ts'
  ),
  route(
    '/api/covid/analytics/socioeconomic-analysis',
    'routes/api.covid.analytics.socioeconomic-analysis.ts'
  ),
  route('/api/countries/list', 'routes/api.countries.list.ts'),
] satisfies RouteConfig;
