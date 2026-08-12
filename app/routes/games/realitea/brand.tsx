import { Outlet } from "react-router";

import { realiteaFaviconLinks } from "~/lib/realitea/brand";

export function links() {
  return realiteaFaviconLinks();
}

export default function RealiteaBrand() {
  return <Outlet />;
}
