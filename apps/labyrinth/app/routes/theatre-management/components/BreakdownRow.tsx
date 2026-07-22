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
        muted && "text-muted-foreground",
      )}
    >
      <span className={cn(bold ? "text-foreground" : "text-muted-foreground")}>{label}</span>
      <span
        className={cn(
          "tabular-nums",
          bold ? "text-foreground" : negative ? "text-destructive" : "text-foreground",
        )}
      >
        {negative && "−"}
        {value}
      </span>
    </div>
  );
}
