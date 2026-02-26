import { useState } from "react";
import { sumOfNumbers, sumUp, sumUpFormula } from "~/lib/problems/sum-array";

export default function SumArrayRoute() {
	const [arrayInput, setArrayInput] = useState("1,2,3,4,5");
	const [n, setN] = useState(10);
	const [result, setResult] = useState<any>(null);
	const [executed, setExecuted] = useState(false);

	const handleSum = () => {
		try {
			const arr = arrayInput.split(",").map(x => parseInt(x.trim()));
			const arraySum = sumOfNumbers(arr);
			const loopSum = sumUp(n);
			const formulaSum = sumUpFormula(n);

			setResult({
				arraySum,
				loopSum,
				formulaSum,
				array: arr
			});
			setExecuted(true);
		} catch (error) {
			setResult({ error: "Invalid input" });
			setExecuted(true);
		}
	};

	return (
		<div className="space-y-8 max-w-2xl">
			<div className="space-y-2">
				<h1 className="text-3xl font-bold text-stone-800">Sum Array</h1>
				<p className="text-stone-600">
					Different approaches to summing numbers with performance comparison
				</p>
			</div>

			<div className="bg-white rounded-lg border border-stone-200 p-6 space-y-4">
				<div>
					<h3 className="font-semibold text-stone-800 mb-3">Approaches</h3>
					<div className="space-y-3">
						<div className="p-3 bg-blue-50 rounded border border-blue-200">
							<p className="text-xs font-bold text-blue-900 mb-1">Loop Approach</p>
							<p className="text-xs text-blue-800">Time: O(n) - Linear</p>
							<pre className="text-xs font-mono bg-white p-2 rounded mt-2 overflow-x-auto">
for (let i of numbers) {"{"}
  result += i
{"}"}
							</pre>
						</div>

						<div className="p-3 bg-yellow-50 rounded border border-yellow-200">
							<p className="text-xs font-bold text-yellow-900 mb-1">Formula Approach</p>
							<p className="text-xs text-yellow-800">Time: O(1) - Constant</p>
							<pre className="text-xs font-mono bg-white p-2 rounded mt-2">
sum = n * (n + 1) / 2
							</pre>
							<p className="text-xs text-yellow-800 mt-1">Much faster for large numbers!</p>
						</div>
					</div>
				</div>
			</div>

			<div className="bg-white rounded-lg border border-stone-200 p-6 space-y-4">
				<h3 className="font-semibold text-stone-800">Calculator</h3>
				<div className="space-y-3">
					<div>
						<label className="block text-sm font-medium text-stone-700 mb-2">
							Array to Sum (comma-separated)
						</label>
						<input
							type="text"
							value={arrayInput}
							onChange={(e) => setArrayInput(e.target.value)}
							className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 font-mono text-sm"
							placeholder="1,2,3,4,5"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-stone-700 mb-2">
							Sum 1 to N
						</label>
						<input
							type="number"
							value={n}
							onChange={(e) => setN(parseInt(e.target.value) || 0)}
							className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
						/>
					</div>

					<button
						onClick={handleSum}
						className="w-full px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-medium"
					>
						Calculate
					</button>
				</div>

				{executed && result && !result.error && (
					<div className="space-y-3">
						<div className="p-4 bg-blue-50 border border-blue-200 rounded">
							<p className="text-sm text-blue-900">
								<strong>Sum of Array [{result.array.join(", ")}]:</strong> {result.arraySum}
							</p>
						</div>

						<div className="grid grid-cols-2 gap-3">
							<div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
								<p className="text-xs text-yellow-800">Sum 1 to {n}</p>
								<p className="text-lg font-bold text-yellow-900">{result.loopSum}</p>
							</div>
							<div className="p-3 bg-green-50 border border-green-200 rounded">
								<p className="text-xs text-green-800">Formula Result</p>
								<p className="text-lg font-bold text-green-900">{result.formulaSum}</p>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
