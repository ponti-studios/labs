import { Card, CardContent } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Slider } from "~/components/ui/slider";
import type { Tracker } from "~/db/schema";

interface AttacksFormProps {
	attacks: Tracker["attacks"];
	onAttackChange: (
		index: number,
		field: "name" | "damage",
		value: string,
	) => void;
}

export function AttacksForm({ attacks, onAttackChange }: AttacksFormProps) {
	if (!attacks || attacks.length === 0) return null;
	return (
		<div data-testid="attacks" className="space-y-4">
			{attacks.map((attack, index) => (
				<Card key={attack.name} className="border-gray-300">
					<CardContent className="pt-6 space-y-4">
						<div className="space-y-2">
							<Label htmlFor={`attackName-${index}`} className="text-gray-700">
								{index === 0 ? "Best Quality" : "Special Talent"}
							</Label>
							<Input
								id={`attackName-${index}`}
								name={`attackName-${index}`}
								value={attack.name}
								onChange={(e) => onAttackChange(index, "name", e.target.value)}
								placeholder={index === 0 ? "Best Quality" : "Special Talent"}
								className="border-gray-300 focus:border-gray-500 focus:ring-gray-500"
							/>
						</div>

						<div className="space-y-2">
							<Label
								htmlFor={`attackDamage-${index}`}
								className="text-gray-700"
							>
								{index === 0 ? "Impact (1-100)" : "Impressiveness (1-100)"}
							</Label>
							<div className="flex items-center gap-4">
								<Slider
									id={`attackDamage-${index}`}
									min={1}
									max={100}
									step={5}
									value={[Number(attack.damage)]}
									onValueChange={(value) =>
										onAttackChange(index, "damage", String(value[0]))
									}
									className="flex-1"
								/>
								<span className="w-12 text-center font-bold">
									{attack.damage}
								</span>
							</div>
						</div>
					</CardContent>
				</Card>
			))}
		</div>
	);
}
