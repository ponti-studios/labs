import { Button } from "@pontistudios/ui";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@pontistudios/ui";
import { Input } from "@pontistudios/ui";

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cardName: string;
  shareUrl: string;
  copyShareLink: () => void;
}

export function ShareDialog({
  open,
  onOpenChange,
  cardName,
  shareUrl,
  copyShareLink,
}: ShareDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share for Friend Verdicts</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Share this link with friends to get their verdict on your relationship with {cardName}.
          </p>

          <div className="flex items-center space-x-2">
            <Input
              readOnly
              value={shareUrl}
              className="border-gray-300 focus:border-gray-500 focus:ring-gray-500"
            />
            <Button onClick={copyShareLink} className="shrink-0">
              Copy
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
