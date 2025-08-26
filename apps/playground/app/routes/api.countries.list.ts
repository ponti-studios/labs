import { sql } from "drizzle-orm";
import { covidData, db } from "~/db";

export async function loader() {
	try {
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
		return Response.json(
			{ error: "Failed to load countries" },
			{ status: 500 },
		);
	}
}
