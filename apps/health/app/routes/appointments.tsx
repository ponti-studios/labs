import { Link } from "react-router";
import { Button } from "@pontistudios/ui";
import { useAppointments } from "../hooks/use-appointments";

export default function Appointments() {
  const { upcoming, past, isLoading, cancelAppointment } = useAppointments();

  if (isLoading) return null;

  return (
    <div className="container mx-auto flex max-w-md flex-col gap-8 px-4 py-8">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight">Appointments</h1>
          <p className="text-muted-foreground">Your scheduled healthcare visits</p>
        </div>
        <Button asChild>
          <Link to="/appointments/new">Schedule New</Link>
        </Button>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Upcoming</h2>
        {upcoming.length === 0 ? (
          <p className="rounded-md border py-4 text-center text-sm text-muted-foreground">
            No upcoming appointments.{" "}
            <Link to="/appointments/new" className="underline">
              Schedule one.
            </Link>
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {upcoming.map((appt) => (
              <div key={appt.id} className="rounded-lg border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-col gap-2">
                    <p className="font-medium">{appt.doctorName}</p>
                    <p className="text-sm text-muted-foreground">{appt.specialty}</p>
                    <p className="text-sm">
                      {appt.date} at {appt.time}
                    </p>
                    <p className="text-sm text-muted-foreground">{appt.location}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="shrink-0 text-muted-foreground"
                    onClick={() => cancelAppointment.mutate(appt.id)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {past.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">Past</h2>
          <div className="flex flex-col gap-3">
            {past.map((appt) => (
              <div key={appt.id} className="rounded-lg border p-4 opacity-60">
                <div className="flex flex-col gap-2">
                  <p className="font-medium">{appt.doctorName}</p>
                  <p className="text-sm text-muted-foreground">{appt.specialty}</p>
                  <p className="text-sm">
                    {appt.date} at {appt.time}
                  </p>
                  <span className="inline-flex w-fit rounded-full bg-muted px-2 py-1 text-xs capitalize">
                    {appt.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
