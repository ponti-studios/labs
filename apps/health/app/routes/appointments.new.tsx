import { Label } from "@pontistudios/ui/primitives";
import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { Button } from "@pontistudios/ui/primitives";
import { useAppointments } from "../hooks/use-appointments";

function getNextWeekdaySlots(count: number) {
  const slots = [];
  const times = ["10:00 AM", "2:30 PM", "9:15 AM", "11:00 AM", "3:45 PM"];
  const date = new Date();
  date.setDate(date.getDate() + 1);
  while (slots.length < count) {
    const day = date.getDay();
    if (day !== 0 && day !== 6) {
      slots.push({
        date: date.toLocaleDateString("en-US", {
          weekday: "long",
          month: "short",
          day: "numeric",
        }),
        time: times[slots.length % times.length],
      });
    }
    date.setDate(date.getDate() + 1);
  }
  return slots;
}

const DOCTOR = {
  name: "Dr. Emily Johnson",
  specialty: "Family Medicine",
  location: "Medical Center, Building A",
};

const SLOTS = getNextWeekdaySlots(5);

export default function NewAppointment() {
  const navigate = useNavigate();
  const { addAppointment } = useAppointments();
  const [selectedSlot, setSelectedSlot] = useState<(typeof SLOTS)[number] | null>(null);

  const handleConfirm = async () => {
    if (!selectedSlot) return;
    await addAppointment.mutateAsync({
      doctorName: DOCTOR.name,
      specialty: DOCTOR.specialty,
      location: DOCTOR.location,
      date: selectedSlot.date,
      time: selectedSlot.time,
    });
    navigate("/appointments");
  };

  return (
    <div className="container mx-auto flex max-w-md flex-col gap-6 px-4 py-8">
      <Link to="/appointments" className="text-secondary hover:text-primary inline-flex text-sm">
        ← Appointments
      </Link>

      <h1 className="text-2xl font-bold tracking-tight">Schedule Appointment</h1>

      <div className="bg-inset/30 rounded-lg border p-4">
        <p className="font-semibold">{DOCTOR.name}</p>
        <p className="text-secondary text-sm">{DOCTOR.specialty}</p>
        <p className="text-secondary text-sm">{DOCTOR.location}</p>
      </div>

      <div className="flex flex-col gap-3">
        <Label>Available Appointments</Label>
        <div className="flex flex-col gap-2">
          {SLOTS.map((slot) => {
            const isSelected = selectedSlot?.date === slot.date && selectedSlot?.time === slot.time;
            return (
              <button
                key={`${slot.date}-${slot.time}`}
                type="button"
                onClick={() => setSelectedSlot(slot)}
                className={`flex w-full items-center justify-between rounded-md border p-3 text-left transition-colors ${
                  isSelected ? "border-foreground bg-accent text-on-accent" : "hover:bg-inset/50"
                }`}
              >
                <div>
                  <p className="font-medium">{slot.date}</p>
                  <p className="text-sm opacity-70">{slot.time}</p>
                </div>
                {isSelected && <span className="text-sm">✓</span>}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" asChild className="flex-1">
          <Link to="/appointments">Cancel</Link>
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={!selectedSlot || addAppointment.isPending}
          className="flex-1"
        >
          {addAppointment.isPending ? "Saving..." : "Confirm Appointment"}
        </Button>
      </div>
    </div>
  );
}
