import { getTranslations } from "next-intl/server";
import Link from "next/link";
import {
  AboutSection,
  Brands,
  ContactSection,
  HeroSection,
  ManifestoSection,
  StatsStrip,
  VenturesSection,
  WorkSection,
} from "../../components/landing";

export default async function Home() {
  const t = await getTranslations("Studio");
  const services = t.raw("services.items") as Array<{ title: string; copy: string }>;
  const clients = t.raw("work.clients") as Array<{
    name: string;
    type: string;
    metric: string;
    metricLabel: string;
    blurb: string;
  }>;
  const principles = t.raw("principles.items") as Array<{ title: string; description: string }>;
  const ventures = t.raw("ventures.items") as Array<{
    name: string;
    description: string;
    status: string;
  }>;
  const stats = t.raw("stats") as {
    clients: { value: string; label: string };
    arr: { value: string; label: string };
    reduction: { value: string; label: string };
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 grid-cols-3 grid-rows-3 gap-0.5">
              <div className="bg-foreground" />
              <div className="col-span-2 bg-foreground" />
              <div className="bg-transparent" />
              <div className="bg-foreground" />
              <div className="bg-foreground" />
              <div className="col-span-2 bg-foreground" />
              <div className="bg-foreground" />
            </div>
            <span className="text-lg font-bold tracking-tight uppercase">Ponti Studios</span>
          </div>

          <div className="hidden items-center gap-8 text-sm font-medium md:flex">
            <Link href="#services" className="transition-opacity hover:opacity-60">
              Services
            </Link>
            <Link href="#work" className="transition-opacity hover:opacity-60">
              Work
            </Link>
            <Link href="#about" className="transition-opacity hover:opacity-60">
              About
            </Link>
            <Link
              href="#contact"
              className="rounded-none border border-foreground px-4 py-2 uppercase tracking-wider hover:bg-foreground hover:text-background transition-colors"
            >
              Contact
            </Link>
          </div>
        </div>
      </nav>

      <HeroSection
        title={t("hero.title")}
        description={t("hero.description")}
        cta={t("hero.cta")}
        ctaSecondary={t("hero.ctaSecondary")}
      />

      <StatsStrip clients={stats.clients} arr={stats.arr} reduction={stats.reduction} />

      <div className="bg-white border-b border-border py-12">
        <div className="container">
          <Brands />
        </div>
      </div>

      <WorkSection
        servicesLabel={t("services.label")}
        servicesTitle={t("services.title")}
        servicesSubtitle={t("services.subtitle")}
        servicesItems={services}
        workLabel={t("work.label")}
        workTitle={t("work.title")}
        workSubtitle={t("work.subtitle")}
        clients={clients}
      />

      <ManifestoSection
        label={t("principles.label")}
        title={t("principles.title")}
        items={principles}
      />

      <VenturesSection
        label={t("ventures.label")}
        title={t("ventures.title")}
        subtitle={t("ventures.subtitle")}
        items={ventures}
      />

      <AboutSection
        label={t("about.label")}
        title={t("about.title")}
        description={t("about.description")}
        antiposition={t("about.antiposition")}
      />

      <ContactSection
        label={t("contact.label")}
        title={t("contact.title")}
        subtitle={t("contact.subtitle")}
        promise={t("contact.promise")}
        email={t("contact.email")}
        bookCall={t("contact.bookCall")}
      />

      <footer className="border-t border-border bg-background py-12">
        <div className="container">
          <p className="text-sm uppercase tracking-widest text-muted-foreground">
            © {new Date().getFullYear()} Ponti Studios. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
