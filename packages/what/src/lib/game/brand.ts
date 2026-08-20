export const gameFaviconHref = "/games/game/icons/icon-512.png";
export const gameAppleTouchIconHref = "/games/game/apple-touch-icon.png";
export const gameManifestHref = "/games/game/manifest.webmanifest";

export function gameFaviconLinks() {
  return [
    { rel: "icon" as const, href: gameFaviconHref, type: "image/png" },
    {
      rel: "apple-touch-icon" as const,
      href: gameAppleTouchIconHref,
      type: "image/png",
    },
    { rel: "manifest" as const, href: gameManifestHref },
  ];
}
