"use client";

import { useTranslations } from "@/i18n/client";
import { useState } from "react";
import { AccordionRow } from "./ui/accordion-row";
import { FIT_GOOD_FOR, FIT_NOT_RIGHT, TOGETHER_GAINS, TOGETHER_NEEDS } from "./data";

interface TogetherItem {
  title: string;
  description: string;
}

function TogetherCard({
  title,
  items,
  openIndex,
  onToggle,
}: {
  title: string;
  items: TogetherItem[];
  openIndex: number | null;
  onToggle: (index: number) => void;
}) {
  return (
    <div className="card overflow-hidden p-0">
      <div className="px-7 pt-7">
        <p className="eyebrow">{title}</p>
      </div>

      <div className="px-7 pb-2">
        {items.map((item, index) => (
          <AccordionRow
            key={item.title}
            index={index}
            isOpen={openIndex === index}
            onToggleAction={() => onToggle(index)}
            title={item.title}
          >
            <p className="text-sm leading-6 text-muted-foreground">{item.description}</p>
          </AccordionRow>
        ))}
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
  const [openNeedIndex, setOpenNeedIndex] = useState<number | null>(null);
  const [openGainIndex, setOpenGainIndex] = useState<number | null>(null);

  return (
    <section className="border-b border-border">
      <div className="container py-20 md:py-28">
        <span className="eyebrow">{t("together.eyebrow")}</span>
        <h2 className="section-heading">{t("together.title")}</h2>

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          <TogetherCard
            title={t("together.needTitle")}
            items={TOGETHER_NEEDS}
            openIndex={openNeedIndex}
            onToggle={(index) => setOpenNeedIndex(openNeedIndex === index ? null : index)}
          />

          <TogetherCard
            title={t("together.getTitle")}
            items={TOGETHER_GAINS}
            openIndex={openGainIndex}
            onToggle={(index) => setOpenGainIndex(openGainIndex === index ? null : index)}
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
