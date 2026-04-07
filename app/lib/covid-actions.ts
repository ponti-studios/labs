// React Router compatible version of covid actions

import { and, eq, isNotNull, sql } from 'drizzle-orm';
import { covidData, db } from '~/db';
import type { CovidDataSelect } from '~/db/schema';

interface ApiResponse {
  data: CovidDataSelect[];
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

// Fetch COVID stats - adapted for React Router
export async function getCovidStats(countryCode: string): Promise<ApiResponse> {
  try {
    const conditions = [];

    if (countryCode && countryCode !== 'OWID_WRL') {
      conditions.push(eq(covidData.isoCode, countryCode));
    } else {
      conditions.push(eq(covidData.isoCode, 'OWID_WRL'));
    }

    // Get latest data for stats
    const records = await db
      .select()
      .from(covidData)
      .where(and(...conditions))
      .orderBy(sql`${covidData.date} DESC`)
      .limit(1);

    return {
      data: records,
      pagination: {
        page: 1,
        limit: 1,
        total: records.length,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      },
      filters: {
        country: countryCode,
        startDate: null,
        endDate: null,
      },
    };
  } catch (error) {
    console.error('Error fetching COVID stats:', error);
    throw new Error('Failed to fetch COVID statistics');
  }
}

// Fetch COVID time series data
export async function getCovidTimeSeries(countryCode: string, limit = 1000): Promise<ApiResponse> {
  try {
    const conditions = [];

    if (countryCode && countryCode !== 'OWID_WRL') {
      conditions.push(eq(covidData.isoCode, countryCode));
    } else {
      conditions.push(eq(covidData.isoCode, 'OWID_WRL'));
    }

    // Fetch recent data only to reduce size
    const records = await db
      .select()
      .from(covidData)
      .where(and(...conditions))
      .orderBy(sql`${covidData.date} DESC`)
      .limit(limit);

    return {
      data: records.reverse(), // Return in chronological order
      pagination: {
        page: 1,
        limit,
        total: records.length,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      },
      filters: {
        country: countryCode,
        startDate: null,
        endDate: null,
      },
    };
  } catch (error) {
    console.error('Error fetching COVID time series:', error);
    throw new Error('Failed to fetch COVID time series data');
  }
}

// Get available countries
export async function getAvailableCountries(): Promise<string[]> {
  try {
    const countries = await db
      .selectDistinct({ isoCode: covidData.isoCode })
      .from(covidData)
      .where(isNotNull(covidData.isoCode));

    return countries.map((c) => c.isoCode).filter(Boolean) as string[];
  } catch (error) {
    console.error('Error fetching available countries:', error);
    return [];
  }
}

// Get global aggregated data
export async function getGlobalCovidData(): Promise<ApiResponse> {
  try {
    const records = await db
      .select()
      .from(covidData)
      .where(eq(covidData.isoCode, 'OWID_WRL'))
      .orderBy(sql`${covidData.date} DESC`)
      .limit(365); // Last year of data

    return {
      data: records.reverse(), // Return in chronological order
      pagination: {
        page: 1,
        limit: 365,
        total: records.length,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      },
      filters: {
        country: 'OWID_WRL',
        startDate: null,
        endDate: null,
      },
    };
  } catch (error) {
    console.error('Error fetching global COVID data:', error);
    throw new Error('Failed to fetch global COVID data');
  }
}

// Get country comparison data
export async function getCountryComparisonData(
  countryCodes: string[],
  limit = 365
): Promise<ApiResponse> {
  try {
    if (countryCodes.length === 0) {
      throw new Error('At least one country code is required');
    }

    const conditions = countryCodes.map((code) => eq(covidData.isoCode, code));

    const records = await db
      .select()
      .from(covidData)
      .where(sql`${covidData.isoCode} IN (${sql.join(countryCodes, sql.raw(','))})`)
      .orderBy(sql`${covidData.date} DESC`)
      .limit(limit * countryCodes.length);

    return {
      data: records,
      pagination: {
        page: 1,
        limit: limit * countryCodes.length,
        total: records.length,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      },
      filters: {
        country: countryCodes.join(','),
        startDate: null,
        endDate: null,
      },
    };
  } catch (error) {
    console.error('Error fetching country comparison data:', error);
    throw new Error('Failed to fetch country comparison data');
  }
}
