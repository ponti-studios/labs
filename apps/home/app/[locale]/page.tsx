import { getTranslations } from "next-intl/server";
import Link from "next/link";

export default async function Home() {
  const t = await getTranslations("Studio");
  const services = t.raw("services.items") as Array<{ title: string; copy: string }>;
  const work = t.raw("work.items") as Array<{ name: string; type: string; blurb: string }>;
  const principles = t.raw("principles.items") as string[];
  const whatWeMake = t.raw("hero.whatWeMake") as string[];

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
            <span className="text-lg font-bold tracking-tight md:text-xl uppercase">
              Ponti Studios
            </span>
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

      <section className="relative flex min-h-screen items-center pt-20">
        <div className="absolute inset-0 opacity-[0.15] [background-image:repeating-linear-gradient(to_right,rgba(255,255,255,0.1)_1px,transparent_1px),repeating-linear-gradient(to_bottom,rgba(255,255,255,0.1)_1px,transparent_1px)] [background-size:56px_56px]" />
        <div className="container relative z-10 py-20 md:py-28">
          <div className="grid gap-14 lg:grid-cols-[1.35fr_0.65fr] lg:items-end">
            <div className="space-y-8">
              <span className="inline-flex border border-border px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                {t("hero.label")}
              </span>
              <h1 className="text-5xl font-normal uppercase tracking-[-0.04em] md:text-7xl lg:text-8xl leading-[0.92]">
                {t("hero.title")}
              </h1>
              <p className="max-w-2xl text-lg md:text-xl leading-relaxed text-muted-foreground">
                {t("hero.description")}
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="#contact"
                  className="rounded-none bg-foreground px-6 py-3 text-sm font-semibold uppercase tracking-wider text-background hover:opacity-90"
                >
                  {t("hero.cta")}
                </Link>
                <Link
                  href="#work"
                  className="rounded-none border border-foreground px-6 py-3 text-sm font-semibold uppercase tracking-wider hover:bg-foreground hover:text-background transition-colors"
                >
                  {t("hero.ctaSecondary")}
                </Link>
              </div>
            </div>

            <div className="rounded-none border border-border bg-muted p-7">
              <div className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground mb-6">
                What we make
              </div>
              <div className="space-y-5">
                {whatWeMake.map((item) => (
                  <div
                    key={item}
                    className="flex items-center justify-between border-b border-border pb-4 text-sm"
                  >
                    <span>{item}</span>
                    <span className="text-muted-foreground">→</span>
                  </div>
                ))}
              </div>
              <div className="mt-8 border border-border bg-accent p-5 text-accent-foreground">
                <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">
                  Operating mode
                </div>
                <div className="text-2xl font-normal leading-tight uppercase tracking-tight">
                  {t("hero.operatingMode")}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="services" className="border-y border-border bg-muted">
        <div className="container py-20 md:py-28">
          <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                Services
              </span>
              <h2 className="mt-3 text-3xl font-normal uppercase tracking-[-0.04em] md:text-5xl">
                {t("services.title")}
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-6 md:text-base text-muted-foreground">
              {t("services.subtitle")}
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {services.map((service) => (
              <div
                key={service.title}
                className="rounded-none border border-border bg-background p-7"
              >
                <div className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground mb-5">
                  {service.title}
                </div>
                <p className="text-lg leading-8 text-foreground">{service.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="work" className="bg-background">
        <div className="container py-20 md:py-28">
          <div className="mb-12 grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                Selected focus
              </span>
              <h2 className="mt-3 text-3xl font-normal uppercase tracking-[-0.04em] md:text-5xl">
                {t("work.title")}
              </h2>
            </div>
            <p className="max-w-2xl text-base leading-7 text-muted-foreground">
              {t("work.subtitle")}
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            {work.map((item) => (
              <div
                key={item.name}
                className="rounded-none border border-border bg-muted p-7 transition-all hover:border-foreground group"
              >
                <div className="flex items-center justify-between mb-12">
                  <span className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                    {item.type}
                  </span>
                  <span className="text-muted-foreground transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </div>
                <div className="text-2xl font-normal uppercase tracking-[-0.03em] mb-4">
                  {item.name}
                </div>
                <p className="text-sm leading-7 text-muted-foreground">{item.blurb}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-foreground text-background">
        <div className="container grid gap-8 py-16 md:py-20 lg:grid-cols-2 lg:items-center">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Principles
            </span>
            <h2 className="mt-3 text-3xl font-normal uppercase tracking-[-0.04em] md:text-5xl text-background">
              {t("principles.title")}
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {principles.map((item) => (
              <div
                key={item}
                className="border border-border bg-background px-5 py-6 text-lg font-normal uppercase"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="bg-background">
        <div className="container py-20 md:py-28">
          <div className="grid gap-10 lg:grid-cols-[1fr_0.8fr]">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                About
              </span>
              <h2 className="mt-3 text-3xl font-normal uppercase tracking-[-0.04em] md:text-5xl">
                {t("about.title")}
              </h2>
            </div>
            <div className="space-y-5 text-base leading-8 text-muted-foreground">
              <p>{t("about.description")}</p>
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="border-t border-border bg-muted">
        <div className="container py-20 md:py-28">
          <div className="rounded-none border border-border bg-background p-8 md:p-12">
            <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
              <div>
                <span className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  Contact
                </span>
                <h2 className="mt-3 max-w-3xl text-3xl font-normal uppercase tracking-[-0.04em] md:text-5xl">
                  {t("contact.title")}
                </h2>
                <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">
                  {t("contact.subtitle")}
                </p>
              </div>
              <div className="flex flex-col gap-4 sm:flex-row lg:justify-end">
                <Link
                  href={`mailto:${t("contact.email")}`}
                  className="rounded-none bg-foreground px-6 py-3 text-center text-sm font-semibold uppercase tracking-wider text-background hover:opacity-90"
                >
                  {t("contact.email")}
                </Link>
                <Link
                  href="https://cal.com/ponti-studios"
                  className="rounded-none border border-foreground px-6 py-3 text-center text-sm font-semibold uppercase tracking-wider hover:bg-foreground hover:text-background transition-colors"
                >
                  {t("contact.bookCall")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

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
