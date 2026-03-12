"use client";

import { motion } from "framer-motion";
import { ChartLineIcon, ChartNetwork, ShieldCheck } from "lucide-react";
import { fadeInUp } from "../../utils/animations";

const features = [
	{
		title: "Expert Team",
		description:
			"Work with seasoned product strategists, designers, and engineers who have delivered successful products for companies like yours.",
		icon: ShieldCheck,
		color: "from-bg-panel-2 to-bg-panel-1",
		number: "01",
	},
	{
		title: "Proven Process",
		description:
			"Our tested methodology ensures on-time delivery, clear communication, and consistently exceptional results that exceed expectations.",
		icon: ChartNetwork,
		color: "from-bg-panel-1 to-bg-panel-0",
		number: "02",
	},
	{
		title: "Guaranteed Results",
		description:
			"We deliver exceptional products on time and within budget, with performance guarantees built into every partnership.",
		icon: ChartLineIcon,
		color: "from-bg-panel-0 to-bg-panel-2",
		number: "03",
	},
];

export const StudioAbout = () => {
	return (
		<motion.div className="w-full my-12 sm:my-16" {...fadeInUp}>
			<div className="space-y-4 mb-12 text-center md:text-left">
				<h2 className="text-4xl md:text-5xl font-bold tracking-tight text-primary font-serif">
					Why Choose Ponti Studios
				</h2>
				<p className="text-text-secondary text-lg md:text-xl max-w-2xl font-light">
					We're a global team of product strategists, designers, and engineers
					who specialize in
					<span className="italic underline mx-1 underline-offset-4 text-primary font-medium">
						human-centered design
					</span>
					and data-driven development to solve complex business challenges.
				</p>
			</div>

			<div className="block md:hidden">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
					className="relative"
				>
					<div className="overflow-hidden bg-bg-panel-0 border border-border-default rounded-xl p-6 hover:bg-bg-panel-1 transition-all duration-300 hover:shadow-xl relative group">
						<div
							className="text-6xl font-black text-text-muted/10 absolute -bottom-2 right-2 group-hover:text-text-muted/15 transition-colors duration-300 font-serif"
							aria-hidden="true"
						>
							PONTI
						</div>

						<div
							className="h-2 w-32 rounded-full bg-gradient-to-r from-bg-panel-2 via-bg-panel-1 to-bg-panel-0 mb-8"
							aria-hidden="true"
						/>

						<div className="mb-8 z-10 relative">
							<h3 className="text-2xl font-bold text-primary mb-3 font-serif">
								Our Distinction
							</h3>
							<p className="text-text-secondary text-sm leading-relaxed font-light">
								Three core principles that set us apart from conventional
								agencies.
							</p>
						</div>

						<div className="space-y-6 z-10 relative">
							{features.map((feature, index) => {
								const IconComponent = feature.icon;
								return (
									<motion.div
										key={feature.title}
										initial={{ opacity: 0, x: -20 }}
										animate={{ opacity: 1, x: 0 }}
										transition={{ duration: 0.4, delay: index * 0.1 }}
										className="space-y-3"
									>
										<div className="flex items-center space-x-3">
											<div className="size-8 flex items-center justify-center rounded-full bg-bg-panel-2 flex-shrink-0">
												<IconComponent size={16} className="text-primary" />
											</div>
											<h4 className="text-lg font-semibold text-primary font-serif">
												{feature.title}
											</h4>
										</div>

										<p className="text-text-secondary text-sm leading-relaxed ml-11 font-light">
											{feature.description}
										</p>
									</motion.div>
								);
							})}
						</div>
					</div>
				</motion.div>
			</div>

			<div className="hidden md:grid grid-cols-1 gap-6 md:grid-cols-3">
				{features.map((feature, index) => {
					const IconComponent = feature.icon;
					return (
						<motion.div
							key={feature.title}
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
									{feature.number}
								</div>

								<div
									className={`h-2 w-24 rounded-full bg-gradient-to-r ${feature.color} mb-6`}
									aria-hidden="true"
								/>

								<div className="flex items-center mb-4 z-10 relative">
									<div className="size-8 flex items-center justify-center rounded-full bg-bg-panel-2 mr-3">
										<IconComponent size={20} className="text-primary" />
									</div>
									<h3 className="text-xl font-semibold text-primary font-serif">
										{feature.title}
									</h3>
								</div>

								<p className="text-text-secondary z-10 leading-relaxed relative font-light">
									{feature.description}
								</p>
							</div>
						</motion.div>
					);
				})}
			</div>
		</motion.div>
	);
};
