import { Section } from "@/components/landing/section";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

export default async function About() {
	const t = await getTranslations("About");

	return (
		<Section>
			<h2 className="text-sm font-bold tracking-[0.2em] uppercase text-text-muted mb-12 text-center font-mono">
				{t("title")}
			</h2>

			<div className="space-y-10 text-lg md:text-2xl font-mono text-primary leading-relaxed text-center uppercase tracking-tighter">
				<p className="max-w-4xl mx-auto">{t("p1")}</p>
				<p className="max-w-4xl mx-auto">{t("p2")}</p>
				<p className="max-w-4xl mx-auto text-text-muted">{t("p3")}</p>
			</div>

			<div className="pt-16 flex justify-center">
				<Link
					href="mailto:hello@ponti.io"
					className="text-base font-mono font-bold uppercase tracking-[0.2em] border-b border-primary pb-1 hover:bg-primary hover:text-bg-panel-0 transition-all px-4 py-2"
				>
					{t("cta")}
				</Link>
			</div>
		</Section>
	);
}
