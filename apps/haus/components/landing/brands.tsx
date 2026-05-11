"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export const brands = [
  {
    name: "General Assembly",
    logo: "/images/companies/general-assembly.png",
    alt: "General Assembly",
    width: 1742,
    height: 1742,
  },
  {
    name: "Humana",
    logo: "/images/companies/humana.png",
    alt: "Humana",
    width: 500,
    height: 200,
  },
  {
    name: "Kensho",
    logo: "/images/companies/kensho.png",
    alt: "Kensho",
    width: 500,
    height: 200,
  },
  {
    name: "Mimecast",
    logo: "/images/companies/mimecast.png",
    alt: "Mimecast",
    width: 1304,
    height: 222,
  },
  {
    name: "Prolog",
    logo: "/images/companies/prolog.png",
    alt: "Prolog",
    width: 3350,
    height: 1050,
  },
  {
    name: "Reuters",
    logo: "/images/companies/reuters.png",
    alt: "Reuters",
    width: 792,
    height: 347,
  },
  {
    name: "StreamYard",
    logo: "/images/companies/streamyard.png",
    alt: "StreamYard",
    width: 500,
    height: 200,
  },
  {
    name: "Whistle",
    logo: "/images/companies/whistle.png",
    alt: "Whistle",
    width: 300,
    height: 156,
  },
  {
    name: "Glow",
    logo: "/images/companies/glow.png",
    alt: "Glow",
    width: 792,
    height: 347,
  },
  {
    name: "You",
    alt: "You",
  },
];

export function BrandLogos() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-8 md:gap-x-14">
      {brands.map((brand, index) => (
        <motion.div
          key={brand.name}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className="flex items-center justify-center opacity-50 grayscale transition-all duration-300 hover:scale-105 hover:opacity-100 hover:grayscale-0"
        >
          {brand.logo ? (
            // Pass real source dimensions so Next.js generates a sharp srcset.
            // CSS then constrains the display to h-10 / max-w-[140px] — the image
            // scales down from its native size rather than being stretched up.
            // dark:brightness-0 dark:invert converts any logo colour to pure white,
            // guaranteeing visibility on dark backgrounds without editing source files.
            <Image
              src={brand.logo}
              alt={brand.alt}
              width={brand.width}
              height={brand.height}
              className="h-10 w-auto max-w-[140px] object-contain dark:brightness-0 dark:invert"
            />
          ) : (
            <span className="font-mono text-sm font-bold text-primary">
              {brand.name}
            </span>
          )}
        </motion.div>
      ))}
    </div>
  );
}

export function Brands() {
  return (
    <motion.section
      className="mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.3 }}
    >
      <div className="max-w-5xl text-center">
        <p className="mb-8 text-xs font-light tracking-wide text-muted-foreground">
          Trusted by distinguished organizations
        </p>
        <BrandLogos />
      </div>
    </motion.section>
  );
}
