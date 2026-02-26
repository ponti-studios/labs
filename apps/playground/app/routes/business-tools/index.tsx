import { Link } from "react-router";
import { PageHeader, PageSection, FeatureCard, GridSection, InfoBox } from "~/components/void-components";

const businessTools = [
	{
		name: "Marketing Spend Calculator",
		path: "/business-tools/marketing",
		description: "Calculate ad spending needed to reach attendee goals",
		icon: "[MKT]",
	},
	{
		name: "Runway Planner",
		path: "/business-tools/runway",
		description: "Forecast your business runway and financial projections",
		icon: "[RWY]",
	},
];

export default function BusinessToolsHub() {
	return (
		<div className="min-h-screen bg-black text-white font-mono">
			<div className="w-full max-w-6xl mx-auto px-4 py-8 md:py-12 space-y-12">
				<PageHeader
					title="Business Tools"
					description="Financial calculators and business analytics tools"
				/>

				<PageSection>
					<GridSection cols={2}>
						{businessTools.map((tool) => (
							<Link key={tool.path} to={tool.path}>
								<FeatureCard
									title={tool.name}
									description={tool.description}
									icon={tool.icon}
								/>
							</Link>
						))}
					</GridSection>
				</PageSection>

				<PageSection title="Business Analytics">
					<InfoBox>
						These tools help you make data-driven business decisions. Calculate marketing ROI,
						forecast your financial runway, and plan growth strategies with confidence.
					</InfoBox>
				</PageSection>
			</div>
		</div>
	);
}
