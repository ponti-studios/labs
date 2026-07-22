import type React from "react";
import { useCallback, useId } from "react";

import { cn } from "../../lib/utils";

export interface DropZoneProps {
  isImporting: boolean;
  dragActive: boolean;
  onDrop: (files: File[]) => void;
  onDragOver: () => void;
  onDragLeave: () => void;
  onChange?: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  className?: string;
  label?: string;
  helpText?: string;
}

/** Drag-and-drop file picker with a click-to-browse fallback. */
export function DropZone({
  isImporting,
  dragActive,
  onDrop,
  onDragOver,
  onDragLeave,
  onChange,
  accept,
  multiple = true,
  className,
  label = "Drag and drop files here, or",
  helpText,
}: DropZoneProps) {
  const inputId = useId();

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      onDragLeave();

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        onDrop(Array.from(e.dataTransfer.files));
      }
    },
    [onDrop, onDragLeave],
  );

  const triggerFileInput = useCallback(() => {
    if (!isImporting) {
      document.getElementById(inputId)?.click();
    }
  }, [isImporting, inputId]);

  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      onDragOver();
    },
    [onDragOver],
  );

  const handleDragLeave = useCallback(
    (e: React.DragEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      onDragLeave();
    },
    [onDragLeave],
  );

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      triggerFileInput();
    },
    [triggerFileInput],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        e.stopPropagation();
        triggerFileInput();
      }
    },
    [triggerFileInput],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      e.stopPropagation();
      if (onChange) {
        onChange(e.target.files ? Array.from(e.target.files) : []);
      }
    },
    [onChange],
  );

  return (
    <div>
      <button
        type="button"
        className={cn(
          "relative border-2 border-dashed p-12",
          {
            "border-primary bg-primary/5": dragActive,
            "border-border bg-muted": !dragActive,
          },
          "flex flex-col items-center justify-center gap-4",
          {
            "pointer-events-none cursor-not-allowed": isImporting,
          },
          className,
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        tabIndex={isImporting ? -1 : 0}
        aria-disabled={isImporting}
        aria-label="Upload file area. Press Enter or Space to open file browser"
      >
        <div className="space-y-2 text-center">
          <p className="text-muted-foreground">
            {label} <span className="text-foreground font-medium">click to browse</span>
          </p>
          {helpText ? <p className="text-muted-foreground text-sm">{helpText}</p> : null}
        </div>
      </button>
      <input
        id={inputId}
        type="file"
        multiple={multiple}
        accept={accept}
        onChange={handleInputChange}
        className="sr-only"
        disabled={isImporting}
        aria-label="File input"
      />
    </div>
  );
}
