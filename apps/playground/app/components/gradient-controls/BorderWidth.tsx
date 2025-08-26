import { Slider } from "~/components/ui";

interface BorderWidthProps {
	borderWidth: number;
	onBorderWidthChange: (value: number) => void;
}

export function BorderWidth({
	borderWidth,
	onBorderWidthChange,
}: BorderWidthProps) {
	return (
		<div className="space-y-2">
			<label htmlFor="border-width" className="block text-sm font-medium">
				Border Width ({borderWidth}px)
			</label>
			<Slider
				id="border-width"
				value={[borderWidth]}
				onValueChange={(value: number[]) => onBorderWidthChange(value[0])}
				min={1}
				max={20}
				step={1}
			/>
		</div>
	);
}
