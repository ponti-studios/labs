import { Section } from "@/components/landing/section";
import { getTranslations } from "next-intl/server";

const SERVICE_KEYS = ["strategy", "llm", "agentic", "data"] as const;

export default async function Services() {
	const t = await getTranslations("Services");

	return (
		<Section>
			<h2 className="text-sm font-bold tracking-[0.2em] uppercase text-text-muted mb-12 text-center font-mono">
				{t("title")}
			</h2>

			<div className="flex flex-col gap-0 w-full">
				{SERVICE_KEYS.map((key) => (
					<div
						key={key}
						className="group flex flex-col md:flex-row md:items-center justify-between gap-4 py-10 border-b border-border-default last:border-0 hover:bg-bg-panel-2 transition-all px-6 cursor-default"
					>
						<h3 className="text-2xl md:text-4xl font-mono font-bold text-primary group-hover:translate-x-2 transition-transform uppercase">
							{t(`items.${key}.title`)}
						</h3>

						<p className="text-text-muted font-mono text-sm md:text-right max-w-sm uppercase leading-relaxed">
							{t(`items.${key}.description`)}
						</p>
					</div>
				))}
			</div>
		</Section>
	);
}
