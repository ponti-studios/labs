import type { Tracker } from "~/db/schema";
interface AttacksFormProps {
  attacks: Tracker["attacks"];
  onAttackChange: (index: number, field: "name" | "damage", value: string) => void;
}
export declare function AttacksForm({
  attacks,
  onAttackChange,
}: AttacksFormProps): import("react/jsx-runtime").JSX.Element | null;
export {};
//# sourceMappingURL=attacks-form.d.ts.map
