import {
  ApproachSection,
  CatalogSection,
  CtaSection,
  FitSection,
  HowWeWorkSection,
  JumpLinks,
  PageFooter,
  PageHero,
  PageNavigation,
  PricingSection,
  WorkingTogetherSection,
} from "../../../components/services-page";

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageNavigation />
      <PageHero />
      <ApproachSection />
      <JumpLinks />
      <CatalogSection />
      <HowWeWorkSection />
      <WorkingTogetherSection />
      <PricingSection />
      <FitSection />
      <CtaSection />
      <PageFooter />
    </div>
  );
}
