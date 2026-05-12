import { SiteNavigation } from "../../../components/landing";
import {
  CtaSection,
  HowWeWorkSection,
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
      <HowWeWorkSection />
      <WorkingTogetherSection />
      <PricingSection />
      <CtaSection />
      <PageFooter />
    </div>
  );
}
