export const whatFaviconHref = "/experiments/logo.what.png?v=2";
export const whatManifestHref = "/games/what/manifest.webmanifest";

export function whatFaviconLinks() {
  return [
    { rel: "icon" as const, href: whatFaviconHref, type: "image/png" },
    { rel: "apple-touch-icon" as const, href: whatFaviconHref, type: "image/png" },
    { rel: "manifest" as const, href: whatManifestHref },
  ];
}
