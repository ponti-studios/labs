"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const brands = [
	{
		name: "General Assembly",
		logo: "/images/companies/general-assembly.png",
		alt: "General Assembly",
	},
	{
		name: "Humana",
		logo: "/images/companies/humana.png",
		alt: "Humana",
	},
	{
		name: "Kensho",
		logo: "/images/companies/kensho.png",
		alt: "Kensho",
	},
	{
		name: "Mimecast",
		logo: "/images/companies/mimecast.png",
		alt: "Mimecast",
	},
	{
		name: "Prolog",
		logo: "/images/companies/prolog.png",
		alt: "Prolog",
	},
	{
		name: "Reuters",
		logo: "/images/companies/reuters.png",
		alt: "Reuters",
	},
	{
		name: "StreamYard",
		logo: "/images/companies/streamyard.png",
		alt: "StreamYard",
	},
	{
		name: "Whistle",
		logo: "/images/companies/whistle.png",
		alt: "Whistle",
	},
	{
		name: "Glow",
		logo: "/images/companies/glow.png",
		alt: "Glow",
	},
	{
		name: "You",
		alt: "You",
	},
];

export default function Brands() {
	return (
		<motion.section
			className="mx-auto"
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.8, delay: 0.3 }}
		>
			<div className="max-w-5xl text-center">
				<p className="text-text-muted text-xs md:text-base mb-8 font-light tracking-wide">
					Trusted by distinguished organizations
				</p>
				<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8 md:gap-16 items-center justify-center opacity-60 hover:opacity-80 transition-opacity duration-300">
					{brands.map((brand, index) => (
						<motion.div
							key={brand.name}
							initial={{ opacity: 0, scale: 0.8 }}
							animate={{ opacity: 1, scale: 1 }}
							transition={{ duration: 0.5, delay: index * 0.1 }}
							className="flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300 hover:scale-110"
						>
							{brand.logo ? (
								<Image
									src={brand.logo}
									alt={brand.alt}
									width={80}
									height={32}
									className="max-h-8 w-auto object-contain filter brightness-0 opacity-50 hover:opacity-70 transition-opacity duration-300"
								/>
							) : (
								<div className="max-h-8 w-auto object-contain text-primary opacity-50 hover:opacity-70 transition-opacity duration-300 font-mono font-bold">
									{brand.name}
								</div>
							)}
						</motion.div>
					))}
				</div>
			</div>
		</motion.section>
	);
}
