import { Button } from "@pontistudios/ui";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@pontistudios/ui";
import { HOSPITALS } from "../lib/hospitals";
import type { Hospital } from "../types/hospital";

interface HospitalFinderProps {
  isOpen: boolean;
  onClose: () => void;
}
export default function HospitalFinder({ isOpen, onClose }: HospitalFinderProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto rounded-lg">
        <DialogHeader>
          <DialogTitle>Nearby Hospitals</DialogTitle>
          <DialogDescription>
            Here are the closest medical facilities that can provide immediate care.
          </DialogDescription>
        </DialogHeader>
        <Hospitals />
      </DialogContent>
    </Dialog>
  );
}

function Hospitals() {
  return (
    <div className="flex flex-col gap-4 pt-6">
      <div className="border-border bg-muted/30 text-muted-foreground rounded-lg border p-4 text-sm">
        If you need urgent in-person care, call ahead or open directions before leaving.
      </div>

      <h3 className="text-lg font-medium">Nearest Hospitals</h3>
      <div className="flex flex-col gap-4">
        {HOSPITALS.map((hospital) => (
          <HospitalListItem key={hospital.id} hospital={hospital} />
        ))}
      </div>
    </div>
  );
}

function HospitalListItem({ hospital }: { hospital: Hospital }) {
  return (
    <div className="hover:bg-muted/50 rounded-lg border p-4 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <h4 className="font-semibold">{hospital.name}</h4>
        <span className="rounded bg-blue-100 px-2 py-1 text-sm text-blue-800">
          {hospital.distance}
        </span>
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-muted-foreground text-sm">{hospital.address}</p>
        <p className="text-sm font-medium">{hospital.phone}</p>
      </div>
      <div className="flex gap-2 pt-3">
        <Button size="sm" variant="outline" asChild>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              `${hospital.name} ${hospital.address}`,
            )}`}
            target="_blank"
            rel="noreferrer"
          >
            Get Directions
          </a>
        </Button>
        <Button size="sm" asChild>
          <a href={`tel:${hospital.phone.replace(/[^\d+]/g, "")}`}>Call</a>
        </Button>
      </div>
    </div>
  );
}
