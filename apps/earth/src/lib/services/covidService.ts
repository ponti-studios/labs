/**
 * COVID-19 Data Service
 * 
 * Fetches COVID-19 data from disease.sh API (no backend required)
 * Cache results in module scope to reduce API calls
 */

// Cache storage
const cache = {
  allCountries: null as CovidCountry[] | null,
  allCountriesTime: 0,
  timeSeries: new Map<string, CovidTimeSeriesRecord[]>(),
  timeSeriesTime: new Map<string, number>(),
};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export interface CovidCountry {
  updated: number;
  country: string;
  countryInfo: {
    _id: number | null;
    iso2: string | null;
    iso3: string;
    lat: number;
    long: number;
    flag: string;
  };
  cases: number;
  todayCases: number;
  deaths: number;
  todayDeaths: number;
  recovered: number;
  todayRecovered: number;
  active: number;
  critical: number;
  casesPerOneMillion: number;
  deathsPerOneMillion: number;
  tests: number;
  testsPerOneMillion: number;
  population: number;
  continent: string;
  oneCasePerPeople: number;
  oneDeathPerPeople: number;
  oneTestPerPeople: number;
  activePerOneMillion: number;
  recoveredPerOneMillion: number;
  criticalPerOneMillion: number;
}

export interface CovidTimeSeriesRecord {
  date: string;
  cases: number;
  deaths: number;
  recovered: number;
}

export interface CovidHistoricalData {
  country: string;
  province: string[] | null;
  timeline: {
    cases: Record<string, number>;
    deaths: Record<string, number>;
    recovered: Record<string, number>;
  };
}

export interface CountryCode {
  name: string;
  iso2: string | null;
  iso3: string;
}

/**
 * Fetch summary data for all countries
 */
export async function fetchAllCountriesSummary(): Promise<CovidCountry[]> {
  const now = Date.now();
  
  if (cache.allCountries && (now - cache.allCountriesTime) < CACHE_DURATION) {
    return cache.allCountries;
  }

  try {
    const response = await fetch('https://disease.sh/v3/covid-19/countries');
    if (!response.ok) throw new Error('Failed to fetch countries');
    
    const data: CovidCountry[] = await response.json();
    
    // Filter out entries without valid coordinates
    const validCountries = data.filter(c => 
      c.countryInfo?.lat && c.countryInfo?.long && c.countryInfo?.iso3
    );
    
    cache.allCountries = validCountries;
    cache.allCountriesTime = now;
    
    return validCountries;
  } catch (error) {
    console.error('Error fetching all countries:', error);
    return cache.allCountries || [];
  }
}

/**
 * Fetch time series data for a specific country (last 365 days)
 */
export async function fetchCountryTimeSeries(iso3: string): Promise<CovidTimeSeriesRecord[]> {
  const now = Date.now();
  const cached = cache.timeSeries.get(iso3);
  const cachedTime = cache.timeSeriesTime.get(iso3) || 0;
  
  if (cached && (now - cachedTime) < CACHE_DURATION) {
    return cached;
  }

  try {
    const response = await fetch(
      `https://disease.sh/v3/covid-19/historical/${iso3}?lastdays=365`
    );
    if (!response.ok) throw new Error(`Failed to fetch time series for ${iso3}`);
    
    const data: CovidHistoricalData = await response.json();
    
    // Convert timeline format to array
    const records: CovidTimeSeriesRecord[] = [];
    const cases = data.timeline?.cases || {};
    const deaths = data.timeline?.deaths || {};
    const recovered = data.timeline?.recovered || {};
    
    // Get all unique dates
    const dates = Object.keys(cases);
    
    for (const dateStr of dates) {
      records.push({
        date: parseDate(dateStr),
        cases: cases[dateStr] || 0,
        deaths: deaths[dateStr] || 0,
        recovered: recovered[dateStr] || 0,
      });
    }
    
    // Sort by date
    records.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    cache.timeSeries.set(iso3, records);
    cache.timeSeriesTime.set(iso3, now);
    
    return records;
  } catch (error) {
    console.error(`Error fetching time series for ${iso3}:`, error);
    return cache.timeSeries.get(iso3) || [];
  }
}

/**
 * Fetch global summary data
 */
export async function fetchGlobalSummary(): Promise<Partial<CovidCountry>> {
  try {
    const response = await fetch('https://disease.sh/v3/covid-19/all');
    if (!response.ok) throw new Error('Failed to fetch global data');
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching global summary:', error);
    return {};
  }
}

/**
 * Find a country by ISO3 code
 */
export function findCountryByIso3(
  countries: CovidCountry[], 
  iso3: string
): CovidCountry | undefined {
  return countries.find(c => c.countryInfo.iso3 === iso3);
}

/**
 * Get top N countries by a metric
 */
export function getTopCountries(
  countries: CovidCountry[],
  metric: keyof CovidCountry,
  limit = 15
): CovidCountry[] {
  return [...countries]
    .sort((a, b) => (b[metric] as number) - (a[metric] as number))
    .slice(0, limit);
}

/**
 * Calculate daily new cases/deaths from cumulative data
 */
export function calculateDailyNew(records: CovidTimeSeriesRecord[]): CovidTimeSeriesRecord[] {
  const result: CovidTimeSeriesRecord[] = [];
  
  for (let i = 1; i < records.length; i++) {
    const prev = records[i - 1];
    const curr = records[i];
    
    result.push({
      date: curr.date,
      cases: Math.max(0, curr.cases - prev.cases),
      deaths: Math.max(0, curr.deaths - prev.deaths),
      recovered: Math.max(0, curr.recovered - prev.recovered),
    });
  }
  
  return result;
}

/**
 * Calculate 7-day moving average
 */
export function calculateMovingAverage(
  records: CovidTimeSeriesRecord[],
  metric: 'cases' | 'deaths' | 'recovered' = 'cases',
  days = 7
): { date: string; value: number }[] {
  const result: { date: string; value: number }[] = [];
  
  for (let i = days - 1; i < records.length; i++) {
    let sum = 0;
    for (let j = i - days + 1; j <= i; j++) {
      sum += records[j][metric];
    }
    
    result.push({
      date: records[i].date,
      value: Math.round(sum / days),
    });
  }
  
  return result;
}

/**
 * Calculate vaccination estimate (not all countries report, use heuristic)
 */
export function estimateVaccinationProgress(
  country: CovidCountry
): { partiallyVaccinated: number; fullyVaccinated: number; boosters: number } {
  // Use tests as a proxy for vaccination coverage
  // This is a rough heuristic since disease.sh doesn't provide vaccination data
  const vaccinationRate = Math.min(
    0.85, // Cap at 85%
    (country.testsPerOneMillion / 2000000) * 0.7 // Estimate based on testing rate
  );
  
  return {
    partiallyVaccinated: vaccinationRate * 0.95 * 100, // 95% of total get first dose
    fullyVaccinated: vaccinationRate * 0.85 * 100, // 85% complete primary series
    boosters: vaccinationRate * 0.45 * 100, // 45% get boosters
  };
}

// Helper: Parse M/D/YY format from disease.sh to YYYY-MM-DD
function parseDate(dateStr: string): string {
  const [month, day, year] = dateStr.split('/').map(Number);
  const fullYear = year < 50 ? 2000 + year : 1900 + year;
  return `${fullYear}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/**
 * Get list of countries with coordinates for the globe
 */
export function getCountriesWithCoordinates(
  countries: CovidCountry[]
): Array<{
  name: string;
  iso3: string;
  iso2: string | null;
  lat: number;
  lng: number;
  cases: number;
  deaths: number;
}> {
  return countries.map(c => ({
    name: c.country,
    iso3: c.countryInfo.iso3,
    iso2: c.countryInfo.iso2,
    lat: c.countryInfo.lat,
    lng: c.countryInfo.long,
    cases: c.cases,
    deaths: c.deaths,
  }));
}

/**
 * Get color based on cases per million (for heat map)
 */
export function getCasesColor(casesPerMillion: number): string {
  if (casesPerMillion > 100000) return '#7f1d1d'; // Dark red
  if (casesPerMillion > 50000) return '#dc2626'; // Red
  if (casesPerMillion > 25000) return '#f97316'; // Orange
  if (casesPerMillion > 10000) return '#eab308'; // Yellow
  if (casesPerMillion > 5000) return '#3b82f6'; // Blue
  return '#10b981'; // Green
}

/**
 * Calculate case fatality rate
 */
export function calculateCFR(country: CovidCountry): number {
  if (!country.cases || country.cases === 0) return 0;
  return (country.deaths / country.cases) * 100;
}

/**
 * Calculate tests per case ratio
 */
export function calculateTestsPerCase(country: CovidCountry): number {
  if (!country.cases || country.cases === 0) return 0;
  return country.tests / country.cases;
}

// Country coordinates for major countries (fallback)
export const COUNTRY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  USA: { lat: 37.0902, lng: -95.7129 },
  CHN: { lat: 35.8617, lng: 104.1954 },
  IND: { lat: 20.5937, lng: 78.9629 },
  BRA: { lat: -14.235, lng: -51.9253 },
  RUS: { lat: 61.524, lng: 105.3188 },
  FRA: { lat: 46.2276, lng: 2.2137 },
  DEU: { lat: 51.1657, lng: 10.4515 },
  GBR: { lat: 55.3781, lng: -3.436 },
  ITA: { lat: 41.8719, lng: 12.5674 },
  ESP: { lat: 40.4637, lng: -3.7492 },
  CAN: { lat: 56.1304, lng: -106.3468 },
  AUS: { lat: -25.2744, lng: 133.7751 },
  JPN: { lat: 36.2048, lng: 138.2529 },
  KOR: { lat: 35.9078, lng: 127.7669 },
  ZAF: { lat: -30.5595, lng: 22.9375 },
  MEX: { lat: 23.6345, lng: -102.5528 },
  IDN: { lat: -0.7893, lng: 113.9213 },
  TUR: { lat: 38.9637, lng: 35.2433 },
  SAU: { lat: 23.8859, lng: 45.0792 },
  ARG: { lat: -38.4161, lng: -63.6167 },
};
