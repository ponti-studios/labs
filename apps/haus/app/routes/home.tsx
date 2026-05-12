import {
  ContactSection,
  HeroSection,
  ManifestoSection,
  ProjectsSection,
  SiteNavigation,
} from "../../components/landing";
import { JumpLinks } from "@/components/landing/jump-links";
import { CatalogSection } from "@/components/landing/catalog-section";
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
      <JumpLinks />
      <CatalogSection />
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
