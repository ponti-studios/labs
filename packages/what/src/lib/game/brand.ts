export const gameFaviconHref = "/experiments/logo.what.png?v=2";
export const gameManifestHref = "/games/game/manifest.webmanifest";

export function gameFaviconLinks() {
  return [
    { rel: "icon" as const, href: gameFaviconHref, type: "image/png" },
    { rel: "apple-touch-icon" as const, href: gameFaviconHref, type: "image/png" },
    { rel: "manifest" as const, href: gameManifestHref },
  ];
}
