import { fetchCovidData, type CovidRow } from "~/lib/public-data";
import type { LoaderFunctionArgs } from "react-router";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const url = new URL(request.url);
    const searchParams = url.searchParams;

    const country = searchParams.get("country");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const page = Number.parseInt(searchParams.get("page") || "1");
    const limit = Math.min(Number.parseInt(searchParams.get("limit") || "1000"), 5000);

    if (page < 1) {
      return Response.json({ error: "Page must be greater than 0" }, { status: 400 });
    }

    if (limit < 1) {
      return Response.json({ error: "Limit must be greater than 0" }, { status: 400 });
    }

    const isoCode = country && country !== "global" ? country : "OWID_WRL";
    const allRows = await fetchCovidData(isoCode, startDate ?? undefined, endDate ?? undefined);

    const sorted = allRows.sort((a, b) => {
      const dateA = a.date ?? "";
      const dateB = b.date ?? "";
      if (dateA !== dateB) return dateA.localeCompare(dateB);
      return (a.location ?? "").localeCompare(b.location ?? "");
    });

    const total = sorted.length;
    const totalPages = Math.ceil(total / limit);
    const data = sorted.slice((page - 1) * limit, page * limit) as CovidRow[];

    return Response.json({
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      filters: { country, startDate, endDate },
    });
  } catch (error) {
    console.error("Failed to load COVID data:", error);
    return Response.json({ error: "Failed to load COVID data" }, { status: 500 });
  }
}
