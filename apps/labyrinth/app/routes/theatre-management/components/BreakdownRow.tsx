import { cn } from "~/lib/utils";

export function BreakdownRow({
  label,
  value,
  negative,
  bold,
  muted,
}: {
  label: string;
  value: string;
  negative?: boolean;
  bold?: boolean;
  muted?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between py-2 text-sm",
        bold && "font-semibold",
        muted && "text-secondary",
      )}
    >
      <span className={cn(bold ? "text-primary" : "text-secondary")}>{label}</span>
      <span
        className={cn(
          "tabular-nums",
          bold ? "text-primary" : negative ? "text-destructive" : "text-primary",
        )}
      >
        {negative && "−"}
        {value}
      </span>
    </div>
  );
}
