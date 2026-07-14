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

export type CaseStat = {
  value: string;
  label: string;
};

export type CaseSnapshot = {
  slug: string;
  client: string;
  industry: string;
  timeline: string;
  role: string;
  problem: string;
  whatWeDid: string;
  approach: readonly string[];
  outcomes: readonly CaseStat[];
  /**
   * Index-only teaser. Short by design — full outcomes live on the case study.
   * value = the number/result; label = 2–4 word gloss.
   */
  listHook: CaseStat;
};

export type ServicePillar = {
  name: string;
  services: ServiceEntry[];
};

const svc = t.catalog.entries;

/** Intentional order: flagship product work first, then advisory/entry. */
export const servicePillars: ServicePillar[] = [
  {
    name: t.common.pillars.product,
    services: [
      { slug: "engineering", ...svc.engineering },
      { slug: "modernization", ...svc.modernization },
      { slug: "product-design", ...svc.productDesign },
      { slug: "fractional-product-management", ...svc.fractionalProductManagement },
    ],
  },
  {
    name: t.common.pillars.advisory,
    services: [
      { slug: "fractional-cto", ...svc.fractionalCto },
      { slug: "technical-due-diligence", ...svc.technicalDueDiligence },
      { slug: "technical-consulting", ...svc.technicalConsulting },
      { slug: "product-strategy", ...svc.productStrategy },
      { slug: "strategy-workshop", ...svc.strategyWorkshop },
    ],
  },
];

export const caseSnapshots: readonly CaseSnapshot[] = t.catalog.proof.snapshots;

export const CONTACT_EMAIL = "hello@ponti.io";
export const BOOK_CALL_URL = `mailto:cj@ponti.io?subject=${encodeURIComponent(
  "Project inquiry - Ponti Studios",
)}&body=${encodeURIComponent(
  "Hi Chase,\n\nI'd like to talk about a project.\n\nHere's what I'm working on:\n",
)}`;
