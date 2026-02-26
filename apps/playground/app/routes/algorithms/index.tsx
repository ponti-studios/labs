import { Link } from "react-router";

const algorithms = [
	{
		name: "Binary Search",
		path: "/algorithms/binary-search",
		description: "O(log n) search algorithm for sorted arrays",
	},
	{
		name: "Selection Sort",
		path: "/algorithms/selection-sort",
		description: "O(n²) sorting algorithm",
	},
	{
		name: "Stacks",
		path: "/algorithms/stacks",
		description: "LIFO data structure with palindrome checker",
	},
];

export default function AlgorithmsExplorer() {
	return (
		<div className="space-y-8">
			<div className="text-center space-y-2">
				<h1 className="text-4xl font-bold text-stone-800">Algorithms Explorer</h1>
				<p className="text-stone-600">
					Learn fundamental algorithms with interactive demonstrations
				</p>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{algorithms.map((algo) => (
					<Link
						key={algo.path}
						to={algo.path}
						className="group block p-6 bg-white rounded-xl border border-stone-200 hover:border-blue-400 hover:shadow-md transition-all duration-300"
					>
						<h3 className="text-xl font-semibold text-stone-800 group-hover:text-blue-600 transition-colors mb-2">
							{algo.name}
						</h3>
						<p className="text-sm text-stone-600 mb-4">{algo.description}</p>
						<span className="text-sm font-medium text-blue-600 group-hover:gap-2 flex items-center gap-1">
							Learn More →
						</span>
					</Link>
				))}
			</div>

			<div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
				<h3 className="font-semibold text-blue-900 mb-2">About Algorithms</h3>
				<p className="text-sm text-blue-800">
					Algorithms are step-by-step procedures for solving a problem or accomplishing a task.
					Understanding fundamental algorithms is essential for competitive programming and technical interviews.
				</p>
			</div>
		</div>
	);
}
