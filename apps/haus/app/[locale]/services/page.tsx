import { SiteNavigation } from "../../../components/landing";
import {
  CatalogSection,
  CtaSection,
  HowWeWorkSection,
  JumpLinks,
  PageFooter,
  PageHero,
  PricingSection,
  WorkingTogetherSection,
} from "../../../components/services-page";

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNavigation />
      <PageHero />
      <JumpLinks />
      <CatalogSection />
      <HowWeWorkSection />
      <WorkingTogetherSection />
      <PricingSection />
      <CtaSection />
      <PageFooter />
    </div>
  );
}
