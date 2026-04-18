import { Section } from "@/components/landing/section";
import { ArrowDown } from "lucide-react";
import { getTranslations } from "next-intl/server";

export default async function Hero() {
	const t = await getTranslations("Hero");

	return (
		<Section className="min-h-[90vh] relative">
			<div className="flex flex-col items-center text-center gap-12 pt-20">
				<div className="max-w-2xl mx-auto space-y-6">
					<p className="text-lg md:text-xl font-mono text-text-secondary leading-relaxed uppercase tracking-tight">
						{t("description")}
					</p>
				</div>
			</div>

			<div className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-bounce opacity-30">
				<ArrowDown className="w-5 h-5 text-primary" />
			</div>
		</Section>
	);
}
