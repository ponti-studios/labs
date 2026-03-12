import About from "@/components/landing/about";
import Hero from "@/components/landing/hero";
import { Section } from "@/components/landing/section";
import Services from "@/components/landing/services";
import { getTranslations } from "next-intl/server";

export default async function Home() {
	const t = await getTranslations("Footer");

	return (
		<>
			<Hero />
			<Services />
			<About />

			<Section className="py-12 border-t border-border-default mt-12 opacity-50">
				<p className="font-mono text-sm uppercase tracking-widest text-text-muted">
					{t("rights", { year: new Date().getFullYear() })}
				</p>
			</Section>
		</>
	);
}
