import { redirect } from "react-router";

/** Redirect the one retained legacy game URL to the standalone What app. */
export function loader({ request }: { request: Request }) {
  const url = new URL(request.url);
  const whatOrigin = process.env.WHAT_APP_URL ?? "http://localhost:5173";
  const target = new URL("/", whatOrigin);
  target.search = url.search;
  return redirect(target.toString(), 308);
}

export default function GameLegacyRedirect() {
  return null;
}
