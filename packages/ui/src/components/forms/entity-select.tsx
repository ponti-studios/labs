import { useId } from "react";

import { Label } from "../primitives/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";

export interface EntitySelectOption {
  id: string;
  name: string;
}

export interface EntitySelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: EntitySelectOption[];
  isLoading?: boolean;
  placeholder?: string;
  label?: string;
  showLabel?: boolean;
  allOptionLabel?: string;
  emptyLabel?: string;
  className?: string;
}

/** Labeled `Select` over an `{ id, name }[]` list, with loading/empty states and an "all" option. */
export function EntitySelect({
  value,
  onValueChange,
  options,
  isLoading = false,
  placeholder = "All",
  label = "Filter",
  showLabel = false,
  allOptionLabel = "All",
  emptyLabel = "No options available",
  className,
}: EntitySelectProps) {
  const id = useId();

  const selectElement = (
    <Select
      name={label}
      value={value}
      onValueChange={(v: string | null) => v != null && onValueChange(v)}
    >
      <SelectTrigger id={id} className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="max-h-[250px] overflow-y-auto">
        <SelectItem value="all">{allOptionLabel}</SelectItem>
        {isLoading ? (
          <SelectItem value="loading" disabled>
            Loading...
          </SelectItem>
        ) : options.length === 0 ? (
          <SelectItem value="empty" disabled>
            {emptyLabel}
          </SelectItem>
        ) : (
          options.map((option) => (
            <SelectItem key={option.id} value={option.id}>
              {option.name}
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );

  if (showLabel) {
    return (
      <div className="space-y-2">
        <Label htmlFor={id}>{label}</Label>
        {selectElement}
      </div>
    );
  }

  return selectElement;
}
