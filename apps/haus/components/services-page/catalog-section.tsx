"use client";

import { useTranslations } from "next-intl";
import { SERVICES } from "./data";
import { ServiceSection } from "./service-section";

export function CatalogSection() {
  const t = useTranslations("ServicesPage");

  return (
    <>
      {SERVICES.map((service, i) => (
        <ServiceSection
          key={service.id}
          service={service}
          index={i}
          labels={{
            differentiators: t("serviceLabels.different"),
            process: t("serviceLabels.process"),
            engagement: t("serviceLabels.engagement"),
            duration: t("serviceLabels.duration"),
            team: t("serviceLabels.team"),
            delivery: t("serviceLabels.delivery"),
            investment: t("serviceLabels.investment"),
            perfectFor: t("serviceLabels.perfectFor"),
          }}
        />
      ))}
    </>
  );
}
