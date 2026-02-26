import { useState } from "react";
import { swap, functionalSwap } from "~/lib/problems/swap";

export default function SwapRoute() {
	const [array, setArray] = useState("1,2,3");
	const [firstIndex, setFirstIndex] = useState(0);
	const [secondIndex, setSecondIndex] = useState(2);
	const [result, setResult] = useState<any>(null);
	const [executed, setExecuted] = useState(false);

	const handleSwap = () => {
		try {
			const arr = array.split(",").map(n => {
				const trimmed = n.trim();
				return isNaN(parseInt(trimmed)) ? trimmed : parseInt(trimmed);
			});
			const res = swap([...arr], firstIndex, secondIndex);
			setResult(res);
			setExecuted(true);
		} catch (error) {
			setResult("Invalid input");
			setExecuted(true);
		}
	};

	return (
		<div className="space-y-8 max-w-2xl">
			<div className="space-y-2">
				<h1 className="text-3xl font-bold text-stone-800">Swap Array Elements</h1>
				<p className="text-stone-600">
					Learn different approaches to swapping elements in an array
				</p>
			</div>

			<div className="bg-white rounded-lg border border-stone-200 p-6 space-y-4">
				<div>
					<h3 className="font-semibold text-stone-800 mb-3">Swap Approaches</h3>
					<div className="space-y-3">
						<div className="p-3 bg-red-50 rounded border border-red-200">
							<p className="text-xs font-bold text-red-900 mb-1">❌ Broken Approach</p>
							<pre className="text-xs font-mono bg-white p-2 rounded mt-2">
array[i] = array[j];
array[j] = array[i]; // Wrong! Value already overwritten
							</pre>
						</div>

						<div className="p-3 bg-green-50 rounded border border-green-200">
							<p className="text-xs font-bold text-green-900 mb-1">✅ Standard Approach</p>
							<pre className="text-xs font-mono bg-white p-2 rounded mt-2">
const temp = array[i];
array[i] = array[j];
array[j] = temp;
							</pre>
						</div>

						<div className="p-3 bg-blue-50 rounded border border-blue-200">
							<p className="text-xs font-bold text-blue-900 mb-1">✨ Functional Approach</p>
							<pre className="text-xs font-mono bg-white p-2 rounded mt-2">
array.reduce((acc, val, idx) =&gt; {"..."}
							</pre>
							<p className="text-xs text-blue-800 mt-2">Immutable - doesn't modify original array</p>
						</div>
					</div>
				</div>
			</div>

			<div className="bg-white rounded-lg border border-stone-200 p-6 space-y-4">
				<h3 className="font-semibold text-stone-800">Interactive Swapper</h3>
				<div className="space-y-3">
					<div>
						<label className="block text-sm font-medium text-stone-700 mb-2">
							Array (comma-separated)
						</label>
						<input
							type="text"
							value={array}
							onChange={(e) => setArray(e.target.value)}
							className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 font-mono text-sm"
							placeholder="1,2,3"
						/>
					</div>

					<div className="grid grid-cols-2 gap-3">
						<div>
							<label className="block text-sm font-medium text-stone-700 mb-2">
								First Index
							</label>
							<input
								type="number"
								value={firstIndex}
								onChange={(e) => setFirstIndex(parseInt(e.target.value) || 0)}
								className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-stone-700 mb-2">
								Second Index
							</label>
							<input
								type="number"
								value={secondIndex}
								onChange={(e) => setSecondIndex(parseInt(e.target.value) || 0)}
								className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
							/>
						</div>
					</div>

					<button
						onClick={handleSwap}
						className="w-full px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-medium"
					>
						Swap
					</button>
				</div>

				{executed && (
					<div className="p-4 bg-green-50 border border-green-200 rounded">
						<p className="text-sm text-green-900">
							<strong>Result:</strong> [{result?.join(", ")}]
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
