import { Input } from "@ponti-studios/ui/forms";
import { cn } from "~/lib/utils";
import { clamp } from "../theatre-model";
import { fmt } from "../utils";

export function NumericControl({
  id,
  label,
  value,
  onChange,
  min,
  max,
  hint,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  hint?: string;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between gap-4">
        <label htmlFor={id} className="text-muted-foreground text-sm font-medium">
          {label}
        </label>
        <span className="text-foreground font-['Geist'] text-lg font-semibold tabular-nums">
          {fmt(value)}
        </span>
      </div>
      <Input
        id={id}
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        step={100}
        value={value}
        onChange={(event) => {
          const next = Number(event.currentTarget.value);
          onChange(Number.isNaN(next) ? min : clamp(next, min, max));
        }}
      />
      {hint && <p className="text-muted-foreground text-xs">{hint}</p>}
    </div>
  );
}
