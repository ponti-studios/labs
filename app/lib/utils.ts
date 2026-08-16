export { cn } from "@ponti-studios/ui/utilities";

export function formatCurrency(
  value: number,
  options: { minimumFractionDigits?: number; maximumFractionDigits?: number } = {},
): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: options.minimumFractionDigits ?? 0,
    maximumFractionDigits: options.maximumFractionDigits ?? 0,
  }).format(value);
}
