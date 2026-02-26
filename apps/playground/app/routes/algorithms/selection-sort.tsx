import { useState } from "react";
import { selectionSort } from "~/lib/algorithms/selection-sort";

export default function SelectionSortDemo() {
	const [arrayInput, setArrayInput] = useState("64,25,12,22,11");
	const [result, setResult] = useState<any>(null);
	const [executed, setExecuted] = useState(false);

	const handleSort = () => {
		try {
			const arr = arrayInput.split(",").map(n => parseInt(n.trim()));
			const sorted = selectionSort([...arr]);
			setResult({ original: arr, sorted });
			setExecuted(true);
		} catch (error) {
			setResult({ error: "Invalid input" });
			setExecuted(true);
		}
	};

	return (
		<div className="space-y-8 max-w-2xl">
			<div className="space-y-2">
				<h1 className="text-3xl font-bold text-stone-800">Selection Sort</h1>
				<p className="text-stone-600">
					A sorting algorithm that divides the array into sorted and unsorted regions
				</p>
			</div>

			<div className="bg-white rounded-lg border border-stone-200 p-6 space-y-4">
				<div>
					<h3 className="font-semibold text-stone-800 mb-2">How it works</h3>
					<ol className="text-sm text-stone-700 space-y-2 list-decimal list-inside">
						<li>Find the minimum element in the unsorted region</li>
						<li>Swap it with the first element of the unsorted region</li>
						<li>Move the boundary between sorted and unsorted regions one element right</li>
						<li>Repeat until the entire array is sorted</li>
					</ol>
				</div>

				<div className="bg-blue-50 p-4 rounded border border-blue-200">
					<p className="text-sm font-mono text-blue-900">
						<strong>Time Complexity:</strong> O(n²)
					</p>
					<p className="text-sm font-mono text-blue-900">
						<strong>Space Complexity:</strong> O(1)
					</p>
				</div>
			</div>

			<div className="bg-white rounded-lg border border-stone-200 p-6 space-y-4">
				<h3 className="font-semibold text-stone-800">Interactive Demo</h3>
				<div className="space-y-3">
					<div>
						<label className="block text-sm font-medium text-stone-700 mb-2">
							Array to Sort (comma-separated numbers)
						</label>
						<input
							type="text"
							value={arrayInput}
							onChange={(e) => setArrayInput(e.target.value)}
							className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
							placeholder="64,25,12,22,11"
						/>
					</div>
					<button
						onClick={handleSort}
						className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
					>
						Sort
					</button>
				</div>

				{executed && result && !result.error && (
					<div className="space-y-3">
						<div className="p-4 bg-stone-50 rounded border border-stone-200">
							<p className="text-sm text-stone-700">
								<strong>Original:</strong> [{result.original.join(", ")}]
							</p>
						</div>
						<div className="p-4 bg-green-50 rounded border border-green-200">
							<p className="text-sm text-green-900">
								<strong>✓ Sorted:</strong> [{result.sorted.join(", ")}]
							</p>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
