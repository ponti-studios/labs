import { useState } from "react";
import { isPalindrome, Stack } from "~/lib/algorithms/stacks";

export default function StacksDemo() {
	const [wordInput, setWordInput] = useState("racecar");
	const [result, setResult] = useState<any>(null);
	const [executed, setExecuted] = useState(false);

	const handleCheck = () => {
		try {
			const isPalin = isPalindrome(wordInput);
			setResult({ word: wordInput, isPalindrome: isPalin });
			setExecuted(true);
		} catch (error) {
			setResult({ error: "Invalid input" });
			setExecuted(true);
		}
	};

	return (
		<div className="space-y-8 max-w-2xl">
			<div className="space-y-2">
				<h1 className="text-3xl font-bold text-stone-800">Stacks & Palindromes</h1>
				<p className="text-stone-600">
					Learn how to use stacks to check if a word is a palindrome
				</p>
			</div>

			<div className="bg-white rounded-lg border border-stone-200 p-6 space-y-4">
				<div>
					<h3 className="font-semibold text-stone-800 mb-2">What is a Stack?</h3>
					<p className="text-sm text-stone-700 mb-3">
						A Stack is a Last-In-First-Out (LIFO) data structure where items are added and removed from the same end (top).
						Like a stack of books - you add to the top and remove from the top.
					</p>

					<h3 className="font-semibold text-stone-800 mb-2 mt-4">Palindrome Checking</h3>
					<p className="text-sm text-stone-700 mb-3">
						A palindrome is a word that reads the same forwards and backwards.
						We can check this using a stack by pushing characters onto the stack and then comparing them as we pop.
					</p>
				</div>

				<div className="bg-blue-50 p-4 rounded border border-blue-200">
					<p className="text-sm font-mono text-blue-900">
						<strong>Time Complexity:</strong> O(n)
					</p>
					<p className="text-sm font-mono text-blue-900">
						<strong>Space Complexity:</strong> O(n)
					</p>
				</div>
			</div>

			<div className="bg-white rounded-lg border border-stone-200 p-6 space-y-4">
				<h3 className="font-semibold text-stone-800">Palindrome Checker</h3>
				<div className="space-y-3">
					<div>
						<label className="block text-sm font-medium text-stone-700 mb-2">
							Enter a word
						</label>
						<input
							type="text"
							value={wordInput}
							onChange={(e) => setWordInput(e.target.value.toLowerCase())}
							className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
							placeholder="racecar"
						/>
					</div>
					<button
						onClick={handleCheck}
						className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
					>
						Check
					</button>
				</div>

				{executed && result && !result.error && (
					<div className={`p-4 rounded ${result.isPalindrome ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
						<p className={`text-sm font-medium ${result.isPalindrome ? 'text-green-900' : 'text-red-900'}`}>
							{result.isPalindrome ? `✓ "${result.word}" is a palindrome!` : `✗ "${result.word}" is not a palindrome`}
						</p>
					</div>
				)}
			</div>

			<div className="bg-stone-50 border border-stone-200 rounded-lg p-6">
				<h3 className="font-semibold text-stone-800 mb-3">Stack Operations</h3>
				<div className="space-y-2 text-sm text-stone-700">
					<p><strong>Push:</strong> Add an element to the top of the stack</p>
					<p><strong>Pop:</strong> Remove and return the top element</p>
					<p><strong>Peek:</strong> View the top element without removing it</p>
					<p><strong>Length:</strong> Get the number of elements in the stack</p>
				</div>
			</div>
		</div>
	);
}
