import { Outlet } from "react-router";

import { requireRealiteaAdminMiddleware } from "~/lib/realitea/admin/auth";

export const middleware = [requireRealiteaAdminMiddleware];

// Server middleware only runs on client nav when a loader exists on this match.
export function loader() {
  return null;
}

export function meta() {
  return [{ name: "robots", content: "noindex" }];
}

export default function RealiteaAdminLayout() {
  return <Outlet />;
}
