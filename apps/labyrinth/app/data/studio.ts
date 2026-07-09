import { t } from "~/translations";

export type ServiceEntry = {
  slug: string;
  name: string;
  problem: string;
  description: string;
  deliverables: readonly string[];
  bestFor: string;
  /** Minimum price in dollars, used for sorting and display. */
  minPrice: number;
  unit: string;
};

export type ServicePillar = {
  name: string;
  services: ServiceEntry[];
};

/** Formats a minimum price as an open-ended "starting at" string, e.g. 80000 -> "$80K". */
export function formatMinPrice(minPrice: number): string {
  return minPrice % 1000 === 0 ? `$${minPrice / 1000}K` : `$${minPrice.toLocaleString()}`;
}

export function sortByMinPrice<T extends { minPrice: number }>(entries: T[]): T[] {
  return [...entries].sort((a, b) => a.minPrice - b.minPrice);
}

const svc = t.services.entries;

export const servicePillars: ServicePillar[] = [
  {
    name: t.common.pillars.product,
    services: sortByMinPrice([
      { slug: "engineering", ...svc.engineering, minPrice: 80_000 },
      { slug: "product-design", ...svc.productDesign, minPrice: 25_000 },
      { slug: "fractional-product-management", ...svc.fractionalProductManagement, minPrice: 8_000 },
      { slug: "technical-consulting", ...svc.technicalConsulting, minPrice: 5_000 },
      { slug: "modernization", ...svc.modernization, minPrice: 100_000 },
    ]),
  },
  {
    name: t.common.pillars.content,
    services: sortByMinPrice([
      { slug: "brand-identity", ...svc.brandIdentity, minPrice: 35_000 },
      { slug: "copy-messaging", ...svc.copyMessaging, minPrice: 15_000 },
      { slug: "content-strategy", ...svc.contentStrategy, minPrice: 8_000 },
      { slug: "visual-production", ...svc.visualProduction, minPrice: 5_000 },
    ]),
  },
  {
    name: t.common.pillars.advisory,
    services: sortByMinPrice([
      { slug: "strategy-workshop", ...svc.strategyWorkshop, minPrice: 5_000 },
    ]),
  },
];

export const CONTACT_EMAIL = "hello@ponti.io";
export const BOOK_CALL_URL = "https://cal.com/ponti-studios";
