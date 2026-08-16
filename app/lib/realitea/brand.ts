export const realiteaFaviconHref = "/experiments/logo.realitea.png?v=2";
export const realiteaManifestHref = "/games/realitea/manifest.webmanifest";

export function realiteaFaviconLinks() {
  return [
    { rel: "icon" as const, href: realiteaFaviconHref, type: "image/png" },
    { rel: "apple-touch-icon" as const, href: realiteaFaviconHref, type: "image/png" },
    { rel: "manifest" as const, href: realiteaManifestHref },
  ];
}
