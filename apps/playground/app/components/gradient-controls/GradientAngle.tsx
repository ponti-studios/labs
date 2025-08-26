import { Button, Input } from "~/components/ui";

interface GradientAngleProps {
	degree: number;
	presetAngles: number[];
	onDegreeChange: (value: number) => void;
}

export function GradientAngle({
	degree,
	presetAngles,
	onDegreeChange,
}: GradientAngleProps) {
	return (
		<div className="space-y-2">
			<label htmlFor="gradient-angle" className="block text-sm font-medium">
				Gradient Angle (degrees)
			</label>
			<div className="flex gap-4 items-center">
				<Input
					id="gradient-angle"
					type="number"
					value={degree}
					onChange={(e) => onDegreeChange(Number(e.target.value))}
					min="0"
					max="360"
					className="w-24"
				/>
				<div className="flex gap-2">
					{presetAngles.map((angle) => (
						<Button
							key={angle}
							variant="secondary"
							onClick={() => onDegreeChange(angle)}
						>
							{angle}°
						</Button>
					))}
				</div>
			</div>
		</div>
	);
}
