import { useState } from "react";
import HospitalFinder from "./hospital-finder";
import { Button } from "@pontistudios/ui";

export function HospitalFinderButton() {
  const [showHospitalFinder, setShowHospitalFinder] = useState(false);

  return (
    <>
      <Button variant="destructive" onClick={() => setShowHospitalFinder(true)}>
        Find Immediate Care
      </Button>
      <HospitalFinder isOpen={showHospitalFinder} onClose={() => setShowHospitalFinder(false)} />
    </>
  );
}
