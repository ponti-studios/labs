import { Link } from "react-router";

const problems = [
	{
		name: "Two Sum",
		path: "/problems/two-sum",
		description: "Find two numbers that add up to a target",
		difficulty: "Easy",
	},
	{
		name: "Swap Elements",
		path: "/problems/swap",
		description: "Different approaches to swapping array elements",
		difficulty: "Easy",
	},
	{
		name: "Sum Array",
		path: "/problems/sum-array",
		description: "Sum array elements with formula optimization",
		difficulty: "Easy",
	},
];

export default function ProblemSolver() {
	return (
		<div className="space-y-8">
			<div className="text-center space-y-2">
				<h1 className="text-4xl font-bold text-stone-800">Problem Solver</h1>
				<p className="text-stone-600">
					Interactive coding problems with solutions and test cases
				</p>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{problems.map((problem) => (
					<Link
						key={problem.path}
						to={problem.path}
						className="group block p-6 bg-white rounded-xl border border-stone-200 hover:border-yellow-400 hover:shadow-md transition-all duration-300"
					>
						<div className="flex items-start justify-between mb-2">
							<h3 className="text-xl font-semibold text-stone-800 group-hover:text-yellow-600 transition-colors">
								{problem.name}
							</h3>
							<span className={`text-xs font-bold px-2 py-1 rounded ${
								problem.difficulty === 'Easy' 
									? 'bg-green-100 text-green-800'
									: 'bg-yellow-100 text-yellow-800'
							}`}>
								{problem.difficulty}
							</span>
						</div>
						<p className="text-sm text-stone-600 mb-4">{problem.description}</p>
						<span className="text-sm font-medium text-yellow-600 group-hover:gap-2 flex items-center gap-1">
							Solve →
						</span>
					</Link>
				))}
			</div>

			<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
				<h3 className="font-semibold text-yellow-900 mb-2">Practice Problems</h3>
				<p className="text-sm text-yellow-800">
					These problems help you understand fundamental programming concepts like data structures,
					algorithms, and code optimization. Each problem includes test cases and multiple solutions.
				</p>
			</div>
		</div>
	);
}
