"use client";

import { Button } from "@pontistudios/ui";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@pontistudios/ui";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@pontistudios/ui";
import { useIsMobile } from "../hooks/use-media-query";
import { HOSPITALS } from "../lib/hospitals";
import type { Hospital } from "../types/hospital";
import { useState } from "react";

interface HospitalFinderProps {
  isOpen: boolean;
  onClose: () => void;
}
export default function HospitalFinder({ isOpen, onClose }: HospitalFinderProps) {
  const isMobile = useIsMobile();

  // Use Dialog for mobile devices
  if (isMobile) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-h-[calc(80vh)] max-w-[calc(100vw-20px)] overflow-y-auto rounded-lg">
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

  // Use Sheet for larger screens
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[600px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Nearby Hospitals</SheetTitle>
          <SheetDescription>
            Here are the closest medical facilities that can provide immediate care.
          </SheetDescription>
        </SheetHeader>
        <Hospitals />
      </SheetContent>
    </Sheet>
  );
}

function Hospitals() {
  const [hospitals] = useState<Hospital[]>(HOSPITALS);

  // In a real app, you would fetch nearby hospitals based on geolocation
  // useEffect(() => {
  //   if (isOpen) {
  //     // Get user location and fetch nearby hospitals
  //     navigator.geolocation.getCurrentPosition(
  //       (position) => {
  //         const { latitude, longitude } = position.coords;
  //         // fetchNearbyHospitals(latitude, longitude).then(setHospitals);
  //       },
  //       (error) => {
  //         console.error("Error getting location:", error);
  //       }
  //     );
  //   }
  // }, [isOpen]);

  return (
    <div className="space-y-4 mt-6">
      <div className="h-64 bg-slate-200 rounded-md mb-4 flex items-center justify-center">
        <p className="text-slate-500">Interactive map would display here</p>
      </div>

      <h3 className="font-medium text-lg">Nearest Hospitals</h3>
      <div className="space-y-4">
        {hospitals.map((hospital) => (
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
        <Button size="sm" variant="outline">
          Get Directions
        </Button>
        <Button size="sm">Call</Button>
      </div>
    </div>
  );
}
