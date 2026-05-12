import type { Route } from "./+types/services";
import { SiteNavigation } from "../../components/landing";
import {
  CtaSection,
  HowWeWorkSection,
  PageFooter,
  PageHero,
  PricingSection,
  WorkingTogetherSection,
} from "../../components/services-page";

export const meta: Route.MetaFunction = () => [
  { title: "Services | Ponti Studios" },
  {
    name: "description",
    content: "Services that ship excellence for entrepreneurs and early-stage startups.",
  },
];

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNavigation />
      <PageHero />
      <HowWeWorkSection />
      <WorkingTogetherSection />
      <PricingSection />
      <CtaSection />
      <PageFooter />
    </div>
  );
}
