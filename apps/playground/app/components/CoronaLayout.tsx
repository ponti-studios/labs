import { Link, useLocation, useNavigate } from "react-router";
import { CountryPicker } from "./country-picker/country-picker";

interface CoronaLayoutProps {
	children: React.ReactNode;
	countryCode: string;
}

export function CoronaLayout({ children, countryCode }: CoronaLayoutProps) {
	const navigate = useNavigate();
	const location = useLocation();

	// Handle country change
	const handleCountryChange = (newCountryCode: string) => {
		// Get the current route path without the country code
		const pathParts = location.pathname.split("/");
		// Replace the country code (should be at index 2: /corona/[countryCode]/...)
		if (pathParts.length >= 3 && pathParts[1] === "corona") {
			pathParts[2] = newCountryCode;
			const newPath = pathParts.join("/");
			navigate(newPath);
		} else {
			// Fallback to main dashboard
			navigate(`/corona/${newCountryCode}`);
		}
	};

	const navigationItems = [
		{
			href: `/corona/${countryCode}`,
			icon: "📊",
			title: "Dashboard",
		},
		{
			href: `/corona/${countryCode}/pandemic-waves`,
			icon: "🌊",
			title: "Pandemic Waves",
		},
		{
			href: `/corona/${countryCode}/vaccination-effectiveness`,
			icon: "💉",
			title: "Vaccination Impact",
		},
		{
			href: `/corona/${countryCode}/seasonal-patterns`,
			icon: "📅",
			title: "Seasonal Analysis",
		},
		{
			href: `/corona/${countryCode}/outlier-detection`,
			icon: "⚡",
			title: "Outlier Detection",
		},
	];

	return (
		<div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/20 to-stone-100">
			{/* Header Section */}
			<div className="pt-32 pb-8 px-4 sm:px-6 lg:px-8">
				<div className="max-w-7xl mx-auto">
					<div className="text-center max-w-4xl mx-auto mb-12">
						<h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-light text-stone-900 mb-6 tracking-tight">
							COVID-19
							<span className="block font-sans font-medium text-olive-700 text-3xl md:text-5xl lg:text-6xl mt-2">
								Analytics
							</span>
						</h1>
						<p className="text-lg md:text-xl text-stone-600 font-light leading-relaxed max-w-2xl mx-auto mb-8">
							Comprehensive insights into pandemic data, trends, and patterns
							with sophisticated analytical tools for informed decision-making.
						</p>

						{/* Country Picker */}
						<div className="max-w-md mx-auto">
							<CountryPicker
								countryCode={countryCode}
								onChange={handleCountryChange}
								className="w-full"
							/>
						</div>
					</div>

					{/* Navigation */}
					<div className="mb-8">
						<div className="bg-white/40 backdrop-blur-sm rounded-2xl p-6 border border-stone-200/50">
							<div className="flex flex-wrap gap-3 justify-center">
								{navigationItems.map((item) => (
									<Link
										key={item.href}
										to={item.href}
										className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-white/40 hover:bg-white/60 border border-stone-200/50 hover:border-stone-300/50 transition-all duration-300 hover:shadow-md"
									>
										<span className="text-lg group-hover:scale-110 transition-transform duration-300">
											{item.icon}
										</span>
										<span className="font-medium text-stone-700 text-sm">
											{item.title}
										</span>
									</Link>
								))}
							</div>
						</div>
					</div>

					{/* Content Container */}
					<div className="relative bg-white/60 backdrop-blur-sm rounded-3xl shadow-xl border border-stone-200/50 overflow-hidden">
						<div className="p-8">{children}</div>
					</div>
				</div>
			</div>
		</div>
	);
}
