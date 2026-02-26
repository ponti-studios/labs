export default function AIPlaygroundHub() {
	return (
		<div className="space-y-8 max-w-4xl">
			<div className="text-center space-y-2">
				<h1 className="text-4xl font-bold text-stone-800">AI Playground</h1>
				<p className="text-stone-600">
					Test LLM prompts and AI-powered tools
				</p>
			</div>

			<div className="bg-white rounded-lg border border-stone-200 p-6 space-y-4">
				<h3 className="font-semibold text-stone-800">Available Prompts</h3>
				<div className="space-y-3">
					<div className="p-4 bg-stone-50 rounded border border-stone-200">
						<h4 className="font-semibold text-stone-800 mb-2">Real Estate Agent Prompt</h4>
						<p className="text-sm text-stone-700 mb-3">
							Mimics an experienced real estate agent. Use this prompt to generate information about specific locations.
						</p>
						<code className="text-xs bg-white p-2 rounded block font-mono text-stone-600">
							"You are an experienced real estate agent who knows a lot about the {'{location}'} area..."
						</code>
					</div>

					<div className="p-4 bg-stone-50 rounded border border-stone-200">
						<h4 className="font-semibold text-stone-800 mb-2">Writing Assistant Prompt</h4>
						<p className="text-sm text-stone-700 mb-3">
							Edits and improves written content. Corrects grammar, enhances style, and removes bias.
						</p>
						<code className="text-xs bg-white p-2 rounded block font-mono text-stone-600">
							"The user will provide a passage for comprehensive editing..."
						</code>
					</div>
				</div>
			</div>

			<div className="bg-rose-50 border border-rose-200 rounded-lg p-6">
				<h3 className="font-semibold text-rose-900 mb-2">Coming Soon</h3>
				<p className="text-sm text-rose-800">
					Full interactive prompt testing interface with API integration. Try your own prompts against OpenAI,
					Claude, and other LLM providers.
				</p>
			</div>
		</div>
	);
}
