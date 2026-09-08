import { Slider } from "@ponti-studios/ui/forms";
import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "~/lib/utils";

export function ControlSection({ label, children }: { label: string; children: ReactNode }) {
  return (
    <fieldset className="border-border flex flex-wrap items-center gap-x-8 gap-y-5 rounded-xl border px-5 py-4">
      <legend className="text-muted-foreground px-1 text-xs font-medium tracking-wider uppercase">
        {label}
      </legend>
      {children}
    </fieldset>
  );
}

export function SliderControl({
  label,
  value,
  min,
  max,
  step,
  display,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  display: string;
  onChange: (value: number) => void;
}) {
  return (
    <label className="flex min-w-44 flex-1 flex-col gap-2">
      <span className="flex items-center justify-between gap-4">
        <span className="text-foreground text-sm font-medium">{label}</span>
        <span className="text-muted-foreground font-mono text-xs">{display}</span>
      </span>
      <Slider
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={([next]) => onChange(next)}
      />
    </label>
  );
}

export function ToggleControl({
  label,
  checked,
  offLabel,
  onLabel,
  onChange,
}: {
  label: string;
  checked: boolean;
  offLabel: string;
  onLabel: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-3">
      <span className="text-foreground text-sm font-medium">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "h-6 w-11 shrink-0 rounded-full p-0.5 transition-colors",
          checked ? "bg-primary" : "bg-muted",
        )}
      >
        <span
          className={cn(
            "bg-background block h-5 w-5 rounded-full shadow transition-transform",
            checked && "translate-x-5",
          )}
        />
      </button>
      <span className="text-muted-foreground text-xs">{checked ? onLabel : offLabel}</span>
    </label>
  );
}

export function SegmentedControl<T extends string>({
  label,
  value,
  options,
  onChange,
  layoutId,
}: {
  label: string;
  value: T;
  options: ReadonlyArray<{ value: T; label: string }>;
  onChange: (value: T) => void;
  layoutId?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-foreground text-sm font-medium">{label}</span>
      <div
        role="radiogroup"
        aria-label={label}
        className="border-border bg-background/60 inline-flex gap-1 rounded-full border p-1 shadow-sm backdrop-blur-md"
      >
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={option.value === value}
            onClick={() => onChange(option.value)}
            className={cn(
              "relative rounded-full px-3 py-1 text-xs font-medium transition-colors",
              option.value === value
                ? "text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {option.value === value && (
              <motion.span
                layoutId={layoutId ?? `segmented-${label}`}
                className="bg-primary absolute inset-0 -z-0 rounded-full shadow-sm"
                transition={{ type: "spring", stiffness: 500, damping: 35 }}
              />
            )}
            <span className="relative z-10">{option.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
