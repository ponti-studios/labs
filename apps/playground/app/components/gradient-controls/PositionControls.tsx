import { Slider } from "~/components/ui";

interface PositionControlsProps {
	positions: number[];
	onPositionChange: (index: number, value: number) => void;
}

const POSITIONS: Record<number, string> = {
	0: "0",
	1: "1",
	2: "2",
	3: "3",
};

export function PositionControls({
	positions,
	onPositionChange,
}: PositionControlsProps) {
	return (
		<div className="space-y-4">
			{positions.map((position, index) => (
				<div key={`position-stop-${POSITIONS[index]}`} className="space-y-2">
					<label
						htmlFor={`position-${index}`}
						className="block text-sm font-medium"
					>
						Color Stop {index + 1} Position ({position}%)
					</label>
					<Slider
						id={`position-${index}`}
						value={[position]}
						onValueChange={(value: number[]) =>
							onPositionChange(index, value[0])
						}
						min={0}
						max={100}
						step={1}
					/>
				</div>
			))}
		</div>
	);
}
