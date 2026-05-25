import type { LoaderFunctionArgs } from "react-router";
import { getSession } from "~/lib/session";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const url = new URL(request.url);
    const query = url.searchParams.get("query");

    if (!query || query.trim().length === 0) {
      return Response.json({ results: [] });
    }

    // Get user ID from session
    const session = await getSession(request.headers.get("Cookie"));
    const userId = session.get("userId");

    if (!userId) {
      return Response.json({ results: [] });
    }

    return Response.json({ results: [] });
  } catch (error) {
    console.error("Error handling search request:", error);
    return Response.json({ error: "Failed to handle search request" }, { status: 500 });
  }
}
