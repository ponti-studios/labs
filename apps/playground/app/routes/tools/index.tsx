import { Link } from "react-router";
import { PageHeader, PageSection, FeatureCard, GridSection, Callout } from "~/components/void-components";

interface Feature {
	title: string;
	description: string;
	path: string;
	icon: string;
}

const features: Feature[] = [
	{
		title: "Games & Recreation",
		description: "Interactive games and creative experiments",
		path: "/games/tetris",
		icon: "[::GAME::]",
	},
	{
		title: "Algorithms Explorer",
		description: "Learn sorting, searching, and data structures",
		path: "/algorithms",
		icon: "[ALGO]",
	},
	{
		title: "Problem Solver",
		description: "Interactive coding problems and solutions",
		path: "/problems",
		icon: "[PROB]",
	},
	{
		title: "Business Tools",
		description: "Finance, marketing, and analytics calculators",
		path: "/business-tools",
		icon: "[TOOL]",
	},
	{
		title: "AI Playground",
		description: "LLM prompts and AI-powered tools",
		path: "/ai-playground",
		icon: "[::AI::]",
	},
];

export default function ToolsHub() {
	return (
		<div className="min-h-screen bg-black text-white font-mono">
			<div className="w-full max-w-6xl mx-auto px-4 py-8 md:py-12 space-y-12">
				<PageHeader
					title="Tools & Features"
					description="A collection of interactive tools, games, and learning resources"
				/>

				<PageSection>
					<GridSection cols={3}>
						{features.map((feature) => (
							<Link key={feature.path} to={feature.path}>
								<FeatureCard
									title={feature.title}
									description={feature.description}
									icon={feature.icon}
								/>
							</Link>
						))}
					</GridSection>
				</PageSection>

				<PageSection title="What's New">
					<div className="space-y-3">
						<Callout type="info">
							<strong>[TETRIS]</strong> Play classic Tetris with modern React patterns
						</Callout>
						<Callout type="info">
							<strong>[ALGORITHMS]</strong> Learn sorting and searching algorithms with visual demonstrations
						</Callout>
						<Callout type="info">
							<strong>[PROBLEMS]</strong> Solve coding challenges with test cases
						</Callout>
						<Callout type="info">
							<strong>[BUSINESS]</strong> Marketing calculators and financial planning tools
						</Callout>
						<Callout type="info">
							<strong>[AI]</strong> Test LLM prompts and AI tools
						</Callout>
					</div>
				</PageSection>
			</div>
		</div>
	);
}
