import { t } from "~/translations";

export type ServiceDeliverable = {
  label: string;
  description: string;
};

export type ServiceEntry = {
  slug: string;
  name: string;
  deliverables: readonly ServiceDeliverable[];
};

export type CaseSnapshot = {
  slug: string;
  client: string;
  industry: string;
  problem: string;
  whatWeDid: string;
  outcomes: readonly string[];
  services: readonly string[];
};

export type ServicePillar = {
  name: string;
  services: ServiceEntry[];
};

const svc = t.services.entries;

/** Intentional order: flagship product work first, then advisory/entry. */
export const servicePillars: ServicePillar[] = [
  {
    name: t.common.pillars.product,
    services: [
      { slug: "engineering", ...svc.engineering },
      { slug: "modernization", ...svc.modernization },
      { slug: "product-design", ...svc.productDesign },
      { slug: "fractional-product-management", ...svc.fractionalProductManagement },
      { slug: "technical-consulting", ...svc.technicalConsulting },
    ],
  },
  {
    name: t.common.pillars.content,
    services: [
      { slug: "brand-identity", ...svc.brandIdentity },
      { slug: "copy-messaging", ...svc.copyMessaging },
      { slug: "content-strategy", ...svc.contentStrategy },
      { slug: "visual-production", ...svc.visualProduction },
    ],
  },
  {
    name: t.common.pillars.advisory,
    services: [{ slug: "strategy-workshop", ...svc.strategyWorkshop }],
  },
];

export const caseSnapshots: readonly CaseSnapshot[] = t.services.proof.snapshots;

export const trustNames: readonly string[] = t.services.trust.names;

export const CONTACT_EMAIL = "hello@ponti.io";
export const BOOK_CALL_URL = "https://cal.com/ponti-studios";
