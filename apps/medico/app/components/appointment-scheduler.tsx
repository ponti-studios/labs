import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@pontistudios/ui";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@pontistudios/ui";
import { useMediaQuery } from "../hooks/use-media-query";
import { useEffect, useState } from "react";
import { Button } from "@pontistudios/ui";

// Sample doctor data - in a real app, this would come from an API or context
const doctorData = {
  name: "Dr. Emily Johnson",
  specialty: "Family Medicine",
  location: "Medical Center, Building A",
  availabilities: [
    { date: "Monday, Nov 20", time: "10:00 AM" },
    { date: "Wednesday, Nov 22", time: "2:30 PM" },
    { date: "Friday, Nov 24", time: "9:15 AM" },
  ],
};

export function AppointmentScheduler({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [mounted, setMounted] = useState(false);

  // Handle hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const content = (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <h3 className="font-medium text-lg">Your Doctor</h3>
        <div className="bg-muted p-3 rounded-md">
          <p className="font-semibold">{doctorData.name}</p>
          <p className="text-sm text-muted-foreground">{doctorData.specialty}</p>
          <p className="text-sm text-muted-foreground">{doctorData.location}</p>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="font-medium text-lg">Available Appointments</h3>
        <div className="space-y-2">
          {doctorData.availabilities.map((slot) => (
            <div
              key={crypto.getRandomValues(new Uint32Array(1))[0]}
              className="flex items-center justify-between p-3 border rounded-md hover:bg-accent transition-colors cursor-pointer"
            >
              <div>
                <p className="font-medium">{slot.date}</p>
                <p className="text-sm text-muted-foreground">{slot.time}</p>
              </div>
              <Button
                size="sm"
                onClick={() => alert(`Selected appointment on ${slot.date} at ${slot.time}`)}
              >
                Select
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-4 flex justify-end">
        <Button onClick={onClose} variant="outline" className="mr-2">
          Cancel
        </Button>
        <Button
          onClick={() => {
            alert("Appointment scheduled!");
            onClose();
          }}
        >
          Confirm Appointment
        </Button>
      </div>
    </div>
  );

  if (!mounted) return null;

  if (isDesktop) {
    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Schedule Appointment</SheetTitle>
          </SheetHeader>
          {content}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Schedule Appointment</DialogTitle>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
}
