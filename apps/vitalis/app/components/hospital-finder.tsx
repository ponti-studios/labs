"use client";

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
    <div className="space-y-4 mt-6">
      <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
        If you need urgent in-person care, call ahead or open directions before leaving.
      </div>

      <h3 className="font-medium text-lg">Nearest Hospitals</h3>
      <div className="space-y-4">
        {HOSPITALS.map((hospital) => (
          <HospitalListItem key={hospital.id} hospital={hospital} />
        ))}
      </div>
    </div>
  );
}

function HospitalListItem({ hospital }: { hospital: Hospital }) {
  return (
    <div className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-semibold">{hospital.name}</h4>
        <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
          {hospital.distance}
        </span>
      </div>
      <p className="text-sm text-muted-foreground">{hospital.address}</p>
      <p className="text-sm font-medium mt-2">{hospital.phone}</p>
      <div className="mt-3 flex gap-2">
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
