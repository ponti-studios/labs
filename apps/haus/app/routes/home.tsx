import {
  ContactSection,
  HeroSection,
  ManifestoSection,
  OfferingsSection,
  ProjectsSection,
  SiteNavigation,
} from "../../components/landing";
import { HowWeWorkSection } from "@/components/landing/how-we-work-section";
import { WorkingTogetherSection } from "@/components/landing/working-together-section";
import { PricingSection } from "@/components/landing/pricing-section";
import { CtaSection } from "@/components/landing/cta-section";
import { PageFooter } from "@/components/landing/page-footer";

export default function Home() {
  return (
    <div className="min-h-screen text-foreground">
      <SiteNavigation />
      <HeroSection />
      <OfferingsSection />
      <HowWeWorkSection />
      <WorkingTogetherSection />
      <PricingSection />
      <CtaSection />
      <ProjectsSection />
      <ManifestoSection />
      <ContactSection />
      <PageFooter />
    </div>
  );
}
