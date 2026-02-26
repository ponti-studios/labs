import { Link } from "react-router";
import { Gamepad2, Zap, Calculator, Sparkles, BookOpen } from "lucide-react";

interface FeatureCard {
	title: string;
	description: string;
	path: string;
	icon: React.ReactNode;
	color: string;
}

const features: FeatureCard[] = [
	{
		title: "Games & Recreation",
		description: "Interactive games and creative experiments",
		path: "/games/tetris",
		icon: <Gamepad2 className="w-8 h-8" />,
		color: "from-purple-500 to-pink-500",
	},
	{
		title: "Algorithms Explorer",
		description: "Learn sorting, searching, and data structures",
		path: "/algorithms",
		icon: <Zap className="w-8 h-8" />,
		color: "from-blue-500 to-cyan-500",
	},
	{
		title: "Problem Solver",
		description: "Interactive coding problems and solutions",
		path: "/problems",
		icon: <BookOpen className="w-8 h-8" />,
		color: "from-yellow-500 to-orange-500",
	},
	{
		title: "Business Tools",
		description: "Finance, marketing, and analytics calculators",
		path: "/business-tools",
		icon: <Calculator className="w-8 h-8" />,
		color: "from-green-500 to-emerald-500",
	},
	{
		title: "AI Playground",
		description: "LLM prompts and AI-powered tools",
		path: "/ai-playground",
		icon: <Sparkles className="w-8 h-8" />,
		color: "from-rose-500 to-red-500",
	},
];

export default function ToolsHub() {
	return (
		<div className="space-y-8">
			<div className="text-center space-y-2 mb-12">
				<h1 className="text-4xl font-bold text-stone-800">Tools & Features</h1>
				<p className="text-stone-600">
					A collection of interactive tools, games, and learning resources
				</p>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{features.map((feature) => (
					<Link
						key={feature.path}
						to={feature.path}
						className="group relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
					>
						{/* Background gradient */}
						<div
							className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
						/>

						{/* Content */}
						<div className="relative p-6 space-y-4">
							<div className="flex items-center justify-between">
								<div className="text-stone-700 group-hover:text-stone-900 transition-colors">
									{feature.icon}
								</div>
								<div
									className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.color} opacity-20 group-hover:opacity-30 transition-opacity`}
								/>
							</div>

							<div className="space-y-1">
								<h3 className="text-xl font-semibold text-stone-800 group-hover:text-stone-900 transition-colors">
									{feature.title}
								</h3>
								<p className="text-sm text-stone-600 group-hover:text-stone-700 line-clamp-2">
									{feature.description}
								</p>
							</div>

							<div className="pt-2 flex items-center text-sm font-medium text-stone-600 group-hover:text-stone-900 transition-colors">
								Explore →
							</div>
						</div>
					</Link>
				))}
			</div>

			{/* Featured section */}
			<div className="mt-16 bg-gradient-to-r from-stone-50 to-stone-100 rounded-3xl p-8 border border-stone-200">
				<h2 className="text-2xl font-bold text-stone-800 mb-4">What's New</h2>
				<div className="space-y-2 text-stone-700">
					<p>⚡ <strong>Tetris Game</strong> - Play classic Tetris with modern React patterns</p>
					<p>📚 <strong>Algorithms Explorer</strong> - Learn sorting and searching algorithms with visual demonstrations</p>
					<p>🎯 <strong>Problem Solver</strong> - Solve coding challenges with test cases</p>
					<p>💰 <strong>Business Tools</strong> - Marketing calculators and financial planning tools</p>
					<p>🤖 <strong>AI Playground</strong> - Test LLM prompts and AI tools</p>
				</div>
			</div>
		</div>
	);
}
