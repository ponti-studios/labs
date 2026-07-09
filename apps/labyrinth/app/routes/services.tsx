import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@pontistudios/ui";
import { HelpCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router";
import { servicePillars } from "~/data/studio";
import { t } from "~/translations";

export function meta(): Array<{
  title?: string;
  name?: string;
  content?: string;
}> {
  return [
    { title: t.services.meta.title },
    { name: "description", content: t.services.meta.description },
  ];
}

const overview = t.services.overview;

const ALL_SERVICE_SLUGS = servicePillars.flatMap((pillar) =>
  pillar.services.map((service) => service.slug),
);

function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="ui-eyebrow">{eyebrow}</span>
      <h2 className="heading-2 text-foreground">{title}</h2>
    </div>
  );
}

export default function Services() {
  const location = useLocation();
  const [openServices, setOpenServices] = useState<string[]>([]);

  useEffect(() => {
    const slug = location.hash.replace(/^#/, "");
    if (slug && ALL_SERVICE_SLUGS.includes(slug)) {
      setOpenServices((prev) => (prev.includes(slug) ? prev : [...prev, slug]));
    }
  }, [location.hash]);

  return (
    <div className="flex w-full flex-col">
      {/* 1. Services — scan, expand only for includes */}
      <section
        id="services-overview"
        className="border-border/60 flex flex-col gap-6 border-b py-16"
      >
        <SectionHeading eyebrow={overview.eyebrow} title={overview.title} />
        <div className="flex flex-col gap-10">
          {servicePillars.map((pillar) => (
            <div key={pillar.name} className="flex flex-col gap-3">
              <h3 className="heading-4 text-foreground">{pillar.name}</h3>
              <Accordion
                type="multiple"
                value={openServices.filter((slug) =>
                  pillar.services.some((service) => service.slug === slug),
                )}
                onValueChange={(value) => {
                  const pillarSlugs = pillar.services.map((service) => service.slug);
                  setOpenServices((prev) => [
                    ...prev.filter((slug) => !pillarSlugs.includes(slug)),
                    ...value,
                  ]);
                }}
              >
                {pillar.services.map((service) => (
                  <AccordionItem key={service.slug} value={service.slug} id={service.slug}>
                    <AccordionTrigger className="text-left">
                      <span className="subheading-3 text-foreground">{service.name}</span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="flex flex-col gap-2">
                        {service.deliverables.map((item) => (
                          <li key={item.label} className="ui-dash-list-item">
                            <span className="ui-dash-marker">—</span>
                            <span className="body-2 text-muted-foreground">
                              <span className="text-foreground font-medium">{item.label}:</span>{" "}
                              {item.description}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>
      </section>

      <section className="border-border/60 flex flex-wrap items-center justify-between gap-4 border-b py-6">
        <p className="body-2 text-muted-foreground">{t.services.proof.title}</p>
        <Link
          to="/work"
          className="body-2 text-foreground hover:text-muted-foreground underline-offset-4 hover:underline"
        >
          {t.services.proof.eyebrow}
        </Link>
      </section>

      <section className="flex items-center justify-between py-6">
        <p className="body-2 text-muted-foreground">{t.faq.title}</p>
        <Link
          to="/faq"
          className="body-2 text-foreground hover:text-muted-foreground flex items-center gap-2"
        >
          <HelpCircle className="size-4" aria-hidden="true" />
          {t.faq.eyebrow}
        </Link>
      </section>
    </div>
  );
}
