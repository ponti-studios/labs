import { useState } from "react";
import { twoSum } from "~/lib/problems/two-sum";

export default function TwoSumRoute() {
	const [target, setTarget] = useState(9);
	const [nums, setNums] = useState("2,7,11,15");
	const [result, setResult] = useState<any>(null);
	const [executed, setExecuted] = useState(false);

	const handleSolve = () => {
		try {
			const numArray = nums.split(",").map(n => parseInt(n.trim()));
			const res = twoSum(numArray, target);
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
				<h1 className="text-3xl font-bold text-stone-800">Two Sum Problem</h1>
				<p className="text-stone-600">
					Find two numbers in an array that add up to a target sum
				</p>
			</div>

			<div className="bg-white rounded-lg border border-stone-200 p-6 space-y-4">
				<div>
					<h3 className="font-semibold text-stone-800 mb-3">Problem Statement</h3>
					<p className="text-sm text-stone-700 mb-3">
						Given an array of integers and a target number, find the indices of the two numbers 
						that add up to the target.
					</p>
					<div className="bg-gray-50 p-3 rounded text-xs font-mono text-gray-800">
						Input: nums = [2, 7, 11, 15], target = 9<br/>
						Output: [0, 1]<br/>
						Explanation: nums[0] + nums[1] = 2 + 7 = 9
					</div>
				</div>

				<div className="bg-blue-50 p-4 rounded border border-blue-200">
					<p className="text-sm font-mono text-blue-900">
						<strong>Time Complexity:</strong> O(n)
					</p>
					<p className="text-sm font-mono text-blue-900">
						<strong>Space Complexity:</strong> O(n)
					</p>
					<p className="text-xs text-blue-800 mt-2">
						Uses a HashMap to store values and their indices for efficient lookup
					</p>
				</div>
			</div>

			<div className="bg-white rounded-lg border border-stone-200 p-6 space-y-4">
				<h3 className="font-semibold text-stone-800">Interactive Solver</h3>
				<div className="space-y-3">
					<div>
						<label className="block text-sm font-medium text-stone-700 mb-2">
							Array of Numbers (comma-separated)
						</label>
						<input
							type="text"
							value={nums}
							onChange={(e) => setNums(e.target.value)}
							className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 font-mono text-sm"
							placeholder="2,7,11,15"
						/>
					</div>
					<div>
						<label className="block text-sm font-medium text-stone-700 mb-2">
							Target Sum
						</label>
						<input
							type="number"
							value={target}
							onChange={(e) => setTarget(parseInt(e.target.value) || 0)}
							className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
						/>
					</div>
					<button
						onClick={handleSolve}
						className="w-full px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-medium"
					>
						Solve
					</button>
				</div>

				{executed && (
					<div className={`p-4 rounded ${
						typeof result !== 'string' && Array.isArray(result) && result.length === 2
							? 'bg-green-50 border border-green-200'
							: 'bg-red-50 border border-red-200'
					}`}>
						<p className={`text-sm font-medium ${
							typeof result !== 'string' && Array.isArray(result) && result.length === 2
								? 'text-green-900'
								: 'text-red-900'
						}`}>
							{typeof result === 'string' ? `✗ ${result}` : `✓ Result: [${result}]`}
						</p>
					</div>
				)}
			</div>

			<div className="bg-stone-50 border border-stone-200 rounded-lg p-6">
				<h3 className="font-semibold text-stone-800 mb-3">Solution Approach</h3>
				<div className="space-y-2 text-sm text-stone-700">
					<p>1. Create a Map to store values and their indices</p>
					<p>2. Iterate through the array</p>
					<p>3. For each number, check if (target - number) exists in the Map</p>
					<p>4. If found, return the indices; otherwise, add current number to Map</p>
				</div>
			</div>
		</div>
	);
}
