import { useState } from "react";
import type { DirectionsResult } from "../lib/google-maps";

interface SearchDirectionsFormProps {
	onLocationFound: (location: string) => void;
	onDirectionsFound: (directions: {
		origin: string;
		destination: string;
	}) => void;
	onClear: () => void;
	isGeocodingLoading: boolean;
	isDirectionsLoading: boolean;
	geocodeError: Error | null;
	directionsError: Error | null;
	directions: DirectionsResult | undefined;
}

export default function SearchDirectionsForm({
	onLocationFound,
	onDirectionsFound,
	onClear,
	isGeocodingLoading,
	isDirectionsLoading,
	geocodeError,
	directionsError,
	directions,
}: SearchDirectionsFormProps) {
	const [isDirectionsMode, setIsDirectionsMode] = useState(false);
	const [stops, setStops] = useState([""]);

	const handleCombinedForm = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const formData = new FormData(e.currentTarget);

		if (isDirectionsMode) {
			// Handle directions mode
			const origin = formData.get("origin") as string;
			const destination = formData.get("destination") as string;

			if (origin.trim() && destination.trim()) {
				onDirectionsFound({
					origin: origin.trim(),
					destination: destination.trim(),
				});
			}
		} else {
			// Handle search mode
			const destination = formData.get("destination") as string;
			if (destination.trim()) {
				onLocationFound(destination.trim());
			}
		}
	};

	const addStop = () => {
		setStops([...stops, ""]);
		if (!isDirectionsMode) {
			setIsDirectionsMode(true);
		}
	};

	const removeStop = (index: number) => {
		const newStops = stops.filter((_, i) => i !== index);
		setStops(newStops);
		if (newStops.length === 1) {
			setIsDirectionsMode(false);
		}
	};

	const updateStop = (index: number, value: string) => {
		const newStops = [...stops];
		newStops[index] = value;
		setStops(newStops);
	};

	const handleClear = () => {
		setStops([""]);
		setIsDirectionsMode(false);
		onClear();
	};

	return (
		<>
			{/* Combined Form */}
			<div className="absolute top-4 left-4 z-20">
				<div className="bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-white/20 p-4 w-80">
					<div className="flex items-center justify-between mb-3">
						<h2 className="text-lg font-semibold text-gray-800 font-serif">
							{isDirectionsMode ? "Directions" : "Search"}
						</h2>
						<div className="flex items-center space-x-2">
							<div
								className={`w-2 h-2 rounded-full ${isDirectionsMode ? "bg-blue-500" : "bg-green-500"}`}
							/>
							<span className="text-xs font-medium text-gray-600">
								{isDirectionsMode ? "Route" : "Location"}
							</span>
						</div>
					</div>

					{/* Error Display */}
					{(geocodeError || directionsError) && (
						<div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
							<div className="flex items-start">
								<svg
									className="w-4 h-4 text-red-500 mt-0.5 mr-2 flex-shrink-0"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
									aria-hidden="true"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
									/>
								</svg>
								<div>
									<p className="text-red-700 text-xs font-medium">
										{isDirectionsMode ? "Directions Error" : "Search Error"}
									</p>
									<p className="text-red-600 text-xs mt-1">
										{(isDirectionsMode ? directionsError : geocodeError)
											?.message ||
											`Failed to ${isDirectionsMode ? "get directions" : "find location"}. Please try again.`}
									</p>
								</div>
							</div>
						</div>
					)}

					<form onSubmit={handleCombinedForm} className="space-y-3">
						<div className="space-y-2">
							{stops.map((stop, index) => (
								<div
									key={`stop-${index}-${stop.slice(0, 10)}`}
									className="group relative"
								>
									<div className="flex items-center space-x-2">
										<div className="flex-shrink-0">
											<div
												className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
													index === 0 && isDirectionsMode
														? "bg-blue-100 text-blue-700"
														: index === stops.length - 1
															? "bg-green-100 text-green-700"
															: "bg-gray-100 text-gray-700"
												}`}
											>
												{index === 0 && isDirectionsMode
													? "A"
													: index === stops.length - 1
														? "B"
														: index + 1}
											</div>
										</div>
										<div className="flex-1">
											<label
												htmlFor={`stop-${index}`}
												className="block text-xs font-medium text-gray-700 mb-1"
											>
												{index === 0 && isDirectionsMode
													? "From"
													: index === stops.length - 1
														? "To"
														: `Stop ${index + 1}`}
											</label>
											<input
												type="text"
												name={
													index === 0 && isDirectionsMode
														? "origin"
														: "destination"
												}
												id={`stop-${index}`}
												value={stop}
												onChange={(e) => updateStop(index, e.target.value)}
												placeholder={
													index === 0 && isDirectionsMode
														? "Starting point"
														: index === stops.length - 1
															? "Destination"
															: `Stop ${index + 1}`
												}
												className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none text-sm transition-colors placeholder-gray-400"
												required
												autoComplete="street-address"
												disabled={isGeocodingLoading || isDirectionsLoading}
											/>
										</div>
										{stops.length > 1 && (
											<button
												type="button"
												onClick={() => removeStop(index)}
												className="flex-shrink-0 mt-6 p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 group-hover:opacity-100 opacity-0"
												disabled={isGeocodingLoading || isDirectionsLoading}
												title="Remove stop"
											>
												<svg
													className="w-3 h-3"
													fill="none"
													stroke="currentColor"
													viewBox="0 0 24 24"
													aria-hidden="true"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth={2}
														d="M6 18L18 6M6 6l12 12"
													/>
												</svg>
											</button>
										)}
									</div>
								</div>
							))}
						</div>

						<div className="flex items-center space-x-2 pt-1">
							<button
								type="button"
								onClick={addStop}
								className="flex items-center px-3 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all duration-200 text-xs font-medium border border-blue-200 hover:border-blue-300"
								disabled={isGeocodingLoading || isDirectionsLoading}
							>
								<svg
									className="w-3 h-3 mr-1"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
									aria-hidden="true"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M12 6v6m0 0v6m0-6h6m-6 0H6"
									/>
								</svg>
								Add Stop
							</button>

							<button
								type="submit"
								className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2 px-4 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 text-sm font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-lg"
								disabled={isGeocodingLoading || isDirectionsLoading}
							>
								{isGeocodingLoading || isDirectionsLoading ? (
									<div className="flex items-center justify-center">
										<div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-1" />
										{isDirectionsMode ? "Getting..." : "Searching..."}
									</div>
								) : (
									<div className="flex items-center justify-center">
										{isDirectionsMode ? (
											<>
												<svg
													className="w-3 h-3 mr-1"
													fill="none"
													stroke="currentColor"
													viewBox="0 0 24 24"
													aria-hidden="true"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth={2}
														d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3"
													/>
												</svg>
												Get Route
											</>
										) : (
											<>
												<svg
													className="w-3 h-3 mr-1"
													fill="none"
													stroke="currentColor"
													viewBox="0 0 24 24"
													aria-hidden="true"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth={2}
														d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
													/>
												</svg>
												Search
											</>
										)}
									</div>
								)}
							</button>
						</div>
					</form>
				</div>
			</div>

			{/* Clear button */}
			<div className="absolute top-4 right-4 z-20">
				<button
					type="button"
					onClick={handleClear}
					className="bg-white/90 backdrop-blur-md text-gray-700 px-3 py-2 rounded-lg hover:bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 text-sm font-medium shadow-lg border border-gray-200 hover:shadow-xl"
				>
					<div className="flex items-center">
						<svg
							className="w-4 h-4 mr-1"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							aria-hidden="true"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
							/>
						</svg>
						Clear
					</div>
				</button>
			</div>

			{/* Directions List */}
			{directions && (
				<div className="absolute bottom-4 left-4 z-20">
					<div className="bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-white/20 p-4 w-80 max-h-64 overflow-y-auto">
						<div className="flex items-center justify-between mb-3">
							<h2 className="text-lg font-semibold text-gray-800 font-serif">
								Route
							</h2>
							<div className="flex items-center space-x-2 text-xs text-gray-600">
								<svg
									className="w-3 h-3"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
									aria-hidden="true"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
									/>
								</svg>
								<span>Details</span>
							</div>
						</div>
						<div className="mb-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
							<div className="space-y-1 text-xs">
								<p className="font-medium text-blue-800">
									From:{" "}
									<span className="font-normal">{directions.summary.from}</span>
								</p>
								<p className="font-medium text-blue-800">
									To:{" "}
									<span className="font-normal">{directions.summary.to}</span>
								</p>
								<div className="flex items-center justify-between pt-1">
									<div className="flex items-center">
										<svg
											className="w-3 h-3 text-blue-600 mr-1"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
											aria-hidden="true"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
											/>
										</svg>
										<span className="text-blue-700 font-medium">
											{directions.summary.distance}
										</span>
									</div>
									<div className="flex items-center">
										<svg
											className="w-3 h-3 text-blue-600 mr-1"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
											aria-hidden="true"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
											/>
										</svg>
										<span className="text-blue-700 font-medium">
											{directions.summary.duration}
										</span>
									</div>
								</div>
							</div>
						</div>
						<ol className="space-y-1 list-none">
							{directions.steps.map((step, index) => (
								<li
									key={`step-${index}-${step.instruction.slice(0, 20)}`}
									className="flex items-start space-x-2 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
								>
									<div className="flex-shrink-0 w-5 h-5 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-medium">
										{index + 1}
									</div>
									<div className="flex-1 min-w-0">
										<span className="text-xs text-gray-800">
											{step.instruction}
										</span>
										{step.distance && (
											<span className="block text-xs text-gray-500 mt-0.5">
												{step.distance}
											</span>
										)}
									</div>
								</li>
							))}
						</ol>
					</div>
				</div>
			)}
		</>
	);
}
