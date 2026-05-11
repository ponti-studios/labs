import { getTranslations } from "next-intl/server";
import Link from "next/link";
import {
  AboutSection,
  ContactSection,
  HeroSection,
  ManifestoSection,
  ServicesSection,
  StatsStrip,
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
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur-md">
        <div className="container flex items-center justify-between py-3.5">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="grid h-7 w-7 grid-cols-3 grid-rows-3 gap-[2px] transition-opacity group-hover:opacity-70">
              <div className="bg-foreground" />
              <div className="col-span-2 bg-foreground" />
              <div className="bg-transparent" />
              <div className="bg-foreground" />
              <div className="bg-foreground" />
              <div className="col-span-2 bg-foreground" />
              <div className="bg-foreground" />
            </div>
            <span className="text-sm font-semibold tracking-[0.12em] uppercase">
              Ponti Studios
            </span>
          </Link>

          {/* Nav links */}
          <div className="hidden items-center gap-7 md:flex">
            {(["Services", "Work", "About"] as const).map((item) => (
              <Link
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-foreground"
              >
                {item}
              </Link>
            ))}
            <Link
              href="#contact"
              className="border border-foreground/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition-colors hover:bg-foreground hover:text-background"
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

      <ServicesSection
        label={t("services.label")}
        title={t("services.title")}
        subtitle={t("services.subtitle")}
        items={services}
      />

      <WorkSection
        label={t("work.label")}
        title={t("work.title")}
        subtitle={t("work.subtitle")}
        clients={clients}
        venturesLabel={t("ventures.label")}
        venturesTitle={t("ventures.title")}
        venturesSubtitle={t("ventures.subtitle")}
        ventures={ventures}
      />

      <ManifestoSection
        label={t("principles.label")}
        title={t("principles.title")}
        items={principles}
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

      <footer className="border-t border-border/60 bg-background py-10">
        <div className="container flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <p className="text-[0.65rem] uppercase tracking-[0.24em] text-muted-foreground/60">
            © {new Date().getFullYear()} Ponti Studios
          </p>
          <p className="text-[0.65rem] uppercase tracking-[0.24em] text-muted-foreground/40">
            Computational intelligence, delivered.
          </p>
        </div>
      </footer>
    </div>
  );
}
