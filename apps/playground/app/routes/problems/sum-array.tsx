import { useState } from "react";
import { sumOfNumbers, sumUp, sumUpFormula } from "~/lib/problems/sum-array";
import {
	PageHeader,
	PageSection,
	FormSection,
	InputField,
	RangeField,
	ResultBox,
	CodeBlock,
	GridSection,
	DiffDisplay,
} from "~/components/void-components";

export default function SumArrayRoute() {
	const [arrayInput, setArrayInput] = useState("1,2,3,4,5");
	const [n, setN] = useState(10);
	const [result, setResult] = useState<any>(undefined);
	const [isLoading, setIsLoading] = useState(false);

	const handleSum = () => {
		setIsLoading(true);
		setTimeout(() => {
			try {
				const arr = arrayInput.split(",").map((x) => parseInt(x.trim()));
				const arraySum = sumOfNumbers(arr);
				const loopSum = sumUp(n);
				const formulaSum = sumUpFormula(n);

				setResult({
					arraySum,
					loopSum,
					formulaSum,
					array: arr,
				});
			} catch (error) {
				setResult({ error: "INVALID INPUT" });
			}
			setIsLoading(false);
		}, 100);
	};

	const handleReset = () => {
		setResult(undefined);
		setArrayInput("1,2,3,4,5");
		setN(10);
	};

	return (
		<div className="min-h-screen bg-black text-white font-mono">
			<div className="w-full max-w-6xl mx-auto px-4 py-8 md:py-12 space-y-12">
				<PageHeader
					title="Sum Array"
					description="Different approaches to summing numbers with performance comparison"
				/>

				<PageSection title="Approaches">
					<GridSection cols={1} gap="lg">
						<div className="border border-white/20 bg-white/2 p-6 space-y-3">
							<h4 className="text-sm font-bold uppercase tracking-widest text-white/80">[1] Loop Approach</h4>
							<p className="text-xs text-white/70">TIME: O(N) - LINEAR</p>
							<CodeBlock>{`FOR EACH NUMBER IN ARRAY:
  RESULT += NUMBER`}</CodeBlock>
						</div>

						<div className="border border-white/20 bg-white/3 p-6 space-y-3">
							<h4 className="text-sm font-bold uppercase tracking-widest text-white/90">[2] Formula Approach</h4>
							<p className="text-xs text-white/70">TIME: O(1) - CONSTANT</p>
							<CodeBlock>SUM = N * (N + 1) / 2</CodeBlock>
							<p className="text-xs text-white/60 pt-2">MUCH FASTER FOR LARGE NUMBERS!</p>
						</div>
					</GridSection>
				</PageSection>

				<PageSection title="Calculator">
					<FormSection onSubmit={handleSum} isLoading={isLoading}>
						<InputField
							label="Array to Sum (comma-separated)"
							value={arrayInput}
							onChange={setArrayInput}
							placeholder="1,2,3,4,5"
						/>
						<RangeField label="Sum 1 to N" value={n} onChange={setN} min={1} max={100} />
					</FormSection>

					{result && !result.error && (
						<div className="space-y-4">
							<ResultBox label="Array Sum" state="success">
								<div className="font-mono text-sm text-white/80">
									SUM OF [{result.array.join(", ")}] = {result.arraySum}
								</div>
							</ResultBox>

							<div className="grid grid-cols-2 gap-4">
								<div className="border border-white/20 bg-white/3 p-4 space-y-2">
									<p className="text-xs text-white/70 font-mono uppercase tracking-widest">LOOP METHOD</p>
									<p className="text-2xl font-bold text-white">{result.loopSum}</p>
								</div>
								<div className="border border-white/20 bg-white/5 p-4 space-y-2">
									<p className="text-xs text-white/80 font-mono uppercase tracking-widest">FORMULA RESULT</p>
									<p className="text-2xl font-bold text-white">{result.formulaSum}</p>
								</div>
							</div>
						</div>
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
