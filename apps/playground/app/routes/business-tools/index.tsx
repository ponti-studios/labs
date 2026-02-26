import { Link } from "react-router";

const businessTools = [
	{
		name: "Marketing Spend Calculator",
		path: "/business-tools/marketing",
		description: "Calculate ad spending needed to reach attendee goals",
	},
	{
		name: "Runway Planner",
		path: "/business-tools/runway",
		description: "Forecast your business runway and financial projections",
	},
];

export default function BusinessToolsHub() {
	return (
		<div className="space-y-8">
			<div className="text-center space-y-2">
				<h1 className="text-4xl font-bold text-stone-800">Business Tools</h1>
				<p className="text-stone-600">
					Financial calculators and business analytics tools
				</p>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{businessTools.map((tool) => (
					<Link
						key={tool.path}
						to={tool.path}
						className="group block p-6 bg-white rounded-xl border border-stone-200 hover:border-green-400 hover:shadow-md transition-all duration-300"
					>
						<h3 className="text-xl font-semibold text-stone-800 group-hover:text-green-600 transition-colors mb-2">
							{tool.name}
						</h3>
						<p className="text-sm text-stone-600 mb-4">{tool.description}</p>
						<span className="text-sm font-medium text-green-600 group-hover:gap-2 flex items-center gap-1">
							Open Tool →
						</span>
					</Link>
				))}
			</div>

			<div className="bg-green-50 border border-green-200 rounded-lg p-6">
				<h3 className="font-semibold text-green-900 mb-2">Business Analytics</h3>
				<p className="text-sm text-green-800">
					These tools help you make data-driven business decisions. Calculate marketing ROI,
					forecast your financial runway, and plan growth strategies with confidence.
				</p>
			</div>
		</div>
	);
}
