import { Link } from "react-router";
import { Button } from "@pontistudios/ui";
import { cn } from "@pontistudios/ui";
import { formatDistanceToNow } from "date-fns";
import { useMonitoredSymptoms } from "../hooks/use-monitored-symptoms";
import { useAppointments } from "../hooks/use-appointments";
import { DashboardEmptyState } from "../components/dashboard-empty-state";
import { TREATMENT_GUIDANCE } from "../types/symptom";

export default function Dashboard() {
  const { activeSymptoms, resolvedSymptoms, resolveSymptom } = useMonitoredSymptoms();
  const { upcoming } = useAppointments();

  return (
    <div className="container mx-auto mt-8 flex max-w-2xl flex-col gap-6 px-4">
      {activeSymptoms.length === 0 && upcoming.length === 0 ? (
        <DashboardEmptyState />
      ) : (
        <>
          <div className="grid grid-cols-3 gap-4">
            <StatCard label="Active" value={activeSymptoms.length} color="text-amber-600" />
            <StatCard label="Resolved" value={resolvedSymptoms.length} color="text-green-600" />
            <StatCard label="Appointments" value={upcoming.length} color="text-blue-600" />
          </div>
          <Section
            title="Active Symptoms"
            action={{ label: "Check new symptom", href: "/symptoms" }}
            empty={activeSymptoms.length === 0}
            emptyText="No symptoms being tracked"
          >
            {activeSymptoms.map((symptom) => (
              <div
                key={symptom.id}
                className="flex items-center justify-between gap-4 rounded-md border p-4 transition-colors hover:bg-muted/30"
              >
                <Link to={`/symptoms/${symptom.id}`} className="flex-1 min-w-0">
                  <p
                    className={cn("truncate font-medium", {
                      "text-green-600": symptom.treatment_guidance === TREATMENT_GUIDANCE.NO_CARE,
                      "text-amber-600":
                        symptom.treatment_guidance === TREATMENT_GUIDANCE.NONIMMEDIATE_CARE,
                      "text-red-600":
                        symptom.treatment_guidance === TREATMENT_GUIDANCE.IMMEDIATE_CARE,
                    })}
                  >
                    {symptom.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Started {formatDistanceToNow(new Date(symptom.createdAt))} ago
                  </p>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  className="shrink-0"
                  onClick={() => resolveSymptom.mutate(symptom)}
                >
                  Resolve
                </Button>
              </div>
            ))}
          </Section>

          <Section
            title="Upcoming Appointments"
            action={{ label: "Schedule new", href: "/appointments/new" }}
            empty={upcoming.length === 0}
            emptyText="No upcoming appointments"
          >
            {upcoming.map((appt) => (
              <div key={appt.id} className="flex flex-col gap-1 rounded-md border p-4">
                <p className="font-medium">{appt.doctorName}</p>
                <p className="text-sm text-muted-foreground">{appt.specialty}</p>
                <p className="text-sm text-muted-foreground">
                  {appt.date} at {appt.time}
                </p>
              </div>
            ))}
          </Section>
        </>
      )}
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border p-4 text-center">
      <p className={cn("text-2xl font-bold", color)}>{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

function Section({
  title,
  action,
  empty,
  emptyText,
  children,
}: {
  title: string;
  action: { label: string; href: string };
  empty: boolean;
  emptyText: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">{title}</h2>
        <Link to={action.href} className="text-sm text-muted-foreground hover:text-foreground">
          {action.label} →
        </Link>
      </div>
      {empty ? (
        <p className="rounded-md border py-4 text-center text-sm text-muted-foreground">
          {emptyText}
        </p>
      ) : (
        <div className="flex flex-col gap-2">{children}</div>
      )}
    </div>
  );
}
