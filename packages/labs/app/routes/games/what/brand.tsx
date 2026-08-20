import { Outlet } from "react-router";
import { useEffect } from "react";

import { whatFaviconLinks } from "~/lib/what/brand";

export function links() {
  return whatFaviconLinks();
}

export function meta() {
  return [
    { name: "theme-color", content: "#f5b400" },
    { name: "mobile-web-app-capable", content: "yes" },
    { name: "apple-mobile-web-app-capable", content: "yes" },
    { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
  ];
}

export default function WhatBrand() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    void navigator.serviceWorker.register("/games/what/sw.js", {
      scope: "/games/what/",
    });
  }, []);

  return <Outlet />;
}
