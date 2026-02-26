import { useState } from "react";
import { calculateMarketingSpend } from "~/lib/business/marketing-calculator";
import {
	PageHeader,
	PageSection,
	FormSection,
	InputField,
	RangeField,
	ResultBox,
	CodeBlock,
} from "~/components/void-components";

export default function MarketingCalculator() {
	const [desiredAttendees, setDesiredAttendees] = useState(500);
	const [conversionRate, setConversionRate] = useState(0.02);
	const [costPerClick, setCostPerClick] = useState(1.0);
	const [result, setResult] = useState<any>(undefined);
	const [isLoading, setIsLoading] = useState(false);

	const handleCalculate = () => {
		setIsLoading(true);
		setTimeout(() => {
			try {
				const res = calculateMarketingSpend({
					desiredAttendees,
					conversionRate,
					costPerClick,
				});
				setResult(res);
			} catch (error: any) {
				setResult({ error: error.message });
			}
			setIsLoading(false);
		}, 100);
	};

	const handleReset = () => {
		setResult(undefined);
		setDesiredAttendees(500);
		setConversionRate(0.02);
		setCostPerClick(1.0);
	};

	return (
		<div className="min-h-screen bg-black text-white font-mono">
			<div className="w-full max-w-6xl mx-auto px-4 py-8 md:py-12 space-y-12">
				<PageHeader
					title="Marketing Spend Calculator"
					description="Calculate the ad spend needed to achieve your attendee goals"
				/>

				<PageSection title="How This Works">
					<div className="space-y-4">
						<p className="text-sm text-white/80">
							This calculator helps you estimate the marketing budget needed to reach a specific number of event attendees
							based on your conversion rate and cost per click.
						</p>
						<CodeBlock>{`FORMULA 1: REQUIRED CLICKS = DESIRED ATTENDEES ÷ CONVERSION RATE
FORMULA 2: AD SPEND = REQUIRED CLICKS × COST PER CLICK`}</CodeBlock>
					</div>
				</PageSection>

				<PageSection title="Calculator">
					<FormSection onSubmit={handleCalculate} isLoading={isLoading}>
						<InputField
							label="Desired Attendees"
							type="number"
							value={String(desiredAttendees)}
							onChange={(v) => setDesiredAttendees(parseInt(v) || 0)}
						/>

						<RangeField
							label={`Conversion Rate (${(conversionRate * 100).toFixed(2)}%)`}
							value={conversionRate * 1000}
							onChange={(v) => setConversionRate(v / 1000)}
							min={0.1}
							max={500}
							step={1}
							showValue={false}
						/>
						<p className="text-xs text-white/60 font-mono">TYPICAL RANGE: 1-5%</p>

						<InputField
							label="Cost Per Click (USD)"
							type="number"
							value={String(costPerClick)}
							onChange={(v) => setCostPerClick(parseFloat(v) || 0)}
						/>
					</FormSection>

					{result && !result.error && (
						<ResultBox label="CALCULATION RESULTS" state="success">
							<div className="space-y-3 font-mono text-sm text-white/80">
								<div className="flex justify-between items-center border-t border-white/10 pt-3">
									<span>REQUIRED CLICKS:</span>
									<span className="text-white font-bold text-lg">
										{result.requiredClicks.toLocaleString()}
									</span>
								</div>
								<div className="flex justify-between items-center border-t border-white/10 pt-3">
									<span>TOTAL AD SPEND:</span>
									<span className="text-white font-bold text-lg">
										${result.projectedAdSpend.toLocaleString("en-US", { minimumFractionDigits: 2 })}
									</span>
								</div>
							</div>
						</ResultBox>
					)}

					{result?.error && (
						<ResultBox label="ERROR" state="error">
							<div className="font-mono text-sm text-white/80">{result.error}</div>
						</ResultBox>
					)}

					{result && (
						<button
							onClick={handleReset}
							className="text-xs font-mono uppercase tracking-widest border border-white/20 text-white/80 px-4 py-2 hover:bg-white/5 hover:border-white/40 transition-all duration-100 cursor-crosshair"
						>
							Reset
						</button>
					)}
				</PageSection>
			</div>
		</div>
	);
}
