import { redirect, type LoaderFunctionArgs } from "react-router";

import { DEFAULT_WHAT_GAME_SLUG } from "../lib/what/generation/catalog";

export function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const defaultSlug = process.env.WHAT_DEFAULT_GAME_SLUG ?? DEFAULT_WHAT_GAME_SLUG;
  throw redirect(`/${defaultSlug}${url.search}`);
}
