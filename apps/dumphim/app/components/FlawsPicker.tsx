import { Label } from "~/components/ui/label";

interface FlawsPickerProps {
	selectedFlaws: string[];
	onFlawChange: (flaw: string, checked: boolean) => void;
}

const ALL_FLAWS = [
	"stubborn",
	"messy",
	"forgetful",
	"impatient",
	"workaholic",
	"indecisive",
	"jealous",
	"moody",
	"procrastinator",
	"picky",
];

export function FlawsPicker({ selectedFlaws, onFlawChange }: FlawsPickerProps) {
	return (
		<div data-testid="flaws-picker" className="space-y-2">
			<Label className="text-gray-700">Flaws (Select Multiple)</Label>
			<div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 border border-gray-300 rounded-md bg-white">
				{ALL_FLAWS.map((flaw) => (
					<div key={flaw} className="flex items-center space-x-2">
						<input
							type="checkbox"
							id={`flaw-${flaw}`}
							checked={selectedFlaws.includes(flaw)}
							onChange={(e) => onFlawChange(flaw, e.target.checked)}
							className="rounded border-gray-400 text-black focus:ring-gray-500"
						/>
						<Label
							htmlFor={`flaw-${flaw}`}
							className="text-sm capitalize text-gray-700"
						>
							{flaw}
						</Label>
					</div>
				))}
			</div>
		</div>
	);
}
