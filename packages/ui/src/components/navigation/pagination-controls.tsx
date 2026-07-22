import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "../primitives/button";

export interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

/** Zero-indexed prev/next pagination control. Renders nothing for a single page. */
export function PaginationControls({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationControlsProps) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="text-sm text-muted-foreground flex items-center justify-end gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="border-dashed"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 0}
      >
        <ChevronLeft className="size-4" aria-hidden />
        Previous
      </Button>
      <span className="text-xs text-foreground">
        Page {currentPage + 1} of {totalPages}
      </span>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="border-dashed"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages - 1}
      >
        Next
        <ChevronRight className="size-4" aria-hidden />
      </Button>
    </div>
  );
}
