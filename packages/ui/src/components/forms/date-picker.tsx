import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { Button } from "../primitives/button";
import { Calendar } from "../forms/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../overlays/popover";

export interface DatePickerProps {
  value: Date | undefined;
  onSelect: (date: Date | undefined) => void;
  disabled?: boolean;
  id?: string;
  placeholder?: string;
  label?: string;
  dateFormat?: string;
  showLabel?: boolean;
  containerClassName?: string;
  popoverAlign?: "start" | "center" | "end";
  variant?: "outline" | "default" | "destructive" | "secondary" | "ghost" | "link";
}

export function DatePicker({
  value,
  onSelect,
  disabled = false,
  id = "date-picker",
  placeholder = "Pick a date",
  label,
  dateFormat = "MMM d, yyyy",
  showLabel = true,
  containerClassName = "flex-1 min-w-0",
  popoverAlign = "start",
  variant = "outline",
}: DatePickerProps) {
  return (
    <div className={containerClassName}>
      {showLabel && label ? (
        <label htmlFor={id} className="text-primary mb-2 block text-sm font-medium">
          {label}
        </label>
      ) : null}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id={id}
            variant={variant}
            disabled={disabled}
            className="bg-inset placeholder:text-secondary w-full justify-start text-left font-normal backdrop-blur-sm"
          >
            <CalendarIcon className="mr-2 size-4" />
            {value ? format(value, dateFormat) : <span>{placeholder}</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="bg-canvas w-auto p-0" align={popoverAlign}>
          <Calendar mode="single" selected={value} onSelect={onSelect} />
        </PopoverContent>
      </Popover>
    </div>
  );
}
