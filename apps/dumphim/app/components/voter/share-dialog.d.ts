interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cardName: string;
  copyShareLink: () => void;
}
export declare function ShareDialog({
  open,
  onOpenChange,
  cardName,
  copyShareLink,
}: ShareDialogProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=share-dialog.d.ts.map
