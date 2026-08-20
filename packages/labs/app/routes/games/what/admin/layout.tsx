import { Outlet } from "react-router";

import { requireWhatAdminMiddleware } from "~/lib/what/admin/auth";

export const middleware = [requireWhatAdminMiddleware];

// Server middleware only runs on client nav when a loader exists on this match.
export function loader() {
  return null;
}

export function meta() {
  return [{ name: "robots", content: "noindex" }];
}

export default function WhatAdminLayout() {
  return <Outlet />;
}
