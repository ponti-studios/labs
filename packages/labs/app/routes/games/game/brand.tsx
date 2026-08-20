import { Outlet } from "react-router";
import { useEffect } from "react";

import { gameFaviconLinks } from "~/lib/game/brand";

export function links() {
  return gameFaviconLinks();
}

export function meta() {
  return [
    { name: "theme-color", content: "#f5b400" },
    { name: "mobile-web-app-capable", content: "yes" },
    { name: "apple-mobile-web-app-capable", content: "yes" },
    { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
  ];
}

export default function GameBrand() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    void navigator.serviceWorker.register("/games/game/sw.js", {
      scope: "/games/game/",
    });
  }, []);

  return <Outlet />;
}
