import { Outlet } from "react-router";
import { useEffect } from "react";

import { realiteaFaviconLinks } from "~/lib/realitea/brand";

export function links() {
  return realiteaFaviconLinks();
}

export function meta() {
  return [
    { name: "theme-color", content: "#f5b400" },
    { name: "mobile-web-app-capable", content: "yes" },
    { name: "apple-mobile-web-app-capable", content: "yes" },
    { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
  ];
}

export default function RealiteaBrand() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    void navigator.serviceWorker.register("/games/realitea/sw.js", {
      scope: "/games/realitea",
    });
  }, []);

  return <Outlet />;
}
