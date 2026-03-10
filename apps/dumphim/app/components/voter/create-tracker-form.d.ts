import "../voter/pokemon-card.css";
interface CreateTrackerFormProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  titleId?: string;
  onTrackerCreate: (newTracker: {
    name: string;
    pros: string[];
    cons: string[];
    photo_url?: string;
  }) => void;
}
export declare function CreateTrackerForm({
  isOpen,
  onClose,
  title,
  description,
  titleId,
  onTrackerCreate,
}: CreateTrackerFormProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=create-tracker-form.d.ts.map
