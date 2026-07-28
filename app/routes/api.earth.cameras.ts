import { fetchTflCameras } from "~/lib/public-data";
import type { LoaderFunctionArgs } from "react-router";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const url = new URL(request.url);
    const type = url.searchParams.get("type") ?? undefined;
    const all = await fetchTflCameras(type);

    const search = url.searchParams.get("search")?.toLowerCase();
    const filtered = search
      ? all.filter(
          (c) =>
            c.common_name.toLowerCase().includes(search) ||
            c.properties.view.toLowerCase().includes(search)
        )
      : all;

    const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
    const limit = Math.min(Number(url.searchParams.get("limit")) || 200, 1000);
    const total = filtered.length;
    const data = filtered.slice((page - 1) * limit, page * limit);

    return Response.json({
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Failed to load TfL cameras:", error);
    return Response.json({ error: "Failed to load TfL cameras" }, { status: 500 });
  }
}
