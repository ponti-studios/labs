export default function STNDRDSWebsite() {
	const services = [
		{
			title: "AI Product Strategy",
			copy: "From concept to roadmap: product framing, opportunity sizing, user workflows, and technical direction for AI-native software.",
		},
		{
			title: "Agent Systems",
			copy: "Harness architecture, tools, skills, command systems, eval loops, and production patterns for reliable agentic products.",
		},
		{
			title: "Design + Engineering",
			copy: "High-taste interfaces and full-stack execution across web, mobile, APIs, infra, and developer tooling.",
		},
	];

	const principles = [
		"Clarity over hype",
		"Systems over features",
		"Taste over noise",
		"Execution over decks",
	];

	const work = [
		{
			name: "Agent Harnesses",
			type: "Systems",
			blurb:
				"Architectures for tools, commands, skills, permissions, and model orchestration.",
		},
		{
			name: "AI-Native Products",
			type: "Product",
			blurb:
				"End-to-end product design and implementation for software built around reasoning models.",
		},
		{
			name: "Studio Systems",
			type: "Brand",
			blurb:
				"Identity, interface language, and product ecosystems built from one coherent standard.",
		},
	];

	return (
		<div className="min-h-screen bg-white text-black">
			<section className="border-b border-black/10">
				<div className="mx-auto max-w-7xl px-6 py-6 md:px-10">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<div className="grid h-10 w-10 grid-cols-3 grid-rows-3 gap-0.5">
								<div className="bg-black" />
								<div className="col-span-2 bg-black" />
								<div className="bg-transparent" />
								<div className="bg-black" />
								<div className="bg-black" />
								<div className="col-span-2 bg-black" />
								<div className="bg-black" />
							</div>
							<div className="text-lg font-black tracking-tight md:text-xl">
								STNDRDS.
							</div>
						</div>

						<nav className="hidden items-center gap-8 text-sm font-medium md:flex">
							<a
								href="#services"
								className="transition-opacity hover:opacity-60"
							>
								Services
							</a>
							<a href="#work" className="transition-opacity hover:opacity-60">
								Work
							</a>
							<a href="#about" className="transition-opacity hover:opacity-60">
								About
							</a>
							<a
								href="#contact"
								className="rounded-full border border-black px-4 py-2 transition-colors hover:bg-black hover:text-white"
							>
								Contact
							</a>
						</nav>
					</div>
				</div>
			</section>

			<section className="relative overflow-hidden">
				<div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] [background-size:56px_56px]" />
				<div className="mx-auto max-w-7xl px-6 py-20 md:px-10 md:py-28">
					<div className="grid gap-14 lg:grid-cols-[1.35fr_.65fr] lg:items-end">
						<div>
							<div className="mb-5 inline-flex rounded-full border border-black/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em]">
								AI product studio
							</div>
							<h1 className="max-w-5xl text-5xl font-black leading-[0.92] tracking-[-0.04em] md:text-7xl lg:text-8xl">
								We build AI products with taste, structure, and teeth.
							</h1>
							<p className="mt-6 max-w-2xl text-base leading-7 text-black/70 md:text-lg">
								STNDRDS. is an AI product studio for founders, teams, and
								companies building serious software. Strategy, systems, design,
								and engineering—under one standard.
							</p>
							<div className="mt-8 flex flex-wrap gap-4">
								<a
									href="#contact"
									className="rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
								>
									Start a project
								</a>
								<a
									href="#work"
									className="rounded-full border border-black px-6 py-3 text-sm font-semibold transition-colors hover:bg-black hover:text-white"
								>
									See what we do
								</a>
							</div>
						</div>

						<div className="rounded-[2rem] border border-black/10 bg-black p-7 text-white shadow-2xl shadow-black/10">
							<div className="text-xs font-semibold uppercase tracking-[0.24em] text-white/60">
								What we make
							</div>
							<div className="mt-6 space-y-5">
								{[
									"Agentic products",
									"Developer tools",
									"AI workflows",
									"Internal systems",
								].map((item) => (
									<div
										key={item}
										className="flex items-center justify-between border-b border-white/10 pb-4 text-sm"
									>
										<span>{item}</span>
										<span className="text-white/45">→</span>
									</div>
								))}
							</div>
							<div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5">
								<div className="text-xs uppercase tracking-[0.2em] text-white/50">
									Operating mode
								</div>
								<div className="mt-2 text-2xl font-bold leading-tight">
									Small team. High standard. End-to-end execution.
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			<section id="services" className="border-y border-black/10 bg-neutral-50">
				<div className="mx-auto max-w-7xl px-6 py-20 md:px-10">
					<div className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
						<div>
							<div className="text-xs font-semibold uppercase tracking-[0.22em] text-black/45">
								Services
							</div>
							<h2 className="mt-3 text-3xl font-black tracking-[-0.04em] md:text-5xl">
								Built for teams shipping real AI.
							</h2>
						</div>
						<p className="max-w-xl text-sm leading-6 text-black/65 md:text-base">
							We work across product strategy, design systems, architecture,
							implementation, and launch.
						</p>
					</div>

					<div className="grid gap-5 md:grid-cols-3">
						{services.map((service) => (
							<div
								key={service.title}
								className="rounded-[1.75rem] border border-black/10 bg-white p-7 shadow-sm"
							>
								<div className="text-sm font-semibold uppercase tracking-[0.18em] text-black/45">
									{service.title}
								</div>
								<p className="mt-5 text-lg leading-8 text-black/80">
									{service.copy}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			<section id="work">
				<div className="mx-auto max-w-7xl px-6 py-20 md:px-10">
					<div className="mb-12 grid gap-8 lg:grid-cols-[.8fr_1.2fr]">
						<div>
							<div className="text-xs font-semibold uppercase tracking-[0.22em] text-black/45">
								Selected focus
							</div>
							<h2 className="mt-3 text-3xl font-black tracking-[-0.04em] md:text-5xl">
								Systems first. Brand second. Never separate.
							</h2>
						</div>
						<p className="max-w-2xl text-base leading-7 text-black/68">
							The best AI products do not just work—they feel coherent. We
							design the logic, the interface, the workflows, and the language
							as one operating system.
						</p>
					</div>

					<div className="grid gap-5 lg:grid-cols-3">
						{work.map((item) => (
							<div
								key={item.name}
								className="group rounded-[1.75rem] border border-black/10 p-7 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-black/5"
							>
								<div className="flex items-center justify-between">
									<div className="text-xs font-semibold uppercase tracking-[0.22em] text-black/40">
										{item.type}
									</div>
									<div className="text-black/25 transition-transform group-hover:translate-x-1">
										→
									</div>
								</div>
								<div className="mt-12 text-2xl font-black tracking-[-0.03em]">
									{item.name}
								</div>
								<p className="mt-4 text-sm leading-7 text-black/65">
									{item.blurb}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			<section className="border-y border-black/10 bg-black text-white">
				<div className="mx-auto grid max-w-7xl gap-8 px-6 py-16 md:px-10 lg:grid-cols-2 lg:items-center">
					<div>
						<div className="text-xs font-semibold uppercase tracking-[0.22em] text-white/45">
							Principles
						</div>
						<h2 className="mt-3 text-3xl font-black tracking-[-0.04em] md:text-5xl">
							A studio shaped by standards.
						</h2>
					</div>
					<div className="grid gap-4 sm:grid-cols-2">
						{principles.map((item) => (
							<div
								key={item}
								className="rounded-2xl border border-white/10 bg-white/5 px-5 py-6 text-lg font-semibold"
							>
								{item}
							</div>
						))}
					</div>
				</div>
			</section>

			<section id="about">
				<div className="mx-auto max-w-7xl px-6 py-20 md:px-10">
					<div className="grid gap-10 lg:grid-cols-[1fr_.8fr]">
						<div>
							<div className="text-xs font-semibold uppercase tracking-[0.22em] text-black/45">
								About
							</div>
							<h2 className="mt-3 text-3xl font-black tracking-[-0.04em] md:text-5xl">
								We help ambitious teams turn AI potential into product reality.
							</h2>
						</div>
						<div className="space-y-5 text-base leading-8 text-black/70">
							<p>
								STNDRDS. partners with companies that need more than prototypes.
								We help define the product, shape the system, and ship the
								experience.
							</p>
							<p>
								That can mean designing an agent harness, building an AI-native
								app, refining a developer workflow, or creating the identity and
								interface language around the product itself.
							</p>
						</div>
					</div>
				</div>
			</section>

			<section id="contact" className="border-t border-black/10 bg-neutral-50">
				<div className="mx-auto max-w-7xl px-6 py-20 md:px-10">
					<div className="rounded-[2rem] border border-black bg-white p-8 md:p-12">
						<div className="grid gap-8 lg:grid-cols-[1.15fr_.85fr] lg:items-end">
							<div>
								<div className="text-xs font-semibold uppercase tracking-[0.22em] text-black/45">
									Contact
								</div>
								<h2 className="mt-3 max-w-3xl text-3xl font-black tracking-[-0.04em] md:text-5xl">
									Need a sharp AI product studio?
								</h2>
								<p className="mt-5 max-w-2xl text-base leading-7 text-black/68">
									Bring the concept, the mess, the ambition, or the rebuild.
									We’ll bring the structure.
								</p>
							</div>
							<div className="flex flex-col gap-4 sm:flex-row lg:justify-end">
								<a
									href="mailto:hello@stndrds.ai"
									className="rounded-full bg-black px-6 py-3 text-center text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
								>
									hello@stndrds.ai
								</a>
								<a
									href="/"
									className="rounded-full border border-black px-6 py-3 text-center text-sm font-semibold transition-colors hover:bg-black hover:text-white"
								>
									Book a call
								</a>
							</div>
						</div>
					</div>
				</div>
			</section>
		</div>
	);
}
