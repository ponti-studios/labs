import {
  ContactSection,
  HeroSection,
  ManifestoSection,
  OfferingsSection,
  ProjectsSection,
  SiteFooter,
  SiteNavigation,
} from "../../components/landing";

export default async function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNavigation />

      <HeroSection />

      <OfferingsSection />

      <ProjectsSection />

      <ManifestoSection />

      <ContactSection />

      <SiteFooter />
    </div>
  );
}
