import { Button } from "@ponti-studios/ui/primitives";
import { Link } from "react-router";

const animationStyles = `
  @keyframes dashboard-float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-8px); }
  }

  .dashboard-empty-orb {
    animation: dashboard-float 3.2s ease-in-out infinite;
  }
`;

export function DashboardEmptyState() {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/80  bg-gradient-to-br from-amber-50 via-white to-sky-50 p-6 shadow-sm">
      <style>{animationStyles}</style>

      <div className="absolute inset-0 overflow-hidden">
        <div className="dashboard-empty-orb absolute top-6 -right-6 h-24 w-24 rounded-full bg-amber-200/70 blur-2xl" />
        <div className="dashboard-empty-orb absolute bottom-2 left-4 h-20 w-20 rounded-full bg-sky-200/70 blur-2xl" />
      </div>

      <div className="relative flex flex-col gap-5">
        <div className="flex items-start gap-3 rounded-2xl backdrop-blur">
          <div className="bg-accent/10 text-primary flex h-11 w-11 items-center justify-center rounded-full text-xl">
            ✦
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-secondary text-xs font-semibold tracking-[0.24em] uppercase">
              dashboard is fresh
            </p>
            <h3 className="text-lg font-semibold">Nothing on the radar yet</h3>
            <p className="text-secondary text-sm">
              Start by checking a symptom or booking a visit so your care timeline feels alive.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3">
          <Button asChild>
            <Link to="/symptoms">Check a symptom</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/appointments/new">Schedule an appointment</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
