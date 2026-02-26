import { PageHeader, PageSection, Callout, CodeBlock, Stack } from "~/components/void-components";

export default function AIPlaygroundHub() {
	return (
		<div className="min-h-screen bg-black text-white font-mono">
			<div className="w-full max-w-6xl mx-auto px-4 py-8 md:py-12 space-y-12">
				<PageHeader
					title="AI Playground"
					description="Test LLM prompts and AI-powered tools"
				/>

				<PageSection title="Available Prompts">
					<Stack spacing="lg">
						<div className="border border-white/10 bg-white/2 p-6 space-y-3">
							<h4 className="text-lg font-bold uppercase tracking-widest text-white">Real Estate Agent Prompt</h4>
							<p className="text-sm text-white/80">
								Mimics an experienced real estate agent. Use this prompt to generate information about specific locations.
							</p>
							<CodeBlock>
								{'You are an experienced real estate agent who knows a lot about the {location} area...'}
							</CodeBlock>
						</div>

						<div className="border border-white/10 bg-white/2 p-6 space-y-3">
							<h4 className="text-lg font-bold uppercase tracking-widest text-white">Writing Assistant Prompt</h4>
							<p className="text-sm text-white/80">
								Edits and improves written content. Corrects grammar, enhances style, and removes bias.
							</p>
							<CodeBlock>
								{'The user will provide a passage for comprehensive editing...'}
							</CodeBlock>
						</div>
					</Stack>
				</PageSection>

				<PageSection title="Coming Soon">
					<Callout type="warning">
						Full interactive prompt testing interface with API integration. Try your own prompts against OpenAI,
						Claude, and other LLM providers.
					</Callout>
				</PageSection>
			</div>
		</div>
	);
}
