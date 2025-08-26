import { useMemo } from "react";
import { Input } from "~/components/ui";

interface ColorControlsProps {
	colors: string[];
	onColorChange: (index: number, value: string) => void;
}

export function ColorControls({ colors, onColorChange }: ColorControlsProps) {
	const colorItems = useMemo(() => {
		return colors.map((color, index) => ({
			id: `${index}-${color}`,
			value: color,
			originalIndex: index,
		}));
	}, [colors]);

	const handleValueChange = (id: string, newValue: string) => {
		const item = colorItems.find((item) => item.id === id);
		if (item) {
			onColorChange(item.originalIndex, newValue);
		}
	};

	return (
		<div className="space-y-4">
			{colorItems.map((item) => (
				<div key={item.id} className="space-y-2">
					<label
						htmlFor={`color-${item.id}`}
						className="block text-sm font-medium"
					>
						Color Stop {item.originalIndex + 1}
					</label>
					<div className="flex gap-2">
						<Input
							id={`color-${item.id}`}
							type="color"
							value={item.value}
							onChange={(e) => handleValueChange(item.id, e.target.value)}
							className="w-12 h-10"
						/>
						<Input
							type="text"
							value={item.value}
							onChange={(e) => handleValueChange(item.id, e.target.value)}
							placeholder="#ffffff"
						/>
					</div>
				</div>
			))}
		</div>
	);
}
