import { useId } from "react";

import { Label } from "../primitives/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";

type GroupByOption = "month" | "week" | "day";

export interface GroupBySelectProps {
  groupBy: GroupByOption;
  onGroupByChange: (value: GroupByOption) => void;
  label?: string;
  className?: string;
}

/** Month/week/day grouping select. */
export function GroupBySelect({
  groupBy,
  onGroupByChange,
  label = "Group By",
  className,
}: GroupBySelectProps) {
  const id = useId();

  return (
    <div className={`space-y-2 ${className || ""}`}>
      <Label htmlFor={id}>{label}</Label>
      <Select
        name="groupBy"
        value={groupBy}
        onValueChange={(value) => {
          if (value === "month" || value === "week" || value === "day") {
            onGroupByChange(value);
          }
        }}
      >
        <SelectTrigger id={id}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="month">Month</SelectItem>
          <SelectItem value="week">Week</SelectItem>
          <SelectItem value="day">Day</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
