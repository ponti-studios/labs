import { Link } from "react-router";
import { PageHeader, PageSection, FeatureCard, GridSection, InfoBox } from "~/components/void-components";

const algorithms = [
	{
		name: "Binary Search",
		path: "/algorithms/binary-search",
		description: "O(log n) search algorithm for sorted arrays",
		icon: "[BIN]",
	},
	{
		name: "Selection Sort",
		path: "/algorithms/selection-sort",
		description: "O(n²) sorting algorithm",
		icon: "[SORT]",
	},
	{
		name: "Stacks",
		path: "/algorithms/stacks",
		description: "LIFO data structure with palindrome checker",
		icon: "[STACK]",
	},
];

export default function AlgorithmsExplorer() {
	return (
		<div className="min-h-screen bg-black text-white font-mono">
			<div className="w-full max-w-6xl mx-auto px-4 py-8 md:py-12 space-y-12">
				<PageHeader
					title="Algorithms Explorer"
					description="Learn fundamental algorithms with interactive demonstrations"
				/>

				<PageSection>
					<GridSection cols={3}>
						{algorithms.map((algo) => (
							<Link key={algo.path} to={algo.path}>
								<FeatureCard
									title={algo.name}
									description={algo.description}
									icon={algo.icon}
								/>
							</Link>
						))}
					</GridSection>
				</PageSection>

				<PageSection title="About Algorithms">
					<InfoBox>
						Algorithms are step-by-step procedures for solving a problem or accomplishing a task. Understanding fundamental algorithms is essential for competitive programming and technical interviews.
					</InfoBox>
				</PageSection>
			</div>
		</div>
	);
}
