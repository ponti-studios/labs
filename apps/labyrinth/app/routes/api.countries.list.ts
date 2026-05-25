import { sql } from "@pontistudios/db";
import type { LoaderFunctionArgs } from "react-router";
import { covidData, db } from "@pontistudios/db";

export async function loader(_args: LoaderFunctionArgs) {
  try {
    // Get all unique countries from the database
    const countries = await db
      .select({
        code: covidData.isoCode,
        name: covidData.location,
      })
      .from(covidData)
      .where(
        sql`${covidData.isoCode} IS NOT NULL 
            AND ${covidData.location} IS NOT NULL 
            AND ${covidData.isoCode} NOT LIKE 'OWID_%'`,
      )
      .groupBy(covidData.isoCode, covidData.location)
      .orderBy(covidData.location);

    // Add world option and format data
    const formattedCountries = [
      { code: "OWID_WRL", name: "🌍 World (Global Data)" },
      ...countries.map((country) => ({
        code: country.code as string,
        name: country.name as string,
      })),
    ];

    return Response.json({
      data: formattedCountries,
      total: formattedCountries.length,
    });
  } catch (error) {
    console.error("Failed to load countries:", error);
    return Response.json({ error: "Failed to load countries" }, { status: 500 });
  }
}
