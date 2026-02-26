import { useState } from "react";
import { binarySearch, binarySearchExample } from "~/lib/algorithms/binary-search";

export default function BinarySearchDemo() {
	const [target, setTarget] = useState(42);
	const [result, setResult] = useState<number | null>(null);
	const [executed, setExecuted] = useState(false);

	const handleSearch = () => {
		const arr = Array.from({ length: 101 }, (_, i) => i);
		const res = binarySearch(target, arr);
		setResult(res);
		setExecuted(true);
	};

	return (
		<div className="space-y-8 max-w-2xl">
			<div className="space-y-2">
				<h1 className="text-3xl font-bold text-stone-800">Binary Search</h1>
				<p className="text-stone-600">
					An efficient algorithm for finding a target value in a sorted array
				</p>
			</div>

			<div className="bg-white rounded-lg border border-stone-200 p-6 space-y-6">
				<div>
					<h3 className="font-semibold text-stone-800 mb-2">How it works</h3>
					<ol className="text-sm text-stone-700 space-y-2 list-decimal list-inside">
						<li>Start with min = 0, max = array length - 1</li>
						<li>Calculate guess as the midpoint (min + max) / 2</li>
						<li>Compare array[guess] with target</li>
						<li>If equal, found! Otherwise adjust min or max</li>
						<li>Repeat until found or range is empty</li>
					</ol>
				</div>

				<div className="bg-blue-50 p-4 rounded border border-blue-200">
					<p className="text-sm font-mono text-blue-900">
						<strong>Time Complexity:</strong> O(log n)
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
							Search for (0-100)
						</label>
						<input
							type="number"
							min="0"
							max="100"
							value={target}
							onChange={(e) => setTarget(parseInt(e.target.value) || 0)}
							className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
					</div>
					<button
						onClick={handleSearch}
						className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
					>
						Search
					</button>
				</div>

				{executed && (
					<div className={`p-4 rounded ${result !== null ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
						<p className={`text-sm font-medium ${result !== null ? 'text-green-900' : 'text-red-900'}`}>
							{result !== null ? `✓ Found at index ${result}` : '✗ Value not found'}
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
