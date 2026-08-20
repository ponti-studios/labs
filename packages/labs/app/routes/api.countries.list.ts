import { fetchCountries } from "~/lib/public-data";
import type { LoaderFunctionArgs } from "react-router";

export async function loader(_args: LoaderFunctionArgs) {
  try {
    const countries = await fetchCountries();

    const formattedCountries = [
      { code: "OWID_WRL", name: "🌍 World (Global Data)" },
      ...countries
        .filter((c) => !c.iso_code.startsWith("OWID_"))
        .map((c) => ({ code: c.iso_code, name: c.location })),
    ];

    return Response.json({ data: formattedCountries, total: formattedCountries.length });
  } catch (error) {
    console.error("Failed to load countries:", error);
    return Response.json({ error: "Failed to load countries" }, { status: 500 });
  }
}
