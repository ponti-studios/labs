import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@pontistudios/ui";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@pontistudios/ui";
import { useMediaQuery } from "../hooks/use-media-query";
import { useEffect, useState } from "react";
import { Button } from "@pontistudios/ui";

function getNextWeekdaySlots(count: number) {
  const slots = [];
  const times = ["10:00 AM", "2:30 PM", "9:15 AM", "11:00 AM", "3:45 PM"];
  const date = new Date();
  date.setDate(date.getDate() + 1); // start from tomorrow
  while (slots.length < count) {
    const day = date.getDay();
    if (day !== 0 && day !== 6) {
      slots.push({
        date: date.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" }),
        time: times[slots.length % times.length],
      });
    }
    date.setDate(date.getDate() + 1);
  }
  return slots;
}

const doctorData = {
  name: "Dr. Emily Johnson",
  specialty: "Family Medicine",
  location: "Medical Center, Building A",
  availabilities: getNextWeekdaySlots(3),
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
  const [selectedSlot, setSelectedSlot] = useState<
    (typeof doctorData.availabilities)[number] | null
  >(null);

  // Handle hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setSelectedSlot(null);
    }
  }, [isOpen]);

  const content = (
    <div className="flex flex-col gap-4 py-4">
      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-medium">Your Doctor</h3>
        <div className="bg-muted rounded-md p-3">
          <p className="font-semibold">{doctorData.name}</p>
          <p className="text-muted-foreground text-sm">{doctorData.specialty}</p>
          <p className="text-muted-foreground text-sm">{doctorData.location}</p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-medium">Available Appointments</h3>
        <div className="flex flex-col gap-2">
          {doctorData.availabilities.map((slot) => (
            <div
              key={`${slot.date}-${slot.time}`}
              className="hover:bg-accent flex items-center justify-between rounded-md border p-3 transition-colors"
            >
              <div>
                <p className="font-medium">{slot.date}</p>
                <p className="text-muted-foreground text-sm">{slot.time}</p>
              </div>
              <Button
                size="sm"
                variant={
                  selectedSlot?.date === slot.date && selectedSlot?.time === slot.time
                    ? "default"
                    : "outline"
                }
                onClick={() => setSelectedSlot(slot)}
              >
                {selectedSlot?.date === slot.date && selectedSlot?.time === slot.time
                  ? "Selected"
                  : "Select"}
              </Button>
            </div>
          ))}
        </div>
      </div>

      {selectedSlot ? (
        <p className="text-muted-foreground text-sm">
          Selected: {selectedSlot.date} at {selectedSlot.time}
        </p>
      ) : null}

      <div className="flex justify-end gap-2 pt-4">
        <Button onClick={onClose} variant="outline">
          Cancel
        </Button>
        <Button
          onClick={() => {
            onClose();
          }}
          disabled={!selectedSlot}
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
            <SheetDescription>
              Select an available time slot with your healthcare provider.
            </SheetDescription>
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
          <DialogDescription>
            Select an available time slot with your healthcare provider.
          </DialogDescription>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
}
