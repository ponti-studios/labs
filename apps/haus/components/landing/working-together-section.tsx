"use client";

import { useTranslations } from "@/i18n/client";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@pontistudios/ui";
import { useState } from "react";
import { FIT_GOOD_FOR, FIT_NOT_RIGHT, TOGETHER_GAINS, TOGETHER_NEEDS } from "./data";

interface TogetherItem {
  title: string;
  description: string;
}

function TogetherCard({
  title,
  items,
  openItem,
  onOpenChange,
}: {
  title: string;
  items: TogetherItem[];
  openItem: string | null;
  onOpenChange: (value: string | null) => void;
}) {
  return (
    <div className="card overflow-hidden p-0">
      <div className="px-7 pt-7">
        <p className="eyebrow">{title}</p>
      </div>

      <div className="px-7 pb-2">
        <Accordion
          type="single"
          collapsible
          value={openItem ?? undefined}
          onValueChange={(value) => onOpenChange(value || null)}
        >
          {items.map((item, index) => {
            const value = `item-${index}`;

            return (
              <AccordionItem key={item.title} value={value}>
                <AccordionTrigger index={index}>{item.title}</AccordionTrigger>
                <AccordionContent>
                  <p className="text-sm leading-6 text-muted-foreground">{item.description}</p>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>
    </div>
  );
}

function FitCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="card">
      <p className="mb-5 eyebrow">{title}</p>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item} className="dash-list-item">
            <span className="dash">—</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function WorkingTogetherSection() {
  const t = useTranslations("ServicesPage");
  const [openNeedItem, setOpenNeedItem] = useState<string | null>(null);
  const [openGainItem, setOpenGainItem] = useState<string | null>(null);

  return (
    <section className="border-b border-border">
      <div className="container py-20 md:py-28">
        <span className="eyebrow">{t("together.eyebrow")}</span>
        <h2 className="section-heading">{t("together.title")}</h2>

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          <TogetherCard
            title={t("together.needTitle")}
            items={TOGETHER_NEEDS}
            openItem={openNeedItem}
            onOpenChange={setOpenNeedItem}
          />

          <TogetherCard
            title={t("together.getTitle")}
            items={TOGETHER_GAINS}
            openItem={openGainItem}
            onOpenChange={setOpenGainItem}
          />
        </div>

        <div className="mt-20 border-t border-border pt-20">
          <span className="eyebrow">{t("fit.eyebrow")}</span>
          <h2 className="section-heading">{t("fit.title")}</h2>

          <div className="mt-12 grid gap-5 md:grid-cols-2">
            <FitCard title={t("fit.goodForTitle")} items={FIT_GOOD_FOR} />
            <FitCard title={t("fit.notRightTitle")} items={FIT_NOT_RIGHT} />
          </div>
        </div>
      </div>
    </section>
  );
}
