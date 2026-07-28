import { fetchCovidData, fetchCountries, type CovidRow } from "~/lib/public-data";

interface ApiResponse {
  data: CovidRow[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters: { country: string | null; startDate: string | null; endDate: string | null };
}

export async function getCovidStats(countryCode: string): Promise<ApiResponse> {
  try {
    const isoCode = countryCode && countryCode !== "OWID_WRL" ? countryCode : "OWID_WRL";
    const allRows = await fetchCovidData(isoCode);
    const sorted = allRows
      .filter((r) => r.totalCases !== null)
      .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));
    const records = sorted.slice(0, 1);

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
      filters: { country: countryCode, startDate: null, endDate: null },
    };
  } catch (error) {
    console.error("Error fetching COVID stats:", error);
    throw new Error("Failed to fetch COVID statistics");
  }
}

export async function getCovidTimeSeries(countryCode: string, limit = 1000): Promise<ApiResponse> {
  try {
    const isoCode = countryCode && countryCode !== "OWID_WRL" ? countryCode : "OWID_WRL";
    const allRows = await fetchCovidData(isoCode);
    const sorted = allRows.sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));
    const records = sorted.slice(0, limit).reverse();

    return {
      data: records,
      pagination: {
        page: 1,
        limit,
        total: records.length,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      },
      filters: { country: countryCode, startDate: null, endDate: null },
    };
  } catch (error) {
    console.error("Error fetching COVID time series:", error);
    throw new Error("Failed to fetch COVID time series data");
  }
}

export async function getAvailableCountries(): Promise<string[]> {
  try {
    const countries = await fetchCountries();
    return countries.map((c) => c.iso_code).filter((c) => !c.startsWith("OWID_"));
  } catch (error) {
    console.error("Error fetching available countries:", error);
    return [];
  }
}

export async function getGlobalCovidData(): Promise<ApiResponse> {
  try {
    const allRows = await fetchCovidData("OWID_WRL");
    const sorted = allRows.sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));
    const records = sorted.slice(0, 365).reverse();

    return {
      data: records,
      pagination: {
        page: 1,
        limit: 365,
        total: records.length,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      },
      filters: { country: "OWID_WRL", startDate: null, endDate: null },
    };
  } catch (error) {
    console.error("Error fetching global COVID data:", error);
    throw new Error("Failed to fetch global COVID data");
  }
}
