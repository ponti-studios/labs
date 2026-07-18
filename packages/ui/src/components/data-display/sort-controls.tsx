import { ListOrdered, PlusCircle } from "lucide-react";

import type { SortField, SortOption } from "../../hooks/sort.types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../overlays/dropdown-menu";
import { Button } from "../primitives/button";
import { SortRow } from "./sort-row";

export interface SortControlsProps {
  sortOptions: SortOption[];
  sortableFields: SortField[];
  addSortOption: (option: SortOption) => void;
  updateSortOption: (index: number, option: SortOption) => void;
  removeSortOption: (index: number) => void;
  open?: boolean | undefined;
  onOpenChange?: ((open: boolean) => void) | undefined;
  focusedSortIndex?: (number | null) | undefined;
}

/** Multi-field sort builder, driven by the `SortOption`/`SortField` shared types. */
export function SortControls({
  sortOptions,
  sortableFields,
  addSortOption,
  updateSortOption,
  removeSortOption,
  open,
  onOpenChange,
  focusedSortIndex,
}: SortControlsProps) {
  const availableFieldsToAdd = sortableFields.filter(
    (field) => !sortOptions.some((option) => option.field === field),
  );

  return (
    <DropdownMenu {...(open !== undefined && { open })} {...(onOpenChange && { onOpenChange })}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <ListOrdered className="mr-2 size-4" />
          Sort
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 space-y-2 p-2">
        <DropdownMenuLabel>Define Sort Order</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuGroup className="space-y-1">
          {sortOptions.map((sort, index) => {
            const usedFields = sortOptions
              .filter((_, i) => i !== index)
              .map((option) => option.field);
            return (
              <DropdownMenuItem
                key={sort.field}
                onSelect={(e) => e.preventDefault()}
                className={`p-0 focus:bg-transparent ${index === focusedSortIndex ? "bg-accent" : ""}`}
              >
                <SortRow
                  sortOption={sort}
                  index={index}
                  sortableFields={sortableFields}
                  usedFields={usedFields}
                  updateSortOption={updateSortOption}
                  removeSortOption={removeSortOption}
                />
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuGroup>
        {availableFieldsToAdd.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                const firstAvailable = availableFieldsToAdd[0];
                if (firstAvailable) {
                  addSortOption({ field: firstAvailable, direction: "desc" });
                }
              }}
              disabled={availableFieldsToAdd.length === 0}
              className="mt-1"
            >
              <PlusCircle className="mr-2 size-4" />
              Add Sort Criterion
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
