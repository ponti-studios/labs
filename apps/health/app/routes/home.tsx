import { Button } from "@pontistudios/ui/primitives";
import { cn } from "@pontistudios/ui/utilities";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router";
import { DashboardEmptyState } from "../components/dashboard-empty-state";
import { useAppointments } from "../hooks/use-appointments";
import { useMonitoredSymptoms } from "../hooks/use-monitored-symptoms";
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
                className="hover:bg-inset/30 flex items-center justify-between gap-4 rounded-md border p-4 transition-colors"
              >
                <Link to={`/symptoms/${symptom.id}`} className="min-w-0 flex-1">
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
                  <p className="text-secondary text-sm">
                    Started {formatDistanceToNow(new Date(symptom.createdAt))} ago
                  </p>
                </Link>
                <Button
                  variant="outline"
                  className="shrink-0"
                  onClick={() => resolveSymptom.mutate(symptom)}
                >
                  Resolve
                </Button>
              </div>
            ))}
          </Section>

          <Section
            title="Health Tools"
            action={{ label: "Open tools", href: "/medication" }}
            empty={false}
            emptyText=""
          >
            <div className="flex flex-col gap-2">
              <Link to="/medication" className="hover:bg-inset/30 rounded-md border p-3 text-sm">
                Medication pen duration calculator
              </Link>
              <Link to="/medicare" className="hover:bg-inset/30 rounded-md border p-3 text-sm">
                Medicare comparison planner
              </Link>
            </div>
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
                <p className="text-secondary text-sm">{appt.specialty}</p>
                <p className="text-secondary text-sm">
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
      <p className="text-secondary text-sm">{label}</p>
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
        <Link to={action.href} className="text-secondary hover:text-primary text-sm">
          {action.label} →
        </Link>
      </div>
      {empty ? (
        <p className="text-secondary rounded-md border py-4 text-center text-sm">
          {emptyText}
        </p>
      ) : (
        <div className="flex flex-col gap-2">{children}</div>
      )}
    </div>
  );
}
