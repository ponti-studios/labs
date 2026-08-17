import { redirect } from "react-router";

export function loader({ request }: { request: Request }) {
  const url = new URL(request.url);
  url.pathname = url.pathname.replace(/^\/games\/realitea(?=\/|$)/, "/games/what");
  return redirect(url.toString(), 308);
}

export default function WhatLegacyRedirect() {
  return null;
}
