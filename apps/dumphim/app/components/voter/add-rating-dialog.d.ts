interface AddRatingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newRating: {
    name: string;
    verdict: "stay" | "dump" | "";
    comment: string;
  };
  handleNewRatingChange: (field: string, value: string) => void;
  submitRating: () => void;
}
export declare function AddRatingDialog({
  open,
  onOpenChange,
  newRating,
  handleNewRatingChange,
  submitRating,
}: AddRatingDialogProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=add-rating-dialog.d.ts.map
