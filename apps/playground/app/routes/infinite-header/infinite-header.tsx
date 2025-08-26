import "./main.css";

export default function InfiniteHeader() {
	return (
		<div className="bg-gray-100 min-h-screen">
			<header className="container mx-auto px-4 py-16 lg:py-24">
				<div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
					<div className="lg:w-1/2 text-center lg:text-left">
						<h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 leading-tight">
							Showcase Your Work Beautifully
						</h1>
						<p className="text-lg md:text-xl text-gray-600 mb-8">
							Engage your visitors with a stunning visual display. Our unique
							scrolling gallery captures attention and highlights your best
							content.
						</p>
						<a
							href="/"
							className="inline-block bg-blue-600 text-white font-bold py-3 px-8 rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
						>
							Get Started
						</a>
					</div>
					<div className="lg:w-1/2 w-full">
						<div className="grid grid-cols-3 gap-4">
							<div className="scroll-container animate-scroll-up">
								<div className="scroll-column">
									<img
										src="https://placehold.co/300x400/d1d5db/374151?text=Image+1"
										alt="Gallery item 1"
										className="h-48 md:h-64 lg:h-80"
									/>
									<img
										src="https://placehold.co/300x500/9ca3af/374151?text=Image+2"
										alt="Gallery item 2"
										className="h-60 md:h-80 lg:h-96"
									/>
									<img
										src="https://placehold.co/300x350/6b7280/ffffff?text=Image+3"
										alt="Gallery item 3"
										className="h-40 md:h-56 lg:h-72"
									/>
									<img
										src="https://placehold.co/300x450/4b5563/ffffff?text=Image+4"
										alt="Gallery item 4"
										className="h-52 md:h-72 lg:h-96"
									/>
									<img
										src="https://placehold.co/300x400/d1d5db/374151?text=Image+1"
										alt="Gallery item 1"
										className="h-48 md:h-64 lg:h-80"
									/>
									<img
										src="https://placehold.co/300x500/9ca3af/374151?text=Image+2"
										alt="Gallery item 2"
										className="h-60 md:h-80 lg:h-96"
									/>
									<img
										src="https://placehold.co/300x350/6b7280/ffffff?text=Image+3"
										alt="Gallery item 3"
										className="h-40 md:h-56 lg:h-72"
									/>
								</div>
							</div>
							<div className="scroll-container animate-scroll-down">
								<div className="scroll-column">
									<img
										src="https://placehold.co/300x400/d1d5db/374151?text=Image+5"
										alt="Gallery item 5"
										className="h-48 md:h-64 lg:h-80"
									/>
									<img
										src="https://placehold.co/300x500/9ca3af/374151?text=Image+6"
										alt="Gallery item 6"
										className="h-60 md:h-80 lg:h-96"
									/>
									<img
										src="https://placehold.co/300x350/6b7280/ffffff?text=Image+7"
										alt="Gallery item 7"
										className="h-40 md:h-56 lg:h-72"
									/>
									<img
										src="https://placehold.co/300x450/4b5563/ffffff?text=Image+8"
										alt="Gallery item 8"
										className="h-52 md:h-72 lg:h-96"
									/>
									<img
										src="https://placehold.co/300x400/d1d5db/374151?text=Image+5"
										alt="Gallery item 5"
										className="h-48 md:h-64 lg:h-80"
									/>
									<img
										src="https://placehold.co/300x500/9ca3af/374151?text=Image+6"
										alt="Gallery item 6"
										className="h-60 md:h-80 lg:h-96"
									/>
									<img
										src="https://placehold.co/300x350/6b7280/ffffff?text=Image+7"
										alt="Gallery item 7"
										className="h-40 md:h-56 lg:h-72"
									/>
								</div>
							</div>
							<div className="scroll-container animate-scroll-up">
								<div className="scroll-column">
									<img
										src="https://placehold.co/300x400/d1d5db/374151?text=Image+9"
										alt="Gallery item 9"
										className="h-48 md:h-64 lg:h-80"
									/>
									<img
										src="https://placehold.co/300x500/9ca3af/374151?text=Image+10"
										alt="Gallery item 10"
										className="h-60 md:h-80 lg:h-96"
									/>
									<img
										src="https://placehold.co/300x350/6b7280/ffffff?text=Image+11"
										alt="Gallery item 11"
										className="h-40 md:h-56 lg:h-72"
									/>
									<img
										src="https://placehold.co/300x450/4b5563/ffffff?text=Image+12"
										alt="Gallery item 12"
										className="h-52 md:h-72 lg:h-96"
									/>
									<img
										src="https://placehold.co/300x400/d1d5db/374151?text=Image+9"
										alt="Gallery item 9"
										className="h-48 md:h-64 lg:h-80"
									/>
									<img
										src="https://placehold.co/300x500/9ca3af/374151?text=Image+10"
										alt="Gallery item 10"
										className="h-60 md:h-80 lg:h-96"
									/>
									<img
										src="https://placehold.co/300x350/6b7280/ffffff?text=Image+11"
										alt="Gallery item 11"
										className="h-40 md:h-56 lg:h-72"
									/>
								</div>
							</div>
						</div>
					</div>
				</div>
			</header>
		</div>
	);
}
