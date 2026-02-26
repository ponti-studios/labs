import { useState } from "react";
import { calculateMarketingSpend } from "~/lib/business/marketing-calculator";

export default function MarketingCalculator() {
	const [desiredAttendees, setDesiredAttendees] = useState(500);
	const [conversionRate, setConversionRate] = useState(0.02);
	const [costPerClick, setCostPerClick] = useState(1.0);
	const [result, setResult] = useState<any>(null);
	const [executed, setExecuted] = useState(false);

	const handleCalculate = () => {
		try {
			const res = calculateMarketingSpend({
				desiredAttendees,
				conversionRate,
				costPerClick,
			});
			setResult(res);
			setExecuted(true);
		} catch (error: any) {
			setResult({ error: error.message });
			setExecuted(true);
		}
	};

	return (
		<div className="space-y-8 max-w-2xl">
			<div className="space-y-2">
				<h1 className="text-3xl font-bold text-stone-800">Marketing Spend Calculator</h1>
				<p className="text-stone-600">
					Calculate the ad spend needed to achieve your attendee goals
				</p>
			</div>

			<div className="bg-white rounded-lg border border-stone-200 p-6 space-y-4">
				<div>
					<h3 className="font-semibold text-stone-800 mb-3">How This Works</h3>
					<p className="text-sm text-stone-700 mb-3">
						This calculator helps you estimate the marketing budget needed to reach a specific number of event attendees
						based on your conversion rate and cost per click.
					</p>
					<div className="bg-gray-50 p-3 rounded text-xs font-mono text-gray-800 space-y-1">
						<p><strong>Formula:</strong> Required Clicks = Desired Attendees ÷ Conversion Rate</p>
						<p><strong>Ad Spend:</strong> Required Clicks × Cost Per Click</p>
					</div>
				</div>
			</div>

			<div className="bg-white rounded-lg border border-stone-200 p-6 space-y-4">
				<h3 className="font-semibold text-stone-800">Calculator</h3>
				<div className="space-y-4">
					<div>
						<label className="block text-sm font-medium text-stone-700 mb-2">
							Desired Attendees
						</label>
						<input
							type="number"
							value={desiredAttendees}
							onChange={(e) => setDesiredAttendees(parseInt(e.target.value) || 0)}
							className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-stone-700 mb-2">
							Conversion Rate ({(conversionRate * 100).toFixed(2)}%)
						</label>
						<input
							type="range"
							min="0.001"
							max="0.5"
							step="0.001"
							value={conversionRate}
							onChange={(e) => setConversionRate(parseFloat(e.target.value))}
							className="w-full"
						/>
						<p className="text-xs text-stone-500 mt-1">Typical range: 1-5%</p>
					</div>

					<div>
						<label className="block text-sm font-medium text-stone-700 mb-2">
							Cost Per Click (USD)
						</label>
						<input
							type="number"
							value={costPerClick}
							onChange={(e) => setCostPerClick(parseFloat(e.target.value) || 0)}
							step="0.01"
							className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
						/>
					</div>

					<button
						onClick={handleCalculate}
						className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
					>
						Calculate
					</button>
				</div>

				{executed && result && (
					<div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
						<h4 className="font-semibold text-green-900">Results</h4>
						{result.error ? (
							<p className="text-red-700">{result.error}</p>
						) : (
							<div className="space-y-2 text-sm">
								<div className="flex justify-between">
									<span className="text-green-800">Required Clicks:</span>
									<span className="font-bold text-green-900">{result.requiredClicks.toLocaleString()}</span>
								</div>
								<div className="flex justify-between">
									<span className="text-green-800">Total Ad Spend:</span>
									<span className="font-bold text-green-900">${result.projectedAdSpend.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
								</div>
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	);
}
