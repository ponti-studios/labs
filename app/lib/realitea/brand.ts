export const realiteaFaviconHref = "/experiments/logo.realitea.png?v=2";

export function realiteaFaviconLinks() {
  return [
    { rel: "icon" as const, href: realiteaFaviconHref, type: "image/png" },
    { rel: "apple-touch-icon" as const, href: realiteaFaviconHref, type: "image/png" },
  ];
}
