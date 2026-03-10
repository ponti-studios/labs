import type React from "react";
interface ImageAdjustmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  image: string | null;
  imageScale: number;
  imagePosition: {
    x: number;
    y: number;
  };
  imageEditorRef: React.RefObject<HTMLDivElement | null>;
  handleMouseDown: (e: React.MouseEvent) => void;
  handleMouseMove: (e: React.MouseEvent) => void;
  handleMouseUp: () => void;
  handleScaleChange: (value: number[]) => void;
  setImageScale: (value: number) => void;
  setImagePosition: (value: { x: number; y: number }) => void;
}
export declare function ImageAdjustmentDialog({
  open,
  onOpenChange,
  image,
  imageScale,
  imagePosition,
  imageEditorRef,
  handleMouseDown,
  handleMouseMove,
  handleMouseUp,
  handleScaleChange,
  setImageScale,
  setImagePosition,
}: ImageAdjustmentDialogProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=image-adjustment-dialog.d.ts.map
