"use client";

import { fadeInUp } from "@/utils/animations";
import { motion } from "framer-motion";
import { Brain, Rocket, Sparkles, Search } from "lucide-react";

const steps = [
	{
		title: "Discovery",
		desc: "Learn the highest-impact opportunities based on true user demand.",
		color: "from-bg-panel-2 to-bg-panel-1",
		icon: Search,
		number: "01",
	},
	{
		title: "Strategy",
		desc: "Get a roadmap to higher revenue and user loyalty.",
		color: "from-bg-panel-1 to-bg-panel-0",
		icon: Brain,
		number: "02",
	},
	{
		title: "Development",
		desc: "Get the features users will love. Fast.",
		color: "from-bg-panel-0 to-bg-panel-2",
		icon: Rocket,
		number: "03",
	},
	{
		title: "Launch",
		desc: "Optimize with real data to maximize ROI and growth.",
		color: "from-bg-panel-2 to-bg-panel-0",
		icon: Sparkles,
		number: "04",
	},
];

export const StudioProcess = () => {
	return (
		<motion.div className="w-full my-12 sm:my-16" {...fadeInUp}>
			<div className="space-y-4 mb-12 text-center md:text-left">
				<h2 className="text-4xl md:text-5xl font-bold tracking-tight text-primary font-serif">
					Our Process
				</h2>
				<p className="text-text-secondary text-lg md:text-xl max-w-2xl font-light">
					Turn your vision into a profitable, user-loved product.
				</p>
			</div>

			<div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
				{steps.map((step, index) => (
					<motion.div
						key={step.title}
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: index * 0.1 }}
						className="relative"
					>
						<div className="overflow-hidden bg-bg-panel-0 border border-border-default rounded-xl p-6 h-full flex flex-col hover:bg-bg-panel-1 transition-all duration-300 hover:shadow-xl relative group">
							<div
								className="text-8xl font-black text-text-muted/10 absolute -bottom-4 right-1 group-hover:text-text-muted/15 transition-colors duration-300"
								aria-hidden="true"
							>
								{step.number}
							</div>

							<div
								className={`h-2 w-24 rounded-full bg-gradient-to-r ${step.color} mb-6`}
								aria-hidden="true"
							/>

							<div className="flex items-center mb-4 z-10 relative">
								<step.icon className="w-6 h-6 mr-3 text-primary" />
								<h3 className="text-xl font-semibold text-primary font-serif">
									{step.title}
								</h3>
							</div>

							<p className="text-text-secondary z-10 leading-relaxed relative font-light">
								{step.desc}
							</p>
						</div>
					</motion.div>
				))}
			</div>
		</motion.div>
	);
};
