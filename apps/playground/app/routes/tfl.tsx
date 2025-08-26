import TFLMap from "~/components/TFLMap";
import { GOOGLE_MAPS_API_KEY } from "~/lib/constants";

export function meta() {
	return [
		{ title: "London Traffic Cameras — Live Views" },
		{
			name: "description",
			content:
				"Discover real-time traffic conditions across London through our curated collection of live camera feeds.",
		},
	];
}

export default function TFL() {
	if (!GOOGLE_MAPS_API_KEY) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-stone-50 to-amber-50/30 pt-32" />
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/20 to-stone-100">
			{/* Header Section */}
			<div className="pt-32 pb-8 px-4 sm:px-6 lg:px-8">
				<div className="max-w-7xl mx-auto">
					<div className="text-center max-w-4xl mx-auto mb-12">
						<h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-light text-stone-900 mb-6 tracking-tight">
							London Traffic
							<span className="block font-sans font-medium text-olive-700 text-3xl md:text-5xl lg:text-6xl mt-2">
								Live Views
							</span>
						</h1>
						<p className="text-lg md:text-xl text-stone-600 font-light leading-relaxed max-w-2xl mx-auto">
							Experience the pulse of London through our carefully curated
							collection of live traffic cameras, offering intimate glimpses
							into the city's ever-flowing rhythm.
						</p>
					</div>

					{/* Map Container */}
					<div className="relative bg-white/60 backdrop-blur-sm rounded-3xl shadow-xl border border-stone-200/50 overflow-hidden">
						<div className="h-[50vh] md:h-[60vh] lg:h-[70vh]">
							<TFLMap />
						</div>
					</div>

					{/* Features Grid */}
					<div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
						<div className="group">
							<div className="bg-white/40 backdrop-blur-sm p-8 rounded-2xl border border-stone-200/50 hover:bg-white/60 hover:shadow-lg transition-all duration-300">
								<div className="w-12 h-12 bg-olive-100 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
									<svg
										className="w-6 h-6 text-olive-700"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
										aria-hidden="true"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={1.5}
											d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
										/>
									</svg>
								</div>
								<h3 className="font-serif text-xl font-medium text-stone-900 mb-3">
									Live Streams
								</h3>
								<p className="text-stone-600 font-light leading-relaxed">
									Real-time footage updated continuously throughout the day,
									capturing London's dynamic traffic patterns.
								</p>
							</div>
						</div>

						<div className="group">
							<div className="bg-white/40 backdrop-blur-sm p-8 rounded-2xl border border-stone-200/50 hover:bg-white/60 hover:shadow-lg transition-all duration-300">
								<div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
									<svg
										className="w-6 h-6 text-amber-700"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
										aria-hidden="true"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={1.5}
											d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
										/>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={1.5}
											d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
										/>
									</svg>
								</div>
								<h3 className="font-serif text-xl font-medium text-stone-900 mb-3">
									City Coverage
								</h3>
								<p className="text-stone-600 font-light leading-relaxed">
									Strategically positioned cameras across London's most vital
									arteries and intersections.
								</p>
							</div>
						</div>

						<div className="group">
							<div className="bg-white/40 backdrop-blur-sm p-8 rounded-2xl border border-stone-200/50 hover:bg-white/60 hover:shadow-lg transition-all duration-300">
								<div className="w-12 h-12 bg-stone-200 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
									<svg
										className="w-6 h-6 text-stone-700"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
										aria-hidden="true"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={1.5}
											d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
										/>
									</svg>
								</div>
								<h3 className="font-serif text-xl font-medium text-stone-900 mb-3">
									Interactive Experience
								</h3>
								<p className="text-stone-600 font-light leading-relaxed">
									Seamlessly navigate and explore detailed camera information
									with elegant, intuitive interactions.
								</p>
							</div>
						</div>
					</div>

					{/* Footer Attribution */}
					<div className="mt-20 pt-8 border-t border-stone-200/50 text-center">
						<p className="text-sm text-stone-500 font-light">
							Camera feeds courtesy of{" "}
							<span className="font-medium">Transport for London</span>
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
