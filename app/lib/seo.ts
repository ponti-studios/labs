import type { MetaDescriptor } from "react-router";

export const SITE_URL = "https://ponti.io";
const SITE_NAME = "Ponti Studios";
const DEFAULT_IMAGE = `${SITE_URL}/og.png`;

type PageMetaInput = {
  title: string;
  description: string;
  /** Path on this site, starting with "/". */
  path: string;
  /** Absolute URL of a 1200x630 image. Defaults to the site card. */
  image?: string;
};

/**
 * Title, description, canonical link, and Open Graph / Twitter tags for a route.
 * Without these, shared links render as a bare URL with no preview card.
 */
export function pageMeta({
  title,
  description,
  path,
  image = DEFAULT_IMAGE,
}: PageMetaInput): MetaDescriptor[] {
  const url = `${SITE_URL}${path === "/" ? "" : path}`;
  return [
    { title },
    { name: "description", content: description },
    { tagName: "link", rel: "canonical", href: url },
    { property: "og:site_name", content: SITE_NAME },
    { property: "og:type", content: "website" },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:url", content: url },
    { property: "og:image", content: image },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: image },
  ];
}
