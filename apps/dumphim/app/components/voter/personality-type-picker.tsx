"use client";

import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { cn } from "~/lib/utils";

export const PERSONALITY_TYPES = [
	{ value: "adventurous", label: "Adventurous", color: "bg-orange-500" },
	{ value: "artistic", label: "Artistic", color: "bg-purple-500" },
	{ value: "athletic", label: "Athletic", color: "bg-blue-500" },
	{ value: "intellectual", label: "Intellectual", color: "bg-cyan-500" },
	{ value: "romantic", label: "Romantic", color: "bg-pink-500" },
	{ value: "ambitious", label: "Ambitious", color: "bg-yellow-500" },
	{ value: "funny", label: "Funny", color: "bg-green-500" },
	{ value: "caring", label: "Caring", color: "bg-red-400" },
	{ value: "outgoing", label: "Outgoing", color: "bg-indigo-500" },
	{ value: "loyal", label: "Loyal", color: "bg-amber-600" },
	{ value: "spontaneous", label: "Spontaneous", color: "bg-lime-500" },
	{ value: "calm", label: "Calm", color: "bg-teal-500" },
	{ value: "organized", label: "Organized", color: "bg-slate-500" },
	{ value: "creative", label: "Creative", color: "bg-violet-500" },
	{ value: "independent", label: "Independent", color: "bg-emerald-500" },
	{ value: "sensitive", label: "Sensitive", color: "bg-rose-500" },
	{ value: "reliable", label: "Reliable", color: "bg-gray-500" },
];

interface PersonalityTypePickerProps {
	value: string;
	onChange: (value: string) => void;
}

export function PersonalityTypePicker({
	value,
	onChange,
}: PersonalityTypePickerProps) {
	return (
		<div data-testid="personality-type" className="space-y-2">
			<Label className="text-gray-700">Personality Type</Label>
			<div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
				{PERSONALITY_TYPES.map((type) => (
					<Button
						key={type.value}
						type="button"
						variant={value === type.value ? "default" : "outline"}
						className={cn(
							"h-auto py-1 px-2 text-xs",
							value === type.value
								? "bg-black text-white hover:bg-gray-800"
								: "bg-white text-black border-gray-300 hover:bg-gray-100",
						)}
						onClick={() => onChange(type.value)}
					>
						{type.label}
					</Button>
				))}
			</div>
		</div>
	);
}
