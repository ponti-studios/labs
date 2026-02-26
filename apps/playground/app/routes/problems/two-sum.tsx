import { useState } from "react";
import { twoSum } from "~/lib/problems/two-sum";
import {
	PageHeader,
	PageSection,
	FormSection,
	InputField,
	ResultBox,
	InfoBox,
	CodeBlock,
} from "~/components/void-components";

export default function TwoSumRoute() {
	const [target, setTarget] = useState("9");
	const [nums, setNums] = useState("2,7,11,15");
	const [result, setResult] = useState<any>(undefined);
	const [isLoading, setIsLoading] = useState(false);

	const handleSolve = () => {
		setIsLoading(true);
		setTimeout(() => {
			try {
				const numArray = nums.split(",").map(n => parseInt(n.trim()));
				const res = twoSum(numArray, parseInt(target) || 0);
				setResult(res);
			} catch (error) {
				setResult("INVALID INPUT");
			}
			setIsLoading(false);
		}, 100);
	};

	const handleReset = () => {
		setResult(undefined);
		setNums("2,7,11,15");
		setTarget("9");
	};

	return (
		<div className="min-h-screen bg-black text-white font-mono">
			<div className="w-full max-w-6xl mx-auto px-4 py-8 md:py-12 space-y-12">
				<PageHeader
					title="Two Sum Problem"
					description="Find two numbers in an array that add up to a target sum"
				/>


				<PageSection title="Problem Statement">
					<div className="space-y-4 font-mono text-sm">
						<p className="text-white/80">
							Given an array of integers and a target number, find the indices of the two numbers
							that add up to the target.
						</p>
						<CodeBlock>
{`INPUT: NUMS = [2, 7, 11, 15], TARGET = 9
OUTPUT: [0, 1]
EXPLANATION: NUMS[0] + NUMS[1] = 2 + 7 = 9`}
						</CodeBlock>
					</div>
				</PageSection>

				<PageSection title="Complexity Analysis">
					<InfoBox>
						<div className="space-y-1 font-mono text-sm">
							<p><strong>TIME COMPLEXITY:</strong> O(N)</p>
							<p><strong>SPACE COMPLEXITY:</strong> O(N)</p>
							<p className="text-white/70 text-xs pt-2">Uses a HashMap to store values and indices</p>
						</div>
					</InfoBox>
				</PageSection>


				<PageSection title="Interactive Solver">
					<FormSection onSubmit={handleSolve} isLoading={isLoading}>
						<InputField
							label="Array of Numbers (comma-separated)"
							value={nums}
							onChange={setNums}
							placeholder="2,7,11,15"
						/>
						<InputField
							label="Target Sum"
							type="number"
							value={target}
							onChange={setTarget}
							placeholder="9"
						/>
					</FormSection>

					{result !== undefined && (
						<ResultBox
							label="RESULT"
							state={typeof result !== "string" && Array.isArray(result) && result.length === 2 ? "success" : "error"}
						>
							<div className="font-mono text-sm text-white/80">
								{typeof result === "string" ? `[✗] ${result}` : `[✓] INDICES: [${result}]`}
							</div>
						</ResultBox>
					)}

					{result !== undefined && (
						<button
							onClick={handleReset}
							className="text-xs font-mono uppercase tracking-widest border border-white/20 text-white/80 px-4 py-2 hover:bg-white/5 hover:border-white/40 transition-all duration-100 cursor-crosshair"
						>
							Reset
						</button>
					)}
				</PageSection>


				<PageSection title="Solution Approach">
					<CodeBlock>
{`STEP 1: CREATE A MAP TO STORE VALUES AND INDICES
STEP 2: ITERATE THROUGH THE ARRAY
STEP 3: FOR EACH NUMBER, CHECK IF (TARGET - NUMBER) EXISTS IN MAP
STEP 4: IF FOUND, RETURN INDICES; OTHERWISE, ADD TO MAP`}
					</CodeBlock>
				</PageSection>
			</div>
		</div>
	);
}
