"use client";

import { fadeInUp } from "@/utils/animations";
import { motion } from "framer-motion";
import { BabyIcon, LandmarkIcon, LineChartIcon } from "lucide-react";
import { useRef } from "react";

type BusinessStage = {
	type: string;
	title: string;
	subtitle: string;
	icon: React.ReactNode;
	accentColor: string;
	benefits: string[];
};

const businessStages: BusinessStage[] = [
	{
		type: "Emerging",
		title: "Launch Successfully",
		subtitle: "Transform concepts into market-ready products",
		icon: <BabyIcon className="text-primary w-6 h-6" />,
		accentColor: "from-bg-panel-2 to-bg-panel-1",
		benefits: [
			"MVP in 6-8 weeks",
			"User validation",
			"Investor-ready presentations",
		],
	},
	{
		type: "Growing",
		title: "Scale Efficiently",
		subtitle: "Manage growth with proven strategies",
		icon: <LineChartIcon className="text-primary w-6 h-6" />,
		accentColor: "from-bg-panel-0 to-bg-panel-2",
		benefits: [
			"Scalable architecture",
			"Enhanced user experiences",
			"Revenue optimization",
		],
	},
	{
		type: "Established",
		title: "Lead Confidently",
		subtitle: "Innovation that maintains your advantage",
		icon: <LandmarkIcon className="text-primary w-6 h-6" />,
		accentColor: "from-bg-panel-1 to-bg-panel-0",
		benefits: [
			"Enterprise security",
			"System integration",
			"Market innovation",
		],
	},
];

export function Stages() {
	const sectionRef = useRef<HTMLDivElement>(null);

	return (
		<motion.section
			className="relative w-full py-16 lg:py-24"
			ref={sectionRef}
			{...fadeInUp}
		>
			<div className="space-y-8">
				<div className="space-y-4">
					<h2 className="text-4xl md:text-5xl font-bold tracking-tight font-serif text-primary">
						Excellence at Every Stage
					</h2>
					<p className="text-text-secondary text-lg md:text-xl font-light">
						We've partnered with companies at every growth phase. Here's how we
						can help at your stage.
					</p>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					{businessStages.map((stage, index) => (
						<motion.div
							key={stage.type}
							initial={{ opacity: 0, y: 30 }}
							whileInView={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: index * 0.1 }}
							viewport={{ once: true }}
							className="group relative"
						>
							<div className="relative h-full bg-bg-panel-0 border border-border-default rounded-2xl p-4 hover:bg-bg-panel-1 transition-all duration-300 overflow-hidden">
								<div
									className={`absolute inset-0 bg-gradient-to-br ${stage.accentColor} opacity-5 group-hover:opacity-10 transition-opacity duration-300`}
								/>

								<div className="absolute -bottom-4 -right-4 text-8xl font-black text-text-muted/10 group-hover:text-text-muted/15 transition-colors duration-300">
									{index + 1}
								</div>

								<div className="flex flex-col z-10 gap-4">
									<div className="flex items-start">
										<div>
											<div className="flex items-center space-x-3 mb-2">
												<div
													className={`size-10 flex items-center justify-center rounded-full bg-gradient-to-r ${stage.accentColor}`}
												>
													{stage.icon}
												</div>
												<span className="text-sm font-medium text-text-muted uppercase tracking-wider font-sans">
													{stage.type}
												</span>
											</div>
											<h3 className="text-2xl font-bold text-primary mb-1 font-serif">
												{stage.title}
											</h3>
											<p className="text-sm text-text-secondary font-light">
												{stage.subtitle}
											</p>
										</div>
									</div>

									<div className="space-y-2">
										{stage.benefits.map((benefit, benefitIndex) => (
											<motion.div
												key={benefit}
												initial={{ opacity: 0, x: -10 }}
												whileInView={{ opacity: 1, x: 0 }}
												transition={{
													duration: 0.3,
													delay: index * 0.1 + benefitIndex * 0.05,
												}}
												viewport={{ once: true }}
												className="flex items-start space-x-3"
											>
												<div
													className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${stage.accentColor} mt-2 flex-shrink-0`}
												/>
												<span className="text-text-secondary font-light">
													{benefit}
												</span>
											</motion.div>
										))}
									</div>
								</div>
							</div>
						</motion.div>
					))}
				</div>
			</div>
		</motion.section>
	);
}
